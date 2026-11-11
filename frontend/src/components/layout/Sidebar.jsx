import React from 'react';
import { 
  LayoutDashboard, 
  FileText, 
  Crosshair, 
  Kanban, 
  Sparkles, 
  GraduationCap, 
  Settings,
  ChevronRight,
  MessageSquareCode
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const Sidebar = ({ currentTab, setCurrentTab, activeResume }) => {
  const { user } = useAuth();

  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  const navItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'interview',
      label: 'AI Mock Interview',
      icon: MessageSquareCode,
      badge: 'STAR AI'
    },
    {
      id: 'resume',
      label: 'Resume Analyzer',
      icon: FileText,
      badge: activeResume ? 'Shortlist Ready' : 'New'
    },
    {
      id: 'matcher',
      label: 'Job Fit & Skill Gap',
      icon: Crosshair,
      badge: 'TF-IDF AI'
    },
    {
      id: 'tracker',
      label: 'Placement Tracker',
      icon: Kanban,
      badge: null
    },
    {
      id: 'settings',
      label: 'Profile Settings',
      icon: Settings,
      badge: `${user?.profileStrength || 20}%`
    }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 min-h-[calc(100vh-4rem)] bg-[#080B11]/90 dark:bg-[#080B11]/90 border-r border-white/5 p-4 justify-between transition-all duration-200">
      <div className="space-y-6">
        {/* User Mini Card */}
        {user && (
          <div 
            onClick={() => setCurrentTab('settings')}
            className="p-3 rounded-2xl bg-white/[0.03] hover:bg-white/[0.06] border border-white/5 hover:border-saffron-500/30 flex items-center space-x-3 cursor-pointer transition-all group"
          >
            {user.avatar ? (
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-10 h-10 rounded-xl object-cover ring-2 ring-saffron-500/30"
              />
            ) : (
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-500 to-orange-500 text-white font-bold text-sm flex items-center justify-center ring-2 ring-saffron-500/30 font-mono">
                {getInitials(user.name)}
              </div>
            )}
            <div className="overflow-hidden flex-1">
              <div className="flex items-center space-x-1">
                <p className="text-sm font-semibold text-slate-100 truncate group-hover:text-saffron-300 transition-colors">
                  {user.name}
                </p>
                <span className="text-xs">🇮🇳</span>
              </div>
              <div className="flex items-center space-x-1 text-[11px] text-slate-400">
                <GraduationCap className="w-3 h-3 text-saffron-400 flex-shrink-0" />
                <span className="truncate">
                  {user.college || 'Engineering Student'} {user.graduationYear ? `'${user.graduationYear.slice(-2)}` : ''}
                </span>
              </div>
            </div>
            <ChevronRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-saffron-400 transition-colors" />
          </div>
        )}

        {/* Navigation list */}
        <div className="space-y-1">
          <p className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Placement Modules
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setCurrentTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group relative ${
                  isActive
                    ? 'bg-gradient-to-r from-saffron-500/20 to-orange-500/10 text-white border border-saffron-500/30 shadow-glow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.03]'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    className={`w-4 h-4 transition-colors ${
                      isActive ? 'text-saffron-400' : 'text-slate-400 group-hover:text-slate-200'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && (
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                      isActive
                        ? 'bg-saffron-500/30 text-saffron-200'
                        : 'bg-white/5 text-slate-400 group-hover:bg-white/10'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Season Footer Banner */}
      <div className="p-3.5 rounded-2xl bg-gradient-to-br from-saffron-500/10 to-brand-500/10 border border-saffron-500/20 text-xs space-y-1.5">
        <div className="flex items-center space-x-1.5 text-saffron-400 font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Season 2026-27</span>
        </div>
        <p className="text-[11px] text-slate-400 leading-relaxed">
          Calibrate resume vectors before Day-1 on-campus and off-campus drives.
        </p>
      </div>
    </aside>
  );
};
