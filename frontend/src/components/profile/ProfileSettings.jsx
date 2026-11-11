import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  User, 
  GraduationCap, 
  Building2, 
  Target, 
  Code2, 
  Github, 
  Sparkles, 
  Save, 
  ArrowLeft, 
  CheckCircle2, 
  AlertCircle,
  FileText,
  Flame,
  Award,
  Link as LinkIcon
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const ProfileSettings = ({ onBack, onSaved, activeResume }) => {
  const { user, updateProfile } = useAuth();

  const [formData, setFormData] = useState({
    name: '',
    college: '',
    graduationYear: '2026',
    targetRole: 'Software Development Engineer (SDE)',
    targetCompanies: 'Zomato, Swiggy, Razorpay, Flipkart',
    leetcodeUrl: '',
    githubUrl: ''
  });

  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        college: user.college || '',
        graduationYear: user.graduationYear || '2026',
        targetRole: user.targetRole || 'Software Development Engineer (SDE)',
        targetCompanies: user.targetCompanies || 'Zomato, Swiggy, Razorpay, Flipkart',
        leetcodeUrl: user.leetcodeUrl || '',
        githubUrl: user.githubUrl || ''
      });
    }
  }, [user]);

  // Calculate live Profile Strength based on form data & resume presence
  const hasResume = Boolean(activeResume) || (user?.resumeSkills && user.resumeSkills !== '[]');
  
  const calculateLiveStrength = () => {
    let score = 20; // Base registration
    if (formData.college?.trim()) score += 15;
    if (formData.targetRole?.trim()) score += 15;
    if (formData.leetcodeUrl?.trim()) score += 20;
    if (formData.githubUrl?.trim()) score += 15;
    if (hasResume) score += 15;
    return Math.min(100, score);
  };

  const strength = calculateLiveStrength();

  const getStrengthBadge = (s) => {
    if (s >= 90) return { label: 'All-Star Placement Profile', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    if (s >= 70) return { label: 'Placement Ready', color: 'bg-saffron-500/20 text-saffron-300 border-saffron-500/30' };
    if (s >= 40) return { label: 'Good Progress', color: 'bg-blue-500/20 text-blue-300 border-blue-500/30' };
    return { label: 'Profile Incomplete', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
  };

  const badge = getStrengthBadge(strength);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSaving(true);
    setSaveSuccess(false);

    try {
      await updateProfile(formData);
      setIsSaving(false);
      setSaveSuccess(true);
      if (onSaved) onSaved('Profile updated successfully!');
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      setIsSaving(false);
      setErrorMessage(err.message || 'Failed to update profile.');
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.25 }}
      className="max-w-4xl mx-auto space-y-8 pb-12"
    >
      {/* Top Navigation & Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/5">
        <div className="flex items-center space-x-3">
          <button
            onClick={onBack}
            className="p-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl font-extrabold text-white tracking-tight">Student Profile Settings</h1>
              <span className="text-xs px-2 py-0.5 rounded-full bg-saffron-500/10 text-saffron-400 border border-saffron-500/25 font-semibold">
                🇮🇳 Placement 2026-27
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Customize your campus credentials, target companies, and verified coding handles.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          disabled={isSaving}
          className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-xs shadow-glow hover:shadow-glow-lg transition-all flex items-center space-x-2 disabled:opacity-50 self-start sm:self-auto"
        >
          {isSaving ? (
            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>{isSaving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
        </button>
      </div>

      {/* Dynamic Profile Strength Meter Card */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-saffron-950/20 via-dark-surface to-brand-950/20 border border-saffron-500/30 relative overflow-hidden shadow-xl">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Sparkles className="w-4 h-4 text-saffron-400" />
              <span className="text-xs font-bold uppercase tracking-wider text-saffron-300">
                Live Profile Strength Meter
              </span>
              <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-semibold border ${badge.color}`}>
                {badge.label}
              </span>
            </div>
            <h2 className="text-2xl font-extrabold text-white">
              {strength}% Complete
            </h2>
            <p className="text-xs text-slate-400 max-w-lg leading-relaxed">
              Recruiters prioritize profiles with verified coding handles and tailored placement targets. Complete each field to maximize your shortlist score.
            </p>
          </div>

          <div className="w-full md:w-64 space-y-2">
            <div className="flex justify-between text-xs text-slate-300">
              <span>Shortlist Readiness</span>
              <span className="font-mono font-bold text-saffron-400">{strength} / 100</span>
            </div>
            <div className="w-full bg-white/10 rounded-full h-3 overflow-hidden p-0.5 border border-white/10">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${strength}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
                className="bg-gradient-to-r from-saffron-500 via-orange-500 to-emerald-400 h-full rounded-full"
              />
            </div>
          </div>
        </div>

        {/* Completeness Checklist */}
        <div className="mt-6 pt-5 border-t border-white/10 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs">
          <div className="flex items-center space-x-2 text-emerald-400">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Account (20%)</span>
          </div>
          <div className={`flex items-center space-x-2 ${formData.college?.trim() ? 'text-emerald-400' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>College (+15%)</span>
          </div>
          <div className={`flex items-center space-x-2 ${formData.targetRole?.trim() ? 'text-emerald-400' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Target Role (+15%)</span>
          </div>
          <div className={`flex items-center space-x-2 ${formData.leetcodeUrl?.trim() ? 'text-emerald-400' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>LeetCode (+20%)</span>
          </div>
          <div className={`flex items-center space-x-2 ${formData.githubUrl?.trim() ? 'text-emerald-400' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>GitHub (+15%)</span>
          </div>
          <div className={`flex items-center space-x-2 ${hasResume ? 'text-emerald-400' : 'text-slate-500'}`}>
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>Resume (+15%)</span>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {saveSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span className="font-semibold">Profile details and strength score updated in database successfully!</span>
        </div>
      )}

      {errorMessage && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2">
          <AlertCircle className="w-4 h-4 text-rose-400" />
          <span>{errorMessage}</span>
        </div>
      )}

      {/* Main Settings Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Section 1: Academic & Personal Info */}
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
            <User className="w-4 h-4 text-saffron-400" />
            <h3 className="text-sm font-bold text-white">Academic & Personal Information</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Full Name</label>
              <input
                type="text"
                required
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g. Rahul Sharma"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500 transition-colors"
              />
            </div>

            {/* Email (Read Only) */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Email Address (Registered)</label>
              <input
                type="email"
                disabled
                value={user?.email || ''}
                className="w-full px-4 py-2.5 rounded-xl bg-white/[0.02] border border-white/5 text-slate-400 text-xs cursor-not-allowed"
              />
            </div>

            {/* College Name */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>College / University Name</span>
                <span className="text-[10px] text-saffron-400">+15% Strength</span>
              </label>
              <input
                type="text"
                required
                value={formData.college}
                onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                placeholder="e.g. VIT Vellore, COEP Pune, IIT Bombay, BITS Pilani"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500 transition-colors"
              />
            </div>

            {/* Graduation Year */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Graduation Year / Batch</label>
              <select
                value={formData.graduationYear}
                onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F1422] border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500 transition-colors"
              >
                <option value="2025">Batch 2025 (Immediate Joiner)</option>
                <option value="2026">Batch 2026 (Day-1 Placement Season)</option>
                <option value="2027">Batch 2027 (Pre-Final Year / Summer Intern)</option>
                <option value="2028">Batch 2028 (Undergraduate)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Placement & Role Focus */}
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
            <Target className="w-4 h-4 text-saffron-400" />
            <h3 className="text-sm font-bold text-white">Career Goals & Placement Drives</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Target Role */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>Primary Target Role</span>
                <span className="text-[10px] text-saffron-400">+15% Strength</span>
              </label>
              <select
                value={formData.targetRole}
                onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                className="w-full px-4 py-2.5 rounded-xl bg-[#0F1422] border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500 transition-colors"
              >
                <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
                <option value="Frontend Engineer">Frontend Engineer (React / Next.js)</option>
                <option value="Backend Engineer">Backend Engineer (Node / Go / Java)</option>
                <option value="Data Analyst / BI Engineer">Data Analyst / BI Engineer</option>
                <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
                <option value="AI / ML Engineer">AI / ML Engineer</option>
              </select>
            </div>

            {/* Target Companies */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Dream Placement Companies</label>
              <input
                type="text"
                value={formData.targetCompanies}
                onChange={(e) => setFormData({ ...formData, targetCompanies: e.target.value })}
                placeholder="e.g. Zomato, Razorpay, Swiggy, Flipkart, CRED, TCS Digital"
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Competitive Programming & GitHub Links */}
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-white/5">
            <Code2 className="w-4 h-4 text-saffron-400" />
            <h3 className="text-sm font-bold text-white">Competitive Programming & Project Repositories</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* LeetCode URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>LeetCode Profile URL / Username</span>
                <span className="text-[10px] text-saffron-400">+20% Strength</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.leetcodeUrl}
                  onChange={(e) => setFormData({ ...formData, leetcodeUrl: e.target.value })}
                  placeholder="e.g. https://leetcode.com/u/rahul_2026 or rahul_2026"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500 transition-colors font-mono"
                />
                <Code2 className="w-4 h-4 text-orange-400 absolute left-3 top-3" />
              </div>
            </div>

            {/* GitHub URL */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                <span>GitHub Profile URL</span>
                <span className="text-[10px] text-saffron-400">+15% Strength</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="e.g. https://github.com/rahulsharma"
                  className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500 transition-colors font-mono"
                />
                <Github className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end space-x-3 pt-2">
          <button
            type="button"
            onClick={onBack}
            className="px-5 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSaving}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-xs shadow-glow transition-all flex items-center space-x-2 disabled:opacity-50"
          >
            {isSaving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save Profile</span>
          </button>
        </div>
      </form>
    </motion.div>
  );
};
