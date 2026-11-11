import React from 'react';
import { 
  Sparkles, 
  ArrowRight, 
  CheckCircle2, 
  FileText, 
  Crosshair, 
  Kanban, 
  Cpu, 
  Zap, 
  ShieldCheck, 
  TrendingUp, 
  Award,
  ChevronRight,
  Code2,
  Terminal,
  ExternalLink,
  Flame,
  BookOpen,
  GraduationCap
} from 'lucide-react';

export const LandingPage = ({ onGetStarted, onLaunchDemo }) => {
  const indianCompanies = [
    { name: 'Zomato', tag: 'SDE-1 & Platform' },
    { name: 'Razorpay', tag: 'Fintech & Checkout' },
    { name: 'Swiggy', tag: 'Logistics Fleet' },
    { name: 'CRED', tag: 'Backend Platform' },
    { name: 'Flipkart', tag: 'E-commerce Scale' },
    { name: 'TCS Digital', tag: 'Prime SDE Band' },
    { name: 'Infosys', tag: 'Specialist Programmer' }
  ];

  const features = [
    {
      icon: FileText,
      tag: 'Day 1 Screening',
      title: 'Resume Shortlist Scoring',
      description: 'PyPDF2 microservice extracts unstructured text, verifies ATS compliance, and scores shortlist probability for top Indian recruiters in under 500ms.',
      gradient: 'from-saffron-500/20 to-orange-500/10'
    },
    {
      icon: Crosshair,
      tag: 'TF-IDF Cosine Matcher',
      title: 'Target Job Fit % Analyzer',
      description: 'Calculates cosine similarity between your resume and real SDE JDs from Naukri.com, Internshala, and LinkedIn to pinpoint exact keyword gaps.',
      gradient: 'from-orange-500/20 to-brand-500/10'
    },
    {
      icon: TrendingUp,
      tag: 'DSA & Tech Alignment',
      title: 'Actionable Skill Remediation',
      description: 'Know what you are missing before OA rounds. Bridges missing frameworks, system design concepts, and Striver SDE sheet patterns.',
      gradient: 'from-emerald-500/20 to-teal-500/10'
    },
    {
      icon: Kanban,
      tag: 'Campus & Off-Campus',
      title: 'Placement Pipeline Tracker',
      description: 'A focused, clutter-free application board tailored for on-campus drives, off-campus hiring, and PPO internship conversions.',
      gradient: 'from-brand-500/20 to-indigo-500/10'
    }
  ];

  const metrics = [
    { label: 'Campus Shortlist Bump', value: '+42%' },
    { label: 'Indian Tech Skills Indexed', value: '180k+' },
    { label: 'Interview Conversion Rate', value: '3.6x' },
    { label: 'Average Placement CTC', value: '₹18.4 LPA' }
  ];

  return (
    <div className="relative overflow-hidden">
      {/* Background radial gradients */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[600px] hero-glow pointer-events-none"></div>
      <div className="absolute -top-40 right-10 w-96 h-96 bg-saffron-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute top-96 -left-20 w-80 h-80 bg-brand-500/10 rounded-full blur-3xl pointer-events-none"></div>

      {/* Hero Section */}
      <section className="relative pt-20 pb-20 md:pt-28 md:pb-32 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        {/* Release Tag */}
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-white/[0.04] border border-white/10 text-xs text-slate-300 mb-8 backdrop-blur-md shadow-glow-sm">
          <span>🇮🇳</span>
          <span className="font-semibold text-saffron-400">Placement Season 2026-27</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300 flex items-center space-x-1">
            <span>Built for Indian Engineering Students</span>
            <ChevronRight className="w-3 h-3 inline text-saffron-400" />
          </span>
        </div>

        {/* User Required Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-white max-w-4xl mx-auto leading-[1.1]">
          Stop getting rejected.{' '}
          <span className="bg-gradient-to-r from-saffron-400 via-orange-400 to-amber-300 bg-clip-text text-transparent">
            Land your dream tech internship with AI.
          </span>
        </h1>

        {/* Subtitle */}
        <p className="mt-6 text-lg sm:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Engineered specifically for Tier 1 & Tier 2 engineering students in India. Parse your resume, calculate exact Job Fit % against Zomato, Razorpay, or Swiggy JDs, and crack on-campus placements.
        </p>

        {/* CTA Buttons */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
          <button
            onClick={() => onGetStarted('register')}
            className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-base shadow-glow hover:shadow-glow-lg transition-all flex items-center justify-center space-x-2 group"
          >
            <span>Start Placement Prep Free 🚀</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
          <button
            onClick={onLaunchDemo}
            className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-white/[0.05] hover:bg-white/[0.08] text-slate-200 font-semibold text-base border border-white/10 transition-all flex items-center justify-center space-x-2"
          >
            <span>Explore Demo (Rahul • VIT)</span>
            <Sparkles className="w-4 h-4 text-saffron-400" />
          </button>
        </div>

        {/* Trust Badges */}
        <div className="mt-12 text-xs text-slate-400 flex flex-wrap items-center justify-center gap-6">
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Campus Placement Shortlist Tested</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Naukri & Internshala JD Compatible</span>
          </span>
          <span className="flex items-center space-x-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>DSA & SDE Sheet Synergy</span>
          </span>
        </div>

        {/* Interactive Mock Interface Preview */}
        <div className="mt-16 relative max-w-5xl mx-auto">
          <div className="relative rounded-2xl p-1 bg-gradient-to-b from-white/15 via-white/5 to-transparent shadow-2xl">
            <div className="rounded-xl bg-[#0B0F19] border border-white/10 p-4 sm:p-6 text-left overflow-hidden">
              {/* Window Controls */}
              <div className="flex items-center justify-between pb-4 border-b border-white/5 mb-6">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-amber-500/80"></div>
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80"></div>
                  <span className="ml-2 font-mono text-xs text-slate-400">career-copilot-in://placements/zomato-sde1</span>
                </div>
                <div className="flex items-center space-x-2 text-xs font-mono text-saffron-400 bg-saffron-500/10 px-2.5 py-1 rounded-md border border-saffron-500/20">
                  <span>FastAPI TF-IDF • Ready</span>
                </div>
              </div>

              {/* Sample Live Mock Analysis Showcase */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-center">
                <div className="space-y-4">
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-slate-400">Target Role</p>
                    <p className="text-sm font-semibold text-white">SDE-1 (Backend / Platform Engineering)</p>
                    <p className="text-xs text-saffron-400 mt-1">Zomato • Gurgaon / Bangalore</p>
                  </div>
                  <div className="p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <p className="text-xs text-slate-400">Candidate Profile</p>
                    <p className="text-sm font-semibold text-slate-200">Rahul_Sharma_BTech_CSE.pdf</p>
                    <p className="text-xs text-emerald-400 mt-1">Shortlist Score: 94/100 (High Likelihood)</p>
                  </div>
                </div>

                {/* Center Gauge */}
                <div className="flex flex-col items-center justify-center p-6 rounded-2xl bg-gradient-to-b from-saffron-950/30 to-dark-surface border border-saffron-500/20">
                  <div className="relative flex items-center justify-center">
                    <svg className="w-32 h-32 -rotate-90">
                      <circle cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" className="text-slate-800" fill="transparent" />
                      <circle 
                        cx="64" cy="64" r="54" stroke="currentColor" strokeWidth="8" 
                        strokeDasharray={339} 
                        strokeDashoffset={339 * (1 - 0.92)} 
                        className="text-saffron-500 transition-all duration-1000" 
                        strokeLinecap="round" 
                        fill="transparent" 
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                      <span className="text-3xl font-extrabold text-white font-mono">92%</span>
                      <span className="text-[10px] uppercase font-semibold text-saffron-300 tracking-wider">Job Fit %</span>
                    </div>
                  </div>
                  <span className="mt-3 text-xs font-medium text-emerald-400 flex items-center space-x-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Prime SDE Shortlist Ready</span>
                  </span>
                </div>

                {/* Skills tags breakdown */}
                <div className="space-y-3">
                  <div>
                    <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Skills Matched (8)</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['C++', 'Node.js', 'PostgreSQL', 'Redis', 'Docker', 'DSA', 'REST APIs'].map(s => (
                        <span key={s} className="px-2 py-1 rounded-md text-xs bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                          ✓ {s}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div>
                    <span className="text-xs font-semibold text-amber-400 uppercase tracking-wider">Missing Skill Gaps (2)</span>
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {['Kafka / Message Queues', 'gRPC'].map(s => (
                        <span key={s} className="px-2 py-1 rounded-md text-xs bg-amber-500/10 text-amber-300 border border-amber-500/20">
                          ! {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Indian Tech Companies Bar */}
      <section className="py-8 border-y border-white/5 bg-[#0A0E17]/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
            Calibrated for Top Indian Product Companies & Campus Recruiters
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {indianCompanies.map((c, i) => (
              <div key={i} className="flex items-center space-x-2 px-3 py-1.5 rounded-xl bg-white/[0.02] border border-white/5">
                <span className="text-sm font-bold text-white">{c.name}</span>
                <span className="text-[10px] text-saffron-400 font-mono">({c.tag})</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* User Required Special Section: "Built for Indian Engineering Students" */}
      <section id="indian-tech" className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl p-8 sm:p-12 border border-saffron-500/20 bg-gradient-to-br from-saffron-950/20 via-[#0A0E17] to-brand-950/20 relative overflow-hidden">
          
          <div className="max-w-3xl mb-12">
            <span className="text-xs font-bold uppercase tracking-wider text-saffron-400 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/20">
              Tailored for Tier 1 & Tier 2 Campuses
            </span>
            <h2 className="mt-4 text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
              Built specifically for Indian Engineering Students
            </h2>
            <p className="mt-3 text-slate-300 text-base leading-relaxed">
              Western career platforms don't understand how Indian campus placements work. AI Career Copilot is engineered around the realities of On-Campus Day 1 drives, Off-Campus coding rounds, and DSA-heavy technical interviews.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center text-saffron-400 font-bold">
                01
              </div>
              <h3 className="text-lg font-bold text-white">Day 1 Shortlist Optimization</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                When 2,000 students apply for 30 SDE openings at Flipkart or Zomato, automated filters reject 85% of resumes. Our parser ensures your keywords match the placement criteria.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-brand-500/10 border border-brand-500/20 flex items-center justify-center text-brand-400 font-bold">
                02
              </div>
              <h3 className="text-lg font-bold text-white">Naukri & Internshala JDs</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Directly paste unformatted job postings from Naukri.com, Internshala, or LinkedIn India. Our TF-IDF model parses messy Indian recruitment specs instantly.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 font-bold">
                03
              </div>
              <h3 className="text-lg font-bold text-white">DSA & Striver Sheet Sync</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Track your LeetCode streaks and Striver SDE sheet completion alongside your resumes. Highlight your competitive coding achievements where recruiters look first.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <span className="text-xs font-bold uppercase tracking-wider text-saffron-400 px-3 py-1 rounded-full bg-saffron-500/10 border border-saffron-500/20">
            Next-Gen Placement Tooling
          </span>
          <h2 className="mt-4 text-3xl sm:text-4xl font-bold text-white tracking-tight">
            Everything you need to turn campus rejection into SDE offers
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {features.map((feat, index) => {
            const Icon = feat.icon;
            return (
              <div
                key={index}
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:border-saffron-500/30 hover:bg-white/[0.04] transition-all group relative overflow-hidden"
              >
                <div className={`absolute top-0 right-0 w-64 h-64 bg-gradient-to-br ${feat.gradient} rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none`}></div>
                
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-saffron-500/10 border border-saffron-500/20 flex items-center justify-center text-saffron-400 group-hover:scale-110 transition-transform">
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-white/5 text-slate-400 border border-white/5">
                    {feat.tag}
                  </span>
                </div>

                <h3 className="text-xl font-semibold text-white mb-2">{feat.title}</h3>
                <p className="text-sm text-slate-400 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* CTA Bottom Banner */}
      <section className="py-20 text-center max-w-4xl mx-auto px-4">
        <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
          Ready to crack Day 1 Placements? 🚀
        </h2>
        <p className="mt-4 text-slate-300 text-base max-w-xl mx-auto">
          Test your resume against top Indian tech roles today. Free for students from IITs, NITs, BITS, VIT, and engineering colleges across India.
        </p>
        <div className="mt-8 flex justify-center">
          <button
            onClick={() => onGetStarted('register')}
            className="px-8 py-3.5 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white font-semibold text-base shadow-glow hover:shadow-glow-lg transition-all"
          >
            Start Placement Preparation Free
          </button>
        </div>
      </section>
    </div>
  );
};
