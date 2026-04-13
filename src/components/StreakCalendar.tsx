import { useState, useMemo } from 'react';
import { X, ChevronLeft, ChevronRight, Scale, Dumbbell } from 'lucide-react';
import { StreakData } from '../types';
import { formatDateISO } from '../hooks/useLocalStorage';

interface StreakCalendarProps {
  isOpen: boolean;
  onClose: () => void;
  loggingStreak: StreakData;
  workoutStreak: StreakData;
  onUpdateLoggingStreak: (streak: StreakData) => void;
  onUpdateWorkoutStreak: (streak: StreakData) => void;
}

type EditMode = 'logging' | 'workout' | null;

const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June',
                'July', 'August', 'September', 'October', 'November', 'December'];

// Calculate streak from array of dates
function calculateStreakFromDates(dates: string[]): { currentStreak: number; longestStreak: number; lastLogDate?: string } {
  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastLogDate: undefined };
  }

  // Sort dates descending
  const sortedDates = [...dates].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

  const today = formatDateISO(new Date());
  const yesterday = formatDateISO(new Date(Date.now() - 86400000));

  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 1;

  // Check if most recent date is today or yesterday for current streak
  const mostRecentDate = sortedDates[0];
  if (mostRecentDate === today || mostRecentDate === yesterday) {
    currentStreak = 1;

    // Count consecutive days backwards from most recent
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);

      if (diffDays === 1) {
        currentStreak++;
      } else {
        break;
      }
    }
  }

  // Calculate longest streak
  for (let i = 1; i < sortedDates.length; i++) {
    const prevDate = new Date(sortedDates[i - 1]);
    const currDate = new Date(sortedDates[i]);
    const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);

    if (diffDays === 1) {
      tempStreak++;
    } else {
      longestStreak = Math.max(longestStreak, tempStreak);
      tempStreak = 1;
    }
  }
  longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

  return {
    currentStreak,
    longestStreak,
    lastLogDate: mostRecentDate
  };
}

