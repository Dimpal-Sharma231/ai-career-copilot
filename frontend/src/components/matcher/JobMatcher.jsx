import React, { useState } from 'react';
import { 
  Crosshair, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Copy, 
  Check, 
  Cpu, 
  BookOpen, 
  FileCheck,
  Plus,
  AlertCircle
} from 'lucide-react';
import { SAMPLE_JOB_DESCRIPTIONS } from '../../data/mockData';
import { apiClient } from '../../api/client';
import { MatcherSkeleton } from '../common/SkeletonLoader';
import { useAuth } from '../../context/AuthContext';

export const JobMatcher = ({ activeResume, onAddToTracker, triggerToast }) => {
  const { user } = useAuth();
  const [jobDescription, setJobDescription] = useState(SAMPLE_JOB_DESCRIPTIONS[0].description);
  const [jobTitle, setJobTitle] = useState(SAMPLE_JOB_DESCRIPTIONS[0].title);
  const [companyName, setCompanyName] = useState(SAMPLE_JOB_DESCRIPTIONS[0].company);
  const [isCalculating, setIsCalculating] = useState(false);
  const [hasCalculated, setHasCalculated] = useState(false);
  const [matchScore, setMatchScore] = useState(85);
  const [matchedSkills, setMatchedSkills] = useState([]);
  const [missingSkills, setMissingSkills] = useState([]);
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [copiedPitch, setCopiedPitch] = useState(false);
  const [matchError, setMatchError] = useState('');
  const [addedToTracker, setAddedToTracker] = useState(false);

  // Preset selector
  const handleSelectPreset = (preset) => {
    setJobDescription(preset.description);
    setJobTitle(preset.title);
    setCompanyName(preset.company);
    setHasCalculated(false);
    setAddedToTracker(false);
    setMatchError('');
  };

  // Real AI TF-IDF Cosine Match calculation
  const handleCalculateMatch = async () => {
    if (!jobDescription.trim()) {
      if (triggerToast) triggerToast('Please enter a Job Description', 'error');
      return;
    }

    setIsCalculating(true);
    setMatchError('');

    try {
      const resumeId = activeResume?.id;
      const resumeText = activeResume?.extractedText || '';
      
      const res = await apiClient.matchJob(resumeId, resumeText, jobDescription, companyName, jobTitle);
      setIsCalculating(false);

      if (!res.success) {
        const errorMsg = res.isAiOffline 
          ? 'AI Service Unavailable. Please try again later.'
          : (res.error || 'Matching calculation failed.');
        setMatchError(errorMsg);
        if (triggerToast) triggerToast(errorMsg, 'error');
        return;
      }

      if (res.data) {
        setHasCalculated(true);
        setMatchScore(res.data.matchScore || 82);
        setMatchedSkills(res.data.matchedSkills || []);
        setMissingSkills(res.data.missingSkills || []);
        setAiRecommendation(res.data.recommendation || 'Focus your resume bullet points around key matched skills.');
        if (triggerToast) triggerToast(`Job Fit calculated: ${res.data.matchScore}% Match!`, 'success');
      }
    } catch (err) {
      setIsCalculating(false);
      const errorMsg = 'AI Service Unavailable. Please try again later.';
      setMatchError(errorMsg);
      if (triggerToast) triggerToast(errorMsg, 'error');
    }
  };

  const handleSaveToTracker = async () => {
    if (!onAddToTracker) return;
    await onAddToTracker({
      company: companyName,
      role: jobTitle,
      status: 'Applied',
      matchScore: matchScore,
      jobDescription: jobDescription.substring(0, 500)
    });
    setAddedToTracker(true);
    if (triggerToast) triggerToast(`Added ${jobTitle} at ${companyName} to Placement Tracker!`);
  };

  const getScoreColor = (score) => {
    if (score >= 75) return 'text-emerald-400 stroke-emerald-500';
    if (score >= 50) return 'text-amber-400 stroke-amber-500';
    return 'text-rose-500 stroke-rose-500';
  };

  const circumference = 2 * Math.PI * 60;
  const strokeDashoffset = circumference - (matchScore / 100) * circumference;

  const handleCopyPitch = () => {
    const studentName = user?.name || 'Candidate';
    const college = user?.college || 'Engineering Campus';
    const pitch = `Hi ${companyName} Hiring / Recruitment Team,\n\nI am applying for the ${jobTitle} opening. With an AI Job Fit match of ${matchScore}% against your tech stack, I bring proven hands-on experience in ${matchedSkills.slice(0, 4).join(', ')}${user?.leetcodeUrl ? `, along with my verified LeetCode profile (${user.leetcodeUrl})` : ''}.\n\nI would love to interview for the upcoming placement drive. My resume and GitHub are attached for your review.\n\nWarm regards,\n${studentName} (${college})`;
    navigator.clipboard.writeText(pitch);
    setCopiedPitch(true);
    setTimeout(() => setCopiedPitch(false), 2000);
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div>
        <div className="flex items-center space-x-2">
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Job Fit % & Skill Gap Analyzer
          </h1>
          <span className="text-xs px-2.5 py-0.5 rounded-full bg-saffron-500/20 text-saffron-300 border border-saffron-500/30 font-mono font-semibold">
            TF-IDF Cosine Model
          </span>
        </div>
        <p className="mt-1 text-sm text-slate-400">
          Compare your active resume vector against real JDs from Naukri.com, Internshala, and campus placement drives.
        </p>
      </div>

      {/* Preset JD Quick Pills */}
      <div className="space-y-2">
        <label className="text-xs font-semibold text-slate-400">Select Preset Indian Tech JD:</label>
        <div className="flex flex-wrap gap-2">
          {SAMPLE_JOB_DESCRIPTIONS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                companyName === preset.company
                  ? 'bg-saffron-500/20 text-saffron-300 border border-saffron-500/40'
                  : 'bg-white/5 hover:bg-white/10 text-slate-300 border border-white/5'
              }`}
            >
              {preset.company} • {preset.title}
            </button>
          ))}
        </div>
      </div>

      {/* Error Banner */}
      {matchError && (
        <div className="p-4 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center space-x-2 animate-fadeIn">
          <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          <span className="font-semibold">{matchError}</span>
        </div>
      )}

      {/* Main Comparison Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Job Description Input */}
        <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Company Name</label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-300">Target Role Title</label>
              <input
                type="text"
                value={jobTitle}
                onChange={(e) => setJobTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-300">Paste Full Job Description (JD)</label>
            <textarea
              rows={12}
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the technical job description requirements, responsibilities, and qualifications..."
              className="w-full p-4 rounded-2xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500 font-mono leading-relaxed resize-none"
            />
          </div>

          <button
            onClick={handleCalculateMatch}
            disabled={isCalculating}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-xs shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isCalculating ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>{isCalculating ? 'Computing TF-IDF Cosine Similarity...' : 'Calculate Job Fit % & Gaps'}</span>
          </button>
        </div>

        {/* Right Column: AI Analysis Result */}
        <div className="space-y-6">
          {isCalculating ? (
            <MatcherSkeleton />
          ) : hasCalculated ? (
            <div className="space-y-6 animate-fadeIn">
              {/* Match Score Card with Circular SVG Indicator */}
              <div className="p-6 rounded-3xl bg-gradient-to-br from-saffron-950/20 via-dark-surface to-dark-surface border border-saffron-500/25 flex flex-col sm:flex-row items-center justify-between gap-6 shadow-xl">
                <div className="space-y-2 text-center sm:text-left">
                  <span className="text-xs font-bold uppercase tracking-wider text-saffron-300">
                    Calculated Job Fit %
                  </span>
                  <div className="flex items-baseline space-x-2 justify-center sm:justify-start">
                    <span className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight font-mono">
                      {matchScore}%
                    </span>
                  </div>
                  <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
                    Based on scikit-learn TF-IDF vectorization and cosine similarity against your active resume.
                  </p>
                </div>

                {/* SVG Gauge */}
                <div className="relative w-32 h-32 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 140 140">
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      className="stroke-white/10"
                      strokeWidth="10"
                      fill="transparent"
                    />
                    <circle
                      cx="70"
                      cy="70"
                      r="60"
                      className={getScoreColor(matchScore)}
                      strokeWidth="10"
                      strokeDasharray={circumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                    />
                  </svg>
                  <span className="absolute text-xl font-extrabold text-white font-mono">
                    {matchScore}%
                  </span>
                </div>
              </div>

              {/* Matched Skills */}
              <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                <div className="flex items-center space-x-2 text-emerald-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Matched Technical Competencies ({matchedSkills.length})
                  </h3>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {matchedSkills.map((s) => (
                    <span key={s} className="px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 text-xs font-medium">
                      {s}
                    </span>
                  ))}
                </div>
              </div>

              {/* Missing Skills as Red Tags */}
              {missingSkills.length > 0 && (
                <div className="p-5 rounded-2xl bg-white/[0.02] border border-white/5 space-y-3">
                  <div className="flex items-center space-x-2 text-rose-400">
                    <XCircle className="w-4 h-4" />
                    <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                      Identified Technical Skill Gaps ({missingSkills.length})
                    </h3>
                  </div>

                  {/* Red Tags for Missing Skills */}
                  <div className="flex flex-wrap gap-2 pt-1">
                    {missingSkills.map((gap, i) => {
                      const skillName = typeof gap === 'string' ? gap : gap.skill;
                      return (
                        <span
                          key={i}
                          className="px-3 py-1.5 rounded-xl bg-rose-500/15 text-rose-300 border border-rose-500/30 text-xs font-semibold flex items-center space-x-1.5 shadow-sm"
                        >
                          <span className="w-1.5 h-1.5 rounded-full bg-rose-400"></span>
                          <span>{skillName}</span>
                        </span>
                      );
                    })}
                  </div>

                  {/* Remediation Cards */}
                  <div className="space-y-2 pt-2 border-t border-white/5">
                    {missingSkills.map((gap, i) => (
                      <div key={i} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs space-y-1">
                        <div className="flex items-center justify-between">
                          <span className="font-semibold text-rose-300">{typeof gap === 'string' ? gap : gap.skill}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-rose-500/10 text-rose-300 font-semibold border border-rose-500/20">Skill Gap</span>
                        </div>
                        {gap.reason && <p className="text-[11px] text-slate-400">{gap.reason}</p>}
                        {gap.remediation && <p className="text-[11px] text-emerald-400/90 font-medium">{gap.remediation}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* AI Strategic Recommendation */}
              {aiRecommendation && (
                <div className="p-4 rounded-2xl bg-saffron-500/10 border border-saffron-500/20 text-xs space-y-1">
                  <span className="font-bold text-saffron-300">AI Placement Recommendation:</span>
                  <p className="text-slate-300 leading-relaxed">{aiRecommendation}</p>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="flex flex-wrap items-center gap-3">
                <button
                  onClick={handleSaveToTracker}
                  disabled={addedToTracker}
                  className="flex-1 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-white font-semibold text-xs shadow-glow-sm transition-all flex items-center justify-center space-x-2 disabled:opacity-60"
                >
                  <Plus className="w-4 h-4" />
                  <span>{addedToTracker ? 'Added to Tracker ✓' : 'Add to Application Tracker'}</span>
                </button>

                <button
                  onClick={handleCopyPitch}
                  className="py-2.5 px-4 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center space-x-1.5"
                >
                  {copiedPitch ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span>{copiedPitch ? 'Copied Pitch!' : 'Copy Recruiter Pitch'}</span>
                </button>
              </div>
            </div>
          ) : (
            /* Prompt to Run Matcher */
            <div className="h-full min-h-[300px] flex flex-col items-center justify-center p-8 rounded-3xl bg-white/[0.015] border border-dashed border-white/10 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
                <Crosshair className="w-6 h-6 text-saffron-400" />
              </div>
              <div className="max-w-xs space-y-1">
                <h3 className="text-sm font-bold text-white">Ready for Cosine Analysis</h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Click 'Calculate Job Fit % & Gaps' to execute the TF-IDF comparison against your resume vector.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
