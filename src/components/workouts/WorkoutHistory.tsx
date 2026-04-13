import { useState, useMemo } from 'react';
import { Trash2, TrendingUp, ChevronDown, ChevronUp, Calendar } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { WorkoutLog, WorkoutCategory } from '../../types';
import { PPL_CATEGORY_COLORS } from '../../constants';

interface WorkoutHistoryProps {
  category: WorkoutCategory;
  logs: WorkoutLog[];
  onDeleteLog: (logId: string) => void;
}

// Custom tooltip for chart
const CustomTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-bg-secondary border border-white/10 rounded-lg p-3 shadow-xl">
        <p className="text-text-primary font-medium">{payload[0].payload.date}</p>
        <p className="text-accent-primary">
          {payload[0].value} kg
        </p>
      </div>
    );
  }
  return null;
};

// Format date for display
const formatDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const formatFullDate = (dateStr: string) => {
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric' });
};

export default function WorkoutHistory({ category, logs, onDeleteLog }: WorkoutHistoryProps) {
  const [selectedExercise, setSelectedExercise] = useState<string | null>(null);
  const [expandedLog, setExpandedLog] = useState<string | null>(null);

  // Filter logs for this category and sort by date (newest first)
  const categoryLogs = useMemo(() => {
    return logs
      .filter(l => l.category === category)
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [logs, category]);

  // Get unique exercise names from all logs
  const exerciseNames = useMemo(() => {
    const names = new Set<string>();
    categoryLogs.forEach(log => {
      log.exercises.forEach(e => names.add(e.name));
    });
    return Array.from(names);
  }, [categoryLogs]);

  // Prepare chart data for selected exercise
  const chartData = useMemo(() => {
    if (!selectedExercise) return [];

    return categoryLogs
      .map(log => {
        const exercise = log.exercises.find(e => e.name === selectedExercise);
        if (!exercise) return null;

        // Get max weight from all sets
        const maxWeight = Math.max(
          ...exercise.sets
            .filter(s => s.completed && s.weight)
            .map(s => s.weight || 0)
        );

        // Get total volume (sets x reps x weight)
        const totalVolume = exercise.sets
          .filter(s => s.completed)
          .reduce((acc, s) => acc + (s.reps * (s.weight || 1)), 0);

        return {
          date: formatDate(log.date),
          fullDate: log.date,
          maxWeight: maxWeight > 0 ? maxWeight : null,
          volume: totalVolume
        };
      })
      .filter(Boolean)
      .reverse(); // Oldest first for chart
  }, [categoryLogs, selectedExercise]);

  const categoryColor = PPL_CATEGORY_COLORS[category];

  // Calculate total stats
  const totalWorkouts = categoryLogs.length;
  const totalSets = categoryLogs.reduce((acc, log) =>
    acc + log.exercises.reduce((a, e) => a + e.sets.filter(s => s.completed).length, 0), 0
  );

  if (categoryLogs.length === 0) {
    return (
      <div className="card p-8 text-center">
        <Calendar size={48} className="mx-auto text-text-muted mb-4" />
        <h3 className="font-display font-semibold text-text-primary mb-2">No Workouts Yet</h3>
        <p className="text-text-muted text-sm">
          Complete a {category} workout to see your history here.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 text-center">
          <p className="stat-value" style={{ color: categoryColor }}>{totalWorkouts}</p>
          <p className="stat-label">Workouts</p>
        </div>
        <div className="card p-4 text-center">
          <p className="stat-value" style={{ color: categoryColor }}>{totalSets}</p>
          <p className="stat-label">Total Sets</p>
        </div>
      </div>

      {/* Exercise selector for chart */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp size={18} className="text-accent-primary" />
          <h3 className="font-display font-semibold text-text-primary">Progress Chart</h3>
        </div>

        {/* Exercise pills */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-2 mb-4">
          {exerciseNames.map(name => (
            <button
              key={name}
              onClick={() => setSelectedExercise(selectedExercise === name ? null : name)}
              className={`px-3 py-1.5 rounded-full text-sm whitespace-nowrap transition-all ${
                selectedExercise === name
                  ? 'text-white'
                  : 'bg-bg-tertiary text-text-muted hover:bg-bg-secondary'
              }`}
              style={selectedExercise === name ? { backgroundColor: categoryColor } : undefined}
            >
              {name}
            </button>
          ))}
        </div>

        {/* Chart */}
        {selectedExercise && chartData.length > 1 ? (
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <XAxis
                  dataKey="date"
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  stroke="#71717a"
                  fontSize={10}
                  tickLine={false}
                  axisLine={false}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `${value}kg`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line
                  type="monotone"
                  dataKey="maxWeight"
                  stroke={categoryColor}
                  strokeWidth={2}
                  dot={{ fill: categoryColor, strokeWidth: 0, r: 4 }}
                  activeDot={{ r: 6, fill: categoryColor }}
                  connectNulls
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : selectedExercise ? (
          <p className="text-center text-text-muted text-sm py-8">
            Need at least 2 workouts to show progress chart.
          </p>
        ) : (
          <p className="text-center text-text-muted text-sm py-8">
            Select an exercise to see your progress over time.
          </p>
        )}
      </div>

      {/* Workout logs list */}
      <div className="space-y-3">
        <h3 className="font-display font-semibold text-text-primary">Past Workouts</h3>

        {categoryLogs.map(log => {
          const isExpanded = expandedLog === log.id;
          const totalLogSets = log.exercises.reduce((acc, e) => acc + e.sets.filter(s => s.completed).length, 0);

          return (
            <div key={log.id} className="card overflow-hidden">
              {/* Log header */}
              <button
                onClick={() => setExpandedLog(isExpanded ? null : log.id)}
                className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors"
              >
                <div>
                  <p className="font-display font-semibold text-text-primary">
                    {formatFullDate(log.date)}
                  </p>
                  <p className="text-sm text-text-muted">
                    {log.exercises.length} exercises · {totalLogSets} sets
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm('Delete this workout?')) {
                        onDeleteLog(log.id);
                      }
                    }}
                    className="p-2 rounded-lg text-text-muted hover:text-accent-danger hover:bg-accent-danger/10 transition-colors"
                  >
                    <Trash2 size={16} />
                  </button>
                  {isExpanded ? (
                    <ChevronUp size={20} className="text-text-muted" />
                  ) : (
                    <ChevronDown size={20} className="text-text-muted" />
                  )}
                </div>
              </button>

              {/* Expanded content */}
              {isExpanded && (
                <div className="px-4 pb-4 space-y-3 border-t border-white/5 pt-3 animate-slide-up">
                  {log.exercises.map(exercise => {
                    const completedSets = exercise.sets.filter(s => s.completed);
                    if (completedSets.length === 0) return null;

                    return (
                      <div key={exercise.id} className="bg-bg-tertiary rounded-lg p-3">
                        <p className="font-medium text-text-primary mb-2">{exercise.name}</p>
                        <div className="flex flex-wrap gap-2">
                          {completedSets.map(set => (
                            <span
                              key={set.setNumber}
                              className="px-2 py-1 bg-bg-secondary rounded text-xs text-text-muted"
                            >
                              {set.reps} reps{set.weight ? ` @ ${set.weight}kg` : ''}
                            </span>
                          ))}
                        </div>
                      </div>
                    );
                  })}

                  {log.notes && (
                    <div className="bg-bg-tertiary rounded-lg p-3">
                      <p className="text-xs text-text-muted mb-1">Notes</p>
                      <p className="text-sm text-text-primary">{log.notes}</p>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
