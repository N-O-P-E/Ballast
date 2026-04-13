import { useState } from 'react';
import { SkillProgress, SkillDefinition, SkillCategory } from '../types';
import { DEFAULT_SKILL_DEFINITIONS, CATEGORY_COLORS, CATEGORY_LABELS } from '../constants';
import { generateId, formatDateISO, formatDate } from '../hooks/useLocalStorage';
import { Check, Lock, Timer, ChevronDown, ChevronUp, Trophy, Plus, Pencil, Trash2, X, RotateCcw } from 'lucide-react';

interface SkillsTrackerProps {
  skills: SkillProgress[];
  onUpdateSkills: (skills: SkillProgress[]) => void;
  skillDefinitions: SkillDefinition[];
  onUpdateSkillDefinitions: (definitions: SkillDefinition[]) => void;
}

export default function SkillsTracker({
  skills,
  onUpdateSkills,
  skillDefinitions,
  onUpdateSkillDefinitions
}: SkillsTrackerProps) {
  const [expandedSkill, setExpandedSkill] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | SkillCategory>('all');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSkillId, setEditingSkillId] = useState<string | null>(null);
  const [editedSkill, setEditedSkill] = useState<SkillDefinition | null>(null);
  const [newSkill, setNewSkill] = useState({
    name: '',
    progressions: [''],
    isHoldBased: false,
    category: 'pull' as SkillCategory
  });

  const getSkillProgress = (skillId: string, skillName: string): SkillProgress | undefined => {
    // Try to find by ID first, then by name for backwards compatibility
    return skills.find(s => s.skillId === skillId || s.skill === skillName);
  };

  const updateSkillProgress = (
    skillId: string,
    skillName: string,
    updates: Partial<Omit<SkillProgress, 'id' | 'skill' | 'skillId'>>
  ) => {
    const existing = getSkillProgress(skillId, skillName);

    if (existing) {
      onUpdateSkills(skills.map(s =>
        (s.skillId === skillId || s.skill === skillName) ? { ...s, ...updates, skillId } : s
      ));
    } else {
      const newProgress: SkillProgress = {
        id: generateId(),
        skill: skillName,
        skillId,
        currentStep: 0,
        ...updates
      };
      onUpdateSkills([...skills, newProgress]);
    }
  };

  const handleProgressionChange = (skillDef: SkillDefinition, stepIndex: number) => {
    const progress = getSkillProgress(skillDef.id, skillDef.name);
    const currentStep = progress?.currentStep ?? -1; // -1 means nothing unlocked yet

    // If clicking current step, go back one step
    if (stepIndex === currentStep) {
      updateSkillProgress(skillDef.id, skillDef.name, {
        currentStep: stepIndex - 1,
        dateUnlocked: stepIndex - 1 >= 0 ? formatDateISO() : undefined
      });
    }
    // If clicking the next step, advance
    else if (stepIndex === currentStep + 1) {
      updateSkillProgress(skillDef.id, skillDef.name, {
        currentStep: stepIndex,
        dateUnlocked: formatDateISO()
      });
    }
  };

  const handleHoldTimeChange = (skillDef: SkillDefinition, holdTime: number) => {
    const progress = getSkillProgress(skillDef.id, skillDef.name);
    const currentPR = progress?.prHoldTime || 0;

    updateSkillProgress(skillDef.id, skillDef.name, {
      holdTime,
      prHoldTime: Math.max(currentPR, holdTime)
    });
  };

  // Skill definition CRUD
  const handleAddSkill = () => {
    if (!newSkill.name.trim()) return;
    const validProgressions = newSkill.progressions.filter(p => p.trim());
    if (validProgressions.length === 0) return;

    const skill: SkillDefinition = {
      id: generateId(),
      name: newSkill.name.trim(),
      progressions: validProgressions,
      isHoldBased: newSkill.isHoldBased,
      category: newSkill.category
    };

    onUpdateSkillDefinitions([...skillDefinitions, skill]);
    setNewSkill({
      name: '',
      progressions: [''],
      isHoldBased: false,
      category: 'pull'
    });
    setShowAddForm(false);
  };

  const handleStartEditSkill = (skill: SkillDefinition) => {
    setEditingSkillId(skill.id);
    setEditedSkill({ ...skill, progressions: [...skill.progressions] });
  };

  const handleSaveSkill = () => {
    if (!editedSkill || !editingSkillId) return;
    const validProgressions = editedSkill.progressions.filter(p => p.trim());
    if (!editedSkill.name.trim() || validProgressions.length === 0) return;

    onUpdateSkillDefinitions(skillDefinitions.map(s =>
      s.id === editingSkillId ? { ...editedSkill, progressions: validProgressions } : s
    ));
    setEditingSkillId(null);
    setEditedSkill(null);
  };

  const handleCancelEdit = () => {
    setEditingSkillId(null);
    setEditedSkill(null);
  };

  const handleDeleteSkill = (skillId: string, skillName: string) => {
    if (!confirm(`Delete "${skillName}"? Your progress will be kept but the skill won't be visible.`)) return;
    onUpdateSkillDefinitions(skillDefinitions.filter(s => s.id !== skillId));
  };

  const handleResetSkills = () => {
    if (confirm('Reset all skills to defaults? Your progress will be kept.')) {
      onUpdateSkillDefinitions(DEFAULT_SKILL_DEFINITIONS);
    }
  };

  const addProgressionStep = () => {
    if (editedSkill) {
      setEditedSkill({ ...editedSkill, progressions: [...editedSkill.progressions, ''] });
    } else {
      setNewSkill({ ...newSkill, progressions: [...newSkill.progressions, ''] });
    }
  };

  const removeProgressionStep = (index: number) => {
    if (editedSkill) {
      const progs = [...editedSkill.progressions];
      progs.splice(index, 1);
      setEditedSkill({ ...editedSkill, progressions: progs });
    } else {
      const progs = [...newSkill.progressions];
      progs.splice(index, 1);
      setNewSkill({ ...newSkill, progressions: progs });
    }
  };

  const updateProgressionStep = (index: number, value: string) => {
    if (editedSkill) {
      const progs = [...editedSkill.progressions];
      progs[index] = value;
      setEditedSkill({ ...editedSkill, progressions: progs });
    } else {
      const progs = [...newSkill.progressions];
      progs[index] = value;
      setNewSkill({ ...newSkill, progressions: progs });
    }
  };

  const filteredSkills = skillDefinitions.filter(
    skill => filter === 'all' || skill.category === filter
  );

  // Stats
  const totalUnlocked = skills.filter(s => (s.currentStep ?? -1) >= 0).length;
  const fullyMastered = skills.filter(s => {
    const def = skillDefinitions.find(d => d.id === s.skillId || d.name === s.skill);
    return def && (s.currentStep ?? -1) >= def.progressions.length - 1;
  }).length;

  // Check if skills have been modified from defaults
  const hasCustomChanges = JSON.stringify(skillDefinitions) !== JSON.stringify(DEFAULT_SKILL_DEFINITIONS);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card text-center">
          <Trophy size={20} className="text-accent-secondary mx-auto mb-2" />
          <p className="font-display text-3xl font-bold">{totalUnlocked}</p>
          <p className="text-text-muted text-xs">Skills Started</p>
        </div>
        <div className="card text-center bg-gradient-to-br from-accent-secondary/20 to-bg-card">
          <div className="text-2xl mb-2">⭐</div>
          <p className="font-display text-3xl font-bold text-accent-secondary">{fullyMastered}</p>
          <p className="text-text-muted text-xs">Mastered</p>
        </div>
      </div>

      {/* Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            filter === 'all'
              ? 'bg-white/10 text-white'
              : 'bg-bg-tertiary text-text-muted hover:text-white'
          }`}
        >
          All
        </button>
        {(['pull', 'push', 'core', 'legs'] as const).map(cat => (
          <button
            key={cat}
            onClick={() => setFilter(cat)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
              filter === cat
                ? 'text-white'
                : 'bg-bg-tertiary text-text-muted hover:text-white'
            }`}
            style={filter === cat ? { backgroundColor: CATEGORY_COLORS[cat] + '40' } : {}}
          >
            {CATEGORY_LABELS[cat]}
          </button>
        ))}
      </div>

      {/* Skills List */}
      <div className="space-y-3">
        {filteredSkills.map(skillDef => {
          const progress = getSkillProgress(skillDef.id, skillDef.name);
          const currentStep = progress?.currentStep ?? -1; // -1 means nothing unlocked
          const isExpanded = expandedSkill === skillDef.id;
          const progressPercent = currentStep >= 0
            ? ((currentStep + 1) / skillDef.progressions.length) * 100
            : 0;
          const isMastered = currentStep >= skillDef.progressions.length - 1;
          const isEditing = editingSkillId === skillDef.id;

          if (isEditing && editedSkill) {
            return (
              <div key={skillDef.id} className="card p-4 space-y-3 border border-accent-primary/30">
                <div className="flex items-center justify-between">
                  <h4 className="font-medium text-text-primary">Edit Skill</h4>
                  <button onClick={handleCancelEdit} className="text-text-muted hover:text-text-primary">
                    <X size={16} />
                  </button>
                </div>

                <div>
                  <label className="text-text-muted text-xs mb-1 block">Name</label>
                  <input
                    type="text"
                    value={editedSkill.name}
                    onChange={(e) => setEditedSkill({ ...editedSkill, name: e.target.value })}
                    className="w-full"
                    autoFocus
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-muted text-xs mb-1 block">Category</label>
                    <select
                      value={editedSkill.category}
                      onChange={(e) => setEditedSkill({ ...editedSkill, category: e.target.value as SkillCategory })}
                      className="w-full"
                    >
                      <option value="pull">Pull</option>
                      <option value="push">Push</option>
                      <option value="core">Core</option>
                      <option value="legs">Legs</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="flex items-center gap-2 text-sm text-text-secondary">
                      <input
                        type="checkbox"
                        checked={editedSkill.isHoldBased}
                        onChange={(e) => setEditedSkill({ ...editedSkill, isHoldBased: e.target.checked })}
                        className="w-4 h-4"
                      />
                      Hold-based
                    </label>
                  </div>
                </div>

                <div>
                  <label className="text-text-muted text-xs mb-1 block">Progressions</label>
                  <div className="space-y-2">
                    {editedSkill.progressions.map((prog, index) => (
                      <div key={index} className="flex gap-2">
                        <span className="text-text-muted text-sm w-6 flex items-center">{index + 1}.</span>
                        <input
                          type="text"
                          value={prog}
                          onChange={(e) => updateProgressionStep(index, e.target.value)}
                          className="flex-1"
                          placeholder={`Step ${index + 1}`}
                        />
                        {editedSkill.progressions.length > 1 && (
                          <button
                            onClick={() => removeProgressionStep(index)}
                            className="p-2 text-text-muted hover:text-accent-danger"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    ))}
                    <button
                      onClick={addProgressionStep}
                      className="text-accent-primary text-sm flex items-center gap-1"
                    >
                      <Plus size={14} /> Add step
                    </button>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <button onClick={handleSaveSkill} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1">
                    <Check size={14} /> Save
                  </button>
                  <button onClick={handleCancelEdit} className="btn-secondary flex-1 py-2 text-sm">
                    Cancel
                  </button>
                </div>
              </div>
            );
          }

          return (
            <div
              key={skillDef.id}
              className={`card-hover overflow-hidden ${isMastered ? 'glow-green' : ''}`}
            >
              {/* Header */}
              <button
                onClick={() => setExpandedSkill(isExpanded ? null : skillDef.id)}
                className="w-full flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-lg"
                    style={{ backgroundColor: CATEGORY_COLORS[skillDef.category] + '20' }}
                  >
                    {isMastered ? '⭐' : currentStep >= 0 ? '🔓' : '🔒'}
                  </div>
                  <div className="text-left">
                    <h4 className="font-semibold">{skillDef.name}</h4>
                    <p className="text-text-muted text-xs">
                      {currentStep >= 0 ? skillDef.progressions[currentStep] : 'Not started'}
                      {skillDef.isHoldBased && progress?.holdTime && (
                        <span className="ml-2 text-accent-primary">
                          {progress.holdTime}s
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-16 h-2 bg-bg-tertiary rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        width: `${progressPercent}%`,
                        backgroundColor: CATEGORY_COLORS[skillDef.category]
                      }}
                    />
                  </div>
                  {isExpanded ? (
                    <ChevronUp size={18} className="text-text-muted" />
                  ) : (
                    <ChevronDown size={18} className="text-text-muted" />
                  )}
                </div>
              </button>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="mt-4 pt-4 border-t border-white/5 animate-slide-up">
                  {/* Edit/Delete buttons */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => handleStartEditSkill(skillDef)}
                      className="flex items-center gap-1 text-sm text-text-muted hover:text-accent-primary transition-colors"
                    >
                      <Pencil size={14} /> Edit skill
                    </button>
                    <button
                      onClick={() => handleDeleteSkill(skillDef.id, skillDef.name)}
                      className="flex items-center gap-1 text-sm text-text-muted hover:text-accent-danger transition-colors"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>

                  {/* Progression Steps */}
                  <div className="space-y-2 mb-4">
                    {skillDef.progressions.map((step, index) => {
                      const isUnlocked = index <= currentStep;
                      const isCurrent = index === currentStep;
                      const isNext = index === currentStep + 1;

                      return (
                        <button
                          key={step}
                          onClick={() => handleProgressionChange(skillDef, index)}
                          disabled={!isUnlocked && !isNext}
                          className={`w-full flex items-center gap-3 p-3 rounded-lg transition-all ${
                            isCurrent
                              ? 'bg-accent-primary/20 border border-accent-primary/50'
                              : isUnlocked
                                ? 'bg-accent-success/10 border border-accent-success/30'
                                : isNext
                                  ? 'bg-bg-tertiary border border-white/10 hover:border-white/30'
                                  : 'bg-bg-tertiary/50 border border-transparent opacity-50'
                          }`}
                        >
                          <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                            isUnlocked
                              ? 'bg-accent-success text-white'
                              : 'bg-bg-secondary text-text-muted'
                          }`}>
                            {isUnlocked ? (
                              <Check size={14} />
                            ) : (
                              <Lock size={12} />
                            )}
                          </div>
                          <span className={`flex-1 text-left text-sm ${
                            isUnlocked ? 'text-white' : 'text-text-muted'
                          }`}>
                            {step}
                          </span>
                          {isNext && (
                            <span className="text-xs text-accent-primary">Tap to unlock</span>
                          )}
                          {isCurrent && (
                            <span className="text-xs text-accent-primary">Current</span>
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Hold Time (for hold-based skills) */}
                  {skillDef.isHoldBased && currentStep >= 0 && (
                    <div className="bg-bg-tertiary rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <Timer size={16} className="text-accent-primary" />
                        <span className="text-sm font-medium">Hold Time</span>
                      </div>
                      <div className="flex items-center gap-4">
                        <input
                          type="number"
                          value={progress?.holdTime || ''}
                          onChange={(e) => handleHoldTimeChange(skillDef, parseInt(e.target.value) || 0)}
                          placeholder="0"
                          className="w-24 text-center"
                        />
                        <span className="text-text-muted">seconds</span>
                        {progress?.prHoldTime && progress.prHoldTime > 0 && (
                          <span className="text-accent-secondary text-sm ml-auto">
                            PR: {progress.prHoldTime}s
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Date Unlocked */}
                  {progress?.dateUnlocked && (
                    <p className="text-text-muted text-xs mt-3">
                      Last progress: {formatDate(progress.dateUnlocked)}
                    </p>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Add Skill Form */}
      {showAddForm ? (
        <div className="card p-4 space-y-3 animate-scale-in">
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-text-primary">Add Custom Skill</h4>
            <button onClick={() => setShowAddForm(false)} className="text-text-muted hover:text-text-primary">
              <X size={16} />
            </button>
          </div>

          <div>
            <label className="text-text-muted text-xs mb-1 block">Name</label>
            <input
              type="text"
              value={newSkill.name}
              onChange={(e) => setNewSkill({ ...newSkill, name: e.target.value })}
              className="w-full"
              placeholder="Skill name"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-xs mb-1 block">Category</label>
              <select
                value={newSkill.category}
                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value as SkillCategory })}
                className="w-full"
              >
                <option value="pull">Pull</option>
                <option value="push">Push</option>
                <option value="core">Core</option>
                <option value="legs">Legs</option>
              </select>
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2 text-sm text-text-secondary">
                <input
                  type="checkbox"
                  checked={newSkill.isHoldBased}
                  onChange={(e) => setNewSkill({ ...newSkill, isHoldBased: e.target.checked })}
                  className="w-4 h-4"
                />
                Hold-based
              </label>
            </div>
          </div>

          <div>
            <label className="text-text-muted text-xs mb-1 block">Progressions</label>
            <div className="space-y-2">
              {newSkill.progressions.map((prog, index) => (
                <div key={index} className="flex gap-2">
                  <span className="text-text-muted text-sm w-6 flex items-center">{index + 1}.</span>
                  <input
                    type="text"
                    value={prog}
                    onChange={(e) => updateProgressionStep(index, e.target.value)}
                    className="flex-1"
                    placeholder={`Step ${index + 1}`}
                  />
                  {newSkill.progressions.length > 1 && (
                    <button
                      onClick={() => removeProgressionStep(index)}
                      className="p-2 text-text-muted hover:text-accent-danger"
                    >
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              ))}
              <button
                onClick={addProgressionStep}
                className="text-accent-primary text-sm flex items-center gap-1"
              >
                <Plus size={14} /> Add step
              </button>
            </div>
          </div>

          <button onClick={handleAddSkill} className="btn-primary w-full">
            Add Skill
          </button>
        </div>
      ) : (
        <button
          onClick={() => setShowAddForm(true)}
          className="w-full py-2 rounded-lg border-2 border-dashed border-white/10 text-text-muted hover:border-accent-primary/50 hover:text-accent-primary transition-all flex items-center justify-center gap-2 text-sm"
        >
          <Plus size={16} />
          Add Custom Skill
        </button>
      )}

      {/* Reset to defaults */}
      {hasCustomChanges && (
        <button
          onClick={handleResetSkills}
          className="w-full py-2 text-text-muted hover:text-accent-warning text-sm transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Reset skills to defaults
        </button>
      )}
    </div>
  );
}
