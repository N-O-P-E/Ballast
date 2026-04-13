import { useState, useMemo } from 'react';
import { StrengthPR } from '../types';
import { EXERCISES } from '../constants';
import { generateId, formatDateISO, formatDate } from '../hooks/useLocalStorage';
import { Plus, Trash2, Trophy, Dumbbell, User, X } from 'lucide-react';

interface StrengthPRsProps {
  prs: StrengthPR[];
  onUpdatePRs: (prs: StrengthPR[]) => void;
  customExercises: string[];
  onUpdateCustomExercises: (exercises: string[]) => void;
}

export default function StrengthPRs({ prs, onUpdatePRs, customExercises, onUpdateCustomExercises }: StrengthPRsProps) {
  const [showForm, setShowForm] = useState(false);
  const [showAddExercise, setShowAddExercise] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [prType, setPrType] = useState<'bodyweight' | 'weighted'>('bodyweight');
  const [exercise, setExercise] = useState<string>(EXERCISES[0]);
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [date, setDate] = useState(formatDateISO());

  // Combine default and custom exercises
  const allExercises = useMemo(() => {
    return [...EXERCISES, ...customExercises];
  }, [customExercises]);

  const handleAddExercise = () => {
    const trimmed = newExerciseName.trim();
    if (!trimmed) return;
    if (allExercises.includes(trimmed)) {
      alert('Exercise already exists!');
      return;
    }
    onUpdateCustomExercises([...customExercises, trimmed]);
    setNewExerciseName('');
    setShowAddExercise(false);
    setExercise(trimmed);
  };

  const handleDeleteExercise = (exerciseName: string) => {
    // Remove from custom exercises
    onUpdateCustomExercises(customExercises.filter(e => e !== exerciseName));
    // Also remove all PRs for this exercise
    onUpdatePRs(prs.filter(pr => pr.exercise !== exerciseName));
  };

  // Group PRs by exercise
  const prsByExercise = useMemo(() => {
    return allExercises.reduce((acc, ex) => {
      const exercisePRs = prs.filter(pr => pr.exercise === ex);
      const bodyweightPR = exercisePRs
        .filter(pr => pr.type === 'bodyweight')
        .sort((a, b) => b.reps - a.reps)[0];
      const weightedPR = exercisePRs
        .filter(pr => pr.type === 'weighted')
        .sort((a, b) => (b.weight || 0) * b.reps - (a.weight || 0) * a.reps)[0];

      acc[ex] = { bodyweightPR, weightedPR };
      return acc;
    }, {} as Record<string, { bodyweightPR?: StrengthPR; weightedPR?: StrengthPR }>);
  }, [allExercises, prs]);

  const handleAdd = () => {
    if (!reps) return;

    const pr: StrengthPR = {
      id: generateId(),
      exercise,
      type: prType,
      reps: parseInt(reps),
      ...(prType === 'weighted' && weight && { weight: parseFloat(weight) }),
      date
    };

    onUpdatePRs([...prs, pr]);
    setReps('');
    setWeight('');
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onUpdatePRs(prs.filter(pr => pr.id !== id));
  };

  const recentPRs = [...prs]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* PR Leaderboard */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider flex items-center gap-2">
          <Trophy size={16} className="text-accent-secondary" />
          Personal Records
        </h3>

        <div className="space-y-2">
          {allExercises.map(ex => {
            const { bodyweightPR, weightedPR } = prsByExercise[ex] || {};
            const hasPR = bodyweightPR || weightedPR;
            const isCustom = customExercises.includes(ex);

            return (
              <div
                key={ex}
                className={`card-hover ${hasPR ? '' : 'opacity-50'}`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h4 className="font-semibold">{ex}</h4>
                    {isCustom && (
                      <span className="text-xs bg-accent-primary/20 text-accent-primary px-1.5 py-0.5 rounded">
                        Custom
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {!hasPR && (
                      <span className="text-text-muted text-xs">No PR yet</span>
                    )}
                    {isCustom && (
                      <button
                        onClick={() => {
                          if (confirm(`Delete "${ex}" and all its PRs?`)) {
                            handleDeleteExercise(ex);
                          }
                        }}
                        className="p-1 text-text-muted hover:text-accent-danger transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                    )}
                  </div>
                </div>

                {hasPR && (
                  <div className="flex gap-4 mt-2">
                    {bodyweightPR && (
                      <div className="flex items-center gap-2">
                        <User size={14} className="text-accent-info" />
                        <span className="text-sm">
                          <span className="font-bold">{bodyweightPR.reps}</span>
                          <span className="text-text-muted"> reps</span>
                        </span>
                      </div>
                    )}
                    {weightedPR && (
                      <div className="flex items-center gap-2">
                        <Dumbbell size={14} className="text-accent-primary" />
                        <span className="text-sm">
                          <span className="font-bold">{weightedPR.reps}</span>
                          <span className="text-text-muted"> × </span>
                          <span className="font-bold">{weightedPR.weight}</span>
                          <span className="text-text-muted">kg</span>
                        </span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Add Exercise Button */}
        {showAddExercise ? (
          <div className="card p-4 space-y-3 animate-scale-in">
            <div className="flex items-center justify-between">
              <label className="text-text-muted text-xs">New Exercise Name</label>
              <button
                onClick={() => setShowAddExercise(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>
            <input
              type="text"
              value={newExerciseName}
              onChange={(e) => setNewExerciseName(e.target.value)}
              placeholder="e.g., Muscle-ups"
              className="w-full"
              autoFocus
            />
            <button onClick={handleAddExercise} className="btn-primary w-full">
              Add Exercise
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddExercise(true)}
            className="w-full py-2 rounded-lg border-2 border-dashed border-white/10 text-text-muted hover:border-accent-primary/50 hover:text-accent-primary transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Custom Exercise
          </button>
        )}
      </div>

      {/* Add PR Form */}
      {showForm ? (
        <div className="card space-y-4 animate-scale-in">
          <h3 className="font-display font-semibold">Log New PR</h3>
          
          {/* Type Toggle */}
          <div className="flex gap-2">
            <button
              onClick={() => setPrType('bodyweight')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                prType === 'bodyweight' 
                  ? 'bg-accent-info/20 text-accent-info border border-accent-info/50' 
                  : 'bg-bg-tertiary text-text-muted border border-white/10'
              }`}
            >
              <User size={16} />
              Bodyweight
            </button>
            <button
              onClick={() => setPrType('weighted')}
              className={`flex-1 py-2 px-4 rounded-lg font-medium transition-all flex items-center justify-center gap-2 ${
                prType === 'weighted' 
                  ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/50' 
                  : 'bg-bg-tertiary text-text-muted border border-white/10'
              }`}
            >
              <Dumbbell size={16} />
              Weighted
            </button>
          </div>

          <div>
            <label className="text-text-muted text-xs mb-1 block">Exercise</label>
            <select
              value={exercise}
              onChange={(e) => setExercise(e.target.value)}
              className="w-full"
            >
              {allExercises.map(ex => (
                <option key={ex} value={ex}>{ex}</option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-xs mb-1 block">Reps</label>
              <input
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                placeholder="10"
                className="w-full"
                autoFocus
              />
            </div>
            {prType === 'weighted' && (
              <div>
                <label className="text-text-muted text-xs mb-1 block">Weight (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="20"
                  className="w-full"
                />
              </div>
            )}
          </div>

          <div>
            <label className="text-text-muted text-xs mb-1 block">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="flex gap-3">
            <button onClick={handleAdd} className="btn-primary flex-1">
              Save PR
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Log New PR
        </button>
      )}

      {/* Recent PRs */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Recent PRs
        </h3>
        
        {recentPRs.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-text-muted">No PRs logged yet</p>
            <p className="text-text-muted text-sm mt-1">Start tracking your personal records!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {recentPRs.map((pr) => (
              <div 
                key={pr.id}
                className="card-hover flex items-center justify-between py-3"
              >
                <div className="flex items-center gap-3">
                  {pr.type === 'weighted' ? (
                    <div className="w-8 h-8 rounded-full bg-accent-primary/20 flex items-center justify-center">
                      <Dumbbell size={16} className="text-accent-primary" />
                    </div>
                  ) : (
                    <div className="w-8 h-8 rounded-full bg-accent-info/20 flex items-center justify-center">
                      <User size={16} className="text-accent-info" />
                    </div>
                  )}
                  <div>
                    <p className="font-semibold">{pr.exercise}</p>
                    <p className="text-sm text-text-muted">
                      {pr.type === 'weighted' 
                        ? `${pr.reps} × ${pr.weight}kg`
                        : `${pr.reps} reps`
                      }
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-text-muted text-xs">
                    {formatDate(pr.date)}
                  </span>
                  <button 
                    onClick={() => handleDelete(pr.id)}
                    className="p-2 text-text-muted hover:text-accent-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
