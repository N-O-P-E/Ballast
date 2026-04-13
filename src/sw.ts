/// <reference lib="webworker" />
import { precacheAndRoute } from 'workbox-precaching';

declare let self: ServiceWorkerGlobalScope;

// Precache all assets
precacheAndRoute(self.__WB_MANIFEST);

interface MealTimeConfig {
  id: string;
  hour: number;
  minute: number;
}

interface NotificationSettings {
  enabled: boolean;
  enabledMeals: string[];
  ifWindowStart: number;
  customMealTimes: MealTimeConfig[] | null;
}

// Default meal info
const DEFAULT_MEALS = [
  { id: 'shake', label: 'Shake', description: 'Protein + fats' },
  { id: 'snack', label: 'Eggs + snack', description: 'Protein + fats' },
  { id: 'dinner', label: 'Dinner', description: 'With family' },
  { id: 'optional', label: 'Optional snack', description: 'Buffer calories' },
  { id: 'fast', label: 'Fast begins', description: 'No more food' },
];

const DEFAULT_OFFSETS = [
  { hours: 0, minutes: 0 },
  { hours: 3, minutes: 30 },
  { hours: 6, minutes: 30 },
  { hours: 7, minutes: 30 },
  { hours: 8, minutes: 0 },
];

// Format time helper
const formatTime = (hour: number, minute: number): string => {
  return `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
};

// Get settings from IndexedDB or cache
async function getSettings(): Promise<NotificationSettings | null> {
  try {
    // Try to get from cache (synced from main app)
    const cache = await caches.open('notification-settings');
    const response = await cache.match('settings');
    if (response) {
      return await response.json();
    }
  } catch (e) {
    console.log('SW: Could not read settings from cache');
  }
  return null;
}

// Calculate meal times based on settings
function getMealTimes(settings: NotificationSettings) {
  const { ifWindowStart, customMealTimes } = settings;

  if (customMealTimes && customMealTimes.length === DEFAULT_MEALS.length) {
    return DEFAULT_MEALS.map((meal, index) => {
      const custom = customMealTimes.find(c => c.id === meal.id) || customMealTimes[index];
      return {
        ...meal,
        time: formatTime(custom.hour, custom.minute),
        hour: custom.hour,
        minute: custom.minute,
      };
    });
  }

  return DEFAULT_MEALS.map((meal, index) => {
    const offset = DEFAULT_OFFSETS[index];
    const hour = (ifWindowStart + offset.hours) % 24;
    const minute = offset.minutes;
    return {
      ...meal,
      time: formatTime(hour, minute),
      hour,
      minute,
    };
  });
}

// Track shown notifications to avoid duplicates
const shownNotifications = new Set<string>();

// Check and show notifications
async function checkAndNotify() {
  const settings = await getSettings();
  if (!settings || !settings.enabled) return;

  const now = new Date();
  const currentTime = formatTime(now.getHours(), now.getMinutes());
  const todayKey = now.toDateString();

  const mealTimes = getMealTimes(settings);

  for (const meal of mealTimes) {
    if (!settings.enabledMeals.includes(meal.id)) continue;

    const notificationKey = `${todayKey}-${meal.id}`;

    if (meal.time === currentTime && !shownNotifications.has(notificationKey)) {
      shownNotifications.add(notificationKey);

      await self.registration.showNotification(`${meal.time} - ${meal.label}`, {
        body: meal.description,
        icon: '/favicon.svg',
        badge: '/favicon.svg',
        tag: `meal-${meal.id}`,
        requireInteraction: true,
      } as NotificationOptions);
    }
  }

  // Clean up old notification keys (older than today)
  for (const key of shownNotifications) {
    if (!key.startsWith(todayKey)) {
      shownNotifications.delete(key);
    }
  }
}

// Listen for messages from the main app
self.addEventListener('message', async (event) => {
  if (event.data && event.data.type === 'SYNC_NOTIFICATION_SETTINGS') {
    // Store settings in cache for service worker access
    const cache = await caches.open('notification-settings');
    await cache.put('settings', new Response(JSON.stringify(event.data.settings)));

    // Immediately check if we should show a notification
    checkAndNotify();
  }

  if (event.data && event.data.type === 'CHECK_NOTIFICATIONS') {
    checkAndNotify();
  }
});

// Install event - register for periodic sync if available
self.addEventListener('install', (event) => {
  event.waitUntil(
    (async () => {
      // Skip waiting to activate immediately
      await self.skipWaiting();

      // Try to register periodic background sync (limited mobile support)
      try {
        const registration = self.registration as any;
        if (registration.periodicSync) {
          await registration.periodicSync.register('check-meal-notifications', {
            minInterval: 60 * 1000, // 1 minute minimum
          });
          console.log('SW: Registered periodic sync');
        }
      } catch (e) {
        console.log('SW: Periodic sync not available');
      }
    })()
  );
});

// Activate event - take control immediately and clear old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      // Clear all old caches except notification-settings
      const cacheNames = await caches.keys();
      await Promise.all(
        cacheNames
          .filter(name => name !== 'notification-settings')
          .map(name => {
            console.log('SW: Deleting old cache:', name);
            return caches.delete(name);
          })
      );

      // Initial check
      await checkAndNotify();

      // Take control of all clients immediately
      await self.clients.claim();

      // Start interval as fallback (works when browser is active)
      setInterval(checkAndNotify, 30000);
    })()
  );
});

// Sync event - for one-off background sync (better mobile support than periodic)
self.addEventListener('sync', (event: any) => {
  if (event.tag === 'check-meal-notifications') {
    event.waitUntil(checkAndNotify());
  }
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  event.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clients) => {
      // Focus existing window or open new one
      for (const client of clients) {
        if ('focus' in client) {
          return client.focus();
        }
      }
      return self.clients.openWindow('/');
    })
  );
});

// Periodic background sync (if supported)
self.addEventListener('periodicsync', (event: any) => {
  if (event.tag === 'check-meal-notifications') {
    event.waitUntil(checkAndNotify());
  }
});

export {};
