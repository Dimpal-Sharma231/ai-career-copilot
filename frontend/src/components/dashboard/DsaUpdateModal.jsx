import React, { useState } from 'react';
import { X, Flame, CheckCircle2, Code2, BookOpen, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const DsaUpdateModal = ({ isOpen, onClose, onUpdated }) => {
  const { user, updateDsa } = useAuth();

  const [dsaStreak, setDsaStreak] = useState(user?.dsaStreak || 0);
  const [dsaSolved, setDsaSolved] = useState(user?.dsaSolved || 0);
  const [striverSolved, setStriverSolved] = useState(user?.striverSolved || 0);
  const [dsaTarget, setDsaTarget] = useState(user?.dsaTarget || 191);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');

    try {
      await updateDsa({
        dsaStreak: Number(dsaStreak),
        dsaSolved: Number(dsaSolved),
        striverSolved: Number(striverSolved),
        dsaTarget: Number(dsaTarget)
      });
      setIsSubmitting(false);
      if (onUpdated) onUpdated();
      onClose();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to update DSA metrics.');
    }
  };

  const progress = Math.min(100, Math.round((striverSolved / (dsaTarget || 191)) * 100));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="w-full max-w-md rounded-3xl glass-panel p-6 sm:p-8 space-y-6 border border-saffron-500/30 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center space-x-2.5">
          <div className="p-2.5 rounded-xl bg-saffron-500/10 text-saffron-400 border border-saffron-500/20">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">Update DSA Prep Stats</h3>
            <p className="text-xs text-slate-400">Keep your competitive coding streak and sheet metrics accurate</p>
          </div>
        </div>

        {error && (
          <div className="p-2.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Active Streak (Days)</label>
              <div className="relative">
                <Flame className="w-4 h-4 text-orange-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  max="2000"
                  value={dsaStreak}
                  onChange={(e) => setDsaStreak(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-saffron-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Total Problems Solved</label>
              <div className="relative">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="number"
                  min="0"
                  max="5000"
                  value={dsaSolved}
                  onChange={(e) => setDsaSolved(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-saffron-500"
                />
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
            <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
              <span className="flex items-center space-x-1.5">
                <BookOpen className="w-4 h-4 text-saffron-400" />
                <span>Striver's SDE Sheet Progress</span>
              </span>
              <span className="font-mono text-emerald-400">{progress}%</span>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Solved from Sheet</label>
                <input
                  type="number"
                  min="0"
                  max={dsaTarget}
                  value={striverSolved}
                  onChange={(e) => setStriverSolved(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-saffron-500"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Total Target</label>
                <input
                  type="number"
                  min="1"
                  max="500"
                  value={dsaTarget}
                  onChange={(e) => setDsaTarget(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono focus:outline-none focus:border-saffron-500"
                />
              </div>
            </div>

            <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-saffron-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>

          <div className="pt-2 flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-white/5 text-slate-300 hover:text-white text-xs font-semibold"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-400 hover:to-orange-400 text-white text-xs font-bold shadow-glow-sm transition-all disabled:opacity-50"
            >
              {isSubmitting ? 'Saving...' : 'Save Metrics'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
