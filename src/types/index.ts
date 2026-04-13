// Weight tracking
export interface WeightEntry {
  id: string;
  date: string; // ISO date string
  weight: number; // kg
}

// Body measurements
export interface MeasurementEntry {
  id: string;
  date: string;
  waist?: number; // cm
  chest?: number;
  arms?: number;
  legs?: number;
  shoulders?: number;
}

// Strength PRs
export interface StrengthPR {
  id: string;
  exercise: string; // Can be default or custom exercise name
  type: 'bodyweight' | 'weighted';
  reps: number;
  weight?: number; // kg, only for weighted
  date: string;
}

// Default exercises (kept for backwards compatibility)
export type ExerciseName =
  | 'Pull-ups'
  | 'Dips'
  | 'Push-ups'
  | 'Rows'
  | 'Squats'
  | 'Pike Push-ups'
  | 'Chin-ups'
  | 'Diamond Push-ups';

// Skills tracking
export interface SkillProgress {
  id: string;
  skill: string; // skill name (for backwards compatibility) or skillId
  skillId?: string; // reference to SkillDefinition.id
  currentStep: number; // index in progression array
  holdTime?: number; // seconds, for hold-based skills
  prHoldTime?: number; // best hold time
  dateUnlocked?: string; // when first achieved current step
  notes?: string;
}

// Legacy type kept for backwards compatibility
export type SkillName = string;

export type SkillCategory = 'pull' | 'push' | 'core' | 'legs';

export interface SkillDefinition {
  id: string;
  name: string;
  progressions: string[];
  isHoldBased: boolean;
  category: SkillCategory;
}

// Phases
export interface Phase {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  calories: number;
  protein: number;
  description: string;
}

// Streak
export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastLogDate?: string;
  totalDaysLogged: number;
  loggedDates?: string[]; // Array of ISO date strings for calendar view
}

// Custom recipe types
export interface CustomRecipe {
  id: string;
  name: string;
  ingredients: string;
  kcal: number;
  protein: string;
  carbs: string;
  category: 'shakes' | 'icecream' | 'snacks-savory' | 'snacks-sweet' | 'waffles';
}

// App State
export interface AppData {
  weights: WeightEntry[];
  measurements: MeasurementEntry[];
  strengthPRs: StrengthPR[];
  skills: SkillProgress[];
  streak: StreakData; // Legacy - logging streak
  workoutStreak?: StreakData; // Workout streak
  profile: UserProfile;
  workouts: WorkoutData;
  customExercises?: string[]; // User-added exercise names for PRs
  customRecipes?: CustomRecipe[]; // User-added recipes
  phases?: Phase[]; // Custom nutrition phases
  skillDefinitions?: SkillDefinition[]; // Custom skill definitions
  activeWorkout?: ActiveWorkoutSession; // In-progress workout (survives tab switches)
}

export type Gender = 'male' | 'female' | 'other';

export interface UserProfile {
  name: string;
  gender?: Gender;
  age?: number;
  startingWeight: number;
  goalWeight?: number;
  height: number; // cm
}

// Navigation
export type TabName = 'dashboard' | 'weight' | 'measurements' | 'strength' | 'skills' | 'recipes' | 'workouts';

// Workout tracking (Push/Pull/Legs)
export type WorkoutCategory = 'push' | 'pull' | 'legs';

export interface TemplateExercise {
  id: string;
  name: string;
  type: 'weighted' | 'bodyweight';
  defaultSets: number;
  defaultReps: number;
  defaultWeight?: number; // kg, only for weighted
  order: number;
}

export type TemplateType = 'weighted' | 'bodyweight';

export interface WorkoutTemplate {
  id: string;
  category: WorkoutCategory;
  templateType: TemplateType;
  exercises: TemplateExercise[];
  lastModified: string; // ISO date
  notes?: string; // Optional template notes
}

export interface ExerciseSet {
  setNumber: number;
  reps: number;
  weight?: number; // kg, only for weighted
  completed: boolean;
}

export interface LoggedExercise {
  id: string;
  exerciseId: string; // Reference to template exercise
  name: string;
  type: 'weighted' | 'bodyweight';
  sets: ExerciseSet[];
  notes?: string; // Per-exercise notes
}

export interface WorkoutLog {
  id: string;
  category: WorkoutCategory;
  templateType: TemplateType;
  date: string; // ISO date
  exercises: LoggedExercise[];
  notes?: string;
}

export interface WorkoutData {
  templates: WorkoutTemplate[];
  logs: WorkoutLog[];
}

// Active workout session (persisted while in progress)
export interface ActiveWorkoutSession {
  category: WorkoutCategory;
  templateType: TemplateType;
  exercises: LoggedExercise[];
  notes: string;
  startedAt: string; // ISO date string
}
