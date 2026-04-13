import { useState } from 'react';
import { Settings, Sun, Moon } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useTheme } from './hooks/useTheme';
import {
  WeightEntry,
  MeasurementEntry,
  StrengthPR,
  SkillProgress,
  StreakData,
  TabName,
  AppData,
  UserProfile,
  WorkoutData,
  CustomRecipe,
  Phase,
  SkillDefinition,
  ActiveWorkoutSession
} from './types';
import { INITIAL_PROFILE, INITIAL_WORKOUT_DATA, DEFAULT_PHASES, DEFAULT_RECIPES, DEFAULT_SKILL_DEFINITIONS } from './constants';
import Navigation from './components/Navigation';
import Dashboard from './components/Dashboard';
import WeightTracker from './components/WeightTracker';
import MeasurementsTracker from './components/MeasurementsTracker';
import StrengthPRs from './components/StrengthPRs';
import SkillsTracker from './components/SkillsTracker';
import RecipesTracker from './components/RecipesTracker';
import SettingsDrawer from './components/SettingsDrawer';
import WorkoutTracker from './components/workouts/WorkoutTracker';
import StreakCalendar from './components/StreakCalendar';

const INITIAL_DATA: AppData = {
  weights: [],
  measurements: [],
  strengthPRs: [],
  skills: [],
  streak: {
    currentStreak: 0,
    longestStreak: 0,
    totalDaysLogged: 0
  },
  workoutStreak: {
    currentStreak: 0,
    longestStreak: 0,
    totalDaysLogged: 0
  },
  profile: INITIAL_PROFILE,
  workouts: INITIAL_WORKOUT_DATA,
  phases: DEFAULT_PHASES
};

