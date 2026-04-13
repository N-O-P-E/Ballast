import { useState, useEffect, useCallback, useMemo } from 'react';

export interface MealTime {
  id: string;
  time: string;
  label: string;
  description: string;
  hour: number;
  minute: number;
}

export interface MealDefinition {
  id: string;
  label: string;
  description: string;
  offsetHours: number;
  offsetMinutes: number;
}

// Default meal schedule (relative to 12:00 start)
const DEFAULT_MEALS: MealDefinition[] = [
  { id: 'shake', label: 'Shake', description: 'Protein + fats', offsetHours: 0, offsetMinutes: 0 },
  { id: 'snack', label: 'Eggs + snack', description: 'Protein + fats', offsetHours: 3, offsetMinutes: 30 },
  { id: 'dinner', label: 'Dinner', description: 'With family', offsetHours: 6, offsetMinutes: 30 },
  { id: 'optional', label: 'Optional snack', description: 'Buffer calories', offsetHours: 7, offsetMinutes: 30 },
  { id: 'fast', label: 'Fast begins', description: 'No more food', offsetHours: 8, offsetMinutes: 0 },
];

const STORAGE_KEY = 'fitness-tracker-notifications';

interface MealTimeConfig {
  id: string;
  hour: number;
  minute: number;
  label?: string;
  description?: string;
}

interface NotificationSettings {
  enabled: boolean;
  enabledMeals: string[]; // meal IDs
  ifWindowStart: number;
  customMealTimes: MealTimeConfig[] | null; // null = use defaults
  customMeals: MealDefinition[] | null; // null = use DEFAULT_MEALS
}

interface NotificationState extends NotificationSettings {
  permission: NotificationPermission;
}

