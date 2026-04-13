import { useState } from 'react';
import { Clock, Coffee, Utensils, IceCream, Cookie, ChevronDown, ChevronUp, Plus, Trash2, X, Pencil, Check, RotateCcw, Grid3X3 } from 'lucide-react';
import { useNotifications } from '../hooks/useNotifications';
import { CustomRecipe } from '../types';
import { generateId } from '../hooks/useLocalStorage';
import { DEFAULT_RECIPES } from '../constants';

type RecipeCategory = 'daily' | 'shakes' | 'icecream' | 'snacks' | 'waffles';

interface RecipesTrackerProps {
  customRecipes: CustomRecipe[];
  onUpdateCustomRecipes: (recipes: CustomRecipe[]) => void;
}

export default function RecipesTracker({ customRecipes, onUpdateCustomRecipes }: RecipesTrackerProps) {
  const [activeCategory, setActiveCategory] = useState<RecipeCategory>('daily');
  const [expandedRecipe, setExpandedRecipe] = useState<string | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newRecipe, setNewRecipe] = useState({
    name: '',
    ingredients: '',
    kcal: '',
    protein: '',
    carbs: '',
    category: 'shakes' as CustomRecipe['category']
  });
  const [editingMealId, setEditingMealId] = useState<string | null>(null);
  const [editMealLabel, setEditMealLabel] = useState('');
  const [editMealDescription, setEditMealDescription] = useState('');
  const [showAddMealForm, setShowAddMealForm] = useState(false);
  const [newMeal, setNewMeal] = useState({ label: '', description: '', hours: '', minutes: '' });
  const [editingRecipeId, setEditingRecipeId] = useState<string | null>(null);
  const [editedRecipe, setEditedRecipe] = useState<CustomRecipe | null>(null);

  const { mealTimes, ifWindowStart, ifWindowEnd, updateMealLabel, removeMeal, addMeal, resetToDefaults: resetMealsToDefaults, hasCustomMeals } = useNotifications();

  // Get recipes for each category
  const shakes = customRecipes.filter(r => r.category === 'shakes');
  const icecream = customRecipes.filter(r => r.category === 'icecream');
  const savorySnacks = customRecipes.filter(r => r.category === 'snacks-savory');
  const sweetSnacks = customRecipes.filter(r => r.category === 'snacks-sweet');
  const waffles = customRecipes.filter(r => r.category === 'waffles');

  const handleAddRecipe = () => {
    if (!newRecipe.name || !newRecipe.kcal) return;

    const recipe: CustomRecipe = {
      id: generateId(),
      name: newRecipe.name,
      ingredients: newRecipe.ingredients,
      kcal: parseInt(newRecipe.kcal) || 0,
      protein: newRecipe.protein || '0g',
      carbs: newRecipe.carbs || '0g',
      category: newRecipe.category
    };

    onUpdateCustomRecipes([...customRecipes, recipe]);
    setNewRecipe({
      name: '',
      ingredients: '',
      kcal: '',
      protein: '',
      carbs: '',
      category: activeCategory === 'snacks' ? 'snacks-savory' : activeCategory as CustomRecipe['category']
    });
    setShowAddForm(false);
  };

  const handleDeleteRecipe = (id: string) => {
    onUpdateCustomRecipes(customRecipes.filter(r => r.id !== id));
  };

  const handleStartEditRecipe = (recipe: CustomRecipe) => {
    setEditingRecipeId(recipe.id);
    setEditedRecipe({ ...recipe });
  };

  const handleSaveRecipe = () => {
    if (!editedRecipe || !editingRecipeId) return;
    onUpdateCustomRecipes(customRecipes.map(r =>
      r.id === editingRecipeId ? editedRecipe : r
    ));
    setEditingRecipeId(null);
    setEditedRecipe(null);
  };

  const handleCancelEditRecipe = () => {
    setEditingRecipeId(null);
    setEditedRecipe(null);
  };

  const handleResetRecipes = () => {
    if (confirm('Reset all recipes to defaults? This will remove all your changes.')) {
      onUpdateCustomRecipes(DEFAULT_RECIPES);
    }
  };

  // Check if recipes have been modified from defaults
  const hasCustomRecipeChanges = JSON.stringify(customRecipes) !== JSON.stringify(DEFAULT_RECIPES);

  // Format hour for display
  const formatHour = (hour: number): string => {
    return `${hour.toString().padStart(2, '0')}:00`;
  };

  const categories: { id: RecipeCategory; label: string; icon: typeof Clock }[] = [
    { id: 'daily', label: 'Daily', icon: Clock },
    { id: 'shakes', label: 'Shakes', icon: Coffee },
    { id: 'icecream', label: 'Ice Cream', icon: IceCream },
    { id: 'waffles', label: 'Waffles', icon: Grid3X3 },
    { id: 'snacks', label: 'Snacks', icon: Cookie },
  ];

  const toggleRecipe = (name: string) => {
    setExpandedRecipe(expandedRecipe === name ? null : name);
  };

  const handleStartEditMeal = (mealId: string, label: string, description: string) => {
    setEditingMealId(mealId);
    setEditMealLabel(label);
    setEditMealDescription(description);
  };

  const handleSaveEditMeal = () => {
    if (editingMealId && editMealLabel.trim()) {
      updateMealLabel(editingMealId, editMealLabel.trim(), editMealDescription.trim());
      setEditingMealId(null);
      setEditMealLabel('');
      setEditMealDescription('');
    }
  };

  const handleRemoveMeal = (mealId: string, label: string) => {
    if (confirm(`Remove "${label}" from your schedule?`)) {
      removeMeal(mealId);
    }
  };

  const handleAddMeal = () => {
    if (!newMeal.label.trim()) return;
    const hours = parseInt(newMeal.hours) || 0;
    const minutes = parseInt(newMeal.minutes) || 0;
    addMeal(newMeal.label.trim(), newMeal.description.trim(), hours, minutes);
    setNewMeal({ label: '', description: '', hours: '', minutes: '' });
    setShowAddMealForm(false);
  };

  const renderDailyStructure = () => {
    // Calculate training time (3 hours after fast begins)
    const fastMeal = mealTimes.find(m => m.id === 'fast');
    const trainingHour = fastMeal ? (fastMeal.hour + 3) % 24 : 23;
    const trainingTime = `${trainingHour.toString().padStart(2, '0')}:00`;

    return (
      <div className="space-y-3">
        <div className="bg-bg-secondary rounded-2xl p-4 border border-white/5">
          <h3 className="font-display font-semibold text-text-primary mb-1">IF Schedule: 16:8</h3>
          <p className="text-text-muted text-sm">Eating window: {formatHour(ifWindowStart)} - {formatHour(ifWindowEnd)}</p>
        </div>

        <div className="space-y-2">
          {mealTimes.map((meal) => (
            <div
              key={meal.id}
              className={`bg-bg-secondary rounded-xl p-4 border border-white/5 ${
                meal.id === 'fast' ? 'border-l-4 border-l-accent-warning' : ''
              }`}
            >
              {editingMealId === meal.id ? (
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <div className="bg-accent-primary/10 rounded-lg px-3 py-2 min-w-[70px] text-center">
                      <span className="font-display font-bold text-accent-primary">{meal.time}</span>
                    </div>
                    <input
                      type="text"
                      value={editMealLabel}
                      onChange={(e) => setEditMealLabel(e.target.value)}
                      className="flex-1 text-sm"
                      placeholder="Meal name"
                      autoFocus
                    />
                  </div>
                  <input
                    type="text"
                    value={editMealDescription}
                    onChange={(e) => setEditMealDescription(e.target.value)}
                    className="w-full text-sm"
                    placeholder="Description"
                  />
                  <div className="flex gap-2">
                    <button
                      onClick={handleSaveEditMeal}
                      className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1"
                    >
                      <Check size={14} />
                      Save
                    </button>
                    <button
                      onClick={() => setEditingMealId(null)}
                      className="btn-secondary flex-1 py-2 text-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-4">
                  <div className="bg-accent-primary/10 rounded-lg px-3 py-2 min-w-[70px] text-center">
                    <span className="font-display font-bold text-accent-primary">{meal.time}</span>
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-text-primary">{meal.label}</p>
                    <p className="text-text-muted text-sm">{meal.description}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleStartEditMeal(meal.id, meal.label, meal.description)}
                      className="p-2 text-text-muted hover:text-accent-primary transition-colors"
                      title="Edit meal"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      onClick={() => handleRemoveMeal(meal.id, meal.label)}
                      className="p-2 text-text-muted hover:text-accent-danger transition-colors"
                      title="Remove meal"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Training time (fasted) */}
          <div className="bg-bg-secondary rounded-xl p-4 border border-white/5 flex items-center gap-4 border-l-4 border-l-accent-primary">
            <div className="bg-accent-primary/10 rounded-lg px-3 py-2 min-w-[70px] text-center">
              <span className="font-display font-bold text-accent-primary">{trainingTime}</span>
            </div>
            <div className="flex-1">
              <p className="font-medium text-text-primary">Training (fasted)</p>
              <p className="text-text-muted text-sm">Gym session</p>
            </div>
          </div>
        </div>

        {/* Add Meal Form */}
        {showAddMealForm ? (
          <div className="card p-4 space-y-3 animate-scale-in">
            <div className="flex items-center justify-between">
              <h4 className="font-medium text-text-primary">Add Meal</h4>
              <button
                onClick={() => setShowAddMealForm(false)}
                className="text-text-muted hover:text-text-primary"
              >
                <X size={16} />
              </button>
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Name</label>
              <input
                type="text"
                value={newMeal.label}
                onChange={(e) => setNewMeal({ ...newMeal, label: e.target.value })}
                placeholder="e.g., Pre-workout snack"
                className="w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Description</label>
              <input
                type="text"
                value={newMeal.description}
                onChange={(e) => setNewMeal({ ...newMeal, description: e.target.value })}
                placeholder="e.g., Light protein"
                className="w-full"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-text-muted text-xs mb-1 block">Hours after IF start</label>
                <input
                  type="number"
                  min="0"
                  max="8"
                  value={newMeal.hours}
                  onChange={(e) => setNewMeal({ ...newMeal, hours: e.target.value })}
                  placeholder="0"
                  className="w-full"
                />
              </div>
              <div>
                <label className="text-text-muted text-xs mb-1 block">Minutes</label>
                <input
                  type="number"
                  min="0"
                  max="59"
                  value={newMeal.minutes}
                  onChange={(e) => setNewMeal({ ...newMeal, minutes: e.target.value })}
                  placeholder="0"
                  className="w-full"
                />
              </div>
            </div>
            <button onClick={handleAddMeal} className="btn-primary w-full">
              Add Meal
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowAddMealForm(true)}
            className="w-full py-2 rounded-lg border-2 border-dashed border-white/10 text-text-muted hover:border-accent-primary/50 hover:text-accent-primary transition-all flex items-center justify-center gap-2 text-sm"
          >
            <Plus size={16} />
            Add Meal
          </button>
        )}

        {/* Reset to defaults button */}
        {hasCustomMeals && (
          <button
            onClick={() => {
              if (confirm('Reset schedule to defaults? This will remove all custom meals.')) {
                resetMealsToDefaults();
              }
            }}
            className="w-full py-2 text-text-muted hover:text-accent-warning text-sm transition-colors"
          >
            Reset to defaults
          </button>
        )}
      </div>
    );
  };

  const renderRecipeCard = (recipe: CustomRecipe) => {
    const isEditing = editingRecipeId === recipe.id;

    if (isEditing && editedRecipe) {
      return (
        <div key={recipe.id} className="bg-bg-secondary rounded-xl border border-accent-primary/30 p-4 space-y-3">
          <div>
            <label className="text-text-muted text-xs mb-1 block">Name</label>
            <input
              type="text"
              value={editedRecipe.name}
              onChange={(e) => setEditedRecipe({ ...editedRecipe, name: e.target.value })}
              className="w-full"
              autoFocus
            />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">Ingredients</label>
            <input
              type="text"
              value={editedRecipe.ingredients}
              onChange={(e) => setEditedRecipe({ ...editedRecipe, ingredients: e.target.value })}
              className="w-full"
            />
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="text-text-muted text-xs mb-1 block">Kcal</label>
              <input
                type="number"
                value={editedRecipe.kcal}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, kcal: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Protein</label>
              <input
                type="text"
                value={editedRecipe.protein}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, protein: e.target.value })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Carbs</label>
              <input
                type="text"
                value={editedRecipe.carbs}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, carbs: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveRecipe} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1">
              <Check size={14} />
              Save
            </button>
            <button onClick={handleCancelEditRecipe} className="btn-secondary flex-1 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={recipe.id}
        className="bg-bg-secondary rounded-xl border border-white/5 overflow-hidden"
      >
        <button
          onClick={() => toggleRecipe(recipe.id)}
          className="w-full p-4 text-left flex items-center justify-between"
        >
          <div className="flex-1">
            <h4 className="font-medium text-text-primary">{recipe.name}</h4>
            <div className="flex gap-4 mt-1">
              <span className="text-accent-primary text-sm font-medium">{recipe.kcal} kcal</span>
              <span className="text-text-muted text-sm">{recipe.protein} protein</span>
              <span className="text-text-muted text-sm">{recipe.carbs} carbs</span>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={(e) => { e.stopPropagation(); handleStartEditRecipe(recipe); }}
              className="p-2 text-text-muted hover:text-accent-primary transition-colors"
              title="Edit recipe"
            >
              <Pencil size={14} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (confirm(`Delete "${recipe.name}"?`)) {
                  handleDeleteRecipe(recipe.id);
                }
              }}
              className="p-2 text-text-muted hover:text-accent-danger transition-colors"
              title="Delete recipe"
            >
              <Trash2 size={14} />
            </button>
            {expandedRecipe === recipe.id ?
              <ChevronUp size={20} className="text-text-muted" /> :
              <ChevronDown size={20} className="text-text-muted" />
            }
          </div>
        </button>

        {expandedRecipe === recipe.id && recipe.ingredients && (
          <div className="px-4 pb-4 border-t border-white/5 pt-3">
            <p className="text-text-secondary text-sm">{recipe.ingredients}</p>
          </div>
        )}
      </div>
    );
  };

  const renderAddRecipeForm = (categoryOptions: { value: CustomRecipe['category']; label: string }[]) => (
    showAddForm ? (
      <div className="card p-4 space-y-3 animate-scale-in">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-text-primary">Add Recipe</h4>
          <button
            onClick={() => setShowAddForm(false)}
            className="text-text-muted hover:text-text-primary"
          >
            <X size={16} />
          </button>
        </div>

        {categoryOptions.length > 1 && (
          <div>
            <label className="text-text-muted text-xs mb-1 block">Category</label>
            <select
              value={newRecipe.category}
              onChange={(e) => setNewRecipe({ ...newRecipe, category: e.target.value as CustomRecipe['category'] })}
              className="w-full"
            >
              {categoryOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
        )}

        <div>
          <label className="text-text-muted text-xs mb-1 block">Name</label>
          <input
            type="text"
            value={newRecipe.name}
            onChange={(e) => setNewRecipe({ ...newRecipe, name: e.target.value })}
            placeholder="Recipe name"
            className="w-full"
          />
        </div>

        <div>
          <label className="text-text-muted text-xs mb-1 block">Ingredients</label>
          <input
            type="text"
            value={newRecipe.ingredients}
            onChange={(e) => setNewRecipe({ ...newRecipe, ingredients: e.target.value })}
            placeholder="List ingredients..."
            className="w-full"
          />
        </div>

        <div className="grid grid-cols-3 gap-2">
          <div>
            <label className="text-text-muted text-xs mb-1 block">Kcal</label>
            <input
              type="number"
              value={newRecipe.kcal}
              onChange={(e) => setNewRecipe({ ...newRecipe, kcal: e.target.value })}
              placeholder="200"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">Protein</label>
            <input
              type="text"
              value={newRecipe.protein}
              onChange={(e) => setNewRecipe({ ...newRecipe, protein: e.target.value })}
              placeholder="20g"
              className="w-full"
            />
          </div>
          <div>
            <label className="text-text-muted text-xs mb-1 block">Carbs</label>
            <input
              type="text"
              value={newRecipe.carbs}
              onChange={(e) => setNewRecipe({ ...newRecipe, carbs: e.target.value })}
              placeholder="5g"
              className="w-full"
            />
          </div>
        </div>

        <button onClick={handleAddRecipe} className="btn-primary w-full">
          Add Recipe
        </button>
      </div>
    ) : (
      <button
        onClick={() => {
          setNewRecipe({ ...newRecipe, category: categoryOptions[0].value });
          setShowAddForm(true);
        }}
        className="w-full py-2 rounded-lg border-2 border-dashed border-white/10 text-text-muted hover:border-accent-primary/50 hover:text-accent-primary transition-all flex items-center justify-center gap-2 text-sm"
      >
        <Plus size={16} />
        Add Recipe
      </button>
    )
  );

  const renderShakes = () => (
    <div className="space-y-3">
      <div className="bg-bg-secondary rounded-2xl p-4 border border-white/5">
        <h3 className="font-display font-semibold text-text-primary mb-1">Protein Shakes</h3>
        <p className="text-text-muted text-sm">Larger portions, replaces a meal (12:00)</p>
      </div>

      <div className="space-y-2">
        {shakes.map(recipe => renderRecipeCard(recipe))}
      </div>

      {renderAddRecipeForm([{ value: 'shakes', label: 'Shake' }])}

      <div className="bg-accent-primary/5 rounded-xl p-4 border border-accent-primary/20">
        <h4 className="font-medium text-accent-primary mb-2">Instructions</h4>
        <ol className="text-text-secondary text-sm space-y-1 list-decimal list-inside">
          <li>All ingredients in blender</li>
          <li>Add water/ice cubes for consistency</li>
          <li>Blend until smooth</li>
        </ol>
      </div>
    </div>
  );

  const renderIceCream = () => (
    <div className="space-y-3">
      <div className="bg-bg-secondary rounded-2xl p-4 border border-white/5">
        <h3 className="font-display font-semibold text-text-primary mb-1">Ninja Creami Recipes</h3>
        <p className="text-text-muted text-sm">Smaller portions (~200 kcal), as snack or dessert</p>
      </div>

      <div className="space-y-2">
        {icecream.map(recipe => renderRecipeCard(recipe))}
      </div>

      {renderAddRecipeForm([{ value: 'icecream', label: 'Ice Cream' }])}

      <div className="bg-accent-secondary/5 rounded-xl p-4 border border-accent-secondary/20">
        <h4 className="font-medium text-accent-secondary mb-2">Instructions</h4>
        <ol className="text-text-secondary text-sm space-y-1 list-decimal list-inside">
          <li>Mix all ingredients smooth</li>
          <li>Pour into Ninja pot</li>
          <li>Freeze minimum 24 hours</li>
          <li>Run on "Ice Cream" setting</li>
          <li>Optionally run 2nd time for extra fluffy</li>
        </ol>
        <p className="text-text-muted text-xs mt-3 italic">
          Tip: Make 2-3 pots at once, always have supply ready.
        </p>
      </div>
    </div>
  );

  const renderWaffles = () => (
    <div className="space-y-3">
      <div className="bg-bg-secondary rounded-2xl p-4 border border-white/5">
        <h3 className="font-display font-semibold text-text-primary mb-1">Protein Waffles</h3>
        <p className="text-text-muted text-sm">High-protein, low-carb waffles for meal prep</p>
      </div>

      <div className="space-y-2">
        {waffles.map(recipe => renderRecipeCard(recipe))}
      </div>

      {renderAddRecipeForm([{ value: 'waffles', label: 'Waffle' }])}

      <div className="bg-accent-primary/5 rounded-xl p-4 border border-accent-primary/20">
        <h4 className="font-medium text-accent-primary mb-2">Instructions</h4>
        <ol className="text-text-secondary text-sm space-y-1 list-decimal list-inside">
          <li>Mix all ingredients in bowl (or blender for smoother batter)</li>
          <li>Let batter rest 2-3 min (baking powder activates)</li>
          <li>Preheat waffle iron + grease lightly</li>
          <li>Pour batter, cook 3-4 min until golden</li>
          <li>Cool and store in container for work</li>
        </ol>
        <p className="text-text-muted text-xs mt-3 italic">
          Storage: 3-4 days fridge, 2 weeks freezer. Reheat in toaster or pan (microwave makes them soggy).
        </p>
      </div>

      <div className="bg-bg-secondary rounded-xl p-4 border border-white/5">
        <h4 className="font-medium text-text-primary mb-2">Low Carb Toppings</h4>
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div className="text-text-muted">Peanut butter (1 tbsp)</div>
          <div className="text-text-secondary">~90 kcal, 2g carbs</div>
          <div className="text-text-muted">Greek yogurt (50g)</div>
          <div className="text-text-secondary">~50 kcal, 2g carbs</div>
          <div className="text-text-muted">Sugar-free syrup</div>
          <div className="text-text-secondary">~5 kcal, 0g carbs</div>
          <div className="text-text-muted">Fresh berries (30g)</div>
          <div className="text-text-secondary">~15 kcal, 3g carbs</div>
        </div>
      </div>
    </div>
  );

  const renderSnackCard = (recipe: CustomRecipe) => {
    const isEditing = editingRecipeId === recipe.id;

    if (isEditing && editedRecipe) {
      return (
        <div key={recipe.id} className="bg-bg-secondary rounded-xl border border-accent-primary/30 p-4 space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2">
              <label className="text-text-muted text-xs mb-1 block">Name</label>
              <input
                type="text"
                value={editedRecipe.name}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, name: e.target.value })}
                className="w-full"
                autoFocus
              />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Kcal</label>
              <input
                type="number"
                value={editedRecipe.kcal}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, kcal: parseInt(e.target.value) || 0 })}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Protein</label>
              <input
                type="text"
                value={editedRecipe.protein}
                onChange={(e) => setEditedRecipe({ ...editedRecipe, protein: e.target.value })}
                className="w-full"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button onClick={handleSaveRecipe} className="btn-primary flex-1 py-2 text-sm flex items-center justify-center gap-1">
              <Check size={14} />
              Save
            </button>
            <button onClick={handleCancelEditRecipe} className="btn-secondary flex-1 py-2 text-sm">
              Cancel
            </button>
          </div>
        </div>
      );
    }

    return (
      <div
        key={recipe.id}
        className="bg-bg-secondary rounded-xl p-4 border border-white/5 flex items-center justify-between"
      >
        <span className="font-medium text-text-primary">{recipe.name}</span>
        <div className="flex items-center gap-3 text-sm">
          <span className="text-accent-primary font-medium">{recipe.kcal}</span>
          <span className="text-text-muted">{recipe.protein}p</span>
          <span className="text-text-muted">{recipe.carbs}c</span>
          <button
            onClick={() => handleStartEditRecipe(recipe)}
            className="p-1 text-text-muted hover:text-accent-primary transition-colors"
            title="Edit snack"
          >
            <Pencil size={14} />
          </button>
          <button
            onClick={() => {
              if (confirm(`Delete "${recipe.name}"?`)) {
                handleDeleteRecipe(recipe.id);
              }
            }}
            className="p-1 text-text-muted hover:text-accent-danger transition-colors"
            title="Delete snack"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>
    );
  };

  const renderSnacks = () => (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Utensils size={18} className="text-text-muted" />
          <h3 className="font-display font-semibold text-text-primary">Savory / Hartig</h3>
        </div>
        <div className="space-y-2">
          {savorySnacks.map(snack => renderSnackCard(snack))}
        </div>
      </div>

      <div>
        <div className="flex items-center gap-2 mb-3">
          <Cookie size={18} className="text-text-muted" />
          <h3 className="font-display font-semibold text-text-primary">Sweet (no sugar) / Zoet</h3>
        </div>
        <div className="space-y-2">
          {sweetSnacks.map(snack => renderSnackCard(snack))}
        </div>
      </div>

      {renderAddRecipeForm([
        { value: 'snacks-savory', label: 'Savory Snack' },
        { value: 'snacks-sweet', label: 'Sweet Snack' }
      ])}
    </div>
  );

  const renderContent = () => {
    switch (activeCategory) {
      case 'daily':
        return renderDailyStructure();
      case 'shakes':
        return renderShakes();
      case 'icecream':
        return renderIceCream();
      case 'waffles':
        return renderWaffles();
      case 'snacks':
        return renderSnacks();
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-text-primary">Recipes</h2>
        <p className="text-text-muted">Your meal plan & recipes</p>
      </div>

      {/* Category Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
        {categories.map(({ id, label, icon: Icon }) => (
          <button
            key={id}
            onClick={() => setActiveCategory(id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-full whitespace-nowrap transition-all ${
              activeCategory === id
                ? 'bg-accent-primary text-white'
                : 'bg-bg-secondary text-text-muted hover:text-text-primary'
            }`}
          >
            <Icon size={16} />
            <span className="font-medium text-sm">{label}</span>
          </button>
        ))}
      </div>

      {/* Content */}
      {renderContent()}

      {/* Reset recipes to defaults - only show for recipe categories */}
      {activeCategory !== 'daily' && hasCustomRecipeChanges && (
        <button
          onClick={handleResetRecipes}
          className="w-full py-2 text-text-muted hover:text-accent-warning text-sm transition-colors flex items-center justify-center gap-2"
        >
          <RotateCcw size={14} />
          Reset recipes to defaults
        </button>
      )}
    </div>
  );
}
