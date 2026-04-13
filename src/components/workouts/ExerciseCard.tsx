import { useState } from 'react';
import { ChevronDown, ChevronUp, Dumbbell, User, Plus, Minus, Trash2, MessageSquare } from 'lucide-react';
import { LoggedExercise, ExerciseSet, TemplateExercise } from '../../types';
import SetRow from './SetRow';

interface ExerciseCardProps {
  exercise: LoggedExercise;
  template: TemplateExercise;
  lastExercise?: LoggedExercise; // Previous workout's corresponding exercise
  onChange: (exercise: LoggedExercise) => void;
  onRemove?: () => void; // Optional - only provided when exercise can be removed
}

export default function ExerciseCard({ exercise, template, lastExercise, onChange, onRemove }: ExerciseCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const [showNotes, setShowNotes] = useState(!!exercise.notes);

  const isWeighted = exercise.type === 'weighted';
  const completedSets = exercise.sets.filter(s => s.completed).length;
  const totalSets = exercise.sets.length;

  const handleSetChange = (index: number, updatedSet: ExerciseSet) => {
    const newSets = [...exercise.sets];
    newSets[index] = updatedSet;
    onChange({ ...exercise, sets: newSets });
  };

  const handleAddSet = () => {
    const newSetNumber = exercise.sets.length + 1;
    const lastSet = exercise.sets[exercise.sets.length - 1];
    const newSet: ExerciseSet = {
      setNumber: newSetNumber,
      reps: lastSet?.reps || template.defaultReps,
      weight: isWeighted ? (lastSet?.weight || template.defaultWeight) : undefined,
      completed: false
    };
    onChange({ ...exercise, sets: [...exercise.sets, newSet] });
  };

  const handleRemoveSet = () => {
    if (exercise.sets.length > 1) {
      onChange({ ...exercise, sets: exercise.sets.slice(0, -1) });
    }
  };

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
            isWeighted ? 'bg-accent-primary/20 text-accent-primary' : 'bg-accent-info/20 text-accent-info'
          }`}>
            {isWeighted ? <Dumbbell size={20} /> : <User size={20} />}
          </div>
          <div className="text-left">
            <h3 className="font-display font-semibold text-text-primary">
              {exercise.name}
            </h3>
            <p className="text-xs text-text-muted">
              {completedSets}/{totalSets} sets completed
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Progress indicator */}
          <div className="w-12 h-1.5 bg-bg-tertiary rounded-full overflow-hidden">
            <div
              className="h-full bg-accent-success transition-all duration-300"
              style={{ width: `${(completedSets / totalSets) * 100}%` }}
            />
          </div>
          {isExpanded ? (
            <ChevronUp size={20} className="text-text-muted" />
          ) : (
            <ChevronDown size={20} className="text-text-muted" />
          )}
        </div>
      </button>

      {/* Expanded content */}
      {isExpanded && (
        <div className="px-4 pb-4 space-y-2 animate-slide-up">
          {/* Column headers */}
          <div className="flex items-center gap-3 px-3 text-xs text-text-muted">
            <span className="w-6 text-center">Set</span>
            <span className="flex-1 text-center">Reps</span>
            {isWeighted && <span className="flex-1 text-center">Weight</span>}
            <span className="w-8 text-center">Done</span>
          </div>

          {/* Sets */}
          {exercise.sets.map((set, index) => (
            <SetRow
              key={set.setNumber}
              set={set}
              isWeighted={isWeighted}
              lastSet={lastExercise?.sets[index]}
              onChange={(updatedSet) => handleSetChange(index, updatedSet)}
            />
          ))}

          {/* Add/Remove set buttons */}
          <div className="flex gap-2 pt-2">
            <button
              onClick={handleRemoveSet}
              disabled={exercise.sets.length <= 1}
              className="flex-1 py-2 rounded-lg bg-bg-tertiary text-text-muted hover:bg-bg-secondary transition-colors flex items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Minus size={16} />
              <span className="text-sm">Remove Set</span>
            </button>
            <button
              onClick={handleAddSet}
              className="flex-1 py-2 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors flex items-center justify-center gap-1"
            >
              <Plus size={16} />
              <span className="text-sm">Add Set</span>
            </button>
          </div>

          {/* Exercise notes */}
          {showNotes ? (
            <div className="pt-2 border-t border-white/5 mt-2">
              <textarea
                value={exercise.notes || ''}
                onChange={(e) => onChange({ ...exercise, notes: e.target.value })}
                placeholder="Notes for this exercise..."
                className="w-full h-16 resize-none text-sm"
              />
            </div>
          ) : (
            <button
              onClick={() => setShowNotes(true)}
              className="w-full pt-2 mt-2 border-t border-white/5 text-xs text-text-muted hover:text-text-primary transition-colors flex items-center justify-center gap-1"
            >
              <MessageSquare size={12} />
              Add note
            </button>
          )}

          {/* Remove exercise button */}
          {onRemove && (
            <button
              onClick={onRemove}
              className="w-full py-2 mt-2 rounded-lg bg-accent-danger/10 text-accent-danger hover:bg-accent-danger/20 transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <Trash2 size={14} />
              Remove Exercise
            </button>
          )}
        </div>
      )}
    </div>
  );
}
