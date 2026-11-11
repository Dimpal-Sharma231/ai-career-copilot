import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  FileText, 
  Crosshair, 
  Kanban, 
  TrendingUp, 
  UploadCloud, 
  Sparkles, 
  ArrowUpRight, 
  Calendar, 
  CheckCircle2, 
  Building2, 
  ChevronRight, 
  Target, 
  Flame, 
  Code2, 
  Award, 
  Plus,
  BookOpen, 
  Briefcase,
  Settings,
  ArrowRight,
  Download,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { apiClient } from '../../api/client';
import { DsaUpdateModal } from './DsaUpdateModal';
import { DashboardSkeleton } from '../common/SkeletonLoader';
import { PlacementReadinessWidget } from '../analytics/PlacementReadinessWidget';
import { DeadlineRadar } from '../drives/DeadlineRadar';

export const Dashboard = ({ setCurrentTab, activeResume, resumes = [], applications = [], isLoading = false, onRefresh, onAddToTracker, triggerToast }) => {
  const { user } = useAuth();
  const [isDsaModalOpen, setIsDsaModalOpen] = useState(false);
  const [isExportingPdf, setIsExportingPdf] = useState(false);

  const handleExportPdf = async () => {
    setIsExportingPdf(true);
    try {
      const res = await apiClient.downloadAtsResume(user?.name || 'Student');
      if (res.success) {
        if (triggerToast) triggerToast('ATS-compliant PDF resume downloaded successfully!', 'success');
      } else {
        if (triggerToast) triggerToast(res.error || 'Failed to download ATS resume', 'error');
      }
    } catch (err) {
      if (triggerToast) triggerToast('PDF download failed: ' + err.message, 'error');
    } finally {
      setIsExportingPdf(false);
    }
  };

  if (isLoading) {
    return <DashboardSkeleton />;
  }

  // Calculate real dynamic stats
  const totalResumes = resumes.length || (activeResume ? 1 : 0);
  const totalApps = applications.length;
  const avgJobFit = totalApps > 0 
    ? Math.round(applications.reduce((acc, a) => acc + (Number(a.matchScore) || 0), 0) / totalApps)
    : 0;
  const interviewingOrOffered = applications.filter(a => a.status === 'Interviewing' || a.status === 'Offered').length;

  const statCards = [
    {
      label: 'Resumes Analyzed',
      value: totalResumes.toString(),
      trend: totalResumes > 0 ? `${totalResumes} version(s) in database` : 'No resumes uploaded yet',
      icon: FileText,
      accent: 'from-saffron-500/20 to-orange-500/10',
      iconColor: 'text-saffron-400'
    },
    {
      label: 'Active Applications',
      value: totalApps.toString(),
      trend: totalApps > 0 ? `${interviewingOrOffered} in tech rounds/offers` : 'Pipeline ready for entries',
      icon: Kanban,
      accent: 'from-blue-500/20 to-indigo-500/10',
      iconColor: 'text-blue-400'
    },
    {
      label: 'Average Job Fit %',
      value: totalApps > 0 ? `${avgJobFit}%` : 'N/A',
      trend: totalApps > 0 ? 'Computed across your tracked JDs' : 'Run Job Matcher to calculate',
      icon: Crosshair,
      accent: 'from-emerald-500/20 to-teal-500/10',
      iconColor: 'text-emerald-400'
    },
    {
      label: 'Shortlists & Offers',
      value: interviewingOrOffered.toString(),
      trend: interviewingOrOffered > 0 ? 'Active recruitment loops' : 'Awaiting interview invites',
      icon: Calendar,
      accent: 'from-amber-500/20 to-orange-500/10',
      iconColor: 'text-amber-400'
    }
  ];

  // Dynamic Profile Strength Calculation
  const hasResume = Boolean(activeResume) || totalResumes > 0;
  const calculateDynamicStrength = () => {
    let score = 20; // Base registration
    if (user?.college && user.college.trim()) score += 15;
    if (user?.targetRole && user.targetRole.trim()) score += 15;
    if (user?.leetcodeUrl && user.leetcodeUrl.trim()) score += 20;
    if (user?.githubUrl && user.githubUrl.trim()) score += 15;
    if (hasResume) score += 15;
    return Math.min(100, score);
  };

  const dynamicStrength = user?.profileStrength ? Math.max(user.profileStrength, calculateDynamicStrength()) : calculateDynamicStrength();

  const getStrengthStatus = (score) => {
    if (score >= 90) return { label: 'All-Star Candidate', color: 'text-emerald-400', nextStep: 'All milestones completed! Keep practicing DSA.' };
    if (score >= 70) return { label: 'Placement Ready', color: 'text-saffron-400', nextStep: hasResume ? 'Add your GitHub & LeetCode link for +35%' : 'Upload primary resume for +15%' };
    if (score >= 40) return { label: 'Good Progress', color: 'text-blue-400', nextStep: 'Add college details and target role' };
    return { label: 'Setup In Progress', color: 'text-amber-400', nextStep: 'Complete profile setup in Settings' };
  };

  const strengthStatus = getStrengthStatus(dynamicStrength);

  // DSA Stats
  const dsaStreak = user?.dsaStreak || 0;
  const dsaSolved = user?.dsaSolved || 0;
  const striverSolved = user?.striverSolved || 0;
  const dsaTarget = user?.dsaTarget || 191;
  const striverProgress = Math.min(100, Math.round((striverSolved / dsaTarget) * 100));

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Welcome Hero Banner with Indian Jaali Watermark */}
      <div className="relative overflow-hidden rounded-3xl p-6 sm:p-8 bg-gradient-to-r from-[#121829] via-[#0F1422] to-[#0A0E17] border border-saffron-500/20 shadow-xl">
        
        {/* Subtle Indian Geometric Jaali Pattern Watermark */}
        <div className="absolute top-0 right-0 w-80 h-80 pointer-events-none opacity-[0.05] overflow-hidden select-none">
          <svg viewBox="0 0 200 200" className="w-full h-full text-saffron-400 fill-current">
            <defs>
              <pattern id="jaaliPattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <circle cx="20" cy="20" r="16" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 0 20 Q 20 0 40 20 Q 20 40 0 20" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <path d="M 20 0 Q 40 20 20 40 Q 0 20 20 0" fill="none" stroke="currentColor" strokeWidth="1.5" />
                <circle cx="20" cy="20" r="5" fill="currentColor" />
              </pattern>
            </defs>
            <rect width="200" height="200" fill="url(#jaaliPattern)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2.5">
            <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-saffron-500/15 border border-saffron-500/30 text-saffron-300 text-xs font-semibold">
              <span>🇮🇳</span>
              <span>Placement Season 2026-27</span>
              <span className="text-saffron-500">•</span>
              <span className="text-white/80">{user?.college || 'Engineering Campus'}</span>
            </div>

            <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight">
              Welcome back, {user ? user.name.split(' ')[0] : 'Engineer'} 🚀 Ready to crack your placement season?
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              Targeting <span className="text-saffron-400 font-semibold">{user?.targetRole || 'Software Development Engineer (SDE)'}</span>.
              {activeResume ? (
                <> Primary resume Shortlist Score is calibrated at <span className="text-emerald-400 font-semibold">{activeResume.shortlistScore || 92}%</span>.</>
              ) : (
                <> Upload your PDF resume to calibrate your Shortlist Score against Indian recruiter filters.</>
              )}
            </p>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setCurrentTab('resume')}
              className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-xs shadow-glow hover:shadow-glow-lg transition-all flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Analyze Resume</span>
            </button>
            <button
              onClick={() => setCurrentTab('interview')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600/30 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 font-semibold text-xs transition-all flex items-center space-x-2"
            >
              <Award className="w-4 h-4 text-emerald-400" />
              <span>AI Mock Interview</span>
            </button>
            <button
              onClick={handleExportPdf}
              disabled={isExportingPdf}
              className="px-4 py-2.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 border border-white/10 font-medium text-xs transition-all flex items-center space-x-2 disabled:opacity-50"
              title="Generate server-side ATS PDF from your profile & projects"
            >
              <Download className={`w-4 h-4 text-saffron-400 ${isExportingPdf ? 'animate-bounce' : ''}`} />
              <span>{isExportingPdf ? 'Exporting PDF...' : 'Download ATS PDF'}</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE 1: PLACEMENT READINESS ENGINE WIDGET */}
      <PlacementReadinessWidget 
        setCurrentTab={setCurrentTab} 
        onOpenDsaModal={() => setIsDsaModalOpen(true)} 
      />

      {/* DYNAMIC PROFILE STRENGTH METER WIDGET (Crucial Requirement #1) */}
      <div className="p-5 sm:p-6 rounded-3xl bg-gradient-to-r from-saffron-950/20 via-dark-surface to-brand-950/20 border border-saffron-500/25 shadow-lg relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-1.5 flex-1">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-saffron-400" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Profile Completeness Meter
              </h3>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 ${strengthStatus.color}`}>
                {strengthStatus.label}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Next recommendation: <span className="text-slate-200 font-medium">{strengthStatus.nextStep}</span>
            </p>

            {/* Live Progress Bar */}
            <div className="pt-2 flex items-center space-x-3">
              <div className="flex-1 bg-white/10 rounded-full h-2.5 overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${dynamicStrength}%` }}
                  transition={{ duration: 0.6, ease: 'easeOut' }}
                  className="bg-gradient-to-r from-saffron-500 via-orange-500 to-emerald-400 h-full rounded-full"
                />
              </div>
              <span className="font-mono text-sm font-extrabold text-white">{dynamicStrength}%</span>
            </div>
          </div>

          <button
            onClick={() => setCurrentTab('settings')}
            className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 hover:border-saffron-500/40 text-slate-200 text-xs font-semibold transition-all flex items-center space-x-2 self-start md:self-center flex-shrink-0"
          >
            <Settings className="w-3.5 h-3.5 text-saffron-400" />
            <span>Edit Profile & Links</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Dynamic Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div
              key={idx}
              className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all relative overflow-hidden group"
            >
              <div className={`absolute -right-4 -bottom-4 w-24 h-24 bg-gradient-to-br ${stat.accent} rounded-full blur-2xl group-hover:scale-125 transition-transform`}></div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-400">{stat.label}</span>
                <div className={`p-2 rounded-xl bg-white/5 ${stat.iconColor}`}>
                  <Icon className="w-4 h-4" />
                </div>
              </div>
              <div className="mt-4">
                <span className="text-3xl font-extrabold text-white tracking-tight">{stat.value}</span>
                <p className="mt-1 text-xs text-slate-400 flex items-center space-x-1">
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  <span>{stat.trend}</span>
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real DSA Prep Tracker Widget */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-saffron-950/20 via-dark-surface to-brand-950/20 border border-saffron-500/25 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <div className="p-2 rounded-xl bg-saffron-500/10 text-saffron-400 border border-saffron-500/20">
                <Code2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-white flex items-center space-x-2">
                  <span>DSA Prep Tracker</span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-saffron-500/20 text-saffron-300 font-semibold">
                    Striver Sheet: {striverProgress}%
                  </span>
                </h3>
                <p className="text-xs text-slate-400">Competitive programming and data structures interview tracking</p>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Streak */}
            <div className="p-3 px-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400">
                <Flame className="w-4 h-4 animate-pulse" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white font-mono">{dsaStreak} Days</p>
                <p className="text-[10px] text-slate-400">Coding Streak 🔥</p>
              </div>
            </div>

            {/* Total Solved */}
            <div className="p-3 px-4 rounded-2xl bg-white/[0.03] border border-white/5 flex items-center space-x-3">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <p className="text-lg font-extrabold text-white font-mono">{dsaSolved}</p>
                <p className="text-[10px] text-slate-400">Problems Solved</p>
              </div>
            </div>

            {/* Striver Sheet Target vs Actual */}
            <div className="p-3 px-4 rounded-2xl bg-white/[0.03] border border-white/5 min-w-[180px] space-y-1.5">
              <div className="flex items-center justify-between text-xs">
                <span className="text-[10px] text-slate-400">SDE Sheet</span>
                <span className="font-mono text-saffron-400 text-xs font-bold">{striverSolved} / {dsaTarget}</span>
              </div>
              <div className="w-full bg-white/10 rounded-full h-1.5 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-saffron-500 to-emerald-400 h-full transition-all duration-300"
                  style={{ width: `${striverProgress}%` }}
                ></div>
              </div>
            </div>

            {/* Update Stats CTA */}
            <button
              onClick={() => setIsDsaModalOpen(true)}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-200 border border-white/10 text-xs font-semibold transition-colors flex items-center space-x-1.5"
            >
              <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
              <span>Update DSA</span>
            </button>
          </div>
        </div>
      </div>

      {/* FEATURE 4: "DEADLINE RADAR" TIME-SERIES TRACKING */}
      <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
        <DeadlineRadar onAddToTracker={onAddToTracker} triggerToast={triggerToast} />
      </div>

      {/* Main Grid: Active Applications & Resume Profile */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 cols): Active Tracked Applications */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white tracking-tight">Active Placement Pipeline</h2>
              <p className="text-xs text-slate-400">Real-time status of your campus drives and off-campus applications</p>
            </div>
            {applications.length > 0 && (
              <button
                onClick={() => setCurrentTab('tracker')}
                className="text-xs font-semibold text-saffron-400 hover:text-saffron-300 flex items-center space-x-1"
              >
                <span>View Full Tracker</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {applications.length > 0 ? (
            <div className="space-y-3">
              {applications.slice(0, 4).map((app) => (
                <div
                  key={app.id}
                  className="p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-white/10 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                >
                  <div className="flex items-center space-x-3.5">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-saffron-500/20 to-brand-500/20 border border-white/10 flex items-center justify-center font-bold text-sm text-white">
                      {app.company.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-white">{app.role}</h3>
                      <div className="flex items-center space-x-2 text-xs text-slate-400">
                        <span className="text-slate-200 font-medium">{app.company}</span>
                        <span>•</span>
                        <span>Applied {new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 self-end sm:self-center">
                    <div className="flex items-center space-x-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-semibold font-mono">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>{app.matchScore}% Job Fit</span>
                    </div>

                    <span
                      className={`text-xs px-2.5 py-1 rounded-full font-medium ${
                        app.status === 'Offered'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : app.status === 'Interviewing'
                          ? 'bg-saffron-500/20 text-saffron-300 border border-saffron-500/30 animate-pulse'
                          : app.status === 'Applied'
                          ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            /* PROFESSIONAL EMPTY STATE: Active Placement Pipeline */
            <div className="p-8 rounded-3xl bg-white/[0.015] border border-dashed border-white/10 text-center space-y-4">
              <div className="w-14 h-14 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <Briefcase className="w-7 h-7 text-saffron-400" />
              </div>
              <div className="max-w-sm mx-auto space-y-1">
                <h3 className="text-base font-bold text-white">No applications tracked yet</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Start tracking your on-campus placement drives and off-campus SDE applications to monitor your conversion rates.
                </p>
              </div>
              <button
                onClick={() => setCurrentTab('tracker')}
                className="px-5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-white font-semibold text-xs shadow-glow-sm transition-all inline-flex items-center space-x-1.5"
              >
                <Plus className="w-4 h-4" />
                <span>Track First Application</span>
              </button>
            </div>
          )}
        </div>

        {/* Right Column: Resume Profile Card (Empty State vs Active State) */}
        <div className="space-y-6">
          <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileText className="w-4 h-4 text-saffron-400" />
                <span>Primary Placement Resume</span>
              </h3>
              {activeResume && (
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 font-semibold">
                  Shortlist {activeResume.shortlistScore || 92}%
                </span>
              )}
            </div>

            {activeResume ? (
              <div className="space-y-3">
                <p className="text-xs font-semibold text-slate-200">{activeResume.fileName}</p>
                <p className="text-xs text-slate-400 leading-relaxed line-clamp-3">
                  {activeResume.summary || activeResume.extractedText?.substring(0, 160) + '...'}
                </p>

                {activeResume.skillsArray && activeResume.skillsArray.length > 0 && (
                  <div className="pt-2">
                    <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-500 mb-2">
                      Indexed Technical Competencies
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {activeResume.skillsArray.slice(0, 8).map((s) => (
                        <span key={s} className="px-2 py-0.5 rounded-md text-[11px] bg-saffron-500/10 text-saffron-300 border border-saffron-500/20">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => setCurrentTab('resume')}
                  className="w-full mt-2 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-xs font-medium text-slate-200 transition-colors flex items-center justify-center space-x-1"
                >
                  <span>Open Full Resume Breakdown</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>

                {/* Feature 3: Download ATS-Optimized 1-Page PDF */}
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                  title="Generate ATS-compliant 1-page PDF using pdfkit server-side"
                >
                  <Download className={`w-3.5 h-3.5 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isExportingPdf ? 'Generating ATS PDF...' : 'Download ATS-Ready Resume (PDF)'}</span>
                </button>
              </div>
            ) : (
              /* PROFESSIONAL EMPTY STATE: Primary Resume Dropzone Prompt */
              <div className="space-y-3">
                <div 
                  onClick={() => setCurrentTab('resume')}
                  className="cursor-pointer p-6 rounded-2xl border-2 border-dashed border-white/10 hover:border-saffron-500/40 bg-white/[0.01] hover:bg-saffron-500/[0.02] text-center space-y-3 transition-all group"
                >
                  <div className="w-12 h-12 mx-auto rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center text-saffron-400 group-hover:scale-110 transition-transform">
                    <UploadCloud className="w-6 h-6" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-saffron-300 transition-colors">
                      No Resume Uploaded Yet
                    </p>
                    <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                      Upload your technical PDF resume to extract skills, evaluate Shortlist Score, and match against JDs.
                    </p>
                  </div>
                  <span className="inline-block px-3 py-1.5 rounded-lg bg-saffron-500 text-white text-[11px] font-semibold shadow-glow-sm">
                    Upload Resume PDF
                  </span>
                </div>

                {/* Direct ATS resume download even if user has only filled profile */}
                <button
                  onClick={handleExportPdf}
                  disabled={isExportingPdf}
                  className="w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
                >
                  <Download className={`w-3.5 h-3.5 text-saffron-400 ${isExportingPdf ? 'animate-bounce' : ''}`} />
                  <span>{isExportingPdf ? 'Exporting...' : 'Export Profile to ATS Resume PDF'}</span>
                </button>
              </div>
            )}
          </div>

          {/* Target Job Alignment Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-br from-brand-950/40 via-dark-surface to-dark-surface border border-brand-500/20 space-y-3">
            <div className="flex items-center space-x-2 text-brand-400">
              <Target className="w-4 h-4 text-saffron-400" />
              <h3 className="text-sm font-bold text-white">Target Job Alignment</h3>
            </div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Found a target role on <span className="text-saffron-300 font-medium">Naukri.com</span>, <span className="text-white font-medium">LinkedIn</span>, or <span className="text-emerald-300 font-medium">Internshala</span>? Compare your resume vector before applying.
            </p>
            <button
              onClick={() => setCurrentTab('matcher')}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-400 hover:to-orange-400 text-white text-xs font-semibold shadow-glow-sm transition-all"
            >
              Analyze Job Fit % Now
            </button>
          </div>
        </div>
      </div>

      {/* DSA Update Modal */}
      <DsaUpdateModal
        isOpen={isDsaModalOpen}
        onClose={() => setIsDsaModalOpen(false)}
        onUpdated={onRefresh}
      />
    </motion.div>
  );
};
