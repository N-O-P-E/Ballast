import { useState } from 'react';
import { X, Plus, Trash2, ChevronUp, ChevronDown, Dumbbell, User, Save, FileText } from 'lucide-react';
import { WorkoutTemplate, TemplateExercise } from '../../types';
import { PPL_CATEGORY_COLORS, PPL_CATEGORY_LABELS } from '../../constants';

interface TemplateEditorProps {
  template: WorkoutTemplate;
  onSave: (template: WorkoutTemplate) => void;
  onClose: () => void;
}

// Generate unique ID
const generateId = () => `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

export default function TemplateEditor({ template, onSave, onClose }: TemplateEditorProps) {
  const [exercises, setExercises] = useState<TemplateExercise[]>([...template.exercises]);
  const [editingExercise, setEditingExercise] = useState<string | null>(null);
  const [notes, setNotes] = useState(template.notes || '');
  const [showNotes, setShowNotes] = useState(!!template.notes);

  const categoryColor = PPL_CATEGORY_COLORS[template.category];

  const handleAddExercise = () => {
    const newExercise: TemplateExercise = {
      id: generateId(),
      name: 'New Exercise',
      type: 'weighted',
      defaultSets: 3,
      defaultReps: 10,
      defaultWeight: 20,
      order: exercises.length + 1
    };
    setExercises([...exercises, newExercise]);
    setEditingExercise(newExercise.id);
  };

  const handleUpdateExercise = (id: string, updates: Partial<TemplateExercise>) => {
    setExercises(exercises.map(e =>
      e.id === id ? { ...e, ...updates } : e
    ));
  };

  const handleDeleteExercise = (id: string) => {
    setExercises(exercises.filter(e => e.id !== id));
    if (editingExercise === id) {
      setEditingExercise(null);
    }
  };

  const handleMoveUp = (index: number) => {
    if (index === 0) return;
    const newExercises = [...exercises];
    [newExercises[index - 1], newExercises[index]] = [newExercises[index], newExercises[index - 1]];
    // Update order numbers
    newExercises.forEach((e, i) => e.order = i + 1);
    setExercises(newExercises);
  };

  const handleMoveDown = (index: number) => {
    if (index === exercises.length - 1) return;
    const newExercises = [...exercises];
    [newExercises[index], newExercises[index + 1]] = [newExercises[index + 1], newExercises[index]];
    // Update order numbers
    newExercises.forEach((e, i) => e.order = i + 1);
    setExercises(newExercises);
  };

  const handleSave = () => {
    const updatedTemplate: WorkoutTemplate = {
      ...template,
      exercises,
      lastModified: new Date().toISOString(),
      notes: notes.trim() || undefined
    };
    onSave(updatedTemplate);
  };

  return (
    <div className="fixed inset-0 z-50">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Drawer - full screen on mobile, above nav bar */}
      <div className="absolute inset-x-0 bottom-16 top-12 sm:bottom-auto sm:top-auto sm:left-1/2 sm:top-1/2 sm:-translate-x-1/2 sm:-translate-y-1/2 sm:max-w-lg sm:max-h-[85vh] bg-bg-primary sm:rounded-2xl rounded-b-2xl overflow-hidden animate-slide-up flex flex-col">
        {/* Header */}
        <div
          className="flex-shrink-0 flex items-center justify-between p-4 border-b border-white/10"
          style={{ backgroundColor: categoryColor }}
        >
          <div>
            <h2 className="font-display text-lg font-bold text-white">
              Edit {PPL_CATEGORY_LABELS[template.category]} Template
            </h2>
            <p className="text-sm text-white/70">{exercises.length} exercises</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content - scrollable */}
        <div className="flex-1 min-h-0 p-4 overflow-y-auto space-y-3">
          {/* Template notes */}
          <div className="card p-4">
            {showNotes ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <FileText size={16} className="text-text-muted" />
                    <span className="text-sm text-text-muted">Template Notes</span>
                  </div>
                  <button
                    onClick={() => {
                      setShowNotes(false);
                      setNotes('');
                    }}
                    className="text-text-muted hover:text-text-primary transition-colors"
                  >
                    <X size={16} />
                  </button>
                </div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about this template (e.g., warm-up routine, focus areas, tips...)"
                  className="w-full h-24 resize-none"
                />
              </div>
            ) : (
              <button
                onClick={() => setShowNotes(true)}
                className="w-full text-left text-sm text-text-muted hover:text-text-primary transition-colors flex items-center gap-2"
              >
                <FileText size={16} />
                + Add template notes
              </button>
            )}
          </div>

          {exercises.map((exercise, index) => {
            const isEditing = editingExercise === exercise.id;

            return (
              <div
                key={exercise.id}
                className={`card p-4 transition-all ${isEditing ? 'ring-2 ring-accent-primary' : ''}`}
              >
                {isEditing ? (
                  // Edit mode
                  <div className="space-y-4">
                    {/* Name */}
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Exercise Name</label>
                      <input
                        type="text"
                        value={exercise.name}
                        onChange={(e) => handleUpdateExercise(exercise.id, { name: e.target.value })}
                        className="w-full"
                        autoFocus
                      />
                    </div>

                    {/* Type toggle */}
                    <div>
                      <label className="text-xs text-text-muted mb-1 block">Type</label>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleUpdateExercise(exercise.id, { type: 'weighted' })}
                          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            exercise.type === 'weighted'
                              ? 'bg-accent-primary/20 text-accent-primary border border-accent-primary/50'
                              : 'bg-bg-tertiary text-text-muted border border-white/10'
                          }`}
                        >
                          <Dumbbell size={16} />
                          Weighted
                        </button>
                        <button
                          onClick={() => handleUpdateExercise(exercise.id, { type: 'bodyweight', defaultWeight: undefined })}
                          className={`flex-1 py-2 px-3 rounded-lg flex items-center justify-center gap-2 transition-all ${
                            exercise.type === 'bodyweight'
                              ? 'bg-accent-info/20 text-accent-info border border-accent-info/50'
                              : 'bg-bg-tertiary text-text-muted border border-white/10'
                          }`}
                        >
                          <User size={16} />
                          Bodyweight
                        </button>
                      </div>
                    </div>

                    {/* Sets and Reps */}
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-xs text-text-muted mb-1 block">Sets</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="10"
                          value={exercise.defaultSets}
                          onChange={(e) => handleUpdateExercise(exercise.id, { defaultSets: parseInt(e.target.value) || 1 })}
                          className="w-full text-center"
                        />
                      </div>
                      <div>
                        <label className="text-xs text-text-muted mb-1 block">Reps</label>
                        <input
                          type="number"
                          inputMode="numeric"
                          min="1"
                          max="100"
                          value={exercise.defaultReps}
                          onChange={(e) => handleUpdateExercise(exercise.id, { defaultReps: parseInt(e.target.value) || 1 })}
                          className="w-full text-center"
                        />
                      </div>
                      {exercise.type === 'weighted' && (
                        <div>
                          <label className="text-xs text-text-muted mb-1 block">Weight (kg)</label>
                          <input
                            type="number"
                            inputMode="decimal"
                            step="0.5"
                            min="0"
                            value={exercise.defaultWeight || ''}
                            onChange={(e) => handleUpdateExercise(exercise.id, { defaultWeight: parseFloat(e.target.value) || 0 })}
                            className="w-full text-center"
                          />
                        </div>
                      )}
                    </div>

                    {/* Done button */}
                    <button
                      onClick={() => setEditingExercise(null)}
                      className="w-full py-2 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors"
                    >
                      Done
                    </button>
                  </div>
                ) : (
                  // View mode
                  <div className="flex items-center gap-3">
                    {/* Move buttons */}
                    <div className="flex flex-col">
                      <button
                        onClick={() => handleMoveUp(index)}
                        disabled={index === 0}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                      >
                        <ChevronUp size={14} />
                      </button>
                      <button
                        onClick={() => handleMoveDown(index)}
                        disabled={index === exercises.length - 1}
                        className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30 transition-colors"
                      >
                        <ChevronDown size={14} />
                      </button>
                    </div>

                    {/* Exercise icon */}
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      exercise.type === 'weighted' ? 'bg-accent-primary/20 text-accent-primary' : 'bg-accent-info/20 text-accent-info'
                    }`}>
                      {exercise.type === 'weighted' ? <Dumbbell size={20} /> : <User size={20} />}
                    </div>

                    {/* Exercise info */}
                    <button
                      onClick={() => setEditingExercise(exercise.id)}
                      className="flex-1 text-left"
                    >
                      <p className="font-medium text-text-primary">{exercise.name}</p>
                      <p className="text-xs text-text-muted">
                        {exercise.defaultSets} sets × {exercise.defaultReps} reps
                        {exercise.type === 'weighted' && exercise.defaultWeight ? ` @ ${exercise.defaultWeight}kg` : ''}
                      </p>
                    </button>

                    {/* Delete button */}
                    <button
                      onClick={() => handleDeleteExercise(exercise.id)}
                      className="p-2 rounded-lg text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                )}
              </div>
            );
          })}

          {/* Add exercise button */}
          <button
            onClick={handleAddExercise}
            className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-text-muted hover:border-accent-primary/50 hover:text-accent-primary transition-all flex items-center justify-center gap-2"
          >
            <Plus size={20} />
            Add Exercise
          </button>

          {/* Save button */}
          <button
            onClick={handleSave}
            className="w-full btn-primary flex items-center justify-center gap-2 py-4 mt-4"
            style={{ backgroundColor: categoryColor }}
          >
            <Save size={18} />
            Save Template
          </button>
        </div>
      </div>
    </div>
  );
}
