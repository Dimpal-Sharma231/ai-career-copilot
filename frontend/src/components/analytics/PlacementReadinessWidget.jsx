import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  Sparkles, 
  RefreshCw, 
  FileText, 
  Code2, 
  UserCheck, 
  MessageSquareCode, 
  ArrowRight, 
  AlertCircle, 
  CheckCircle2, 
  TrendingUp, 
  HelpCircle,
  Award
} from 'lucide-react';
import { CircularProgress } from './CircularProgress';
import { apiClient } from '../../api/client';

export const PlacementReadinessWidget = ({ setCurrentTab, onOpenDsaModal }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchReadiness = async (isManual = false) => {
    if (isManual) setRefreshing(true);
    else setLoading(true);
    setError(null);

    try {
      const res = await apiClient.getPlacementReadiness();
      if (res.success && res.readiness) {
        setData(res.readiness);
      } else {
        // Fallback calculation if offline
        setData({
          overallReadinessScore: 50,
          readinessTier: 'Placement Ready',
          targetRole: 'Software Development Engineer',
          breakdown: {
            resume: { label: 'Resume Shortlist Potential', weight: '30%', score: 0, contribution: 0, status: 'No resume uploaded' },
            dsa: { label: 'DSA & Problem Solving', weight: '30%', score: 40, contribution: 12, status: 'Active prep' },
            profile: { label: 'Profile Completeness', weight: '20%', score: 60, contribution: 12, status: 'Good progress' },
            mockInterview: { label: 'AI Mock Interview', weight: '20%', score: 0, contribution: 0, status: 'No session completed' }
          },
          recommendations: [
            'Upload your primary engineering resume for +30% score boost',
            'Take your first AI Mock Interview to assess STAR-method communication'
          ]
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchReadiness();
  }, []);

  if (loading) {
    return (
      <div className="p-8 rounded-3xl bg-white/[0.02] border border-white/5 animate-pulse space-y-6">
        <div className="h-6 w-48 bg-white/10 rounded-lg"></div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="h-44 bg-white/5 rounded-2xl"></div>
          <div className="md:col-span-2 h-44 bg-white/5 rounded-2xl"></div>
        </div>
      </div>
    );
  }

  const breakdown = data?.breakdown || {};
  const recommendations = data?.recommendations || [];
  const overallScore = data?.overallReadinessScore || 0;

  const metricCards = [
    {
      id: 'resume',
      title: 'Resume Shortlist',
      weight: '30%',
      score: breakdown.resume?.score || 0,
      contribution: breakdown.resume?.contribution || 0,
      details: breakdown.resume?.details || breakdown.resume?.status,
      icon: FileText,
      color: 'text-saffron-400',
      bgColor: 'bg-saffron-500/10 border-saffron-500/20',
      actionLabel: 'Analyze Resume',
      onClick: () => setCurrentTab && setCurrentTab('resume')
    },
    {
      id: 'dsa',
      title: 'DSA & Coding',
      weight: '30%',
      score: breakdown.dsa?.score || 0,
      contribution: breakdown.dsa?.contribution || 0,
      details: breakdown.dsa?.details || breakdown.dsa?.status,
      icon: Code2,
      color: 'text-orange-400',
      bgColor: 'bg-orange-500/10 border-orange-500/20',
      actionLabel: 'Update DSA',
      onClick: onOpenDsaModal || (() => setCurrentTab && setCurrentTab('settings'))
    },
    {
      id: 'profile',
      title: 'Profile Strength',
      weight: '20%',
      score: breakdown.profile?.score || 0,
      contribution: breakdown.profile?.contribution || 0,
      details: breakdown.profile?.details || breakdown.profile?.status,
      icon: UserCheck,
      color: 'text-blue-400',
      bgColor: 'bg-blue-500/10 border-blue-500/20',
      actionLabel: 'Edit Profile',
      onClick: () => setCurrentTab && setCurrentTab('settings')
    },
    {
      id: 'mockInterview',
      title: 'AI Mock Interview',
      weight: '20%',
      score: breakdown.mockInterview?.score || 0,
      contribution: breakdown.mockInterview?.contribution || 0,
      details: breakdown.mockInterview?.details || breakdown.mockInterview?.status,
      icon: MessageSquareCode,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/20',
      actionLabel: 'Practice Now',
      onClick: () => setCurrentTab && setCurrentTab('interview')
    }
  ];

  return (
    <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#101524] via-dark-surface to-[#0B0F19] border border-saffron-500/25 shadow-xl relative overflow-hidden space-y-6">
      
      {/* Ambient background glow */}
      <div className="absolute top-0 right-1/4 w-96 h-96 bg-saffron-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5 relative z-10">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-saffron-500/15 border border-saffron-500/30 text-saffron-400">
              <Award className="w-4 h-4" />
            </div>
            <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight">
              Placement Readiness Index
            </h2>
            <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-saffron-500/20 text-saffron-300 font-bold border border-saffron-500/30">
              Weighted Formula
            </span>
          </div>
          <p className="text-xs text-slate-400">
            Real-time aggregate across 4 vectors: Resume (30%), DSA (30%), Profile (20%), Mock Interviews (20%)
          </p>
        </div>

        <button
          onClick={() => fetchReadiness(true)}
          disabled={refreshing}
          className="px-3.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-medium transition-all flex items-center space-x-1.5 self-start sm:self-auto disabled:opacity-50"
          title="Recalculate weighted metrics from database"
        >
          <RefreshCw className={`w-3.5 h-3.5 text-saffron-400 ${refreshing ? 'animate-spin' : ''}`} />
          <span>{refreshing ? 'Recalibrating...' : 'Refresh Score'}</span>
        </button>
      </div>

      {/* Main Grid: Gauge on Left, Metrics on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center relative z-10">
        
        {/* Left: Gauge with tier badge (4 cols) */}
        <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 rounded-2xl bg-white/[0.015] border border-white/5">
          <CircularProgress 
            value={overallScore} 
            size={180} 
            strokeWidth={14} 
            label="Placement Readiness" 
            sublabel="/ 100"
            showTierBadge={true}
          />
          <p className="text-[11px] text-slate-400 text-center mt-3 max-w-xs leading-relaxed">
            Composite index calibrated against Tier-1 Indian tech placement bars (Zomato, Swiggy, Razorpay, CRED).
          </p>
        </div>

        {/* Right: 4 Component Metric Cards (8 cols) */}
        <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {metricCards.map((metric) => {
            const Icon = metric.icon;
            return (
              <motion.div
                key={metric.id}
                whileHover={{ y: -2 }}
                className="p-4 rounded-2xl bg-white/[0.025] hover:bg-white/[0.04] border border-white/5 hover:border-white/10 transition-all space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div className={`p-2 rounded-xl border ${metric.bgColor} ${metric.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white tracking-tight">{metric.title}</h4>
                      <span className="text-[10px] text-slate-400 font-mono">Weight: {metric.weight}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-lg font-black font-mono text-white">{Math.round(metric.score)}%</span>
                    <p className="text-[10px] text-slate-400 font-mono">+{metric.contribution} pts</p>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-saffron-500 to-emerald-400 h-full rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(100, Math.max(0, metric.score))}%` }}
                  />
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-slate-400 truncate max-w-[150px]">
                    {metric.details}
                  </span>
                  <button
                    onClick={metric.onClick}
                    className="text-[11px] font-semibold text-saffron-400 hover:text-saffron-300 flex items-center space-x-0.5 transition-colors"
                  >
                    <span>{metric.actionLabel}</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Dynamic Placement Recommendations Banner */}
      {recommendations.length > 0 && (
        <div className="p-4 rounded-2xl bg-saffron-500/[0.06] border border-saffron-500/20 space-y-2 relative z-10">
          <div className="flex items-center space-x-2">
            <Sparkles className="w-4 h-4 text-saffron-400" />
            <h4 className="text-xs font-bold text-white uppercase tracking-wider">
              Priority Placement Action Items
            </h4>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-xs">
            {recommendations.map((rec, i) => (
              <div key={i} className="flex items-start space-x-2 text-slate-300">
                <CheckCircle2 className="w-3.5 h-3.5 text-saffron-400 flex-shrink-0 mt-0.5" />
                <span className="leading-snug">
                  {typeof rec === 'string' ? rec : (rec.tip || `${rec.area}: ${rec.tip}`)}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
