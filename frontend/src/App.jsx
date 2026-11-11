import React, { useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ThemeProvider } from './context/ThemeContext';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { MobileNav } from './components/layout/MobileNav';
import { LandingPage } from './components/landing/LandingPage';
import { Dashboard } from './components/dashboard/Dashboard';
import { ResumeAnalyzer } from './components/resume/ResumeAnalyzer';
import { JobMatcher } from './components/matcher/JobMatcher';
import { ApplicationTracker } from './components/tracker/ApplicationTracker';
import { ProfileSettings } from './components/profile/ProfileSettings';
import { MockInterviewChat } from './components/interview/MockInterviewChat';
import { AuthModal } from './components/auth/AuthModal';
import { OnboardingModal } from './components/onboarding/OnboardingModal';
import { apiClient } from './api/client';
import { CheckCircle2, AlertTriangle, WifiOff, X } from 'lucide-react';

const MainAppContent = () => {
  const { user, isAuthenticated, loading: authLoading, refreshUser } = useAuth();
  
  // Navigation & View State
  const [currentTab, setCurrentTab] = useState('dashboard');
  const [isLanding, setIsLanding] = useState(false);
  const [isAuthOpen, setIsAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  
  // Real User Data from SQLite / Express Backend
  const [activeResume, setActiveResume] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [applications, setApplications] = useState([]);
  const [isLoadingData, setIsLoadingData] = useState(false);
  
  // System & Onboarding States
  const [toastMessage, setToastMessage] = useState(null);
  const [backendStatus, setBackendStatus] = useState('checking'); // 'online' | 'offline'

  const triggerToast = (msg, type = 'success') => {
    setToastMessage({ text: msg, type });
    setTimeout(() => setToastMessage(null), 4500);
  };

  // 1. Healthcheck probe
  useEffect(() => {
    const probeHealth = async () => {
      const res = await apiClient.checkHealth();
      setBackendStatus(res.online ? 'online' : 'offline');
    };
    probeHealth();
  }, []);

  // 2. Fetch User Data (Resumes & Applications) when authenticated
  const loadUserData = async () => {
    if (!isAuthenticated) return;
    setIsLoadingData(true);
    try {
      if (refreshUser) await refreshUser();

      // Fetch user's stored resumes
      const resumeRes = await apiClient.getResumes();
      if (resumeRes.success && resumeRes.resumes) {
        setResumes(resumeRes.resumes);
        if (resumeRes.resumes.length > 0) {
          const latest = resumeRes.resumes[0];
          setActiveResume({
            ...latest,
            shortlistScore: latest.shortlistScore || 88,
            skills: {
              languages: latest.skillsArray?.filter(s => ['C++', 'Java', 'Python', 'TypeScript', 'JavaScript', 'Go', 'SQL', 'C', 'Rust'].includes(s)) || [],
              frameworks: latest.skillsArray?.filter(s => ['React', 'Next.js', 'Node.js', 'Express', 'FastAPI', 'Tailwind CSS'].includes(s)) || [],
              cloudDevops: latest.skillsArray?.filter(s => ['Docker', 'AWS', 'Kubernetes', 'PostgreSQL', 'Redis', 'Git', 'CI/CD'].includes(s)) || [],
              architecture: latest.skillsArray?.filter(s => ['Microservices', 'REST APIs', 'System Design', 'DSA'].includes(s)) || []
            }
          });
        } else {
          setActiveResume(null);
        }
      }

      // Fetch user's tracked applications
      const appsRes = await apiClient.getApplications();
      if (appsRes.success && appsRes.applications) {
        setApplications(appsRes.applications);
      }
    } catch (err) {
      console.warn('Failed to fetch user data:', err);
    } finally {
      setIsLoadingData(false);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadUserData();
    } else {
      setActiveResume(null);
      setResumes([]);
      setApplications([]);
    }
  }, [isAuthenticated]);

  // Open Auth Modal handler
  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode);
    setIsAuthOpen(true);
  };

  // Real CRUD: Create Application
  const handleAddApplication = async (newJob) => {
    try {
      const res = await apiClient.createApplication(newJob);
      if (res.success && res.application) {
        setApplications(prev => [res.application, ...prev]);
        triggerToast(`Added ${newJob.role} at ${newJob.company} to placement tracker!`, 'success');
      } else {
        const localApp = { ...newJob, id: 'app_' + Date.now(), appliedDate: new Date() };
        setApplications(prev => [localApp, ...prev]);
        triggerToast(`Saved application locally!`, 'success');
      }
    } catch (e) {
      const localApp = { ...newJob, id: 'app_' + Date.now(), appliedDate: new Date() };
      setApplications(prev => [localApp, ...prev]);
      triggerToast(`Saved application!`, 'success');
    }
  };

  // Real CRUD: Update Status
  const handleUpdateStatus = async (appId, newStatus) => {
    setApplications(prev =>
      prev.map(a => (a.id === appId ? { ...a, status: newStatus } : a))
    );
    try {
      await apiClient.updateApplication(appId, { status: newStatus });
      triggerToast(`Application status updated to ${newStatus}`, 'success');
    } catch (e) {
      console.warn('Backend sync failed, updated locally');
    }
  };

  // Real CRUD: Delete Application
  const handleDeleteApp = async (appId) => {
    setApplications(prev => prev.filter(a => a.id !== appId));
    try {
      await apiClient.deleteApplication(appId);
      triggerToast('Application removed from tracker.', 'success');
    } catch (e) {
      console.warn('Backend delete failed, removed locally');
    }
  };

  // Check if user requires Onboarding
  const needsOnboarding = isAuthenticated && user && user.onboardingCompleted === false;

  return (
    <div className="min-h-screen bg-[#080B11] text-slate-100 flex flex-col font-sans transition-colors duration-200">
      
      {/* Backend Status Diagnostic Ribbon (If Offline) */}
      {backendStatus === 'offline' && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-1.5 text-xs text-amber-300 flex items-center justify-between z-50">
          <div className="flex items-center space-x-2">
            <WifiOff className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-semibold">Backend Offline (Port 5000):</span>
            <span className="text-amber-200/80 hidden sm:inline">
              Start the backend with `npm run dev` in the backend folder to enable database persistence.
            </span>
          </div>
          <span className="text-[10px] font-mono bg-amber-500/20 px-2 py-0.5 rounded">
            LOCAL FALLBACK
          </span>
        </div>
      )}

      {/* Floating Toast Notification (Red for Error, Green for Success) */}
      {toastMessage && (
        <div className={`fixed top-16 right-6 z-50 p-3.5 rounded-2xl glass-panel border text-xs font-semibold shadow-2xl flex items-center space-x-2 animate-bounce ${
          toastMessage.type === 'error'
            ? 'border-rose-500/40 bg-rose-950/90 text-rose-200'
            : 'border-emerald-500/40 bg-emerald-950/90 text-emerald-200'
        }`}>
          {toastMessage.type === 'error' ? (
            <AlertTriangle className="w-4 h-4 text-rose-400 flex-shrink-0" />
          ) : (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
          )}
          <span>{toastMessage.text}</span>
          <button 
            onClick={() => setToastMessage(null)}
            className="text-slate-400 hover:text-white pl-2"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Top Navigation */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        isLanding={isLanding || !isAuthenticated}
        setIsLanding={setIsLanding}
        onOpenAuth={handleOpenAuth}
      />

      {/* Landing View or Authenticated Dashboard */}
      {!isAuthenticated || isLanding ? (
        <main className="flex-1">
          <LandingPage
            onGetStarted={(mode) => handleOpenAuth(mode)}
            onLaunchDemo={() => handleOpenAuth('login')}
          />
        </main>
      ) : (
        <div className="flex-1 flex max-w-[1600px] w-full mx-auto pb-20 md:pb-8">
          {/* Persistent Desktop Sidebar */}
          <Sidebar
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
            activeResume={activeResume}
          />

          {/* Main Module Content with Framer Motion transitions */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
            <AnimatePresence mode="wait">
              {currentTab === 'dashboard' && (
                <motion.div
                  key="dashboard"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <Dashboard
                    setCurrentTab={setCurrentTab}
                    activeResume={activeResume}
                    resumes={resumes}
                    applications={applications}
                    isLoading={isLoadingData}
                    onRefresh={loadUserData}
                    onAddToTracker={handleAddApplication}
                    triggerToast={triggerToast}
                  />
                </motion.div>
              )}

              {currentTab === 'interview' && (
                <motion.div
                  key="interview"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <MockInterviewChat
                    triggerToast={triggerToast}
                  />
                </motion.div>
              )}

              {currentTab === 'resume' && (
                <motion.div
                  key="resume"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <ResumeAnalyzer
                    activeResume={activeResume}
                    setActiveResume={setActiveResume}
                    onGoToMatcher={() => setCurrentTab('matcher')}
                    onResumeUploaded={() => {
                      loadUserData();
                    }}
                    triggerToast={triggerToast}
                  />
                </motion.div>
              )}

              {currentTab === 'matcher' && (
                <motion.div
                  key="matcher"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <JobMatcher
                    activeResume={activeResume}
                    onAddToTracker={handleAddApplication}
                    triggerToast={triggerToast}
                  />
                </motion.div>
              )}

              {currentTab === 'tracker' && (
                <motion.div
                  key="tracker"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <ApplicationTracker
                    applications={applications}
                    onAddApplication={handleAddApplication}
                    onUpdateStatus={handleUpdateStatus}
                    onDeleteApplication={handleDeleteApp}
                    triggerToast={triggerToast}
                  />
                </motion.div>
              )}

              {currentTab === 'settings' && (
                <motion.div
                  key="settings"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.2 }}
                >
                  <ProfileSettings
                    onBack={() => setCurrentTab('dashboard')}
                    onSaved={(msg) => {
                      loadUserData();
                      triggerToast(msg || 'Profile updated successfully!', 'success');
                    }}
                    activeResume={activeResume}
                  />
                </motion.div>
              )}
            </AnimatePresence>
          </main>

          {/* Mobile Bottom Navigation */}
          <MobileNav
            currentTab={currentTab}
            setCurrentTab={setCurrentTab}
          />
        </div>
      )}

      {/* Auth Modal (Sign In / Register) */}
      <AuthModal
        isOpen={isAuthOpen}
        initialMode={authMode}
        onClose={() => setIsAuthOpen(false)}
        onAuthSuccess={() => {
          setIsLanding(false);
          triggerToast('Welcome to AI Career Copilot!', 'success');
        }}
      />

      {/* Onboarding Wizard Modal (Triggers on first login) */}
      <OnboardingModal
        isOpen={Boolean(needsOnboarding)}
        onComplete={() => {
          triggerToast('Onboarding completed! Welcome to your Placement Dashboard 🚀', 'success');
          loadUserData();
        }}
      />
    </div>
  );
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </ThemeProvider>
  );
}