function App() {
  const [activeTab, setActiveTab] = useState<TabName>('dashboard');
  const [storedData, setData] = useLocalStorage<AppData>('fitness-tracker-data', INITIAL_DATA);
  const { theme, toggle: toggleTheme } = useTheme();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isStreakCalendarOpen, setIsStreakCalendarOpen] = useState(false);

  // Merge stored data with defaults to handle missing fields (e.g., workouts for existing users)
  const data: AppData = {
    ...INITIAL_DATA,
    ...storedData,
    workouts: storedData.workouts || INITIAL_WORKOUT_DATA,
    workoutStreak: storedData.workoutStreak || INITIAL_DATA.workoutStreak,
    phases: storedData.phases || DEFAULT_PHASES,
    customRecipes: storedData.customRecipes && storedData.customRecipes.length > 0
      ? storedData.customRecipes
      : DEFAULT_RECIPES,
    skillDefinitions: storedData.skillDefinitions && storedData.skillDefinitions.length > 0
      ? storedData.skillDefinitions
      : DEFAULT_SKILL_DEFINITIONS
  };

  // Update functions
  const updateWeights = (weights: WeightEntry[]) => {
    setData(prev => ({ ...prev, weights }));
  };

  const updateMeasurements = (measurements: MeasurementEntry[]) => {
    setData(prev => ({ ...prev, measurements }));
  };

  const updateStrengthPRs = (strengthPRs: StrengthPR[]) => {
    setData(prev => ({ ...prev, strengthPRs }));
  };

  const updateSkills = (skills: SkillProgress[]) => {
    setData(prev => ({ ...prev, skills }));
  };

  const updateStreak = (streak: StreakData) => {
    setData(prev => ({ ...prev, streak }));
  };

  const updateProfile = (profile: UserProfile) => {
    setData(prev => ({ ...prev, profile }));
  };

  const updateWorkouts = (workouts: WorkoutData) => {
    setData(prev => ({ ...prev, workouts }));
  };

  const updateWorkoutStreak = (workoutStreak: StreakData) => {
    setData(prev => ({ ...prev, workoutStreak }));
  };

  const updateCustomExercises = (customExercises: string[]) => {
    setData(prev => ({ ...prev, customExercises }));
  };

  const updateCustomRecipes = (customRecipes: CustomRecipe[]) => {
    setData(prev => ({ ...prev, customRecipes }));
  };

  const updatePhases = (phases: Phase[]) => {
    setData(prev => ({ ...prev, phases }));
  };

  const updateSkillDefinitions = (skillDefinitions: SkillDefinition[]) => {
    setData(prev => ({ ...prev, skillDefinitions }));
  };

  const updateActiveWorkout = (activeWorkout: ActiveWorkoutSession | undefined) => {
    setData(prev => ({ ...prev, activeWorkout }));
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return (
          <Dashboard
            data={data}
            phases={data.phases || DEFAULT_PHASES}
            onNavigate={setActiveTab}
            onOpenStreakCalendar={() => setIsStreakCalendarOpen(true)}
          />
        );
      case 'weight':
        return (
          <WeightTracker 
            weights={data.weights}
            profile={data.profile}
            streak={data.streak}
            onUpdateWeights={updateWeights}
            onUpdateStreak={updateStreak}
          />
        );
      case 'measurements':
        return (
          <MeasurementsTracker 
            measurements={data.measurements}
            onUpdateMeasurements={updateMeasurements}
          />
        );
      case 'strength':
        return (
          <StrengthPRs
            prs={data.strengthPRs}
            onUpdatePRs={updateStrengthPRs}
            customExercises={data.customExercises || []}
            onUpdateCustomExercises={updateCustomExercises}
          />
        );
      case 'skills':
        return (
          <SkillsTracker
            skills={data.skills}
            onUpdateSkills={updateSkills}
            skillDefinitions={data.skillDefinitions || DEFAULT_SKILL_DEFINITIONS}
            onUpdateSkillDefinitions={updateSkillDefinitions}
          />
        );
      case 'recipes':
        return (
          <RecipesTracker
            customRecipes={data.customRecipes || []}
            onUpdateCustomRecipes={updateCustomRecipes}
          />
        );
      case 'workouts':
        return (
          <WorkoutTracker
            workouts={data.workouts}
            workoutStreak={data.workoutStreak!}
            onUpdateWorkouts={updateWorkouts}
            onUpdateWorkoutStreak={updateWorkoutStreak}
            activeWorkout={data.activeWorkout}
            onUpdateActiveWorkout={updateActiveWorkout}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-bg-primary pb-24">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-bg-primary backdrop-blur-lg border-b border-white/5">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="font-display text-xl font-bold tracking-tight">
                <span className="text-gradient">Ball</span>
                <span className="text-text-primary">ast</span>
              </h1>
              <p className="text-text-muted text-xs">
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
            </div>
            <div className="flex items-center gap-2">
              {data.streak.currentStreak > 0 && (
                <div className="flex items-center gap-1 bg-accent-primary/10 px-2 py-1 rounded-full">
                  <span className="text-sm">🔥</span>
                  <span className="font-display font-bold text-accent-primary text-sm">
                    {data.streak.currentStreak}
                  </span>
                </div>
              )}
              {(data.workoutStreak?.currentStreak || 0) > 0 && (
                <div className="flex items-center gap-1 bg-accent-success/10 px-2 py-1 rounded-full">
                  <span className="text-sm">💪</span>
                  <span className="font-display font-bold text-accent-success text-sm">
                    {data.workoutStreak?.currentStreak}
                  </span>
                </div>
              )}
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              >
                {theme === 'dark' ? (
                  <Sun size={20} className="text-text-muted" />
                ) : (
                  <Moon size={20} className="text-text-muted" />
                )}
              </button>
              <button
                onClick={() => setIsSettingsOpen(true)}
                className="p-2 rounded-lg hover:bg-white/5 transition-colors"
                aria-label="Settings"
              >
                <Settings size={20} className="text-text-muted" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-lg mx-auto px-4 pt-4 pb-6">
        {renderContent()}
      </main>

      {/* Navigation */}
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />

      {/* Settings Drawer */}
      <SettingsDrawer
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        profile={data.profile}
        onUpdateProfile={updateProfile}
        phases={data.phases || DEFAULT_PHASES}
        onUpdatePhases={updatePhases}
        allData={data}
        onImportData={(imported) => setData(imported)}
      />

      {/* Streak Calendar */}
      <StreakCalendar
        isOpen={isStreakCalendarOpen}
        onClose={() => setIsStreakCalendarOpen(false)}
        loggingStreak={data.streak}
        workoutStreak={data.workoutStreak!}
        onUpdateLoggingStreak={updateStreak}
        onUpdateWorkoutStreak={updateWorkoutStreak}
      />
    </div>
  );
}

export default App;
