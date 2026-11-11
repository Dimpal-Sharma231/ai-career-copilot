import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  MessageSquareCode, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Award, 
  CheckCircle2, 
  AlertCircle, 
  RotateCcw, 
  ChevronRight, 
  Building2, 
  Clock, 
  HelpCircle,
  Briefcase,
  History,
  Layers,
  ArrowRight
} from 'lucide-react';
import { apiClient } from '../../api/client';

export const MockInterviewChat = ({ triggerToast }) => {
  // Session Configuration & State
  const [activeSession, setActiveSession] = useState(null);
  const [messages, setMessages] = useState([]);
  const [role, setRole] = useState('Software Development Engineer (SDE)');
  const [company, setCompany] = useState('Zomato');
  
  // Interactive Chat State
  const [currentInput, setCurrentInput] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [isStarting, setIsStarting] = useState(false);
  const [historySessions, setHistorySessions] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  
  const chatBottomRef = useRef(null);

  // Auto-scroll on new message
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isEvaluating]);

  // Load Past Interview History
  const loadHistory = async () => {
    try {
      const res = await apiClient.getInterviewHistory();
      if (res.success && res.sessions) {
        setHistorySessions(res.sessions);
      }
    } catch (err) {
      console.warn('Failed to load interview history:', err);
    }
  };

  useEffect(() => {
    loadHistory();
  }, []);

  // 1. Start a New Interview Session
  const handleStartInterview = async () => {
    setIsStarting(true);
    try {
      const res = await apiClient.startMockInterview(role, company);
      if (res.success && res.session) {
        setActiveSession(res.session);
        setMessages(res.session.messages || [
          {
            id: 'msg_initial',
            sender: 'ai',
            content: res.openingQuestion || `Welcome to your mock interview for the ${role} position at ${company}. Let's begin: Can you describe a challenging technical bug or outage you faced in a project, and how you diagnosed and resolved it using the STAR method?`,
            createdAt: new Date().toISOString()
          }
        ]);
        if (triggerToast) {
          triggerToast(`Mock interview started for ${company} (${role})!`, 'success');
        }
        loadHistory();
      } else {
        throw new Error(res.error || 'Failed to start session');
      }
    } catch (err) {
      // Local fallback simulation if microservice offline
      const fallbackSession = {
        id: 'sess_' + Date.now(),
        role,
        company,
        score: null,
        createdAt: new Date().toISOString()
      };
      setActiveSession(fallbackSession);
      setMessages([
        {
          id: 'msg_fallback_0',
          sender: 'ai',
          content: `Welcome to your mock interview for the ${role} role at ${company}. Let's start with a core technical problem: Tell me about a complex project where you had to make critical architectural trade-offs (e.g. database choice, caching, or latency optimization). How did you structure your solution?`,
          createdAt: new Date().toISOString()
        }
      ]);
    } finally {
      setIsStarting(false);
    }
  };

  // 2. Submit Answer to FastAPI NLP Engine
  const handleSubmitAnswer = async (e) => {
    e?.preventDefault();
    if (!currentInput.trim() || isEvaluating || !activeSession) return;

    const userText = currentInput.trim();
    setCurrentInput('');

    // Last AI message was the question
    const lastAiMsg = [...messages].reverse().find(m => m.sender === 'ai');
    const questionText = lastAiMsg ? lastAiMsg.content : 'Describe your project execution.';

    // Optimistically append user message
    const tempUserMsg = {
      id: 'usr_' + Date.now(),
      sender: 'user',
      content: userText,
      createdAt: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempUserMsg]);
    setIsEvaluating(true);

    try {
      const res = await apiClient.submitInterviewAnswer(activeSession.id, userText, questionText);
      
      if (res.success && res.evaluation) {
        const evaluation = res.evaluation;
        const nextQ = res.nextQuestion;

        // Update active session score if returned
        if (res.session) {
          setActiveSession(res.session);
        }

        // Notify user of dynamic Placement Readiness Score database update
        if (res.readiness && triggerToast) {
          triggerToast(`Placement Readiness updated in database: ${res.readiness.overallReadinessScore}%`, 'success');
        }

        // Attach coach evaluation card to user message
        setMessages(prev => 
          prev.map(m => m.id === tempUserMsg.id ? { ...m, evaluation } : m)
        );

        // Append next question from AI
        if (nextQ) {
          setTimeout(() => {
            setMessages(prev => [
              ...prev,
              {
                id: 'ai_' + Date.now(),
                sender: 'ai',
                content: nextQ,
                createdAt: new Date().toISOString()
              }
            ]);
          }, 600);
        }
      } else {
        // Fallback simulated evaluation if microservice is offline
        const wordCount = userText.split(/\s+/).length;
        const fallbackEval = {
          score: wordCount > 50 ? 8.2 : 6.0,
          starAnalysis: {
            situation: userText.toLowerCase().includes('when') || userText.toLowerCase().includes('project'),
            task: userText.toLowerCase().includes('task') || userText.toLowerCase().includes('goal') || userText.toLowerCase().includes('had to'),
            action: userText.toLowerCase().includes('built') || userText.toLowerCase().includes('implemented') || userText.toLowerCase().includes('optimized'),
            result: userText.toLowerCase().includes('improved') || userText.toLowerCase().includes('result') || userText.toLowerCase().includes('%')
          },
          wordCount,
          confidenceLevel: wordCount > 40 ? 'High Confidence' : 'Needs Expansion',
          idealAnswerKeywords: ['Architecture', 'Latency', 'Scalability', 'Testing', 'Metrics'],
          feedback: 'Solid technical depth. Try to explicitly quantify the final outcome (e.g., latency reduction %, users supported) to make your STAR Result compelling.'
        };

        setMessages(prev => 
          prev.map(m => m.id === tempUserMsg.id ? { ...m, evaluation: fallbackEval } : m)
        );

        setTimeout(() => {
          setMessages(prev => [
            ...prev,
            {
              id: 'ai_' + Date.now(),
              sender: 'ai',
              content: 'Excellent breakdown. Moving on: In high-concurrency systems, how do you handle cache invalidation and prevent race conditions when multiple workers update the same entity?',
              createdAt: new Date().toISOString()
            }
          ]);
        }, 600);
      }
    } catch (err) {
      console.warn('Evaluation error:', err);
    } finally {
      setIsEvaluating(false);
      loadHistory();
    }
  };

  const handleSelectHistorySession = async (sess) => {
    setActiveSession(sess);
    setShowHistory(false);
    try {
      const res = await apiClient.getInterviewSession(sess.id);
      if (res.success && res.session?.messages) {
        setMessages(res.session.messages);
      }
    } catch (err) {
      console.warn('Failed to load session details:', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* Top Banner & Header */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-saffron-950/20 via-dark-surface to-brand-950/20 border border-saffron-500/25 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center space-x-2">
            <div className="p-2 rounded-xl bg-saffron-500/15 border border-saffron-500/30 text-saffron-400">
              <MessageSquareCode className="w-5 h-5" />
            </div>
            <h1 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
              Stateful AI Mock Interview
            </h1>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20 font-bold">
              STAR Method NLP Active
            </span>
          </div>
          <p className="text-xs text-slate-300 max-w-xl">
            Simulate real tech rounds for Indian campus placements. Evaluates STAR structure (Situation, Task, Action, Result), technical depth, and communication confidence.
          </p>
        </div>

        {/* History Toggle & New Session Button */}
        <div className="flex items-center space-x-2 self-start md:self-center">
          <button
            onClick={() => setShowHistory(!showHistory)}
            className="px-3.5 py-2 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 hover:text-white text-xs font-semibold transition-all flex items-center space-x-1.5"
          >
            <History className="w-3.5 h-3.5 text-saffron-400" />
            <span>Past Sessions ({historySessions.length})</span>
          </button>
          {activeSession && (
            <button
              onClick={() => setActiveSession(null)}
              className="px-3.5 py-2 rounded-xl bg-saffron-500/20 hover:bg-saffron-500/30 text-saffron-300 border border-saffron-500/30 text-xs font-semibold transition-all flex items-center space-x-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Session</span>
            </button>
          )}
        </div>
      </div>

      {/* History Drawer Modal / Popover */}
      {showHistory && (
        <motion.div 
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-5 rounded-3xl bg-dark-surface border border-white/10 shadow-2xl space-y-4"
        >
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <History className="w-4 h-4 text-saffron-400" />
              <span>Your Previous Mock Interview Transcripts</span>
            </h3>
            <button onClick={() => setShowHistory(false)} className="text-xs text-slate-400 hover:text-white">
              Close
            </button>
          </div>

          {historySessions.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">No completed interviews yet. Start your first session below!</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {historySessions.map((sess) => (
                <div
                  key={sess.id}
                  onClick={() => handleSelectHistorySession(sess)}
                  className="p-3.5 rounded-2xl bg-white/[0.02] hover:bg-white/[0.05] border border-white/5 hover:border-saffron-500/30 cursor-pointer transition-all space-y-1.5 group"
                >
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-bold text-white group-hover:text-saffron-300 transition-colors">
                      {sess.company}
                    </span>
                    {sess.score !== null && (
                      <span className="text-[11px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                        {Math.round(sess.score * 10) / 10}/10
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-400 truncate">{sess.role}</p>
                  <p className="text-[10px] text-slate-500">
                    {new Date(sess.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </motion.div>
      )}

      {/* Main View: Session Setup vs Live Chat Stream */}
      {!activeSession ? (
        /* Configuration Card: Select Role & Company */
        <div className="p-8 sm:p-12 rounded-3xl bg-white/[0.02] border border-white/5 space-y-8 max-w-2xl mx-auto text-center">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-saffron-500/20 to-brand-500/20 border border-saffron-500/30 flex items-center justify-center text-saffron-400 shadow-glow">
            <Bot className="w-8 h-8" />
          </div>

          <div className="space-y-2">
            <h2 className="text-xl font-black text-white tracking-tight">
              Configure Your Mock Interview
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Select your target role and recruitment company. The AI engine will tailor technical follow-ups, system design trade-offs, and behavioral questions.
            </p>
          </div>

          <div className="space-y-4 text-left">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Role / Designation
              </label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
              >
                <option value="Software Development Engineer (SDE)" className="bg-slate-900">Software Development Engineer (SDE 1)</option>
                <option value="Frontend Engineer" className="bg-slate-900">Frontend Engineer (React/TypeScript)</option>
                <option value="Backend Engineer" className="bg-slate-900">Backend Engineer (Node/Python/Go)</option>
                <option value="Full-Stack Engineer" className="bg-slate-900">Full-Stack Engineer (MERN/PERN)</option>
                <option value="Data Engineer" className="bg-slate-900">Data Engineer & ML Associate</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                Target Company Persona
              </label>
              <select
                value={company}
                onChange={(e) => setCompany(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
              >
                <option value="Zomato" className="bg-slate-900">Zomato (High Concurrency & Low Latency)</option>
                <option value="Swiggy" className="bg-slate-900">Swiggy (Distributed Microservices & Scale)</option>
                <option value="Razorpay" className="bg-slate-900">Razorpay (FinTech Reliability & Idempotency)</option>
                <option value="CRED" className="bg-slate-900">CRED (Event-Driven & Clean Architecture)</option>
                <option value="Amazon" className="bg-slate-900">Amazon (Leadership Principles & System Design)</option>
                <option value="Google" className="bg-slate-900">Google (Data Structures & Algorithmic Rigor)</option>
                <option value="TCS Digital" className="bg-slate-900">TCS Digital / Ninja (Core CS & Problem Solving)</option>
              </select>
            </div>
          </div>

          <button
            onClick={handleStartInterview}
            disabled={isStarting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-bold text-sm shadow-glow transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            {isStarting ? (
              <span>Initializing AI Microservice...</span>
            ) : (
              <>
                <span>Launch Interactive Interview</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        /* Active Interview Chat Room */
        <div className="rounded-3xl bg-white/[0.015] border border-white/5 flex flex-col h-[650px] overflow-hidden shadow-2xl relative">
          
          {/* Interviewer Status Bar */}
          <div className="p-4 bg-white/[0.02] border-b border-white/5 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-saffron-500/15 border border-saffron-500/30 flex items-center justify-center text-saffron-400">
                <Bot className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center space-x-2">
                  <h3 className="text-xs font-bold text-white">{activeSession.company} AI Recruiter</h3>
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
                </div>
                <p className="text-[11px] text-slate-400">Round 1: Technical & Behavioral Deep-Dive • {activeSession.role}</p>
              </div>
            </div>

            {activeSession.score !== null && activeSession.score !== undefined && (
              <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/25 text-saffron-300 font-mono text-xs font-bold">
                <Award className="w-3.5 h-3.5" />
                <span>Session Score: {Math.round(activeSession.score * 10) / 10} / 10</span>
              </div>
            )}
          </div>

          {/* Scrollable Message List */}
          <div className="flex-1 p-4 sm:p-6 overflow-y-auto space-y-6">
            {messages.map((msg, idx) => {
              const isAi = msg.sender === 'ai';
              const evalData = msg.evaluation;

              return (
                <div
                  key={msg.id || idx}
                  className={`flex flex-col ${isAi ? 'items-start' : 'items-end'}`}
                >
                  <div className={`flex items-start space-x-3 max-w-2xl ${isAi ? 'flex-row' : 'flex-row-reverse space-x-reverse'}`}>
                    
                    {/* Avatar */}
                    <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 text-xs font-bold ${
                      isAi 
                        ? 'bg-gradient-to-tr from-saffron-500 to-orange-500 text-white shadow-glow-sm' 
                        : 'bg-brand-500 text-white'
                    }`}>
                      {isAi ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                    </div>

                    {/* Speech Bubble */}
                    <div className={`p-4 rounded-2xl text-xs sm:text-sm leading-relaxed ${
                      isAi
                        ? 'bg-white/[0.04] border border-white/10 text-slate-200'
                        : 'bg-gradient-to-r from-saffron-500/20 to-orange-500/20 border border-saffron-500/30 text-white'
                    }`}>
                      {msg.content}
                    </div>
                  </div>

                  {/* COACH CARD (Only attached to User answers) */}
                  {evalData && (
                    <motion.div
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="mt-3 ml-11 max-w-2xl p-4 rounded-2xl bg-gradient-to-br from-[#121622] to-[#0A0D14] border border-saffron-500/30 space-y-3.5 shadow-lg"
                    >
                      {/* Top Bar: Score & STAR Framework Badges */}
                      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5 border-b border-white/5">
                        <div className="flex items-center space-x-2">
                          <Sparkles className="w-4 h-4 text-saffron-400" />
                          <span className="text-xs font-bold text-white uppercase tracking-wider">
                            AI Coach Critique
                          </span>
                        </div>

                        <div className="flex items-center space-x-3">
                          <span className="text-xs font-mono font-black text-saffron-400 bg-saffron-500/15 px-2.5 py-0.5 rounded-full border border-saffron-500/30">
                            Score: {evalData.score || 8.0} / 10
                          </span>
                          <span className="text-[11px] font-medium text-slate-400">
                            {evalData.confidenceLevel || 'High Confidence'}
                          </span>
                        </div>
                      </div>

                      {/* STAR Method Indicators */}
                      <div>
                        <p className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">
                          STAR Method Calibration
                        </p>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {[
                            { label: 'Situation (S)', detected: evalData.starAnalysis?.situation },
                            { label: 'Task (T)', detected: evalData.starAnalysis?.task },
                            { label: 'Action (A)', detected: evalData.starAnalysis?.action },
                            { label: 'Result (R)', detected: evalData.starAnalysis?.result }
                          ].map((star, i) => (
                            <div
                              key={i}
                              className={`px-2 py-1.5 rounded-lg border text-[11px] flex items-center justify-between font-semibold ${
                                star.detected
                                  ? 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30'
                                  : 'bg-white/[0.02] text-slate-400 border-white/5'
                              }`}
                            >
                              <span>{star.label}</span>
                              {star.detected ? (
                                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                              ) : (
                                <span className="text-[10px] text-slate-500">Missing</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Coach Feedback Note */}
                      {evalData.feedback && (
                        <div className="p-3 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-slate-300 leading-relaxed">
                          <strong className="text-saffron-400 font-medium">Recruiter Insight: </strong>
                          {evalData.feedback}
                        </div>
                      )}

                      {/* Ideal Keywords Found/Suggested */}
                      {evalData.idealAnswerKeywords && evalData.idealAnswerKeywords.length > 0 && (
                        <div className="flex flex-wrap items-center gap-1.5 text-[11px]">
                          <span className="text-slate-500 font-semibold mr-1">Recommended Keywords:</span>
                          {evalData.idealAnswerKeywords.map((kw, i) => (
                            <span key={i} className="px-2 py-0.5 rounded-md bg-white/5 text-slate-300 border border-white/10 font-mono text-[10px]">
                              {kw}
                            </span>
                          ))}
                        </div>
                      )}
                    </motion.div>
                  )}
                </div>
              );
            })}

            {/* Live Typing Indicator */}
            {isEvaluating && (
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 rounded-xl bg-saffron-500/20 text-saffron-400 flex items-center justify-center">
                  <Bot className="w-4 h-4 animate-spin-slow" />
                </div>
                <div className="p-3.5 rounded-2xl bg-white/[0.04] border border-white/10 text-xs text-slate-400 flex items-center space-x-2">
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-saffron-400 animate-bounce"></span>
                    <span className="w-2 h-2 rounded-full bg-saffron-400 animate-bounce [animation-delay:0.2s]"></span>
                    <span className="w-2 h-2 rounded-full bg-saffron-400 animate-bounce [animation-delay:0.4s]"></span>
                  </div>
                  <span>Evaluating answer with Python STAR-NLP engine...</span>
                </div>
              </div>
            )}

            <div ref={chatBottomRef} />
          </div>

          {/* User Input Bar */}
          <form
            onSubmit={handleSubmitAnswer}
            className="p-3 sm:p-4 bg-white/[0.02] border-t border-white/5 flex items-center space-x-3"
          >
            <textarea
              rows={2}
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSubmitAnswer();
                }
              }}
              placeholder="Structure your answer using STAR (Situation, Task, Action, Result)... [Press Enter to Submit]"
              disabled={isEvaluating}
              className="flex-1 p-2.5 rounded-xl bg-white/5 border border-white/10 text-white placeholder-slate-500 text-xs focus:outline-none focus:border-saffron-500 resize-none"
            />
            <button
              type="submit"
              disabled={!currentInput.trim() || isEvaluating}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-xs shadow-glow-sm transition-all disabled:opacity-40 flex items-center space-x-1.5 flex-shrink-0"
            >
              <Send className="w-4 h-4" />
              <span className="hidden sm:inline">Send Answer</span>
            </button>
          </form>
        </div>
      )}
    </div>
  );
};
