import { useState } from 'react';
import Navbar, { type Screen } from '@/components/Navbar';
import CustomerTokenScreen from '@/screens/CustomerTokenScreen';
import LiveDisplayBoard from '@/screens/LiveDisplayBoard';
import OperatorDashboard from '@/screens/OperatorDashboard';

function App() {
  const [screen, setScreen] = useState<Screen>('token');

  return (
    <div className="min-h-screen bg-slate-50 relative overflow-hidden">
      {/* Decorative background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-teal-200/40 blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-96 h-96 rounded-full bg-blue-200/40 blur-3xl" />
        <div className="absolute top-1/3 left-1/2 w-64 h-64 rounded-full bg-cyan-100/30 blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col min-h-screen">
        <Navbar current={screen} onNavigate={setScreen} />

        <main className="flex-1 flex items-start sm:items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
          {screen === 'token' ? (
            <CustomerTokenScreen />
          ) : screen === 'display' ? (
            <LiveDisplayBoard />
          ) : (
            <OperatorDashboard />
          )}
        </main>

        {/* Footer */}
        <footer className="border-t border-slate-200/70 bg-white/60 backdrop-blur-sm">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 text-center">
            <p className="text-xs text-slate-400">
              Smart Queue Management System · Designed for a smoother wait
            </p>
          </div>
        </footer>
      </div>
    </div>
  );
}

export default App;
