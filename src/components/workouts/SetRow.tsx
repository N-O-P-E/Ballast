import { Check } from 'lucide-react';
import { ExerciseSet } from '../../types';

interface SetRowProps {
  set: ExerciseSet;
  isWeighted: boolean;
  lastSet?: ExerciseSet; // Previous workout's corresponding set
  onChange: (set: ExerciseSet) => void;
}

export default function SetRow({ set, isWeighted, lastSet, onChange }: SetRowProps) {
  const handleRepsChange = (value: string) => {
    const reps = parseInt(value) || 0;
    onChange({ ...set, reps });
  };

  const handleWeightChange = (value: string) => {
    const weight = parseFloat(value) || 0;
    onChange({ ...set, weight });
  };

  const handleCompletedChange = () => {
    onChange({ ...set, completed: !set.completed });
  };

  return (
    <div className={`flex items-center gap-3 py-2 px-3 rounded-lg transition-all ${
      set.completed ? 'bg-accent-success/10' : 'bg-bg-tertiary'
    }`}>
      {/* Set number */}
      <span className="w-6 text-center text-text-muted text-sm font-medium">
        {set.setNumber}
      </span>

      {/* Reps input */}
      <div className="flex-1">
        <input
          type="number"
          inputMode="numeric"
          value={set.reps || ''}
          onChange={(e) => handleRepsChange(e.target.value)}
          placeholder={lastSet ? `${lastSet.reps}` : 'Reps'}
          className="w-full bg-transparent border-none p-0 text-center text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-0"
        />
        <span className="text-xs text-text-muted block text-center">reps</span>
      </div>

      {/* Weight input (only for weighted) */}
      {isWeighted && (
        <div className="flex-1">
          <input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={set.weight || ''}
            onChange={(e) => handleWeightChange(e.target.value)}
            placeholder={lastSet?.weight ? `${lastSet.weight}` : 'kg'}
            className="w-full bg-transparent border-none p-0 text-center text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:ring-0"
          />
          <span className="text-xs text-text-muted block text-center">kg</span>
        </div>
      )}

      {/* Completion checkbox */}
      <button
        onClick={handleCompletedChange}
        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
          set.completed
            ? 'bg-accent-success text-white'
            : 'bg-bg-secondary border border-white/10 text-text-muted hover:border-accent-success/50'
        }`}
      >
        <Check size={16} />
      </button>
    </div>
  );
}