// Helper to format time
const formatTime = (hour: number, minute: number): string => {
  const h = hour % 24;
  return `${h.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// Build meal times from meals and optional custom times
const buildMealTimes = (
  ifWindowStart: number,
  customTimes: MealTimeConfig[] | null,
  meals: MealDefinition[]
): MealTime[] => {
  return meals.map((meal) => {
    // Check if there's a custom time for this meal
    const customTime = customTimes?.find(c => c.id === meal.id);

    let hour: number;
    let minute: number;
    let label = meal.label;
    let description = meal.description;

    if (customTime) {
      hour = customTime.hour;
      minute = customTime.minute;
      // Use custom label/description if provided
      if (customTime.label) label = customTime.label;
      if (customTime.description) description = customTime.description;
    } else {
      // Calculate from IF window start + offset
      hour = (ifWindowStart + meal.offsetHours) % 24;
      minute = meal.offsetMinutes;
    }

    return {
      id: meal.id,
      label,
      description,
      time: formatTime(hour, minute),
      hour,
      minute,
    };
  });
};

export function useNotifications() {
  const [state, setState] = useState<NotificationState>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const defaults: NotificationSettings = {
      enabled: false,
      enabledMeals: DEFAULT_MEALS.map(m => m.id),
      ifWindowStart: 12,
      customMealTimes: null,
      customMeals: null,
    };
    const parsed = saved ? { ...defaults, ...JSON.parse(saved) } : defaults;

    return {
      ...parsed,
      permission: 'Notification' in window ? Notification.permission : 'denied',
    };
  });

  const [nextMeal, setNextMeal] = useState<MealTime | null>(null);

  // Get the meals to use (custom or default)
  const meals = state.customMeals || DEFAULT_MEALS;

  // Calculate current meal times
  const mealTimes = useMemo(
    () => buildMealTimes(state.ifWindowStart, state.customMealTimes, meals),
    [state.ifWindowStart, state.customMealTimes, meals]
  );

  // Check for notification support
  const isSupported = 'Notification' in window;

  // Sync settings to service worker and register background sync
  const syncToServiceWorker = useCallback(async (settings: NotificationSettings) => {
    if ('serviceWorker' in navigator) {
      // Post message to service worker
      if (navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({
          type: 'SYNC_NOTIFICATION_SETTINGS',
          settings,
        });
      }

      // Register background sync for mobile reliability
      try {
        const registration = await navigator.serviceWorker.ready;
        if ('sync' in registration) {
          await (registration as any).sync.register('check-meal-notifications');
        }
      } catch (e) {
        // Background sync not supported
      }
    }
  }, []);

  // Save to localStorage and sync to service worker
  const saveSettings = useCallback((settings: NotificationSettings) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
    syncToServiceWorker(settings);
  }, [syncToServiceWorker]);

  // Request permission
  const requestPermission = useCallback(async () => {
    if (!isSupported) return false;
    const permission = await Notification.requestPermission();
    setState(prev => ({ ...prev, permission }));
    return permission === 'granted';
  }, [isSupported]);

  // Enable notifications
  const enableNotifications = useCallback(async () => {
    if (!isSupported) return false;

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission === 'granted') {
      const newState: NotificationSettings = {
        enabled: true,
        enabledMeals: state.enabledMeals.length > 0 ? state.enabledMeals : meals.map(m => m.id),
        ifWindowStart: state.ifWindowStart,
        customMealTimes: state.customMealTimes,
        customMeals: state.customMeals,
      };
      setState(prev => ({ ...prev, ...newState, permission }));
      saveSettings(newState);

      new Notification('Ballast Reminders Enabled', {
        body: 'You\'ll be notified at meal times!',
        icon: '/favicon.svg',
        tag: 'confirmation',
      });

      return true;
    }

    setState(prev => ({ ...prev, permission }));
    return false;
  }, [isSupported, state.enabledMeals, state.ifWindowStart, state.customMealTimes, state.customMeals, meals, saveSettings]);

  // Disable notifications
  const disableNotifications = useCallback(() => {
    const newState: NotificationSettings = {
      enabled: false,
      enabledMeals: state.enabledMeals,
      ifWindowStart: state.ifWindowStart,
      customMealTimes: state.customMealTimes,
      customMeals: state.customMeals,
    };
    setState(prev => ({ ...prev, ...newState }));
    saveSettings(newState);
  }, [state.enabledMeals, state.ifWindowStart, state.customMealTimes, state.customMeals, saveSettings]);

  // Toggle notifications
  const toggleNotifications = useCallback(async () => {
    if (state.enabled) {
      disableNotifications();
      return false;
    } else {
      return await enableNotifications();
    }
  }, [state.enabled, enableNotifications, disableNotifications]);

  // Toggle individual meal notification by ID
  const toggleMealNotification = useCallback((mealId: string) => {
    setState(prev => {
      const newEnabledMeals = prev.enabledMeals.includes(mealId)
        ? prev.enabledMeals.filter(id => id !== mealId)
        : [...prev.enabledMeals, mealId];

      const newState: NotificationSettings = {
        enabled: prev.enabled,
        enabledMeals: newEnabledMeals,
        ifWindowStart: prev.ifWindowStart,
        customMealTimes: prev.customMealTimes,
        customMeals: prev.customMeals,
      };
      saveSettings(newState);

      return { ...prev, enabledMeals: newEnabledMeals };
    });
  }, [saveSettings]);

  // Update IF window start time (resets to default offsets but keeps custom meals)
  const setIfWindowStart = useCallback((hour: number) => {
    setState(prev => {
      const newState: NotificationSettings = {
        enabled: prev.enabled,
        enabledMeals: prev.enabledMeals,
        ifWindowStart: hour,
        customMealTimes: null, // Reset times to defaults when changing window
        customMeals: prev.customMeals, // Keep custom meal definitions
      };
      saveSettings(newState);
      return { ...prev, ...newState };
    });
  }, [saveSettings]);

  // Update individual meal time
  const setMealTime = useCallback((mealId: string, hour: number, minute: number) => {
    setState(prev => {
      // Get current meal times as config
      const currentTimes: MealTimeConfig[] = mealTimes.map(m => ({
        id: m.id,
        hour: m.hour,
        minute: m.minute,
      }));

      // Update the specific meal
      const newTimes = currentTimes.map(t =>
        t.id === mealId ? { ...t, hour, minute } : t
      );

      const newState: NotificationSettings = {
        enabled: prev.enabled,
        enabledMeals: prev.enabledMeals,
        ifWindowStart: prev.ifWindowStart,
        customMealTimes: newTimes,
        customMeals: prev.customMeals,
      };
      saveSettings(newState);

      return { ...prev, customMealTimes: newTimes };
    });
  }, [mealTimes, saveSettings]);

  // Update meal label and description
  const updateMealLabel = useCallback((mealId: string, label: string, description: string) => {
    setState(prev => {
      // Initialize custom meals from current meals if not set
      const currentMeals = prev.customMeals || DEFAULT_MEALS;
      const newMeals = currentMeals.map(m =>
        m.id === mealId ? { ...m, label, description } : m
      );

      const newState: NotificationSettings = {
        enabled: prev.enabled,
        enabledMeals: prev.enabledMeals,
        ifWindowStart: prev.ifWindowStart,
        customMealTimes: prev.customMealTimes,
        customMeals: newMeals,
      };
      saveSettings(newState);

      return { ...prev, customMeals: newMeals };
    });
  }, [saveSettings]);

  // Remove a meal from the schedule
  const removeMeal = useCallback((mealId: string) => {
    setState(prev => {
      // Initialize custom meals from current meals if not set
      const currentMeals = prev.customMeals || DEFAULT_MEALS;
      const newMeals = currentMeals.filter(m => m.id !== mealId);

      // Also remove from enabled meals and custom times
      const newEnabledMeals = prev.enabledMeals.filter(id => id !== mealId);
      const newCustomTimes = prev.customMealTimes?.filter(t => t.id !== mealId) || null;

      const newState: NotificationSettings = {
        enabled: prev.enabled,
        enabledMeals: newEnabledMeals,
        ifWindowStart: prev.ifWindowStart,
        customMealTimes: newCustomTimes,
        customMeals: newMeals,
      };
      saveSettings(newState);

      return { ...prev, ...newState };
    });
  }, [saveSettings]);

  // Add a new meal to the schedule
  const addMeal = useCallback((label: string, description: string, offsetHours: number, offsetMinutes: number) => {
    setState(prev => {
      // Generate unique ID
      const id = `meal-${Date.now()}`;

      // Initialize custom meals from current meals if not set
      const currentMeals = prev.customMeals || DEFAULT_MEALS;
      const newMeal: MealDefinition = { id, label, description, offsetHours, offsetMinutes };
      const newMeals = [...currentMeals, newMeal];

      // Add to enabled meals
      const newEnabledMeals = [...prev.enabledMeals, id];

      const newState: NotificationSettings = {
        enabled: prev.enabled,
        enabledMeals: newEnabledMeals,
        ifWindowStart: prev.ifWindowStart,
        customMealTimes: prev.customMealTimes,
        customMeals: newMeals,
      };
      saveSettings(newState);

      return { ...prev, ...newState };
    });
  }, [saveSettings]);

  // Reset to default times
  const resetToDefaults = useCallback(() => {
    setState(prev => {
      const newState: NotificationSettings = {
        enabled: prev.enabled,
        enabledMeals: DEFAULT_MEALS.map(m => m.id),
        ifWindowStart: 12,
        customMealTimes: null,
        customMeals: null,
      };
      saveSettings(newState);
      return { ...prev, ...newState };
    });
  }, [saveSettings]);

  // Find next meal time
  const getNextMeal = useCallback((): MealTime | null => {
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const enabledMealTimes = mealTimes.filter(m => state.enabledMeals.includes(m.id));

    for (const meal of enabledMealTimes) {
      const mealMinutes = meal.hour * 60 + meal.minute;
      if (mealMinutes > currentMinutes) {
        return meal;
      }
    }

    return enabledMealTimes[0] || null;
  }, [mealTimes, state.enabledMeals]);

  // Show notification
  const showNotification = useCallback((meal: MealTime) => {
    if (!isSupported || !state.enabled || Notification.permission !== 'granted') return;
    if (!state.enabledMeals.includes(meal.id)) return;

    new Notification(`🍽️ ${meal.time} - ${meal.label}!`, {
      body: meal.description,
      icon: '/icon-192.png',
      tag: `meal-${meal.id}`,
      requireInteraction: true,
    });
  }, [isSupported, state.enabled, state.enabledMeals]);

  // Check and trigger notifications
  useEffect(() => {
    if (!state.enabled || !isSupported) return;

    const checkTime = () => {
      const now = new Date();
      const currentTime = formatTime(now.getHours(), now.getMinutes());

      const meal = mealTimes.find(m => m.time === currentTime);
      if (meal) {
        showNotification(meal);
      }

      setNextMeal(getNextMeal());
    };

    checkTime();
    const interval = setInterval(checkTime, 60000);

    return () => clearInterval(interval);
  }, [state.enabled, isSupported, mealTimes, showNotification, getNextMeal]);

  useEffect(() => {
    setNextMeal(getNextMeal());
  }, [getNextMeal]);

  // Sync settings to service worker on load and when SW becomes available
  useEffect(() => {
    const syncSettings = () => {
      const settings: NotificationSettings = {
        enabled: state.enabled,
        enabledMeals: state.enabledMeals,
        ifWindowStart: state.ifWindowStart,
        customMealTimes: state.customMealTimes,
        customMeals: state.customMeals,
      };
      syncToServiceWorker(settings);
    };

    // Sync immediately if SW is ready
    if ('serviceWorker' in navigator) {
      if (navigator.serviceWorker.controller) {
        syncSettings();
      }
      // Also sync when SW becomes active
      navigator.serviceWorker.addEventListener('controllerchange', syncSettings);
      return () => {
        navigator.serviceWorker.removeEventListener('controllerchange', syncSettings);
      };
    }
  }, [state.enabled, state.enabledMeals, state.ifWindowStart, state.customMealTimes, state.customMeals, syncToServiceWorker]);

  const ifWindowEnd = (state.ifWindowStart + 8) % 24;

  // Test notification function
  const sendTestNotification = useCallback(async () => {
    if (!isSupported) {
      alert('Notifications not supported in this browser');
      return false;
    }

    let permission = Notification.permission;
    if (permission === 'default') {
      permission = await Notification.requestPermission();
    }

    if (permission !== 'granted') {
      alert('Notification permission denied. Please enable in browser settings.');
      return false;
    }

    // Try service worker notification first (works better on mobile)
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      try {
        const registration = await navigator.serviceWorker.ready;
        await registration.showNotification('Ballast Test', {
          body: 'Notifications are working! You will receive meal reminders.',
          icon: '/favicon.svg',
          badge: '/favicon.svg',
          tag: 'test-notification',
        });
        return true;
      } catch (e) {
        console.error('SW notification failed:', e);
      }
    }

    // Fallback to regular notification
    try {
      new Notification('Ballast Test', {
        body: 'Notifications are working! You will receive meal reminders.',
        icon: '/favicon.svg',
        tag: 'test-notification',
      });
      return true;
    } catch (e) {
      console.error('Notification failed:', e);
      alert('Failed to send notification: ' + e);
      return false;
    }
  }, [isSupported]);

  return {
    isSupported,
    isEnabled: state.enabled,
    permission: state.permission,
    enabledMeals: state.enabledMeals,
    mealTimes,
    nextMeal,
    ifWindowStart: state.ifWindowStart,
    ifWindowEnd,
    hasCustomTimes: state.customMealTimes !== null,
    hasCustomMeals: state.customMeals !== null,
    enableNotifications,
    disableNotifications,
    toggleNotifications,
    toggleMealNotification,
    setIfWindowStart,
    setMealTime,
    updateMealLabel,
    removeMeal,
    addMeal,
    resetToDefaults,
    requestPermission,
    sendTestNotification,
  };
}
