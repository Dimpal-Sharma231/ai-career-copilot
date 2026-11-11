import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  Lock, 
  Mail, 
  User, 
  ArrowRight, 
  ShieldCheck,
  Eye,
  EyeOff
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const AuthModal = ({ isOpen, onClose, initialMode = 'login', onAuthSuccess }) => {
  const [mode, setMode] = useState(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const { login, register, demoLogin } = useAuth();

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      if (mode === 'login') {
        await login(email, password);
      } else {
        await register(name, email, password);
      }
      setIsLoading(false);
      onAuthSuccess();
      onClose();
    } catch (err) {
      setIsLoading(false);
      setError('Authentication failed. Please verify credentials.');
    }
  };

  const handleDemoSignIn = () => {
    demoLogin();
    onAuthSuccess();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 space-y-6 border border-white/15 shadow-2xl relative">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-gradient-to-tr from-saffron-500 via-orange-500 to-brand-500 flex items-center justify-center text-white shadow-glow-sm">
            <Sparkles className="w-6 h-6 animate-pulse" />
          </div>
          <div className="flex items-center justify-center space-x-1.5">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {mode === 'login' ? 'Sign In to Placement Portal' : 'Create Free Student Account'}
            </h2>
            <span className="text-sm">🇮🇳</span>
          </div>
          <p className="text-xs text-slate-400">
            {mode === 'login'
              ? 'Access your resumes, shortlist scores, and placement drives.'
              : 'Join Indian engineering students cracking Day 1 SDE placements with AI.'}
          </p>
        </div>

        {/* 1-Click Demo Login Pill */}
        <div className="p-3 rounded-2xl bg-saffron-500/10 border border-saffron-500/25 text-center space-y-1">
          <p className="text-[11px] text-saffron-300 font-semibold">Campus Placement Quick Preview</p>
          <button
            onClick={handleDemoSignIn}
            className="w-full py-2 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-400 hover:to-orange-400 text-white text-xs font-semibold shadow-glow-sm transition-all flex items-center justify-center space-x-1.5"
          >
            <span>Instant Demo Login (Rahul Sharma • VIT Vellore)</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="relative flex items-center justify-center">
          <div className="border-t border-white/10 w-full"></div>
          <span className="bg-dark-surface px-3 text-[11px] text-slate-500 uppercase tracking-wider absolute">
            or continue with college email
          </span>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold">
          <button
            onClick={() => setMode('login')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'login' ? 'bg-saffron-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            onClick={() => setMode('register')}
            className={`py-2 rounded-lg transition-all ${
              mode === 'register' ? 'bg-saffron-500 text-white shadow-glow-sm' : 'text-slate-400 hover:text-white'
            }`}
          >
            Register
          </button>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs text-center">
            {error}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Rahul Sharma"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">College or Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                placeholder="name@vitstudent.ac.in or gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500 font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-xs shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isLoading ? (
              <span className="animate-pulse">Authenticating with Placement Portal...</span>
            ) : (
              <>
                <span>{mode === 'login' ? 'Sign In to Dashboard' : 'Create Free Student Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </>
            )}
          </button>
        </form>

        <div className="text-center text-[11px] text-slate-500 flex items-center justify-center space-x-1">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>256-Bit Bcrypt Encryption & Secure JWT Placement Sessions</span>
        </div>
      </div>
    </div>
  );
};
