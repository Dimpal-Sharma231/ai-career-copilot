import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Flame, 
  Calendar, 
  Clock, 
  Building2, 
  AlertTriangle, 
  ChevronRight, 
  ExternalLink, 
  CheckCircle2, 
  Sparkles,
  MapPin,
  Briefcase,
  Plus
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const DeadlineRadar = ({ onAddToTracker, triggerToast }) => {
  const [drives, setDrives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all'); // 'all' | 'urgent' | 'dream'

  useEffect(() => {
    const fetchDrives = async () => {
      setLoading(true);
      try {
        const res = await apiClient.getPlacementDrives();
        if (res.success && res.drives) {
          setDrives(res.drives);
        }
      } catch (err) {
        console.warn('Failed to load placement drives:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDrives();
  }, []);

  const urgentCount = drives.filter(d => d.daysLeft <= 3 && d.daysLeft >= 0).length;

  const filteredDrives = drives.filter(drive => {
    if (filter === 'urgent') return drive.daysLeft <= 3;
    if (filter === 'dream') return drive.tier === 'Super Dream' || drive.tier === 'Dream';
    return true;
  });

  const handleTrackDrive = (drive) => {
    if (onAddToTracker) {
      onAddToTracker({
        company: drive.company,
        role: drive.role,
        status: 'Applied',
        notes: `Campus Drive: ${drive.tier} • CTC: ${drive.ctc} • Location: ${drive.location || 'Pan-India'}`
      });
      if (triggerToast) {
        triggerToast(`Tracked ${drive.company} drive in Application Pipeline!`, 'success');
      }
    }
  };

  return (
    <div className="space-y-4">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-rose-500/15 border border-rose-500/30 text-rose-400">
              <Clock className="w-4 h-4 animate-spin-slow" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center space-x-2">
              <span>Placement Deadline Radar</span>
              {urgentCount > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-rose-500/20 text-rose-300 border border-rose-500/30 animate-pulse">
                  {urgentCount} URGENT
                </span>
              )}
            </h3>
          </div>
          <p className="text-xs text-slate-400">
            Real-time countdown of campus recruitment registration deadlines and eligibility criteria
          </p>
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center space-x-1.5 p-1 rounded-xl bg-white/[0.03] border border-white/5 text-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'all' 
                ? 'bg-saffron-500 text-white font-semibold shadow-glow-sm' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All Drives ({drives.length})
          </button>
          <button
            onClick={() => setFilter('urgent')}
            className={`px-3 py-1 rounded-lg transition-all flex items-center space-x-1 ${
              filter === 'urgent' 
                ? 'bg-rose-500 text-white font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <span>Closing Soon</span>
            {urgentCount > 0 && (
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
            )}
          </button>
          <button
            onClick={() => setFilter('dream')}
            className={`px-3 py-1 rounded-lg transition-all ${
              filter === 'dream' 
                ? 'bg-brand-500 text-white font-semibold' 
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Dream & Super Dream
          </button>
        </div>
      </div>

      {/* Drives Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 rounded-2xl bg-white/[0.02] border border-white/5 animate-pulse" />
          ))}
        </div>
      ) : filteredDrives.length === 0 ? (
        <div className="p-8 rounded-3xl bg-white/[0.015] border border-dashed border-white/10 text-center space-y-3">
          <div className="w-12 h-12 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Calendar className="w-6 h-6 text-saffron-400" />
          </div>
          <div className="max-w-xs mx-auto space-y-1">
            <h4 className="text-sm font-bold text-white">No drives yet. Check back later!</h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              New campus recruitment drives and SDE opportunities will appear here in real-time.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredDrives.map((drive) => {
            const isUrgent = drive.daysLeft <= 3 && drive.daysLeft >= 0;
            const isExpired = drive.daysLeft < 0;

            return (
              <motion.div
                key={drive.id}
                initial={{ opacity: 0, y: 6 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -3 }}
                className={`p-5 rounded-2xl bg-gradient-to-b from-white/[0.03] to-white/[0.01] transition-all relative overflow-hidden flex flex-col justify-between border ${
                  isUrgent 
                    ? 'border-rose-500/80 shadow-lg shadow-rose-950/40 animate-pulse' 
                    : drive.tier === 'Super Dream'
                    ? 'border-saffron-500/40 hover:border-saffron-500/60'
                    : 'border-white/10 hover:border-white/20'
                }`}
              >
                {/* Urgent top banner */}
                {isUrgent && (
                  <div className="absolute top-0 right-0 left-0 bg-rose-500/20 border-b border-rose-500/40 py-1 px-3 flex items-center justify-between text-[10px] font-bold text-rose-300">
                    <span className="flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-rose-400" />
                      <span>CLOSING IN {drive.daysLeft === 0 ? 'HOURS' : `${drive.daysLeft} DAY(S)`}</span>
                    </span>
                    <span className="uppercase tracking-widest font-mono">URGENT</span>
                  </div>
                )}

                <div className={`space-y-3 ${isUrgent ? 'pt-4' : ''}`}>
                  {/* Company & Tier */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-500/20 to-brand-500/20 border border-white/10 flex items-center justify-center font-bold text-sm text-white">
                        {(drive.company || drive.companyName || 'IN').slice(0, 2).toUpperCase()}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-white tracking-tight">{drive.company || drive.companyName}</h4>
                        <p className="text-xs text-slate-400 flex items-center space-x-1">
                          <MapPin className="w-3 h-3 text-slate-500" />
                          <span>{drive.location || 'Bangalore / Remote'}</span>
                        </p>
                      </div>
                    </div>

                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                      drive.tier === 'Super Dream'
                        ? 'bg-saffron-500/15 text-saffron-300 border-saffron-500/30'
                        : drive.tier === 'Dream'
                        ? 'bg-blue-500/15 text-blue-300 border-blue-500/30'
                        : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/30'
                    }`}>
                      {drive.tier}
                    </span>
                  </div>

                  {/* Role & CTC */}
                  <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Designation</span>
                      <span className="text-slate-200 font-semibold truncate max-w-[150px]">{drive.role}</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">CTC Package</span>
                      <span className="text-saffron-400 font-mono font-black">{drive.ctc}</span>
                    </div>
                  </div>

                  {/* Criteria & Eligible Branches */}
                  <div className="space-y-1 text-[11px] text-slate-400">
                    <div className="flex items-center justify-between">
                      <span>Min CGPA: <strong className="text-slate-300">{drive.minCgpa || 7.0}</strong></span>
                      <span>Batch: <strong className="text-slate-300">{drive.batch || '2026 / 2027'}</strong></span>
                    </div>
                    <p className="truncate text-slate-500">
                      Branches: {drive.eligibleBranches || 'CSE, IT, ECE, AI/DS'}
                    </p>
                  </div>
                </div>

                {/* Footer: Countdown & Action */}
                <div className="pt-4 mt-4 border-t border-white/5 flex items-center justify-between gap-2">
                  <div className="flex items-center space-x-1.5 text-xs">
                    <Clock className={`w-3.5 h-3.5 ${isUrgent ? 'text-rose-400 animate-pulse' : 'text-slate-400'}`} />
                    <span className={`font-mono font-bold ${
                      isUrgent ? 'text-rose-400' : isExpired ? 'text-slate-500' : 'text-slate-300'
                    }`}>
                      {isExpired ? 'Drive Closed' : drive.daysLeft === 0 ? 'Ends Today' : `${drive.daysLeft} days left`}
                    </span>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onClick={() => handleTrackDrive(drive)}
                      className="px-2.5 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all flex items-center space-x-1"
                      title="Add to Placement Application Tracker"
                    >
                      <Plus className="w-3 h-3 text-saffron-400" />
                      <span>Track</span>
                    </button>
                    {(drive.portalUrl || drive.applicationLink) && (
                      <a
                        href={drive.portalUrl || drive.applicationLink}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1.5 rounded-lg bg-saffron-500/20 hover:bg-saffron-500/30 text-saffron-300 border border-saffron-500/30 text-xs font-semibold transition-all flex items-center space-x-1"
                      >
                        <span>Apply</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
};
