import React, { useState } from 'react';
import { 
  Sparkles, 
  GraduationCap, 
  Target, 
  Code2, 
  Github, 
  ArrowRight, 
  CheckCircle2, 
  Building2,
  Calendar,
  Briefcase
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const OnboardingModal = ({ isOpen, onComplete }) => {
  const { user, updateOnboarding } = useAuth();

  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    college: '',
    graduationYear: '2026',
    targetRole: 'Software Development Engineer (SDE)',
    targetCompanies: '',
    leetcodeUrl: '',
    githubUrl: '',
    dsaSolved: 0,
    dsaStreak: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  // Calculate live Profile Strength based on form completion
  const calculateLiveStrength = () => {
    let score = 20; // Base registration
    if (formData.name?.trim()) score += 10;
    if (formData.college?.trim()) score += 15;
    if (formData.targetRole?.trim()) score += 15;
    if (formData.leetcodeUrl?.trim()) score += 20;
    if (formData.githubUrl?.trim()) score += 15;
    return Math.min(100, score);
  };

  const handleNext = () => {
    if (step < 3) setStep(step + 1);
  };

  const handleBack = () => {
    if (step > 1) setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);
    try {
      await updateOnboarding({
        ...formData,
        gradYear: formData.graduationYear,
        leetcodeUsername: formData.leetcodeUrl
      });
      setIsSubmitting(false);
      onComplete();
    } catch (err) {
      setIsSubmitting(false);
      setError(err.message || 'Failed to save onboarding details.');
    }
  };

  const strength = calculateLiveStrength();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
      <div className="w-full max-w-xl rounded-3xl glass-panel p-6 sm:p-8 space-y-6 border border-saffron-500/30 shadow-2xl relative overflow-hidden animate-fadeIn">
        
        {/* Background glow */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/25 text-saffron-400 text-xs font-semibold">
              <span>🇮🇳</span>
              <span>Placement Season 2026-27 Onboarding</span>
            </div>
            <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Personalize Your Placement Profile
            </h2>
            <p className="text-xs text-slate-400">
              Complete the 3-step setup to unlock tailored Indian tech shortlist scoring.
            </p>
          </div>

          {/* Profile Strength Gauge */}
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400">Profile Strength</span>
            <div className="flex items-center space-x-1.5 justify-end">
              <span className="text-lg font-extrabold text-emerald-400 font-mono">{strength}%</span>
              <Sparkles className="w-3.5 h-3.5 text-saffron-400" />
            </div>
            <div className="w-24 bg-white/10 rounded-full h-1.5 overflow-hidden mt-1">
              <div 
                className="bg-gradient-to-r from-saffron-500 to-emerald-400 h-full transition-all duration-300"
                style={{ width: `${strength}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Stepper Indicator */}
        <div className="grid grid-cols-3 gap-2 pt-2 border-t border-white/5">
          <div className={`p-2 rounded-xl text-center text-xs font-semibold transition-colors ${
            step === 1 ? 'bg-saffron-500/20 text-saffron-300 border border-saffron-500/40' : 'bg-white/5 text-slate-400'
          }`}>
            1. Basic Info
          </div>
          <div className={`p-2 rounded-xl text-center text-xs font-semibold transition-colors ${
            step === 2 ? 'bg-saffron-500/20 text-saffron-300 border border-saffron-500/40' : 'bg-white/5 text-slate-400'
          }`}>
            2. Career Goals
          </div>
          <div className={`p-2 rounded-xl text-center text-xs font-semibold transition-colors ${
            step === 3 ? 'bg-saffron-500/20 text-saffron-300 border border-saffron-500/40' : 'bg-white/5 text-slate-400'
          }`}>
            3. Prep Links
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs">
            {error}
          </div>
        )}

        {/* Step Forms */}
        <form onSubmit={step === 3 ? handleSubmit : (e) => { e.preventDefault(); handleNext(); }}>
          {/* STEP 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Your Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Rahul Sharma or Priya Patel"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>College / Engineering Campus</span>
                  <span className="text-[10px] text-saffron-400 font-mono">+15% Strength</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.college}
                  onChange={(e) => setFormData({ ...formData, college: e.target.value })}
                  placeholder="e.g. VIT Vellore, COEP Pune, IIT Bombay, BITS Pilani"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Graduation Year / Batch</label>
                <select
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F1422] border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
                >
                  <option value="2025">Batch 2025 (Immediate Joiner)</option>
                  <option value="2026">Batch 2026 (Day-1 Placement Season)</option>
                  <option value="2027">Batch 2027 (Pre-Final Year / Summer Intern)</option>
                  <option value="2028">Batch 2028 (Undergraduate)</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 2: Career Goals */}
          {step === 2 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>Target Placement Role</span>
                  <span className="text-[10px] text-saffron-400 font-mono">+15% Strength</span>
                </label>
                <select
                  value={formData.targetRole}
                  onChange={(e) => setFormData({ ...formData, targetRole: e.target.value })}
                  className="w-full px-4 py-2.5 rounded-xl bg-[#0F1422] border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
                >
                  <option value="Software Development Engineer (SDE)">Software Development Engineer (SDE)</option>
                  <option value="Frontend Engineer">Frontend Engineer (React / Next.js)</option>
                  <option value="Backend Engineer">Backend Engineer (Node / Go / Java)</option>
                  <option value="Data Analyst / BI Engineer">Data Analyst / BI Engineer</option>
                  <option value="Cloud & DevOps Engineer">Cloud & DevOps Engineer</option>
                  <option value="AI / ML Engineer">AI / ML Engineer</option>
                </select>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Target Companies / Dream Recruiters</label>
                <input
                  type="text"
                  value={formData.targetCompanies}
                  onChange={(e) => setFormData({ ...formData, targetCompanies: e.target.value })}
                  placeholder="e.g. Zomato, Razorpay, Swiggy, Flipkart, CRED, TCS Digital"
                  className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500"
                />
              </div>
            </div>
          )}

          {/* STEP 3: Prep Links */}
          {step === 3 && (
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>LeetCode Profile Link or Username</span>
                  <span className="text-[10px] text-saffron-400 font-mono">+20% Strength</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.leetcodeUrl}
                    onChange={(e) => setFormData({ ...formData, leetcodeUrl: e.target.value })}
                    placeholder="e.g. https://leetcode.com/u/rahul_2026 or rahul_2026"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500 font-mono"
                  />
                  <Code2 className="w-4 h-4 text-orange-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                  <span>GitHub Profile Link</span>
                  <span className="text-[10px] text-saffron-400 font-mono">+15% Strength</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={formData.githubUrl}
                    onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                    placeholder="e.g. https://github.com/rahulsharma"
                    className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500 font-mono"
                  />
                  <Github className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Problems Solved (Est.)</label>
                  <input
                    type="number"
                    value={formData.dsaSolved}
                    onChange={(e) => setFormData({ ...formData, dsaSolved: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] text-slate-400">Coding Streak (Days)</label>
                  <input
                    type="number"
                    value={formData.dsaStreak}
                    onChange={(e) => setFormData({ ...formData, dsaStreak: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Stepper Controls */}
          <div className="flex items-center justify-between pt-6 border-t border-white/5">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold transition-colors"
              >
                Back
              </button>
            ) : (
              <div></div>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-400 hover:to-orange-400 text-white text-xs font-semibold shadow-glow-sm transition-all flex items-center space-x-1.5"
              >
                <span>Continue</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-emerald-500 hover:from-saffron-400 hover:to-orange-400 text-white text-xs font-semibold shadow-glow transition-all flex items-center space-x-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <CheckCircle2 className="w-4 h-4" />
                )}
                <span>Complete Onboarding & Enter</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
