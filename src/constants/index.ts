import { SkillDefinition, Phase, ExerciseName, WorkoutTemplate, WorkoutData, WorkoutCategory, CustomRecipe } from '../types';

export const DEFAULT_SKILL_DEFINITIONS: SkillDefinition[] = [
  {
    id: 'skill-1',
    name: 'Muscle-up',
    progressions: ['Explosive Pull-up', 'Chest-to-bar', 'Slow Muscle-up', 'Clean Muscle-up'],
    isHoldBased: false,
    category: 'pull'
  },
  {
    id: 'skill-2',
    name: 'Front Lever',
    progressions: ['Tuck', 'Advanced Tuck', 'Straddle', 'Half Lay', 'Full'],
    isHoldBased: true,
    category: 'pull'
  },
  {
    id: 'skill-3',
    name: 'Back Lever',
    progressions: ['Tuck', 'Advanced Tuck', 'Straddle', 'Full'],
    isHoldBased: true,
    category: 'pull'
  },
  {
    id: 'skill-4',
    name: 'Planche',
    progressions: ['Lean', 'Tuck', 'Advanced Tuck', 'Straddle', 'Full'],
    isHoldBased: true,
    category: 'push'
  },
  {
    id: 'skill-5',
    name: 'Handstand',
    progressions: ['Wall', '5s Free', '15s Free', '30s Free', '60s Free'],
    isHoldBased: true,
    category: 'push'
  },
  {
    id: 'skill-6',
    name: 'L-Sit',
    progressions: ['Tuck', 'One Leg', 'Full L', 'V-Sit'],
    isHoldBased: true,
    category: 'core'
  },
  {
    id: 'skill-7',
    name: 'Human Flag',
    progressions: ['Tuck', 'Straddle', 'Full'],
    isHoldBased: true,
    category: 'core'
  },
  {
    id: 'skill-8',
    name: 'One Arm Pull-up',
    progressions: ['Archer', 'Assisted', 'Negative', 'Full'],
    isHoldBased: false,
    category: 'pull'
  },
  {
    id: 'skill-9',
    name: 'Pistol Squat',
    progressions: ['Assisted', 'Full', 'Weighted'],
    isHoldBased: false,
    category: 'legs'
  },
  {
    id: 'skill-10',
    name: 'Ring Muscle-up',
    progressions: ['False Grip Hang', 'Transition', 'Slow', 'Clean'],
    isHoldBased: false,
    category: 'pull'
  },
  {
    id: 'skill-11',
    name: '360 Pull',
    progressions: ['Explosive', 'Half Rotation', 'Full 360'],
    isHoldBased: false,
    category: 'pull'
  },
  {
    id: 'skill-12',
    name: 'Dragon Flag',
    progressions: ['Tuck', 'One Leg', 'Straddle', 'Full'],
    isHoldBased: true,
    category: 'core'
  },
  {
    id: 'skill-13',
    name: 'Hefesto',
    progressions: ['Assisted', 'Negative', 'Full'],
    isHoldBased: false,
    category: 'pull'
  },
  {
    id: 'skill-14',
    name: 'Victorian',
    progressions: ['Tuck', 'Advanced Tuck', 'Straddle'],
    isHoldBased: true,
    category: 'pull'
  },
  {
    id: 'skill-15',
    name: 'Maltese',
    progressions: ['Tuck', 'Advanced Tuck', 'Straddle'],
    isHoldBased: true,
    category: 'push'
  }
];

// Backwards compatibility alias
export const SKILL_DEFINITIONS = DEFAULT_SKILL_DEFINITIONS;

export const DEFAULT_PHASES: Phase[] = [
  {
    id: 'phase-1',
    name: 'Mini Cut',
    startDate: '2026-01-01',
    endDate: '2026-03-31',
    calories: 2400,
    protein: 170,
    description: 'Lose fat while maintaining strength'
  },
  {
    id: 'phase-2',
    name: 'Lean Bulk',
    startDate: '2026-04-01',
    endDate: '2026-06-30',
    calories: 2800,
    protein: 180,
    description: 'Build strength and muscle'
  },
  {
    id: 'phase-3',
    name: 'Summer',
    startDate: '2026-07-01',
    endDate: '2026-09-30',
    calories: 2600,
    protein: 170,
    description: 'Maintain and enjoy'
  }
];

export const EXERCISES: ExerciseName[] = [
  'Pull-ups',
  'Dips',
  'Push-ups',
  'Rows',
  'Squats',
  'Pike Push-ups',
  'Chin-ups',
  'Diamond Push-ups'
];

