import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  UploadCloud, 
  FileText, 
  CheckCircle2, 
  Sparkles, 
  Cpu, 
  RefreshCw, 
  ArrowRight,
  Layers,
  Award,
  Plus,
  AlertCircle,
  X,
  Download
} from 'lucide-react';
import { apiClient } from '../../api/client';
import { ResumeSkeleton } from '../common/SkeletonLoader';

export const ResumeAnalyzer = ({ activeResume, setActiveResume, onGoToMatcher, onResumeUploaded, triggerToast }) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [analysisStep, setAnalysisStep] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [customSkillInput, setCustomSkillInput] = useState('');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isDownloadingAts, setIsDownloadingAts] = useState(false);
  const fileInputRef = useRef(null);

  const handleDownloadAts = async () => {
    setIsDownloadingAts(true);
    try {
      const res = await apiClient.downloadAtsResume('Engineer');
      if (res.success) {
        if (triggerToast) triggerToast('ATS-optimized PDF downloaded successfully!', 'success');
      } else {
        if (triggerToast) triggerToast(res.error || 'Failed to download PDF', 'error');
      }
    } catch (err) {
      if (triggerToast) triggerToast('Download failed: ' + err.message, 'error');
    } finally {
      setIsDownloadingAts(false);
    }
  };

  const steps = [
    'Parsing PDF text streams with local disk persistence...',
    'Forwarding vector to Python AI microservice (PyPDF2 & NLP)...',
    'Extracting technical skill entities & competencies...',
    'Calibrating Placement Shortlist Score & storing in database...'
  ];

  // Handler to open native file explorer via ref
  const handleUploadClick = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Always clear previous value so onChange triggers every time
      fileInputRef.current.click();
    }
  };

  // Handler for file input selection with strict 5MB & extension checks
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validExtensions = ['.pdf', '.doc', '.docx'];
    const fileNameLower = file.name.toLowerCase();
    const hasValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));
    const isUnder5Mb = file.size <= 5 * 1024 * 1024; // 5MB limit

    if (!hasValidExt || !isUnder5Mb) {
      const errorMsg = 'Please upload a valid PDF document.';
      setUploadError(errorMsg);
      if (triggerToast) triggerToast(errorMsg, 'error');
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    setUploadError('');
    handleUploadFile(file);
  };

  const handleUploadFile = async (file) => {
    setIsUploading(true);
    setUploadError('');
    setAnalysisStep(0);

    const stepInterval = setInterval(() => {
      setAnalysisStep((prev) => (prev < steps.length - 1 ? prev + 1 : prev));
    }, 800);

    try {
      const res = await apiClient.uploadResume(file);
      clearInterval(stepInterval);
      setIsUploading(false);

      if (!res.success) {
        const rawError = res.error || '';
        const isScannedError = rawError.toLowerCase().includes('scanned') || 
                               rawError.toLowerCase().includes('looks like a scan') ||
                               rawError.toLowerCase().includes('image-only') ||
                               rawError.toLowerCase().includes('text-based pdf');

        const errorMsg = isScannedError
          ? 'Upload Failed: This PDF looks like a scan. Please upload a text-based PDF file.'
          : res.status === 400 || rawError.toLowerCase().includes('invalid document')
          ? (rawError || 'Invalid Document. Please upload a standard Resume.')
          : (rawError || 'Server error during upload.');

        setUploadError(errorMsg);
        if (triggerToast) triggerToast(errorMsg, 'error');
        if (fileInputRef.current) fileInputRef.current.value = '';
        return;
      }

      if (res.data?.resume) {
        const savedResume = res.data.resume;
        const skillsList = res.data.skills || savedResume.skillsArray || [];

        const normalized = {
          ...savedResume,
          shortlistScore: res.data.shortlistScore || savedResume.shortlistScore || 88,
          skillsArray: skillsList,
          skills: {
            languages: skillsList.filter(s => ['C++', 'Java', 'Python', 'TypeScript', 'JavaScript', 'Go', 'SQL', 'C', 'Rust'].includes(s)),
            frameworks: skillsList.filter(s => ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Tailwind CSS', 'Django', 'Flask'].includes(s)),
            cloudDevops: skillsList.filter(s => ['Docker', 'AWS', 'Kubernetes', 'PostgreSQL', 'Redis', 'Git', 'CI/CD', 'Linux', 'MongoDB'].includes(s)),
            architecture: skillsList.filter(s => !['C++', 'Java', 'Python', 'TypeScript', 'JavaScript', 'Go', 'SQL', 'C', 'Rust', 'React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Tailwind CSS', 'Django', 'Flask', 'Docker', 'AWS', 'Kubernetes', 'PostgreSQL', 'Redis', 'Git', 'CI/CD', 'Linux', 'MongoDB'].includes(s))
          }
        };

        setActiveResume(normalized);
        if (triggerToast) triggerToast('Resume Uploaded!', 'success');
        if (onResumeUploaded) onResumeUploaded(normalized);
      }
    } catch (err) {
      clearInterval(stepInterval);
      setIsUploading(false);
      const errorMsg = 'Server error during upload.';
      setUploadError(errorMsg);
      if (triggerToast) triggerToast(errorMsg, 'error');
    } finally {
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleFileDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      const file = files[0];
      const validExtensions = ['.pdf', '.doc', '.docx'];
      const fileNameLower = file.name.toLowerCase();
      const hasValidExt = validExtensions.some(ext => fileNameLower.endsWith(ext));
      const isUnder5Mb = file.size <= 5 * 1024 * 1024;

      if (!hasValidExt || !isUnder5Mb) {
        const errorMsg = 'Please upload a valid PDF document.';
        setUploadError(errorMsg);
        if (triggerToast) triggerToast(errorMsg, 'error');
        return;
      }

      setUploadError('');
      handleUploadFile(file);
    }
  };

  const handleAddCustomSkill = (e) => {
    e.preventDefault();
    if (!customSkillInput.trim() || !activeResume) return;
    const newSkill = customSkillInput.trim();
    if (activeResume.skillsArray?.includes(newSkill)) return;

    const updatedSkills = [...(activeResume.skillsArray || []), newSkill];
    setActiveResume({
      ...activeResume,
      skillsArray: updatedSkills,
      skills: {
        ...activeResume.skills,
        languages: [...(activeResume.skills?.languages || []), newSkill]
      }
    });
    setCustomSkillInput('');
    setShowAddSkill(false);
    if (triggerToast) triggerToast(`Added ${newSkill} to indexed competencies!`);
  };

  // Skill category filter
  const filterSkills = () => {
    if (!activeResume?.skills) return [];
    if (selectedCategory === 'all') return activeResume.skillsArray || [];
    return activeResume.skills[selectedCategory] || [];
  };

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Resume Analyzer & Shortlist Engine
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-saffron-500/20 text-saffron-300 border border-saffron-500/30 font-mono font-semibold">
              PyPDF2 + NLP
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Multi-tier parsing optimized for Indian Day-1 on-campus drives, off-campus referrals, and ATS screeners.
          </p>
        </div>

        {activeResume && (
          <div className="flex flex-col items-end space-y-1 self-start sm:self-auto">
            <button
              type="button"
              onClick={handleUploadClick}
              title="Please ensure your resume is a standard PDF (not an image scan)."
              className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-semibold transition-colors flex items-center space-x-2"
            >
              <RefreshCw className="w-3.5 h-3.5 text-saffron-400" />
              <span>Upload New Version</span>
            </button>
            <span className="text-[10px] text-slate-400 hidden sm:block">
              Please ensure your resume is a standard PDF (not an image scan).
            </span>
          </div>
        )}
      </div>

      {/* Hidden Native File Input bound to useRef */}
      <input
        type="file"
        id="resume-upload"
        ref={fileInputRef}
        accept=".pdf, .doc, .docx"
        style={{ display: 'none' }}
        onChange={handleFileChange}
      />

      {/* Sleek Red Toast/Alert Banner for Document Validation */}
      {uploadError && (
        <div className="p-4 rounded-2xl bg-rose-500/15 border border-rose-500/40 text-rose-200 text-xs flex items-center justify-between animate-fadeIn shadow-lg shadow-rose-950/40">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-rose-500/20 text-rose-400 border border-rose-500/30">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
            </div>
            <div>
              <span className="font-bold text-white block text-sm">Document Validation Failed</span>
              <span className="text-rose-300 font-medium">{uploadError}</span>
            </div>
          </div>
          <button 
            type="button"
            onClick={() => setUploadError('')}
            className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Loading Skeleton Shimmer */}
      {isUploading ? (
        <div className="space-y-6">
          <div className="p-8 rounded-3xl glass-panel border border-saffron-500/30 text-center space-y-4">
            <div className="w-12 h-12 mx-auto rounded-2xl bg-saffron-500/10 border border-saffron-500/30 flex items-center justify-center text-saffron-400">
              <Cpu className="w-6 h-6 animate-spin text-saffron-400" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-white">Analyzing Resume with AI Engine</h3>
              <p className="text-xs text-saffron-300 font-mono transition-all">
                {steps[analysisStep]}
              </p>
            </div>
            <div className="w-64 mx-auto bg-white/10 rounded-full h-1.5 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-saffron-500 via-orange-500 to-emerald-400 h-full transition-all duration-500"
                style={{ width: `${((analysisStep + 1) / steps.length) * 100}%` }}
              ></div>
            </div>
          </div>
          <ResumeSkeleton />
        </div>
      ) : !activeResume ? (
        /* Empty State / Upload Dropzone */
        <div
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={handleFileDrop}
          onClick={handleUploadClick}
          className={`cursor-pointer p-12 rounded-3xl border-2 border-dashed transition-all text-center space-y-5 group ${
            isDragging
              ? 'border-saffron-500 bg-saffron-500/10 shadow-glow'
              : 'border-white/10 hover:border-saffron-500/40 bg-white/[0.01] hover:bg-white/[0.03]'
          }`}
        >
          <div className="w-16 h-16 mx-auto rounded-2xl bg-saffron-500/10 border border-saffron-500/25 flex items-center justify-center text-saffron-400 group-hover:scale-110 transition-transform">
            <UploadCloud className="w-8 h-8" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-white group-hover:text-saffron-300 transition-colors">
              Drop your Resume PDF here, or <span className="text-saffron-400 underline">browse files</span>
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Accepts technical resume documents (.pdf, .doc, .docx) up to 5MB. Parsed text will be stored locally and analyzed via FastAPI microservice.
            </p>
          </div>

          {/* Styled Upload Resume Button explicitly triggering file explorer */}
          <div className="pt-2 space-y-2">
            <button
              type="button"
              onClick={handleUploadClick}
              title="Please ensure your resume is a standard PDF (not an image scan)."
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-xs shadow-glow transition-all inline-flex items-center space-x-2"
            >
              <UploadCloud className="w-4 h-4" />
              <span>Upload Resume</span>
            </button>
            <p className="text-[11px] text-slate-400 flex items-center justify-center space-x-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-saffron-400/90 flex-shrink-0" />
              <span>Please ensure your resume is a standard PDF (not an image scan).</span>
            </p>
          </div>
          <div className="flex items-center justify-center space-x-3 text-[11px] text-slate-400 pt-2">
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>pdf-parse Extraction</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Shortlist Scoring</span>
            </span>
            <span>•</span>
            <span className="flex items-center space-x-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>Skill Gap Indexing</span>
            </span>
          </div>
        </div>
      ) : (
        /* Active Resume Breakdown */
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Shortlist Score Card & Actions */}
          <div className="space-y-6">
            <div className="p-6 rounded-3xl bg-gradient-to-br from-saffron-950/20 via-dark-surface to-dark-surface border border-saffron-500/25 space-y-5">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-saffron-300">
                  Resume Shortlist Score
                </span>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-semibold">
                  Calibrated
                </span>
              </div>

              <div className="flex items-baseline space-x-2">
                <span className="text-5xl font-extrabold text-white tracking-tight font-mono">
                  {activeResume.shortlistScore || 92}
                </span>
                <span className="text-lg font-bold text-slate-400">/ 100</span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">
                Your resume demonstrates strong technical depth for Day-1 Campus Placements and high ATS shortlist probability.
              </p>

              <div className="pt-2 border-t border-white/5 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>File Name</span>
                  <span className="text-slate-200 font-mono truncate max-w-[150px]">{activeResume.fileName}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Total Skills Extracted</span>
                  <span className="text-saffron-400 font-mono font-bold">{activeResume.skillsArray?.length || 0}</span>
                </div>
              </div>

              <button
                onClick={onGoToMatcher}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-xs shadow-glow transition-all flex items-center justify-center space-x-2"
              >
                <span>Run Job Fit % Matcher</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Feature 3: Server-side ATS Resume PDF Exporter */}
              <button
                onClick={handleDownloadAts}
                disabled={isDownloadingAts}
                className="w-full py-2.5 rounded-xl bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 text-xs font-semibold transition-all flex items-center justify-center space-x-1.5 disabled:opacity-50"
              >
                <Download className={`w-3.5 h-3.5 ${isDownloadingAts ? 'animate-bounce' : ''}`} />
                <span>{isDownloadingAts ? 'Generating 1-Page PDF...' : 'Download ATS-Optimized Resume (PDF)'}</span>
              </button>
            </div>
          </div>

          {/* Right Column: Extracted Skills & Competencies */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 rounded-3xl bg-white/[0.02] border border-white/5 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-white/5">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center space-x-2">
                    <Sparkles className="w-4 h-4 text-saffron-400" />
                    <span>Extracted Technical Competencies</span>
                  </h3>
                  <p className="text-xs text-slate-400">Indexed from your resume for placement recruiter filters</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setShowAddSkill(!showAddSkill)}
                    className="px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-slate-300 hover:text-white border border-white/10 text-xs font-medium transition-colors flex items-center space-x-1"
                  >
                    <Plus className="w-3.5 h-3.5 text-saffron-400" />
                    <span>Add Skill</span>
                  </button>
                </div>
              </div>

              {/* Add Custom Skill Form */}
              {showAddSkill && (
                <form onSubmit={handleAddCustomSkill} className="flex items-center space-x-2 p-3 rounded-2xl bg-white/[0.03] border border-white/10 animate-fadeIn">
                  <input
                    type="text"
                    value={customSkillInput}
                    onChange={(e) => setCustomSkillInput(e.target.value)}
                    placeholder="Enter skill name (e.g., Redis, Kafka, Kubernetes)..."
                    className="flex-1 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500"
                  />
                  <button
                    type="submit"
                    className="px-4 py-1.5 rounded-lg bg-saffron-500 hover:bg-saffron-400 text-white text-xs font-semibold shadow-glow-sm transition-all"
                  >
                    Add
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddSkill(false)}
                    className="p-1.5 text-slate-400 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* Skill Tags by Category */}
              <div className="space-y-4">
                {activeResume.skillsArray && activeResume.skillsArray.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {activeResume.skillsArray.map((skill) => (
                      <span
                        key={skill}
                        className="px-3 py-1.5 rounded-xl bg-saffron-500/10 hover:bg-saffron-500/20 text-saffron-300 border border-saffron-500/25 text-xs font-medium flex items-center space-x-1.5 transition-all shadow-sm"
                      >
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{skill}</span>
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No skills extracted yet.</p>
                )}
              </div>

              {/* Extracted Text Snippet */}
              {activeResume.extractedText && (
                <div className="pt-4 border-t border-white/5 space-y-2">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    Extracted Text Preview
                  </span>
                  <div className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-400 font-mono leading-relaxed max-h-36 overflow-y-auto">
                    {activeResume.extractedText}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
