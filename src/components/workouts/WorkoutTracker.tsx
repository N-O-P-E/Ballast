import { useState } from 'react';
import { History, ArrowUp, ArrowDown, Footprints, Dumbbell, User } from 'lucide-react';
import { WorkoutData, WorkoutCategory, WorkoutLog, WorkoutTemplate, TemplateType, StreakData, ActiveWorkoutSession } from '../../types';
import { PPL_CATEGORY_COLORS, PPL_CATEGORY_LABELS, INITIAL_WORKOUT_DATA } from '../../constants';
import WorkoutSession from './WorkoutSession';
import WorkoutHistory from './WorkoutHistory';
import TemplateEditor from './TemplateEditor';

interface WorkoutTrackerProps {
  workouts: WorkoutData;
  workoutStreak: StreakData;
  onUpdateWorkouts: (workouts: WorkoutData) => void;
  onUpdateWorkoutStreak: (streak: StreakData) => void;
  activeWorkout?: ActiveWorkoutSession;
  onUpdateActiveWorkout: (activeWorkout: ActiveWorkoutSession | undefined) => void;
}

type ViewMode = 'session' | 'history';

const CATEGORY_ICONS: Record<WorkoutCategory, typeof ArrowUp> = {
  push: ArrowUp,
  pull: ArrowDown,
  legs: Footprints
};

