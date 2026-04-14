import { useState, useEffect, useRef } from 'react';
import { X, Bell, BellOff, Clock, ChevronLeft, ChevronRight, RotateCcw, Edit2, Check, Download, Upload, Smartphone, AlertCircle, User, Target, Plus, Trash2 } from 'lucide-react';
import { useNotifications, MealTime } from '../hooks/useNotifications';
import { UserProfile, Gender, Phase, AppData } from '../types';
import { AppDataSchema } from '../types/schema';
import { DEFAULT_PHASES } from '../constants';

interface SettingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  profile: UserProfile;
  onUpdateProfile: (profile: UserProfile) => void;
  phases: Phase[];
  onUpdatePhases: (phases: Phase[]) => void;
  allData: AppData;
  onImportData: (data: AppData) => void;
}

// Format hour for display
const formatHour = (hour: number): string => {
  return `${hour.toString().padStart(2, '0')}:00`;
};

// Time picker component
function TimePicker({
  meal,
  onSave,
  onCancel
}: {
  meal: MealTime;
  onSave: (hour: number, minute: number) => void;
  onCancel: () => void;
}) {
  const [hour, setHour] = useState(meal.hour);
  const [minute, setMinute] = useState(meal.minute);

  const adjustHour = (delta: number) => {
    setHour((prev) => (prev + delta + 24) % 24);
  };

  const adjustMinute = (delta: number) => {
    setMinute((prev) => {
      const newMin = prev + delta;
      if (newMin >= 60) {
        setHour((h) => (h + 1) % 24);
        return 0;
      }
      if (newMin < 0) {
        setHour((h) => (h - 1 + 24) % 24);
        return 30;
      }
      return newMin;
    });
  };

  return (
    <div className="bg-bg-tertiary rounded-xl p-4 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-text-primary font-medium">{meal.label}</span>
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted"
          >
            <X size={16} />
          </button>
          <button
            onClick={() => onSave(hour, minute)}
            className="p-1.5 rounded-lg bg-accent-primary text-white"
          >
            <Check size={16} />
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-4">
        {/* Hour */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => adjustHour(1)}
            className="p-1 rounded hover:bg-white/10"
          >
            <ChevronLeft size={16} className="rotate-90 text-text-muted" />
          </button>
          <span className="font-display text-2xl font-bold text-accent-primary w-12 text-center">
            {hour.toString().padStart(2, '0')}
          </span>
          <button
            onClick={() => adjustHour(-1)}
            className="p-1 rounded hover:bg-white/10"
          >
            <ChevronRight size={16} className="rotate-90 text-text-muted" />
          </button>
        </div>

        <span className="font-display text-2xl font-bold text-text-muted">:</span>

        {/* Minute */}
        <div className="flex flex-col items-center">
          <button
            onClick={() => adjustMinute(15)}
            className="p-1 rounded hover:bg-white/10"
          >
            <ChevronLeft size={16} className="rotate-90 text-text-muted" />
          </button>
          <span className="font-display text-2xl font-bold text-accent-primary w-12 text-center">
            {minute.toString().padStart(2, '0')}
          </span>
          <button
            onClick={() => adjustMinute(-15)}
            className="p-1 rounded hover:bg-white/10"
          >
            <ChevronRight size={16} className="rotate-90 text-text-muted" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function SettingsDrawer({ isOpen, onClose, profile, onUpdateProfile, phases, onUpdatePhases, allData, onImportData }: SettingsDrawerProps) {
  const {
    isSupported,
    isEnabled,
    permission,
    enabledMeals,
    mealTimes,
    ifWindowStart,
    ifWindowEnd,
    hasCustomTimes,
    toggleNotifications,
    toggleMealNotification,
    setIfWindowStart,
    setMealTime,
    resetToDefaults,
    sendTestNotification,
  } = useNotifications();

  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [isPWAInstalled, setIsPWAInstalled] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [editedProfile, setEditedProfile] = useState<UserProfile>(profile);
  const [editingPhaseId, setEditingPhaseId] = useState<string | null>(null);
  const [editedPhase, setEditedPhase] = useState<Phase | null>(null);
  const [isAddingPhase, setIsAddingPhase] = useState(false);
  const [importStatus, setImportStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Sync editedProfile when profile changes
  useEffect(() => {
    setEditedProfile(profile);
  }, [profile]);

  const handleSaveProfile = () => {
    onUpdateProfile(editedProfile);
    setIsEditingProfile(false);
  };

  const handleCancelEdit = () => {
    setEditedProfile(profile);
    setIsEditingProfile(false);
  };

  // Phase editing handlers
  const handleEditPhase = (phase: Phase) => {
    setEditingPhaseId(phase.id);
    setEditedPhase({ ...phase });
  };

  const handleSavePhase = () => {
    if (!editedPhase) return;
    const updatedPhases = phases.map(p => p.id === editedPhase.id ? editedPhase : p);
    onUpdatePhases(updatedPhases);
    setEditingPhaseId(null);
    setEditedPhase(null);
  };

  const handleCancelPhaseEdit = () => {
    setEditingPhaseId(null);
    setEditedPhase(null);
  };

  const handleDeletePhase = (phaseId: string) => {
    if (phases.length <= 1) return; // Keep at least one phase
    onUpdatePhases(phases.filter(p => p.id !== phaseId));
  };

  const handleAddPhase = () => {
    const newPhase: Phase = {
      id: `phase-${Date.now()}`,
      name: 'New Phase',
      startDate: new Date().toISOString().split('T')[0],
      endDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 90 days from now
      calories: 2200,
      protein: 150,
      description: ''
    };
    setEditedPhase(newPhase);
    setIsAddingPhase(true);
  };

  const handleSaveNewPhase = () => {
    if (!editedPhase) return;
    onUpdatePhases([...phases, editedPhase]);
    setIsAddingPhase(false);
    setEditedPhase(null);
  };

  const handleCancelNewPhase = () => {
    setIsAddingPhase(false);
    setEditedPhase(null);
  };

  const handleResetPhases = () => {
    onUpdatePhases(DEFAULT_PHASES);
  };

  // Export data as JSON file
  const handleExportData = () => {
    const dataStr = JSON.stringify(allData, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fitness-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Import data from JSON file
  const handleImportData = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB is more than enough for years of data
    if (file.size > MAX_FILE_SIZE) {
      setImportStatus('error');
      setTimeout(() => setImportStatus('idle'), 3000);
      event.target.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const raw = JSON.parse(e.target?.result as string);
        const result = AppDataSchema.safeParse(raw);
        if (!result.success) {
          throw new Error('Invalid data format');
        }
        onImportData(result.data as AppData);
        setImportStatus('success');
        setTimeout(() => setImportStatus('idle'), 3000);
      } catch {
        setImportStatus('error');
        setTimeout(() => setImportStatus('idle'), 3000);
      }
    };
    reader.readAsText(file);
    // Reset input so same file can be selected again
    event.target.value = '';
  };

  useEffect(() => {
    // Check if running as installed PWA
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches
      || (window.navigator as any).standalone === true;
    setIsPWAInstalled(isStandalone);

    // Check if iOS
    const iOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    setIsIOS(iOS);
  }, []);

  const handleWindowChange = (delta: number) => {
    const newStart = (ifWindowStart + delta + 24) % 24;
    if (newStart >= 6 && newStart <= 16) {
      setIfWindowStart(newStart);
    }
  };

  const handleSaveMealTime = (mealId: string, hour: number, minute: number) => {
    setMealTime(mealId, hour, minute);
    setEditingMealId(null);
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      {/* Drawer */}
      <div
        className={`fixed top-0 right-0 h-full w-full max-w-sm bg-bg-primary border-l border-white/10 z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-white/10">
          <h2 className="font-display text-xl font-bold text-text-primary">Settings</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={24} className="text-text-muted" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-6 overflow-y-auto h-[calc(100%-65px)]">
          {/* Profile Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <User size={18} className="text-accent-primary" />
                <h3 className="font-display font-semibold text-text-primary">Your Profile</h3>
              </div>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="flex items-center gap-1 text-xs text-accent-primary hover:text-accent-primary/80 transition-colors"
                >
                  <Edit2 size={12} />
                  Edit
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    onClick={handleCancelEdit}
                    className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted"
                  >
                    <X size={16} />
                  </button>
                  <button
                    onClick={handleSaveProfile}
                    className="p-1.5 rounded-lg bg-accent-primary text-white"
                  >
                    <Check size={16} />
                  </button>
                </div>
              )}
            </div>

            {!isEditingProfile ? (
              <div className="bg-bg-secondary rounded-xl p-4 border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Name</span>
                  <span className="font-medium text-text-primary">{profile.name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Gender</span>
                  <span className="font-medium text-text-primary capitalize">{profile.gender || 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Age</span>
                  <span className="font-medium text-text-primary">{profile.age ? `${profile.age} years` : 'Not set'}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Height</span>
                  <span className="font-medium text-text-primary">{profile.height} cm</span>
                </div>
                <div className="border-t border-white/5 pt-3 mt-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted text-sm">Starting Weight</span>
                    <span className="font-medium text-text-primary">{profile.startingWeight} kg</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-text-muted text-sm">Goal Weight</span>
                  <span className="font-medium text-accent-primary">{profile.goalWeight || 'Not set'} kg</span>
                </div>
              </div>
            ) : (
              <div className="bg-bg-secondary rounded-xl p-4 border border-white/5 space-y-4">
                {/* Name */}
                <div>
                  <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Name</label>
                  <input
                    type="text"
                    value={editedProfile.name}
                    onChange={(e) => setEditedProfile({ ...editedProfile, name: e.target.value })}
                    className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                  />
                </div>

                {/* Gender */}
                <div>
                  <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Gender</label>
                  <div className="flex gap-2">
                    {(['male', 'female', 'other'] as Gender[]).map((g) => (
                      <button
                        key={g}
                        onClick={() => setEditedProfile({ ...editedProfile, gender: g })}
                        className={`flex-1 py-2 rounded-lg text-sm font-medium transition-all ${
                          editedProfile.gender === g
                            ? 'bg-accent-primary text-white'
                            : 'bg-bg-tertiary text-text-muted hover:text-text-primary'
                        }`}
                      >
                        {g.charAt(0).toUpperCase() + g.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Age */}
                <div>
                  <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Age</label>
                  <input
                    type="number"
                    value={editedProfile.age || ''}
                    onChange={(e) => setEditedProfile({ ...editedProfile, age: parseInt(e.target.value) || undefined })}
                    placeholder="Your age"
                    className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                  />
                </div>

                {/* Height */}
                <div>
                  <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Height (cm)</label>
                  <input
                    type="number"
                    value={editedProfile.height}
                    onChange={(e) => setEditedProfile({ ...editedProfile, height: parseInt(e.target.value) || 0 })}
                    className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                  />
                </div>

                <div className="border-t border-white/5 pt-4">
                  {/* Starting Weight */}
                  <div className="mb-4">
                    <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Starting Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedProfile.startingWeight}
                      onChange={(e) => setEditedProfile({ ...editedProfile, startingWeight: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                    />
                  </div>

                  {/* Goal Weight */}
                  <div>
                    <label className="text-text-muted text-xs uppercase tracking-wider block mb-1">Goal Weight (kg)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={editedProfile.goalWeight || ''}
                      onChange={(e) => setEditedProfile({ ...editedProfile, goalWeight: parseFloat(e.target.value) || undefined })}
                      placeholder="Your goal"
                      className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Nutrition Phases Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Target size={18} className="text-accent-secondary" />
                <h3 className="font-display font-semibold text-text-primary">Nutrition Phases</h3>
              </div>
              <button
                onClick={handleResetPhases}
                className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-primary transition-colors"
              >
                <RotateCcw size={12} />
                Reset
              </button>
            </div>

            <div className="space-y-2">
              {phases.map((phase) => (
                editingPhaseId === phase.id && editedPhase ? (
                  <div key={phase.id} className="bg-bg-secondary rounded-xl p-4 border border-accent-primary/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary font-medium">Edit Phase</span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelPhaseEdit}
                          className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted"
                        >
                          <X size={16} />
                        </button>
                        <button
                          onClick={handleSavePhase}
                          className="p-1.5 rounded-lg bg-accent-primary text-white"
                        >
                          <Check size={16} />
                        </button>
                      </div>
                    </div>

                    <input
                      type="text"
                      value={editedPhase.name}
                      onChange={(e) => setEditedPhase({ ...editedPhase, name: e.target.value })}
                      placeholder="Phase name"
                      className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                    />

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-text-muted text-xs block mb-1">Start Date</label>
                        <input
                          type="date"
                          value={editedPhase.startDate}
                          onChange={(e) => setEditedPhase({ ...editedPhase, startDate: e.target.value })}
                          className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none text-sm"
                        />
                      </div>
                      <div>
                        <label className="text-text-muted text-xs block mb-1">End Date</label>
                        <input
                          type="date"
                          value={editedPhase.endDate}
                          onChange={(e) => setEditedPhase({ ...editedPhase, endDate: e.target.value })}
                          className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none text-sm"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-text-muted text-xs block mb-1">Calories</label>
                        <input
                          type="number"
                          value={editedPhase.calories}
                          onChange={(e) => setEditedPhase({ ...editedPhase, calories: parseInt(e.target.value) || 0 })}
                          className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                        />
                      </div>
                      <div>
                        <label className="text-text-muted text-xs block mb-1">Protein (g)</label>
                        <input
                          type="number"
                          value={editedPhase.protein}
                          onChange={(e) => setEditedPhase({ ...editedPhase, protein: parseInt(e.target.value) || 0 })}
                          className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                        />
                      </div>
                    </div>

                    <input
                      type="text"
                      value={editedPhase.description}
                      onChange={(e) => setEditedPhase({ ...editedPhase, description: e.target.value })}
                      placeholder="Description (optional)"
                      className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none text-sm"
                    />
                  </div>
                ) : (
                  <div
                    key={phase.id}
                    className="bg-bg-secondary rounded-xl p-3 border border-white/5 hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-text-primary">{phase.name}</p>
                        <p className="text-text-muted text-xs">
                          {phase.calories} kcal · {phase.protein}g protein
                        </p>
                        <p className="text-text-muted text-xs mt-1">
                          {new Date(phase.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} - {new Date(phase.endDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleEditPhase(phase)}
                          className="p-2 rounded-lg hover:bg-white/10 text-text-muted hover:text-text-primary transition-colors"
                        >
                          <Edit2 size={14} />
                        </button>
                        {phases.length > 1 && (
                          <button
                            onClick={() => handleDeletePhase(phase.id)}
                            className="p-2 rounded-lg hover:bg-accent-danger/20 text-text-muted hover:text-accent-danger transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              ))}

              {/* Add new phase form */}
              {isAddingPhase && editedPhase ? (
                <div className="bg-bg-secondary rounded-xl p-4 border border-accent-primary/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-primary font-medium">New Phase</span>
                    <div className="flex gap-2">
                      <button
                        onClick={handleCancelNewPhase}
                        className="p-1.5 rounded-lg hover:bg-white/10 text-text-muted"
                      >
                        <X size={16} />
                      </button>
                      <button
                        onClick={handleSaveNewPhase}
                        className="p-1.5 rounded-lg bg-accent-primary text-white"
                      >
                        <Check size={16} />
                      </button>
                    </div>
                  </div>

                  <input
                    type="text"
                    value={editedPhase.name}
                    onChange={(e) => setEditedPhase({ ...editedPhase, name: e.target.value })}
                    placeholder="Phase name"
                    className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                  />

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-text-muted text-xs block mb-1">Start Date</label>
                      <input
                        type="date"
                        value={editedPhase.startDate}
                        onChange={(e) => setEditedPhase({ ...editedPhase, startDate: e.target.value })}
                        className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none text-sm"
                      />
                    </div>
                    <div>
                      <label className="text-text-muted text-xs block mb-1">End Date</label>
                      <input
                        type="date"
                        value={editedPhase.endDate}
                        onChange={(e) => setEditedPhase({ ...editedPhase, endDate: e.target.value })}
                        className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none text-sm"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-text-muted text-xs block mb-1">Calories</label>
                      <input
                        type="number"
                        value={editedPhase.calories}
                        onChange={(e) => setEditedPhase({ ...editedPhase, calories: parseInt(e.target.value) || 0 })}
                        className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-text-muted text-xs block mb-1">Protein (g)</label>
                      <input
                        type="number"
                        value={editedPhase.protein}
                        onChange={(e) => setEditedPhase({ ...editedPhase, protein: parseInt(e.target.value) || 0 })}
                        className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none"
                      />
                    </div>
                  </div>

                  <input
                    type="text"
                    value={editedPhase.description}
                    onChange={(e) => setEditedPhase({ ...editedPhase, description: e.target.value })}
                    placeholder="Description (optional)"
                    className="w-full bg-bg-tertiary rounded-lg px-3 py-2 text-text-primary border border-white/10 focus:border-accent-primary focus:outline-none text-sm"
                  />
                </div>
              ) : (
                <button
                  onClick={handleAddPhase}
                  className="w-full py-3 rounded-xl border-2 border-dashed border-white/10 text-text-muted hover:border-white/20 hover:text-text-primary transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={18} />
                  <span className="text-sm">Add Phase</span>
                </button>
              )}
            </div>
          </div>

          {/* IF Window Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Clock size={18} className="text-accent-secondary" />
                <h3 className="font-display font-semibold text-text-primary">Fasting Window</h3>
              </div>
              {hasCustomTimes && (
                <button
                  onClick={resetToDefaults}
                  className="flex items-center gap-1 text-xs text-text-muted hover:text-accent-primary transition-colors"
                >
                  <RotateCcw size={12} />
                  Reset
                </button>
              )}
            </div>

            <div className="bg-bg-secondary rounded-xl p-4 border border-white/5">
              <p className="text-text-muted text-sm mb-3">
                Adjust your 16:8 eating window. Meal times will shift with the window.
              </p>

              <div className="flex items-center justify-between">
                <button
                  onClick={() => handleWindowChange(-1)}
                  disabled={ifWindowStart <= 6}
                  className="p-2 rounded-lg bg-bg-tertiary hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronLeft size={20} className="text-text-primary" />
                </button>

                <div className="text-center">
                  <p className="font-display text-2xl font-bold text-accent-primary">
                    {formatHour(ifWindowStart)} - {formatHour(ifWindowEnd)}
                  </p>
                  <p className="text-text-muted text-xs">Eating window</p>
                </div>

                <button
                  onClick={() => handleWindowChange(1)}
                  disabled={ifWindowStart >= 16}
                  className="p-2 rounded-lg bg-bg-tertiary hover:bg-white/10 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
                >
                  <ChevronRight size={20} className="text-text-primary" />
                </button>
              </div>
            </div>
          </div>

          {/* Meal Times Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Edit2 size={18} className="text-accent-primary" />
              <h3 className="font-display font-semibold text-text-primary">Meal Times</h3>
            </div>

            <div className="space-y-2">
              {mealTimes.map((meal) => (
                editingMealId === meal.id ? (
                  <TimePicker
                    key={meal.id}
                    meal={meal}
                    onSave={(hour, minute) => handleSaveMealTime(meal.id, hour, minute)}
                    onCancel={() => setEditingMealId(null)}
                  />
                ) : (
                  <button
                    key={meal.id}
                    onClick={() => setEditingMealId(meal.id)}
                    className="w-full bg-bg-secondary rounded-xl p-3 border border-white/5 flex items-center justify-between hover:border-white/10 transition-all"
                  >
                    <div className="flex items-center gap-3">
                      <div className="bg-accent-primary/10 rounded-lg px-2 py-1 min-w-[52px]">
                        <span className="font-display font-bold text-accent-primary text-sm">
                          {meal.time}
                        </span>
                      </div>
                      <div className="text-left">
                        <p className="font-medium text-text-primary text-sm">{meal.label}</p>
                        <p className="text-text-muted text-xs">{meal.description}</p>
                      </div>
                    </div>
                    <Edit2 size={14} className="text-text-muted" />
                  </button>
                )
              ))}
            </div>
          </div>

          {/* Notifications Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Bell size={18} className="text-accent-primary" />
              <h3 className="font-display font-semibold text-text-primary">Meal Reminders</h3>
            </div>

            {/* PWA Install Guide */}
            {!isPWAInstalled && isSupported && permission !== 'denied' && (
              <div className="bg-accent-primary/10 border border-accent-primary/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Download size={20} className="text-accent-primary flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary text-sm">Install App for Best Experience</p>
                    <p className="text-text-muted text-xs mt-1">
                      {isIOS ? (
                        <>Tap <span className="text-accent-primary">Share</span> then <span className="text-accent-primary">"Add to Home Screen"</span> for reliable notifications.</>
                      ) : (
                        <>Tap the menu and select <span className="text-accent-primary">"Install"</span> or <span className="text-accent-primary">"Add to Home Screen"</span> for reliable notifications.</>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Notification Info */}
            {isEnabled && isPWAInstalled && (
              <div className="bg-accent-success/10 border border-accent-success/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <Smartphone size={20} className="text-accent-success flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary text-sm">Notifications Active</p>
                    <p className="text-text-muted text-xs mt-1">
                      You'll receive notifications at your scheduled meal times, even when the app is in the background.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {isEnabled && !isPWAInstalled && (
              <div className="bg-accent-warning/10 border border-accent-warning/30 rounded-xl p-4">
                <div className="flex items-start gap-3">
                  <AlertCircle size={20} className="text-accent-warning flex-shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-text-primary text-sm">Limited Notifications</p>
                    <p className="text-text-muted text-xs mt-1">
                      Notifications only work when the app is open. Install the app for background notifications.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Test Notification Button */}
            {isSupported && permission !== 'denied' && (
              <button
                onClick={sendTestNotification}
                className="w-full bg-bg-secondary rounded-xl p-3 border border-white/5 text-center hover:border-accent-primary/50 transition-all"
              >
                <span className="text-accent-primary font-medium text-sm">Send Test Notification</span>
              </button>
            )}

            {!isSupported ? (
              <p className="text-text-muted text-sm">
                Notifications are not supported in this browser.
              </p>
            ) : permission === 'denied' ? (
              <div className="bg-accent-warning/10 border border-accent-warning/30 rounded-xl p-4">
                <p className="text-accent-warning text-sm">
                  Notifications are blocked. Please enable them in your browser settings.
                </p>
              </div>
            ) : (
              <>
                {/* Master Toggle */}
                <button
                  onClick={toggleNotifications}
                  className={`w-full rounded-xl p-4 border transition-all ${
                    isEnabled
                      ? 'bg-accent-success/10 border-accent-success/30'
                      : 'bg-bg-secondary border-white/5'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isEnabled ? (
                        <Bell size={20} className="text-accent-success" />
                      ) : (
                        <BellOff size={20} className="text-text-muted" />
                      )}
                      <div className="text-left">
                        <p className="font-medium text-text-primary">
                          {isEnabled ? 'Reminders Enabled' : 'Reminders Disabled'}
                        </p>
                        <p className="text-text-muted text-sm">
                          {isEnabled ? 'You\'ll be notified at meal times' : 'Turn on to get meal reminders'}
                        </p>
                      </div>
                    </div>
                    <div
                      className={`w-12 h-7 rounded-full p-1 transition-all ${
                        isEnabled ? 'bg-accent-success' : 'bg-bg-tertiary'
                      }`}
                    >
                      <div
                        className={`w-5 h-5 rounded-full bg-white shadow transition-transform ${
                          isEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </div>
                  </div>
                </button>

                {/* Individual Meal Toggles */}
                {isEnabled && (
                  <div className="space-y-2 animate-fade-in">
                    <p className="text-text-muted text-xs uppercase tracking-wider px-1">
                      Notify me for
                    </p>
                    {mealTimes.map((meal) => (
                      <button
                        key={meal.id}
                        onClick={() => toggleMealNotification(meal.id)}
                        className="w-full bg-bg-secondary rounded-xl p-3 border border-white/5 flex items-center justify-between hover:border-white/10 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <div className="bg-accent-primary/10 rounded-lg px-2 py-1 min-w-[52px]">
                            <span className="font-display font-bold text-accent-primary text-sm">
                              {meal.time}
                            </span>
                          </div>
                          <span className="font-medium text-text-primary text-sm">{meal.label}</span>
                        </div>
                        <div
                          className={`w-10 h-6 rounded-full p-1 transition-all ${
                            enabledMeals.includes(meal.id) ? 'bg-accent-primary' : 'bg-bg-tertiary'
                          }`}
                        >
                          <div
                            className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${
                              enabledMeals.includes(meal.id) ? 'translate-x-4' : 'translate-x-0'
                            }`}
                          />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>

          {/* Data Backup Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Download size={18} className="text-accent-success" />
              <h3 className="font-display font-semibold text-text-primary">Data Backup</h3>
            </div>

            <div className="bg-bg-secondary rounded-xl p-4 border border-white/5 space-y-3">
              <p className="text-text-muted text-sm">
                Export your data to a file for backup, or import from a previous backup.
              </p>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={handleExportData}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-accent-success/20 text-accent-success hover:bg-accent-success/30 transition-colors"
                >
                  <Download size={18} />
                  <span className="font-medium text-sm">Export</span>
                </button>

                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 py-3 rounded-lg bg-accent-primary/20 text-accent-primary hover:bg-accent-primary/30 transition-colors"
                >
                  <Upload size={18} />
                  <span className="font-medium text-sm">Import</span>
                </button>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />

              {importStatus === 'success' && (
                <div className="bg-accent-success/10 border border-accent-success/30 rounded-lg p-3 text-center">
                  <p className="text-accent-success text-sm font-medium">Data imported successfully!</p>
                </div>
              )}

              {importStatus === 'error' && (
                <div className="bg-accent-danger/10 border border-accent-danger/30 rounded-lg p-3 text-center">
                  <p className="text-accent-danger text-sm font-medium">Invalid backup file</p>
                </div>
              )}
            </div>
          </div>

          {/* App Info */}
          <div className="pt-4 border-t border-white/5">
            <div className="flex items-center gap-2 mb-2">
              <Clock size={18} className="text-text-muted" />
              <h3 className="font-display font-semibold text-text-primary">About</h3>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4 border border-white/5">
              <p className="text-text-primary font-medium">Ballast</p>
              <p className="text-text-muted text-sm">
                by{' '}
                <a
                  href="https://studionope.nl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-accent-primary transition-colors"
                >
                  Studio N.O.P.E.
                </a>
                {' · Summer 2026'}
              </p>
              <p className="text-text-muted text-xs mt-2">
                Track your fitness journey with weight, measurements, PRs, and skills.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
