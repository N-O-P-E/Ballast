import { useState } from 'react';
import { MeasurementEntry } from '../types';
import { generateId, formatDateISO, formatDate } from '../hooks/useLocalStorage';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Plus, Trash2 } from 'lucide-react';

interface MeasurementsTrackerProps {
  measurements: MeasurementEntry[];
  onUpdateMeasurements: (measurements: MeasurementEntry[]) => void;
}

const MEASUREMENT_FIELDS = [
  { key: 'waist', label: 'Waist', color: '#5b6cf7' },
  { key: 'chest', label: 'Chest', color: '#0070f3' },
  { key: 'arms', label: 'Arms', color: '#00a67e' },
  { key: 'legs', label: 'Legs', color: '#f5a623' },
  { key: 'shoulders', label: 'Shoulders', color: '#7c3aed' },
] as const;

type MeasurementKey = typeof MEASUREMENT_FIELDS[number]['key'];

export default function MeasurementsTracker({ 
  measurements, 
  onUpdateMeasurements 
}: MeasurementsTrackerProps) {
  const [showForm, setShowForm] = useState(false);
  const [newDate, setNewDate] = useState(formatDateISO());
  const [newMeasurements, setNewMeasurements] = useState<Record<MeasurementKey, string>>({
    waist: '',
    chest: '',
    arms: '',
    legs: '',
    shoulders: ''
  });

  const sortedMeasurements = [...measurements].sort(
    (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
  );

  const latestMeasurement = sortedMeasurements[sortedMeasurements.length - 1];
  const previousMeasurement = sortedMeasurements[sortedMeasurements.length - 2];

  const chartData = sortedMeasurements.slice(-20).map(m => ({
    ...m,
    date: formatDate(m.date),
  }));

  const handleAdd = () => {
    const entry: MeasurementEntry = {
      id: generateId(),
      date: newDate,
      ...(newMeasurements.waist && { waist: parseFloat(newMeasurements.waist) }),
      ...(newMeasurements.chest && { chest: parseFloat(newMeasurements.chest) }),
      ...(newMeasurements.arms && { arms: parseFloat(newMeasurements.arms) }),
      ...(newMeasurements.legs && { legs: parseFloat(newMeasurements.legs) }),
      ...(newMeasurements.shoulders && { shoulders: parseFloat(newMeasurements.shoulders) }),
    };

    // Check if we have at least one measurement
    if (!entry.waist && !entry.chest && !entry.arms && !entry.legs && !entry.shoulders) {
      return;
    }

    onUpdateMeasurements([...measurements, entry]);
    setNewMeasurements({ waist: '', chest: '', arms: '', legs: '', shoulders: '' });
    setShowForm(false);
  };

  const handleDelete = (id: string) => {
    onUpdateMeasurements(measurements.filter(m => m.id !== id));
  };

  const getChange = (key: MeasurementKey): number | null => {
    if (!latestMeasurement || !previousMeasurement) return null;
    const latest = latestMeasurement[key];
    const previous = previousMeasurement[key];
    if (latest === undefined || previous === undefined) return null;
    return latest - previous;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-bg-secondary border border-white/10 rounded-lg p-3 shadow-xl">
          <p className="text-text-muted text-xs mb-2">{label}</p>
          {payload.map((p: any) => (
            <p key={p.dataKey} className="text-sm" style={{ color: p.color }}>
              {p.name}: {p.value} cm
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Current Stats */}
      <div className="grid grid-cols-2 gap-3">
        {MEASUREMENT_FIELDS.map(({ key, label, color }) => {
          const value = latestMeasurement?.[key];
          const change = getChange(key);
          
          return (
            <div key={key} className="card">
              <div className="flex items-center gap-2 mb-1">
                <div 
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <p className="text-text-muted text-xs">{label}</p>
              </div>
              <p className="font-display text-2xl font-bold">
                {value !== undefined ? value : '-'}
                {value !== undefined && <span className="text-text-muted text-sm ml-1">cm</span>}
              </p>
              {change !== null && change !== 0 && (
                <p className={`text-xs font-medium ${
                  // For waist, decrease is good. For others, increase might be good.
                  key === 'waist' 
                    ? (change < 0 ? 'text-accent-success' : 'text-accent-warning')
                    : (change > 0 ? 'text-accent-success' : 'text-accent-warning')
                }`}>
                  {change > 0 ? '+' : ''}{change.toFixed(1)} cm
                </p>
              )}
            </div>
          );
        })}
      </div>

      {/* Chart */}
      {chartData.length > 1 && (
        <div className="card">
          <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider mb-4">
            Measurement Trends
          </h3>
          <div className="h-56">
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
                  domain={['dataMin - 2', 'dataMax + 2']}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  wrapperStyle={{ fontSize: '10px', paddingTop: '10px' }}
                />
                {MEASUREMENT_FIELDS.map(({ key, label, color }) => (
                  <Line 
                    key={key}
                    type="monotone" 
                    dataKey={key}
                    name={label}
                    stroke={color}
                    strokeWidth={2}
                    dot={{ fill: color, strokeWidth: 0, r: 2 }}
                    connectNulls
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}

      {/* Add Form */}
      {showForm ? (
        <div className="card space-y-4 animate-scale-in">
          <h3 className="font-display font-semibold">Log Measurements</h3>
          
          <div>
            <label className="text-text-muted text-xs mb-1 block">Date</label>
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            {MEASUREMENT_FIELDS.map(({ key, label }) => (
              <div key={key}>
                <label className="text-text-muted text-xs mb-1 block">{label} (cm)</label>
                <input
                  type="number"
                  step="0.1"
                  value={newMeasurements[key]}
                  onChange={(e) => setNewMeasurements(prev => ({ ...prev, [key]: e.target.value }))}
                  placeholder="0.0"
                  className="w-full"
                />
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={handleAdd} className="btn-primary flex-1">
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
          Log Measurements
        </button>
      )}

      {/* History */}
      <div className="space-y-3">
        <h3 className="font-display text-sm font-semibold text-text-secondary uppercase tracking-wider">
          History
        </h3>
        
        {sortedMeasurements.length === 0 ? (
          <div className="card text-center py-8">
            <p className="text-text-muted">No measurements yet</p>
            <p className="text-text-muted text-sm mt-1">Start tracking to see your progress!</p>
          </div>
        ) : (
          <div className="space-y-2">
            {[...sortedMeasurements].reverse().slice(0, 10).map((entry) => (
              <div 
                key={entry.id}
                className="card-hover py-3"
              >
                <div className="flex items-center justify-between mb-2">
                  <p className="text-text-muted text-xs">{formatDate(entry.date)}</p>
                  <button 
                    onClick={() => handleDelete(entry.id)}
                    className="p-1 text-text-muted hover:text-accent-danger transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
                <div className="flex flex-wrap gap-3">
                  {MEASUREMENT_FIELDS.map(({ key, label, color }) => {
                    const value = entry[key];
                    if (value === undefined) return null;
                    return (
                      <div key={key} className="flex items-center gap-1.5">
                        <div 
                          className="w-1.5 h-1.5 rounded-full"
                          style={{ backgroundColor: color }}
                        />
                        <span className="text-sm">
                          <span className="text-text-muted">{label}:</span>{' '}
                          <span className="font-semibold">{value}</span>
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