export default function WorkoutTracker({ workouts, workoutStreak, onUpdateWorkouts, onUpdateWorkoutStreak, activeWorkout, onUpdateActiveWorkout }: WorkoutTrackerProps) {
  // Initialize from active workout if one exists
  const [selectedCategory, setSelectedCategory] = useState<WorkoutCategory>(activeWorkout?.category || 'push');
  const [selectedTemplateType, setSelectedTemplateType] = useState<TemplateType>(activeWorkout?.templateType || 'weighted');
  const [viewMode, setViewMode] = useState<ViewMode>('session');
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);

  // Get template for selected category and type
  const currentTemplate = workouts.templates.find(
    t => t.category === selectedCategory && t.templateType === selectedTemplateType
  ) || INITIAL_WORKOUT_DATA.templates.find(
    t => t.category === selectedCategory && t.templateType === selectedTemplateType
  )!;

  // Handle saving a completed workout
  const handleSaveWorkout = (log: WorkoutLog) => {
    const updatedWorkouts: WorkoutData = {
      ...workouts,
      logs: [...workouts.logs, log]
    };
    onUpdateWorkouts(updatedWorkouts);

    // Clear active workout after saving
    onUpdateActiveWorkout(undefined);

    // Update workout streak
    updateWorkoutStreak(log.date);
  };

  const updateWorkoutStreak = (logDate: string) => {
    // Get existing logged dates or initialize empty array
    const loggedDates = new Set(workoutStreak.loggedDates || []);

    // Don't update if already logged on this date
    if (loggedDates.has(logDate)) {
      return;
    }

    // Add the new date
    loggedDates.add(logDate);
    const datesArray = Array.from(loggedDates);

    // Recalculate streak from all logged dates
    const sortedDates = [...datesArray].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Check if most recent date is today or yesterday for current streak
    const mostRecentDate = sortedDates[0];
    if (mostRecentDate === today || mostRecentDate === yesterday) {
      currentStreak = 1;
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

    onUpdateWorkoutStreak({
      currentStreak,
      longestStreak,
      lastLogDate: mostRecentDate,
      totalDaysLogged: datesArray.length,
      loggedDates: datesArray
    });
  };

  // Handle saving template changes
  const handleSaveTemplate = (template: WorkoutTemplate) => {
    // Check if template already exists
    const existingIndex = workouts.templates.findIndex(
      t => t.category === template.category && t.templateType === template.templateType
    );

    let updatedTemplates;
    if (existingIndex >= 0) {
      // Update existing template
      updatedTemplates = workouts.templates.map((t, i) =>
        i === existingIndex ? template : t
      );
    } else {
      // Add new template (for users with old data)
      updatedTemplates = [...workouts.templates, template];
    }

    onUpdateWorkouts({
      ...workouts,
      templates: updatedTemplates
    });
    setShowTemplateEditor(false);
  };

  // Handle deleting a workout log
  const handleDeleteLog = (logId: string) => {
    const updatedWorkouts: WorkoutData = {
      ...workouts,
      logs: workouts.logs.filter(l => l.id !== logId)
    };
    onUpdateWorkouts(updatedWorkouts);
  };

  // Count workouts per category
  const getWorkoutCount = (category: WorkoutCategory) => {
    return workouts.logs.filter(l => l.category === category).length;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Category selector */}
      <div className="flex gap-2">
        {(['push', 'pull', 'legs'] as WorkoutCategory[]).map((category) => {
          const Icon = CATEGORY_ICONS[category];
          const isSelected = selectedCategory === category;
          const color = PPL_CATEGORY_COLORS[category];
          const count = getWorkoutCount(category);

          return (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`flex-1 py-3 px-4 rounded-xl font-display font-semibold transition-all flex flex-col items-center gap-1 ${
                isSelected
                  ? 'text-white shadow-lg'
                  : 'bg-bg-tertiary text-text-muted hover:bg-bg-secondary'
              }`}
              style={isSelected ? { backgroundColor: color } : undefined}
            >
              <Icon size={20} />
              <span>{PPL_CATEGORY_LABELS[category]}</span>
              {count > 0 && (
                <span className={`text-xs ${isSelected ? 'text-white/70' : 'text-text-muted'}`}>
                  {count} logged
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Template type toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setSelectedTemplateType('weighted')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            selectedTemplateType === 'weighted'
              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/50'
              : 'bg-bg-tertiary text-text-muted border border-white/10 hover:bg-bg-secondary'
          }`}
        >
          <Dumbbell size={18} />
          Weighted
        </button>
        <button
          onClick={() => setSelectedTemplateType('bodyweight')}
          className={`flex-1 py-2.5 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            selectedTemplateType === 'bodyweight'
              ? 'bg-accent-info/20 text-accent-info border border-accent-info/50'
              : 'bg-bg-tertiary text-text-muted border border-white/10 hover:bg-bg-secondary'
          }`}
        >
          <User size={18} />
          Bodyweight
        </button>
      </div>

      {/* View toggle */}
      <div className="flex gap-2">
        <button
          onClick={() => setViewMode('session')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all ${
            viewMode === 'session'
              ? 'bg-white/10 text-text-primary border border-white/20'
              : 'bg-bg-tertiary text-text-muted border border-white/10 hover:bg-bg-secondary'
          }`}
        >
          New Workout
        </button>
        <button
          onClick={() => setViewMode('history')}
          className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
            viewMode === 'history'
              ? 'bg-white/10 text-text-primary border border-white/20'
              : 'bg-bg-tertiary text-text-muted border border-white/10 hover:bg-bg-secondary'
          }`}
        >
          <History size={16} />
          History
        </button>
      </div>

      {/* Content based on view mode */}
      {viewMode === 'session' ? (
        <WorkoutSession
          key={`${selectedCategory}-${selectedTemplateType}-${currentTemplate.lastModified}`}
          category={selectedCategory}
          templateType={selectedTemplateType}
          template={currentTemplate}
          logs={workouts.logs}
          onSave={handleSaveWorkout}
          onEditTemplate={() => setShowTemplateEditor(true)}
          activeWorkout={activeWorkout?.category === selectedCategory && activeWorkout?.templateType === selectedTemplateType ? activeWorkout : undefined}
          onUpdateActiveWorkout={onUpdateActiveWorkout}
        />
      ) : (
        <WorkoutHistory
          category={selectedCategory}
          logs={workouts.logs}
          onDeleteLog={handleDeleteLog}
        />
      )}

      {/* Template Editor Drawer */}
      {showTemplateEditor && (
        <TemplateEditor
          template={currentTemplate}
          onSave={handleSaveTemplate}
          onClose={() => setShowTemplateEditor(false)}
        />
      )}
    </div>
  );
}
