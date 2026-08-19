import { Ticket, Monitor, Headphones } from 'lucide-react';

export type Screen = 'token' | 'display' | 'operator';

type NavbarProps = {
  current: Screen;
  onNavigate: (screen: Screen) => void;
};

const NAV_ITEMS: { id: Screen; label: string; icon: typeof Ticket }[] = [
  { id: 'token', label: 'Customer Token', icon: Ticket },
  { id: 'display', label: 'Live Display', icon: Monitor },
  { id: 'operator', label: 'Operator', icon: Headphones },
];

export default function Navbar({ current, onNavigate }: NavbarProps) {
  return (
    <header className="border-b border-slate-200/70 bg-white/80 backdrop-blur-md sticky top-0 z-30">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between gap-4">
        {/* Brand */}
        <button
          onClick={() => onNavigate('token')}
          className="flex items-center gap-3 group flex-shrink-0"
        >
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-blue-600 flex items-center justify-center shadow-lg shadow-teal-500/30 group-hover:shadow-teal-500/50 transition-shadow">
            <Ticket className="w-5 h-5 text-white" strokeWidth={2.2} />
          </div>
          <div className="text-left">
            <h1 className="text-sm sm:text-base font-bold text-slate-800 leading-tight tracking-tight">
              Smart Queue Management
            </h1>
            <p className="text-xs text-slate-500 hidden sm:block">
              System
            </p>
          </div>
        </button>

        {/* Nav toggle */}
        <nav className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const active = current === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  active
                    ? 'bg-white text-teal-700 shadow-sm'
                    : 'text-slate-500 hover:text-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
