import React from 'react';
import { LayoutDashboard, FileText, Crosshair, Kanban, Settings, MessageSquareCode } from 'lucide-react';

export const MobileNav = ({ currentTab, setCurrentTab }) => {
  const navItems = [
    { id: 'dashboard', label: 'Home', icon: LayoutDashboard },
    { id: 'interview', label: 'Mock AI', icon: MessageSquareCode },
    { id: 'resume', label: 'Resume', icon: FileText },
    { id: 'matcher', label: 'Job Fit', icon: Crosshair },
    { id: 'tracker', label: 'Tracker', icon: Kanban },
    { id: 'settings', label: 'Profile', icon: Settings },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 left-4 right-4 z-50">
      <div className="glass-panel backdrop-blur-xl bg-slate-900/90 rounded-2xl p-1.5 flex items-center justify-around shadow-2xl border border-white/10">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-3 rounded-xl transition-all ${
                isActive
                  ? 'text-saffron-400 bg-saffron-500/15 font-medium'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
