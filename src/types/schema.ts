import { z } from 'zod';

// Validation schema for user-imported backup JSON. Applied in
// SettingsDrawer.handleImportData before the data is trusted by the app.
//
// Philosophy: be strict about the shape of critical fields (profile, streak,
// arrays) so that malformed or malicious backups are rejected, but use
// passthrough on optional nested objects so that schema evolution in newer
// backup formats doesn't break imports from older or newer versions.

const MAX_STRING = 512;
const MAX_LONG_STRING = 4096; // for notes / ingredient lists

const safeString = (max = MAX_STRING) => z.string().max(max);
const safeId = z.string().min(1).max(128);
const safeDate = z.string().max(64);
const finiteNumber = z.number().finite();

const WeightEntrySchema = z.object({
  id: safeId,
  date: safeDate,
  weight: finiteNumber,
}).passthrough();

const MeasurementEntrySchema = z.object({
  id: safeId,
  date: safeDate,
  waist: finiteNumber.optional(),
  chest: finiteNumber.optional(),
  arms: finiteNumber.optional(),
  legs: finiteNumber.optional(),
  shoulders: finiteNumber.optional(),
}).passthrough();

const StrengthPRSchema = z.object({
  id: safeId,
  exercise: safeString(),
  type: z.enum(['bodyweight', 'weighted']),
  reps: finiteNumber,
  weight: finiteNumber.optional(),
  date: safeDate,
}).passthrough();

const SkillProgressSchema = z.object({
  id: safeId,
  skill: safeString(),
  skillId: safeId.optional(),
  currentStep: finiteNumber,
  holdTime: finiteNumber.optional(),
  prHoldTime: finiteNumber.optional(),
  dateUnlocked: safeDate.optional(),
  notes: safeString(MAX_LONG_STRING).optional(),
}).passthrough();

const SkillDefinitionSchema = z.object({
  id: safeId,
  name: safeString(),
  progressions: z.array(safeString()).max(64),
  isHoldBased: z.boolean(),
  category: z.enum(['pull', 'push', 'core', 'legs']),
}).passthrough();

const PhaseSchema = z.object({
  id: safeId,
  name: safeString(),
  startDate: safeDate,
  endDate: safeDate,
  calories: finiteNumber,
  protein: finiteNumber,
  description: safeString(MAX_LONG_STRING),
}).passthrough();

const StreakDataSchema = z.object({
  currentStreak: finiteNumber,
  longestStreak: finiteNumber,
  lastLogDate: safeDate.optional(),
  totalDaysLogged: finiteNumber,
  loggedDates: z.array(safeDate).max(10_000).optional(),
}).passthrough();

const CustomRecipeSchema = z.object({
  id: safeId,
  name: safeString(),
  ingredients: safeString(MAX_LONG_STRING),
  kcal: finiteNumber,
  protein: safeString(64),
  carbs: safeString(64),
  category: z.enum(['shakes', 'icecream', 'snacks-savory', 'snacks-sweet', 'waffles']),
}).passthrough();

const UserProfileSchema = z.object({
  name: safeString(128),
  gender: z.enum(['male', 'female', 'other']).optional(),
  age: finiteNumber.optional(),
  startingWeight: finiteNumber,
  goalWeight: finiteNumber.optional(),
  height: finiteNumber,
}).passthrough();

const TemplateExerciseSchema = z.object({
  id: safeId,
  name: safeString(),
  type: z.enum(['weighted', 'bodyweight']),
  defaultSets: finiteNumber,
  defaultReps: finiteNumber,
  defaultWeight: finiteNumber.optional(),
  order: finiteNumber,
}).passthrough();

const WorkoutTemplateSchema = z.object({
  id: safeId,
  category: z.enum(['push', 'pull', 'legs']),
  templateType: z.enum(['weighted', 'bodyweight']),
  exercises: z.array(TemplateExerciseSchema).max(256),
  lastModified: safeDate,
  notes: safeString(MAX_LONG_STRING).optional(),
}).passthrough();

const ExerciseSetSchema = z.object({
  setNumber: finiteNumber,
  reps: finiteNumber,
  weight: finiteNumber.optional(),
  completed: z.boolean(),
}).passthrough();

const LoggedExerciseSchema = z.object({
  id: safeId,
  exerciseId: safeId,
  name: safeString(),
  type: z.enum(['weighted', 'bodyweight']),
  sets: z.array(ExerciseSetSchema).max(64),
  notes: safeString(MAX_LONG_STRING).optional(),
}).passthrough();

const WorkoutLogSchema = z.object({
  id: safeId,
  category: z.enum(['push', 'pull', 'legs']),
  templateType: z.enum(['weighted', 'bodyweight']),
  date: safeDate,
  exercises: z.array(LoggedExerciseSchema).max(128),
  notes: safeString(MAX_LONG_STRING).optional(),
}).passthrough();

const WorkoutDataSchema = z.object({
  templates: z.array(WorkoutTemplateSchema).max(64),
  logs: z.array(WorkoutLogSchema).max(10_000),
}).passthrough();

const ActiveWorkoutSessionSchema = z.object({
  category: z.enum(['push', 'pull', 'legs']),
  templateType: z.enum(['weighted', 'bodyweight']),
  exercises: z.array(LoggedExerciseSchema).max(128),
  notes: safeString(MAX_LONG_STRING),
  startedAt: safeDate,
}).passthrough();

export const AppDataSchema = z.object({
  weights: z.array(WeightEntrySchema).max(20_000),
  measurements: z.array(MeasurementEntrySchema).max(20_000),
  strengthPRs: z.array(StrengthPRSchema).max(20_000),
  skills: z.array(SkillProgressSchema).max(256),
  streak: StreakDataSchema,
  workoutStreak: StreakDataSchema.optional(),
  profile: UserProfileSchema,
  workouts: WorkoutDataSchema.optional(),
  customExercises: z.array(safeString()).max(512).optional(),
  customRecipes: z.array(CustomRecipeSchema).max(1024).optional(),
  phases: z.array(PhaseSchema).max(256).optional(),
  skillDefinitions: z.array(SkillDefinitionSchema).max(256).optional(),
  activeWorkout: ActiveWorkoutSessionSchema.optional(),
}).passthrough();

export type ValidatedAppData = z.infer<typeof AppDataSchema>;
