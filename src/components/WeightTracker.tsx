import { useState } from 'react';
import { WeightEntry, StreakData, UserProfile } from '../types';
import { generateId, formatDateISO, formatDate } from '../hooks/useLocalStorage';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';

interface WeightTrackerProps {
  weights: WeightEntry[];
  profile: UserProfile;
  streak: StreakData;
  onUpdateWeights: (weights: WeightEntry[]) => void;
  onUpdateStreak: (streak: StreakData) => void;
}

export default function WeightTracker({ 
  weights, 
  profile, 
  streak,
  onUpdateWeights, 
  onUpdateStreak 
}: WeightTrackerProps) {
  const [newWeight, setNewWeight] = useState('');
  const [newDate, setNewDate] = useState(formatDateISO());
  const [showForm, setShowForm] = useState(false);

  const sortedWeights = [...weights].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const chartData = sortedWeights.slice(-30).map(w => ({
    date: formatDate(w.date),
    weight: w.weight,
    fullDate: w.date
  }));

  const latestWeight = sortedWeights[sortedWeights.length - 1]?.weight || profile.startingWeight;
  const totalChange = latestWeight - profile.startingWeight;
  const goalRemaining = profile.goalWeight ? latestWeight - profile.goalWeight : null;

  const handleAddWeight = () => {
    if (!newWeight) return;

    const weight = parseFloat(newWeight);
    if (isNaN(weight)) return;

    // Check if entry exists for this date
    const existingIndex = weights.findIndex(w => w.date === newDate);
    
    let updatedWeights: WeightEntry[];
    if (existingIndex >= 0) {
      // Update existing entry
      updatedWeights = weights.map((w, i) => 
        i === existingIndex ? { ...w, weight } : w
      );
    } else {
      // Add new entry
      const entry: WeightEntry = {
        id: generateId(),
        date: newDate,
        weight
      };
      updatedWeights = [...weights, entry];
    }

    onUpdateWeights(updatedWeights);
    updateStreak(newDate);
    setNewWeight('');
    setShowForm(false);
  };

  const updateStreak = (logDate: string) => {
    // Get existing logged dates or initialize empty array
    const loggedDates = new Set(streak.loggedDates || []);

    // Don't update if already logged on this date
    if (loggedDates.has(logDate)) {
      return;
    }

    // Add the new date
    loggedDates.add(logDate);
    const datesArray = Array.from(loggedDates);

    // Recalculate streak from all logged dates
    const sortedDates = [...datesArray].sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
    const today = formatDateISO();
    const yesterday = formatDateISO(new Date(Date.now() - 86400000));

    let currentStreak = 0;
    let longestStreak = 0;
    let tempStreak = 1;

    // Check if most recent date is today or yesterday for current streak
    const mostRecentDate = sortedDates[0];
    if (mostRecentDate === today || mostRecentDate === yesterday) {
      currentStreak = 1;
      for (let i = 1; i < sortedDates.length; i++) {
        const prevDate = new Date(sortedDates[i - 1]);
        const currDate = new Date(sortedDates[i]);
        const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
        if (diffDays === 1) {
          currentStreak++;
        } else {
          break;
        }
      }
    }

    // Calculate longest streak
    for (let i = 1; i < sortedDates.length; i++) {
      const prevDate = new Date(sortedDates[i - 1]);
      const currDate = new Date(sortedDates[i]);
      const diffDays = Math.round((prevDate.getTime() - currDate.getTime()) / 86400000);
      if (diffDays === 1) {
        tempStreak++;
      } else {
        longestStreak = Math.max(longestStreak, tempStreak);
        tempStreak = 1;
      }
    }
    longestStreak = Math.max(longestStreak, tempStreak, currentStreak);

    onUpdateStreak({
      currentStreak,
      longestStreak,
      lastLogDate: mostRecentDate,
      totalDaysLogged: datesArray.length,
      loggedDates: datesArray
    });
  };

  const handleDelete = (id: string) => {
    onUpdateWeights(weights.filter(w => w.id !== id));
  };

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-secondary border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-text-muted text-xs">{payload[0].payload.date}</p>
          <p className="font-display text-xl font-bold">{payload[0].value} kg</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Stats Header */}
      <div className="grid grid-cols-3 gap-3">
        <div className="card text-center">
          <p className="text-text-muted text-xs mb-1">Current</p>
          <p className="font-display text-2xl font-bold">{latestWeight}</p>
          <p className="text-text-muted text-xs">kg</p>
        </div>
        <div className="card text-center">
          <p className="text-text-muted text-xs mb-1">Change</p>
          <p className={`font-display text-2xl font-bold ${
            totalChange < 0 ? 'text-accent-success' : totalChange > 0 ? 'text-accent-warning' : ''
          }`}>
            {totalChange > 0 ? '+' : ''}{totalChange.toFixed(1)}
          </p>
          <p className="text-text-muted text-xs">kg</p>
        </div>
        <div className="card text-center">
          <p className="text-text-muted text-xs mb-1">To Goal</p>
          <p className={`font-display text-2xl font-bold ${
            goalRemaining && goalRemaining <= 0 ? 'text-accent-success' : ''
          }`}>
            {goalRemaining ? goalRemaining.toFixed(1) : '-'}
          </p>
          <p className="text-text-muted text-xs">kg</p>
        </div>
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card">
          <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Weight Trend
          </h3>
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
                  domain={['dataMin - 1', 'dataMax + 1']}
                  tickFormatter={(v) => `${v}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="#5b6cf7" 
                  strokeWidth={2}
                  dot={{ fill: '#5b6cf7', strokeWidth: 0, r: 3 }}
                  activeDot={{ r: 6, fill: '#5b6cf7' }}
                />
                {profile.goalWeight && (
                  <Line 
                    type="monotone" 
                    dataKey={() => profile.goalWeight} 
                    stroke="#10b981" 
                    strokeWidth={1}
                    strokeDasharray="5 5"
                    dot={false}
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add Weight Form */}
      {showForm ? (
        <div className="card space-y-4 animate-scale-in">
          <h3 className="font-display font-semibold">Log Weight</h3>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-text-muted text-xs mb-1 block">Date</label>
              <input
                type="date"
                value={newDate}
                onChange={(e) => setNewDate(e.target.value)}
                className="w-full"
              />
            </div>
            <div>
              <label className="text-text-muted text-xs mb-1 block">Weight (kg)</label>
              <input
                type="number"
                step="0.1"
                value={newWeight}
                onChange={(e) => setNewWeight(e.target.value)}
                placeholder="83.0"
                className="w-full"
                autoFocus
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button onClick={handleAddWeight} className="btn-primary flex-1">
              Save
            </button>
            <button onClick={() => setShowForm(false)} className="btn-secondary flex-1">
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button 
          onClick={() => setShowForm(true)}
          className="btn-primary w-full flex items-center justify-center gap-2"
        >
          <Plus size={20} />
          Log Weight
        </button>
      )}

      {/* History */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider">
          History
        </h3>
        
        {sortedWeights.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-text-muted">No weight entries yet</p>
            <p className="text-text-muted text-sm mt-1">Start tracking to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...sortedWeights].reverse().slice(0, 10).map((entry, index) => {
              const prevEntry = sortedWeights[sortedWeights.length - 2 - index];
              const change = prevEntry ? entry.weight - prevEntry.weight : 0;
              
              return (
                <div 
                  key={entry.id}
                  className="card-hover flex items-center justify-between py-3"
                >
                  <div>
                    <p className="text-text-muted text-xs">{formatDate(entry.date)}</p>
                    <p className="font-display text-xl font-bold">{entry.weight} kg</p>
                  </div>
                  <div className="flex items-center gap-3">
                    {change !== 0 && (
                      <span className={`text-sm font-medium ${
                        change < 0 ? 'text-accent-success' : 'text-accent-warning'
                      }`}>
                        {change > 0 ? '+' : ''}{change.toFixed(1)}
                      </span>
                    )}
                    <button 
                      onClick={() => handleDelete(entry.id)}
                      className="p-2 text-text-muted hover:text-accent-danger transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
