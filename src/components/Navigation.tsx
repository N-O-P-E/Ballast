import { TabName } from '../types';
import {
  LayoutDashboard,
  Scale,
  Ruler,
  Dumbbell,
  Trophy,
  ClipboardList
} from 'lucide-react';

interface NavigationProps {
  activeTab: TabName;
  onTabChange: (tab: TabName) => void;
}

const tabs: { id: TabName; label: string; icon: typeof LayoutDashboard }[] = [
  { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
  { id: 'weight', label: 'Weight', icon: Scale },
  { id: 'measurements', label: 'Measure', icon: Ruler },
  { id: 'workouts', label: 'Workout', icon: ClipboardList },
  { id: 'strength', label: 'PRs', icon: Dumbbell },
  { id: 'skills', label: 'Skills', icon: Trophy },
];

export default function Navigation({ activeTab, onTabChange }: NavigationProps) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-bg-secondary/95 backdrop-blur-lg border-t border-white/5">
      <div className="max-w-lg mx-auto px-2 py-2">
        <div className="flex justify-around items-center">
          {tabs.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              className={activeTab === id ? 'nav-item-active' : 'nav-item-inactive'}
            >
              <Icon size={20} strokeWidth={activeTab === id ? 2.5 : 2} />
              <span className="text-[10px] font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </nav>
  );
}