export default function StreakCalendar({
  isOpen,
  onClose,
  loggingStreak,
  workoutStreak,
  onUpdateLoggingStreak,
  onUpdateWorkoutStreak
}: StreakCalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editMode, setEditMode] = useState<EditMode>(null);

  // Get logged dates arrays (initialize from existing data if needed)
  const loggingDates = useMemo(() => {
    return new Set(loggingStreak.loggedDates || []);
  }, [loggingStreak.loggedDates]);

  const workoutDates = useMemo(() => {
    return new Set(workoutStreak.loggedDates || []);
  }, [workoutStreak.loggedDates]);

  // Generate calendar days for current month
  const calendarDays = useMemo(() => {
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();

    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startPadding = firstDay.getDay();
    const totalDays = lastDay.getDate();

    const days: { date: string; day: number; isCurrentMonth: boolean; isToday: boolean; isFuture: boolean }[] = [];

    // Previous month padding
    const prevMonth = new Date(year, month, 0);
    for (let i = startPadding - 1; i >= 0; i--) {
      const day = prevMonth.getDate() - i;
      const date = formatDateISO(new Date(year, month - 1, day));
      days.push({ date, day, isCurrentMonth: false, isToday: false, isFuture: false });
    }

    // Current month
    const today = formatDateISO(new Date());
    for (let day = 1; day <= totalDays; day++) {
      const date = formatDateISO(new Date(year, month, day));
      const isFuture = new Date(date) > new Date(today);
      days.push({
        date,
        day,
        isCurrentMonth: true,
        isToday: date === today,
        isFuture
      });
    }

    // Next month padding to complete grid
    const remaining = 42 - days.length;
    for (let day = 1; day <= remaining; day++) {
      const date = formatDateISO(new Date(year, month + 1, day));
      days.push({ date, day, isCurrentMonth: false, isToday: false, isFuture: true });
    }

    return days;
  }, [currentMonth]);

  const handleDayClick = (date: string, isFuture: boolean) => {
    if (isFuture || !editMode) return;

    if (editMode === 'logging') {
      const newDates = new Set(loggingStreak.loggedDates || []);
      if (newDates.has(date)) {
        newDates.delete(date);
      } else {
        newDates.add(date);
      }

      const datesArray = Array.from(newDates);
      const calculated = calculateStreakFromDates(datesArray);

      onUpdateLoggingStreak({
        ...loggingStreak,
        ...calculated,
        totalDaysLogged: datesArray.length,
        loggedDates: datesArray
      });
    } else if (editMode === 'workout') {
      const newDates = new Set(workoutStreak.loggedDates || []);
      if (newDates.has(date)) {
        newDates.delete(date);
      } else {
        newDates.add(date);
      }

      const datesArray = Array.from(newDates);
      const calculated = calculateStreakFromDates(datesArray);

      onUpdateWorkoutStreak({
        ...workoutStreak,
        ...calculated,
        totalDaysLogged: datesArray.length,
        loggedDates: datesArray
      });
    }
  };

  const prevMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="absolute inset-x-4 top-1/2 -translate-y-1/2 max-w-md mx-auto bg-bg-primary rounded-2xl overflow-hidden animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-display text-lg font-bold text-text-primary">
            Streak Calendar
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <X size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Edit Mode Selector */}
        <div className="p-4 border-b border-white/10">
          <p className="text-xs text-text-muted mb-2">Tap to edit:</p>
          <div className="flex gap-2">
            <button
              onClick={() => setEditMode(editMode === 'logging' ? null : 'logging')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                editMode === 'logging'
                  ? 'bg-accent-primary text-white'
                  : 'bg-bg-tertiary text-text-muted hover:bg-bg-secondary'
              }`}
            >
              <Scale size={16} />
              <span className="text-sm">Log Streak</span>
              <span className="text-xs opacity-70">({loggingStreak.currentStreak})</span>
            </button>
            <button
              onClick={() => setEditMode(editMode === 'workout' ? null : 'workout')}
              className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                editMode === 'workout'
                  ? 'bg-accent-success text-white'
                  : 'bg-bg-tertiary text-text-muted hover:bg-bg-secondary'
              }`}
            >
              <Dumbbell size={16} />
              <span className="text-sm">Workout</span>
              <span className="text-xs opacity-70">({workoutStreak.currentStreak})</span>
            </button>
          </div>
          {editMode && (
            <p className="text-xs text-text-muted mt-2 text-center">
              Tap days to add/remove from {editMode === 'logging' ? 'log' : 'workout'} streak
            </p>
          )}
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-between p-4">
          <button
            onClick={prevMonth}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronLeft size={20} className="text-text-muted" />
          </button>
          <h3 className="font-display font-semibold text-text-primary">
            {MONTHS[currentMonth.getMonth()]} {currentMonth.getFullYear()}
          </h3>
          <button
            onClick={nextMonth}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
          >
            <ChevronRight size={20} className="text-text-muted" />
          </button>
        </div>

        {/* Calendar Grid */}
        <div className="px-4 pb-4">
          {/* Day headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {DAYS.map(day => (
              <div key={day} className="text-center text-xs text-text-muted py-1">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map(({ date, day, isCurrentMonth, isToday, isFuture }) => {
              const hasLogging = loggingDates.has(date);
              const hasWorkout = workoutDates.has(date);
              const isEditable = editMode && !isFuture;

              return (
                <button
                  key={date}
                  onClick={() => handleDayClick(date, isFuture)}
                  disabled={isFuture || !editMode}
                  className={`
                    relative aspect-square flex flex-col items-center justify-center rounded-lg text-sm transition-all
                    ${!isCurrentMonth ? 'text-text-muted/30' : ''}
                    ${isToday ? 'ring-2 ring-accent-primary' : ''}
                    ${isFuture ? 'opacity-30' : ''}
                    ${isEditable ? 'hover:bg-white/10 cursor-pointer' : 'cursor-default'}
                    ${editMode === 'logging' && hasLogging ? 'bg-accent-primary/30' : ''}
                    ${editMode === 'workout' && hasWorkout ? 'bg-accent-success/30' : ''}
                    ${!editMode && (hasLogging || hasWorkout) ? 'bg-white/5' : ''}
                  `}
                >
                  <span className={isCurrentMonth ? 'text-text-primary' : ''}>
                    {day}
                  </span>

                  {/* Streak indicators */}
                  {(hasLogging || hasWorkout) && (
                    <div className="flex gap-0.5 mt-0.5">
                      {hasLogging && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-primary" />
                      )}
                      {hasWorkout && (
                        <div className="w-1.5 h-1.5 rounded-full bg-accent-success" />
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-center gap-4 text-xs text-text-muted">
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent-primary" />
              <span>Log</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-2 h-2 rounded-full bg-accent-success" />
              <span>Workout</span>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-2 p-4 border-t border-white/10">
          <div className="bg-bg-tertiary rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Scale size={14} className="text-accent-primary" />
              <span className="text-xs text-text-muted">Log Streak</span>
            </div>
            <p className="font-display font-bold text-accent-primary">
              {loggingStreak.currentStreak} days
            </p>
            <p className="text-xs text-text-muted">Best: {loggingStreak.longestStreak}</p>
          </div>
          <div className="bg-bg-tertiary rounded-lg p-3 text-center">
            <div className="flex items-center justify-center gap-1 mb-1">
              <Dumbbell size={14} className="text-accent-success" />
              <span className="text-xs text-text-muted">Workout Streak</span>
            </div>
            <p className="font-display font-bold text-accent-success">
              {workoutStreak.currentStreak} days
            </p>
            <p className="text-xs text-text-muted">Best: {workoutStreak.longestStreak}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