export const INITIAL_PROFILE = {
  name: '',
  gender: undefined,
  age: undefined,
  startingWeight: 80,
  goalWeight: undefined,
  height: 175
};

export const CATEGORY_COLORS = {
  pull: '#0070f3',   // NOPE blue
  push: '#ee5555',   // NOPE red
  core: '#f5a623',   // NOPE orange
  legs: '#00a67e'    // NOPE green
};

export const CATEGORY_LABELS = {
  pull: 'Pull',
  push: 'Push',
  core: 'Core',
  legs: 'Legs'
};

// PPL Workout Constants
export const PPL_CATEGORY_COLORS: Record<WorkoutCategory, string> = {
  push: '#ee5555', // NOPE red
  pull: '#0070f3', // NOPE blue
  legs: '#00a67e'  // NOPE green
};

export const PPL_CATEGORY_LABELS: Record<WorkoutCategory, string> = {
  push: 'Push',
  pull: 'Pull',
  legs: 'Legs'
};

export const DEFAULT_TEMPLATES: WorkoutTemplate[] = [
  // PUSH - Weighted (calisthenics with added weight)
  {
    id: 'template-push-weighted',
    category: 'push',
    templateType: 'weighted',
    exercises: [
      { id: 'push-w-1', name: 'Weighted Dips', type: 'weighted', defaultSets: 4, defaultReps: 8, defaultWeight: 10, order: 1 },
      { id: 'push-w-2', name: 'Weighted Push-ups', type: 'weighted', defaultSets: 4, defaultReps: 10, defaultWeight: 10, order: 2 },
      { id: 'push-w-3', name: 'Pike Push-ups', type: 'bodyweight', defaultSets: 4, defaultReps: 10, order: 3 },
      { id: 'push-w-4', name: 'Diamond Push-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 12, order: 4 },
      { id: 'push-w-5', name: 'Tricep Dips', type: 'bodyweight', defaultSets: 3, defaultReps: 15, order: 5 },
      { id: 'push-w-6', name: 'Pseudo Planche Lean', type: 'bodyweight', defaultSets: 3, defaultReps: 30, order: 6 }
    ],
    lastModified: new Date().toISOString()
  },
  // PUSH - Bodyweight
  {
    id: 'template-push-bodyweight',
    category: 'push',
    templateType: 'bodyweight',
    exercises: [
      { id: 'push-b-1', name: 'Push-ups', type: 'bodyweight', defaultSets: 4, defaultReps: 15, order: 1 },
      { id: 'push-b-2', name: 'Pike Push-ups', type: 'bodyweight', defaultSets: 4, defaultReps: 10, order: 2 },
      { id: 'push-b-3', name: 'Diamond Push-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 12, order: 3 },
      { id: 'push-b-4', name: 'Dips', type: 'bodyweight', defaultSets: 3, defaultReps: 12, order: 4 },
      { id: 'push-b-5', name: 'Archer Push-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 8, order: 5 },
      { id: 'push-b-6', name: 'Pseudo Planche Push-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 8, order: 6 }
    ],
    lastModified: new Date().toISOString()
  },
  // PULL - Weighted (calisthenics with added weight)
  {
    id: 'template-pull-weighted',
    category: 'pull',
    templateType: 'weighted',
    exercises: [
      { id: 'pull-w-1', name: 'Weighted Pull-ups', type: 'weighted', defaultSets: 4, defaultReps: 8, defaultWeight: 10, order: 1 },
      { id: 'pull-w-2', name: 'Weighted Chin-ups', type: 'weighted', defaultSets: 4, defaultReps: 8, defaultWeight: 10, order: 2 },
      { id: 'pull-w-3', name: 'Weighted Australian Rows', type: 'weighted', defaultSets: 3, defaultReps: 10, defaultWeight: 10, order: 3 },
      { id: 'pull-w-4', name: 'Archer Pull-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 6, order: 4 },
      { id: 'pull-w-5', name: 'Front Lever Raises', type: 'bodyweight', defaultSets: 3, defaultReps: 8, order: 5 },
      { id: 'pull-w-6', name: 'Scapular Pull-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 12, order: 6 }
    ],
    lastModified: new Date().toISOString()
  },
  // PULL - Bodyweight
  {
    id: 'template-pull-bodyweight',
    category: 'pull',
    templateType: 'bodyweight',
    exercises: [
      { id: 'pull-b-1', name: 'Pull-ups', type: 'bodyweight', defaultSets: 4, defaultReps: 10, order: 1 },
      { id: 'pull-b-2', name: 'Chin-ups', type: 'bodyweight', defaultSets: 4, defaultReps: 10, order: 2 },
      { id: 'pull-b-3', name: 'Australian Rows', type: 'bodyweight', defaultSets: 3, defaultReps: 12, order: 3 },
      { id: 'pull-b-4', name: 'Archer Pull-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 6, order: 4 },
      { id: 'pull-b-5', name: 'Scapular Pull-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 12, order: 5 },
      { id: 'pull-b-6', name: 'Negative Pull-ups', type: 'bodyweight', defaultSets: 3, defaultReps: 5, order: 6 }
    ],
    lastModified: new Date().toISOString()
  },
  // LEGS - Weighted (calisthenics with added weight)
  {
    id: 'template-legs-weighted',
    category: 'legs',
    templateType: 'weighted',
    exercises: [
      { id: 'legs-w-1', name: 'Weighted Pistol Squats', type: 'weighted', defaultSets: 4, defaultReps: 6, defaultWeight: 10, order: 1 },
      { id: 'legs-w-2', name: 'Weighted Lunges', type: 'weighted', defaultSets: 4, defaultReps: 10, defaultWeight: 10, order: 2 },
      { id: 'legs-w-3', name: 'Nordic Curls', type: 'bodyweight', defaultSets: 3, defaultReps: 6, order: 3 },
      { id: 'legs-w-4', name: 'Shrimp Squats', type: 'bodyweight', defaultSets: 3, defaultReps: 8, order: 4 },
      { id: 'legs-w-5', name: 'Single Leg Calf Raises', type: 'bodyweight', defaultSets: 4, defaultReps: 15, order: 5 },
      { id: 'legs-w-6', name: 'Glute Bridges', type: 'bodyweight', defaultSets: 3, defaultReps: 15, order: 6 }
    ],
    lastModified: new Date().toISOString()
  },
  // LEGS - Bodyweight
  {
    id: 'template-legs-bodyweight',
    category: 'legs',
    templateType: 'bodyweight',
    exercises: [
      { id: 'legs-b-1', name: 'Pistol Squats', type: 'bodyweight', defaultSets: 4, defaultReps: 6, order: 1 },
      { id: 'legs-b-2', name: 'Nordic Curls', type: 'bodyweight', defaultSets: 4, defaultReps: 6, order: 2 },
      { id: 'legs-b-3', name: 'Jump Squats', type: 'bodyweight', defaultSets: 3, defaultReps: 15, order: 3 },
      { id: 'legs-b-4', name: 'Lunges', type: 'bodyweight', defaultSets: 3, defaultReps: 12, order: 4 },
      { id: 'legs-b-5', name: 'Single Leg Calf Raises', type: 'bodyweight', defaultSets: 4, defaultReps: 15, order: 5 },
      { id: 'legs-b-6', name: 'Glute Bridges', type: 'bodyweight', defaultSets: 3, defaultReps: 15, order: 6 }
    ],
    lastModified: new Date().toISOString()
  }
];

export const INITIAL_WORKOUT_DATA: WorkoutData = {
  templates: DEFAULT_TEMPLATES,
  logs: []
};

export const DEFAULT_RECIPES: CustomRecipe[] = [
  // Shakes
  { id: 'shake-1', name: 'Base / Basis', ingredients: '2 scoops whey + 150g quark + 50ml cream + 50g berries', kcal: 550, protein: '58g', carbs: '12g', category: 'shakes' },
  { id: 'shake-2', name: 'Chocolate / Chocolade', ingredients: '2 scoops whey + 150g quark + 50ml cream + 1 tbsp cocoa', kcal: 560, protein: '60g', carbs: '10g', category: 'shakes' },
  { id: 'shake-3', name: 'Peanut Butter / Pindakaas', ingredients: '2 scoops whey + 150g quark + 50ml cream + 1 tbsp peanut butter', kcal: 650, protein: '64g', carbs: '10g', category: 'shakes' },
  { id: 'shake-4', name: 'PB-Berry / Pindakaas-Bessen', ingredients: '2 scoops whey + 150g quark + 1 tbsp peanut butter + 50g berries', kcal: 620, protein: '62g', carbs: '14g', category: 'shakes' },
  { id: 'shake-5', name: 'Greek Yogurt / Griekse Yoghurt', ingredients: '2 scoops whey + 200g Greek yogurt 10% + 50ml cream + 50g berries', kcal: 600, protein: '60g', carbs: '15g', category: 'shakes' },
  { id: 'shake-6', name: 'Rich Chocolate / Rijke Chocolade', ingredients: '2 scoops whey + 150g quark + 100ml cream + peanut butter + cocoa', kcal: 850, protein: '64g', carbs: '12g', category: 'shakes' },
  // Ice Cream
  { id: 'ice-1', name: 'Base Vanilla / Basis Vanille', ingredients: '1 scoop vanilla whey + 100g full-fat quark + 50ml cream', kcal: 200, protein: '28g', carbs: '5g', category: 'icecream' },
  { id: 'ice-2', name: 'Chocolate / Chocolade', ingredients: '1 scoop choco whey + 100g full-fat quark + 50ml cream + 1 tsp cocoa', kcal: 210, protein: '29g', carbs: '6g', category: 'icecream' },
  { id: 'ice-3', name: 'Peanut Butter / Pindakaas', ingredients: '1 scoop vanilla whey + 75g full-fat quark + 1 tbsp peanut butter', kcal: 220, protein: '30g', carbs: '5g', category: 'icecream' },
  { id: 'ice-4', name: 'Strawberry / Aardbei', ingredients: '1 scoop vanilla whey + 100g full-fat quark + 40g frozen strawberries', kcal: 180, protein: '28g', carbs: '8g', category: 'icecream' },
  { id: 'ice-5', name: 'Cookie Dough', ingredients: '1 scoop vanilla whey + 100g full-fat quark + 50ml cream + 10g dark chocolate chunks', kcal: 240, protein: '28g', carbs: '8g', category: 'icecream' },
  { id: 'ice-6', name: 'Bounty', ingredients: '1 scoop choco whey + 75g full-fat quark + 50ml coconut cream + 1 tbsp shredded coconut', kcal: 230, protein: '26g', carbs: '6g', category: 'icecream' },
  // Savory Snacks
  { id: 'snack-s-1', name: '2 boiled eggs + mayo', ingredients: '', kcal: 200, protein: '13g', carbs: '1g', category: 'snacks-savory' },
  { id: 'snack-s-2', name: 'Cheese cubes (50g)', ingredients: '', kcal: 180, protein: '12g', carbs: '0g', category: 'snacks-savory' },
  { id: 'snack-s-3', name: 'Handful nuts (30g)', ingredients: '', kcal: 180, protein: '5g', carbs: '3g', category: 'snacks-savory' },
  { id: 'snack-s-4', name: 'Ham + cheese rolled', ingredients: '', kcal: 100, protein: '10g', carbs: '1g', category: 'snacks-savory' },
  { id: 'snack-s-5', name: 'Pickles', ingredients: '', kcal: 10, protein: '0g', carbs: '1g', category: 'snacks-savory' },
  { id: 'snack-s-6', name: 'Cucumber + cream cheese', ingredients: '', kcal: 100, protein: '3g', carbs: '3g', category: 'snacks-savory' },
  // Sweet Snacks
  { id: 'snack-w-1', name: '100g full-fat quark + berries', ingredients: '', kcal: 150, protein: '10g', carbs: '8g', category: 'snacks-sweet' },
  { id: 'snack-w-2', name: '85% dark chocolate (20g)', ingredients: '', kcal: 120, protein: '2g', carbs: '5g', category: 'snacks-sweet' },
  { id: 'snack-w-3', name: 'Ninja ice cream (small)', ingredients: '', kcal: 200, protein: '25g', carbs: '5g', category: 'snacks-sweet' },
  // Waffles
  { id: 'waffle-1', name: 'Basic Protein Waffle', ingredients: '2 eggs + 100g quark + 1 scoop vanilla whey + 1/2 tsp baking powder', kcal: 350, protein: '45g', carbs: '5g', category: 'waffles' },
  { id: 'waffle-2', name: 'Peanut Butter Waffle', ingredients: '2 eggs + 100g quark + 1 scoop vanilla whey + 1 tbsp peanut butter + 1/2 tsp baking powder', kcal: 450, protein: '50g', carbs: '7g', category: 'waffles' },
  { id: 'waffle-3', name: 'Chocolate Waffle', ingredients: '2 eggs + 100g quark + 1 scoop chocolate whey + 1 tsp cocoa powder + 1/2 tsp baking powder', kcal: 360, protein: '46g', carbs: '6g', category: 'waffles' },
  { id: 'waffle-4', name: 'Berry Waffle', ingredients: '2 eggs + 100g quark + 1 scoop vanilla whey + 30g berries (thawed) + 1/2 tsp baking powder', kcal: 360, protein: '45g', carbs: '8g', category: 'waffles' },
  { id: 'waffle-5', name: 'Double Chocolate PB Waffle', ingredients: '2 eggs + 100g quark + 1 scoop chocolate whey + 1 tbsp peanut butter + 1 tsp cocoa + 1/2 tsp baking powder', kcal: 470, protein: '52g', carbs: '8g', category: 'waffles' },
];
