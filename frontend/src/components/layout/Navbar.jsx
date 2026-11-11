import React, { useState } from 'react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { 
  Sun, 
  Moon, 
  Sparkles, 
  Bell, 
  LogOut, 
  User, 
  ChevronDown, 
  ShieldCheck, 
  Coins,
  Flame,
  Settings,
  LayoutDashboard,
  MessageSquareCode
} from 'lucide-react';

export const Navbar = ({ currentTab, setCurrentTab, isLanding, setIsLanding, onOpenAuth }) => {
  const { theme, toggleTheme } = useTheme();
  const { user, logout, isAuthenticated } = useAuth();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Generate clean initials avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    return name.slice(0, 2).toUpperCase();
  };

  return (
    <header className="sticky top-0 z-40 w-full glass-nav transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Logo and Brand with Indian Flag Badge & Subtitle */}
        <div 
          className="flex items-center space-x-3 cursor-pointer group" 
          onClick={() => {
            if (isAuthenticated) {
              setCurrentTab('dashboard');
              setIsLanding(false);
            } else {
              setIsLanding(true);
            }
          }}
        >
          <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-500 via-orange-500 to-brand-500 shadow-glow-sm">
            <Sparkles className="w-5 h-5 text-white animate-pulse" />
            <div className="absolute inset-0 rounded-xl bg-white/20 blur-[1px]"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 dark:from-white dark:via-slate-200 dark:to-slate-400 light:from-slate-900 light:to-slate-700 bg-clip-text text-transparent">
                Career Copilot
              </span>
              
              {/* Indian Tricolor Badge */}
              <span 
                title="Built specifically for engineering placements in India 🇮🇳"
                className="inline-flex items-center space-x-1 px-1.5 py-0.5 text-[11px] font-semibold rounded-full bg-saffron-500/10 text-saffron-400 border border-saffron-500/25 shadow-sm hover:scale-105 transition-transform"
              >
                <span>🇮🇳</span>
                <span className="text-[10px] tracking-wide uppercase font-mono font-bold text-white">IN</span>
              </span>
            </div>

            {/* Subtitle / Built for India Tag */}
            <div className="flex items-center space-x-1 text-[11px] text-slate-400">
              <span className="text-saffron-400/90 font-medium">Built for India</span>
              <span className="text-slate-500">•</span>
              <span className="hidden sm:inline text-slate-400">Campus Placements & SDE Drives</span>
            </div>
          </div>
        </div>

        {/* Center Navigation Links (Landing View) or Status Bar */}
        {isLanding ? (
          <nav className="hidden md:flex items-center space-x-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-saffron-400 transition-colors">Features</a>
            <a href="#indian-tech" className="hover:text-saffron-400 transition-colors">Placement Focus</a>
            <a href="#dsa-edge" className="hover:text-saffron-400 transition-colors">DSA & Shortlists</a>
            <a href="#testimonials" className="hover:text-saffron-400 transition-colors">Student Offers</a>
          </nav>
        ) : (
          <div className="hidden md:flex items-center space-x-2 text-xs text-slate-400 bg-slate-900/60 dark:bg-dark-surface/80 px-3 py-1.5 rounded-full border border-white/5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-1"></span>
            <span className="text-slate-300 font-medium">Placement AI Engine:</span>
            <span className="text-emerald-400 font-mono">TF-IDF Active (120ms)</span>
          </div>
        )}

        {/* Right Controls */}
        <div className="flex items-center space-x-3">
          {/* Quick Landing / Dashboard Toggle */}
          <button
            onClick={() => setIsLanding(!isLanding)}
            className="text-xs px-3 py-1.5 rounded-lg border border-slate-700/60 text-slate-300 hover:text-white hover:border-saffron-500/50 transition-all hidden sm:flex items-center space-x-1.5"
          >
            <span>{isLanding ? 'Open Student Dashboard' : 'View Placement Landing'}</span>
          </button>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle Theme"
            className="p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors border border-transparent hover:border-white/10"
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400 transition-transform rotate-0 hover:rotate-45" />
            ) : (
              <Moon className="w-4 h-4 text-brand-400 transition-transform -rotate-12 hover:rotate-0" />
            )}
          </button>

          {/* User authenticated section */}
          {isAuthenticated && user ? (
            <div className="flex items-center space-x-2 relative">
              {/* Prep Coins allowance pill */}
              <div 
                title="Your available AI parsing & matching allowance"
                className="hidden lg:flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/25 text-xs text-saffron-300"
              >
                <Flame className="w-3.5 h-3.5 text-saffron-400" />
                <span className="font-semibold">{user.dsaStreak ? `${user.dsaStreak}d Streak` : '840 Coins'}</span>
              </div>

              {/* Notification bell */}
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl text-slate-400 hover:text-slate-200 hover:bg-white/5 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-saffron-500"></span>
              </button>

              {/* Notification dropdown */}
              {showNotifications && (
                <div className="absolute right-12 top-12 w-72 rounded-2xl p-3 glass-panel shadow-2xl z-50 text-xs animate-fadeIn">
                  <div className="flex items-center justify-between pb-2 border-b border-white/10 mb-2">
                    <span className="font-semibold text-slate-200">Placement Alerts</span>
                    <button 
                      onClick={() => setShowNotifications(false)}
                      className="text-[10px] text-saffron-400 hover:underline"
                    >
                      Close
                    </button>
                  </div>
                  <div className="space-y-2">
                    <div className="p-2 rounded-lg bg-saffron-500/10 border border-saffron-500/20">
                      <p className="font-medium text-slate-200">Profile Completeness: {user.profileStrength || 20}%</p>
                      <p className="text-[11px] text-slate-400">Add your LeetCode link and target companies to boost shortlist rank.</p>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5 border border-white/5">
                      <p className="font-medium text-slate-200">Season 2026-27 Active</p>
                      <p className="text-[11px] text-slate-400">Match your resume against upcoming SDE campus postings.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* User Avatar Menu */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center space-x-2 p-1.5 rounded-xl hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
                >
                  {user.avatar ? (
                    <img
                      src={user.avatar}
                      alt={user.name}
                      className="w-7 h-7 rounded-lg object-cover ring-1 ring-saffron-500/40"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-saffron-500 to-orange-500 text-white font-bold text-xs flex items-center justify-center ring-1 ring-saffron-500/40 font-mono">
                      {getInitials(user.name)}
                    </div>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-60 rounded-2xl p-2 glass-panel shadow-2xl z-50 animate-fadeIn">
                    <div className="px-3 py-2 border-b border-white/10 mb-1">
                      <p className="font-semibold text-sm text-slate-200 truncate">{user.name}</p>
                      <p className="text-xs text-slate-400 truncate">{user.email}</p>
                      <div className="mt-1 flex items-center space-x-1 text-[11px] text-saffron-400">
                        <ShieldCheck className="w-3 h-3" />
                        <span className="truncate">{user.college || 'Engineering Student'} {user.graduationYear ? `'${user.graduationYear.slice(-2)}` : ''}</span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('dashboard');
                        setIsLanding(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <LayoutDashboard className="w-3.5 h-3.5 text-saffron-400" />
                      <span>Placement Dashboard</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('interview');
                        setIsLanding(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <MessageSquareCode className="w-3.5 h-3.5 text-emerald-400" />
                      <span>AI Mock Interview</span>
                    </button>

                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        setCurrentTab('settings');
                        setIsLanding(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-slate-300 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                    >
                      <Settings className="w-3.5 h-3.5 text-blue-400" />
                      <span>Profile Settings</span>
                    </button>

                    <div className="my-1 border-t border-white/5"></div>

                    <button
                      onClick={() => {
                        logout();
                        setShowUserMenu(false);
                      }}
                      className="w-full flex items-center space-x-2 px-3 py-2 text-xs text-rose-400 hover:bg-rose-500/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <button
                onClick={() => onOpenAuth('login')}
                className="text-xs font-semibold px-4 py-2 rounded-xl text-slate-200 hover:text-white hover:bg-white/5 transition-colors"
              >
                Log In
              </button>
              <button
                onClick={() => onOpenAuth('register')}
                className="text-xs font-semibold px-4 py-2 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white shadow-glow-sm hover:shadow-glow transition-all"
              >
                Get Started
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
