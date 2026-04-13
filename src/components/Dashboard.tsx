import { AppData, TabName, Phase } from '../types';
import { DEFAULT_SKILL_DEFINITIONS } from '../constants';
import {
  TrendingDown,
  TrendingUp,
  Target,
  ChevronRight,
  Calendar,
  ChefHat,
  Dumbbell,
  Scale
} from 'lucide-react';

interface DashboardProps {
  data: AppData;
  phases: Phase[];
  onNavigate: (tab: TabName) => void;
  onOpenStreakCalendar: () => void;
}

export default function Dashboard({ data, phases, onNavigate, onOpenStreakCalendar }: DashboardProps) {
  const { weights, strengthPRs, skills, streak, workoutStreak, profile } = data;
  
  // Get current weight and change
  const latestWeight = weights.length > 0 
    ? weights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0]
    : null;
  
  const previousWeight = weights.length > 1 
    ? weights.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[1]
    : null;
  
  const weightChange = latestWeight && previousWeight 
    ? latestWeight.weight - previousWeight.weight 
    : 0;

  const totalWeightChange = latestWeight 
    ? latestWeight.weight - profile.startingWeight 
    : 0;

  // Get current phase
  const today = new Date();
  const currentPhase = phases.length > 0
    ? phases.find(phase => {
        const start = new Date(phase.startDate);
        const end = new Date(phase.endDate);
        return today >= start && today <= end;
      }) || phases[0]
    : null;

  // Calculate phase progress
  const phaseStart = currentPhase ? new Date(currentPhase.startDate) : today;
  const phaseEnd = currentPhase ? new Date(currentPhase.endDate) : today;
  const totalDays = Math.ceil((phaseEnd.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  const daysPassed = Math.ceil((today.getTime() - phaseStart.getTime()) / (1000 * 60 * 60 * 24));
  const phaseProgress = Math.min(Math.max((daysPassed / totalDays) * 100, 0), 100);
  const daysRemaining = Math.max(totalDays - daysPassed, 0);

  // Count unlocked skills
  const skillDefinitions = data.skillDefinitions || DEFAULT_SKILL_DEFINITIONS;
  const unlockedSkills = skills.filter(s => (s.currentStep ?? -1) >= 0).length;
  const totalSkills = skillDefinitions.length;

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Phase Card */}
      {currentPhase && (
        <div className="card relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-accent-primary/10 to-transparent" />
          <div className="relative">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-text-muted text-xs uppercase tracking-wider mb-1">Current Phase</p>
                <h2 className="font-display text-2xl font-bold text-accent-primary">
                  {currentPhase.name}
                </h2>
              </div>
              <div className="text-right">
                <p className="font-display text-3xl font-bold">{daysRemaining}</p>
                <p className="text-text-muted text-xs">days left</p>
              </div>
            </div>

            <div className="progress-bar mb-2">
              <div
                className="progress-fill bg-gradient-to-r from-accent-primary to-accent-secondary"
                style={{ width: `${phaseProgress}%` }}
              />
            </div>

            <div className="flex justify-between text-xs text-text-muted">
              <span>{currentPhase.calories} kcal</span>
              <span>{currentPhase.protein}g protein</span>
            </div>
          </div>
        </div>
      )}

      {/* Streaks Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Logging Streak Card */}
        <button
          onClick={onOpenStreakCalendar}
          className="card-hover bg-gradient-to-br from-accent-primary/20 to-bg-card text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs uppercase tracking-wider">Log Streak</span>
            <Scale size={16} className="text-accent-primary" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="stat-value text-accent-primary">{streak.currentStreak}</p>
            {streak.currentStreak > 0 && <span className="text-xl animate-fire">🔥</span>}
          </div>
          <p className="text-text-muted text-xs mt-1">
            Best: {streak.longestStreak} days · Tap to edit
          </p>
        </button>

        {/* Workout Streak Card */}
        <button
          onClick={onOpenStreakCalendar}
          className="card-hover bg-gradient-to-br from-accent-success/20 to-bg-card text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs uppercase tracking-wider">Workout Streak</span>
            <Dumbbell size={16} className="text-accent-success" />
          </div>
          <div className="flex items-baseline gap-2">
            <p className="stat-value text-accent-success">{workoutStreak?.currentStreak || 0}</p>
            {(workoutStreak?.currentStreak || 0) > 0 && <span className="text-xl animate-fire">💪</span>}
          </div>
          <p className="text-text-muted text-xs mt-1">
            Best: {workoutStreak?.longestStreak || 0} days · Tap to edit
          </p>
        </button>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weight Card */}
        <button
          onClick={() => onNavigate('weight')}
          className="card-hover text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs uppercase tracking-wider">Weight</span>
            <ChevronRight size={16} className="text-text-muted" />
          </div>
          {latestWeight ? (
            <>
              <p className="stat-value">{latestWeight.weight}</p>
              <div className="flex items-center gap-1 mt-1">
                {weightChange !== 0 && (
                  <>
                    {weightChange < 0 ? (
                      <TrendingDown size={14} className="text-accent-success" />
                    ) : (
                      <TrendingUp size={14} className="text-accent-warning" />
                    )}
                    <span className={`text-xs font-medium ${
                      weightChange < 0 ? 'text-accent-success' : 'text-accent-warning'
                    }`}>
                      {weightChange > 0 ? '+' : ''}{weightChange.toFixed(1)} kg
                    </span>
                  </>
                )}
              </div>
            </>
          ) : (
            <p className="text-text-muted text-sm mt-2">No data yet</p>
          )}
        </button>

        {/* Progress Card */}
        <button
          onClick={() => onNavigate('weight')}
          className="card-hover text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs uppercase tracking-wider">Progress</span>
            <Target size={16} className="text-text-muted" />
          </div>
          <p className={`stat-value ${totalWeightChange < 0 ? 'text-accent-success' : 'text-text-primary'}`}>
            {totalWeightChange > 0 ? '+' : ''}{totalWeightChange.toFixed(1)}
          </p>
          <p className="text-text-muted text-xs mt-1">
            from {profile.startingWeight} kg
          </p>
        </button>

        {/* Skills Card */}
        <button
          onClick={() => onNavigate('skills')}
          className="card-hover text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs uppercase tracking-wider">Skills</span>
            <ChevronRight size={16} className="text-text-muted" />
          </div>
          <p className="stat-value">{unlockedSkills}</p>
          <p className="text-text-muted text-xs mt-1">
            of {totalSkills} unlocked
          </p>
        </button>

        {/* Workouts Card */}
        <button
          onClick={() => onNavigate('workouts')}
          className="card-hover text-left"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-text-muted text-xs uppercase tracking-wider">Workouts</span>
            <ChevronRight size={16} className="text-text-muted" />
          </div>
          <p className="stat-value">{workoutStreak?.totalDaysLogged || 0}</p>
          <p className="text-text-muted text-xs mt-1">
            total logged
          </p>
        </button>
      </div>

      {/* Quick Actions */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider">
          Quick Actions
        </h3>

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => onNavigate('weight')}
            className="btn-primary flex items-center justify-center gap-2"
          >
            <Calendar size={18} />
            Log Today
          </button>
          <button
            onClick={() => onNavigate('strength')}
            className="btn-secondary flex items-center justify-center gap-2"
          >
            <Target size={18} />
            New PR
          </button>
        </div>
      </div>

      {/* Recipes Card */}
      <button
        onClick={() => onNavigate('recipes')}
        className="card-hover w-full text-left"
      >
        <div className="flex items-center gap-4">
          <div className="bg-accent-secondary/20 rounded-xl p-3">
            <ChefHat size={24} className="text-accent-secondary" />
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between">
              <h3 className="font-display font-semibold text-text-primary">Recipes & Meal Plan</h3>
              <ChevronRight size={18} className="text-text-muted" />
            </div>
            <p className="text-text-muted text-sm">IF 16:8 · Shakes · Ice Cream · Snacks</p>
          </div>
        </div>
      </button>

      {/* Recent PRs */}
      {strengthPRs.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider">
              Recent PRs
            </h3>
            <button 
              onClick={() => onNavigate('strength')}
              className="text-accent-primary text-xs font-medium"
            >
              View all
            </button>
          </div>
          
          <div className="space-y-2">
            {strengthPRs
              .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
              .slice(0, 3)
              .map(pr => (
                <div 
                  key={pr.id}
                  className="card-hover flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-semibold">{pr.exercise}</p>
                    <p className="text-text-muted text-sm">
                      {pr.type === 'weighted' ? `${pr.reps} × ${pr.weight}kg` : `${pr.reps} reps`}
                    </p>
                  </div>
                  <span className="text-text-muted text-xs">
                    {new Date(pr.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </span>
                </div>
              ))
            }
          </div>
        </div>
      )}
    </div>
  );
}
