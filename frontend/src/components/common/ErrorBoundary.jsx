import React from 'react';
import { AlertTriangle, RefreshCw, Terminal, Home, Sparkles } from 'lucide-react';

export class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showStack: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('[ErrorBoundary caught error]:', error, errorInfo);
    this.setState({ errorInfo });
  }

  handleReset = () => {
    localStorage.removeItem('copilot_user');
    localStorage.removeItem('copilot_token');
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#080B11] text-slate-100 flex items-center justify-center p-4">
          <div className="w-full max-w-2xl rounded-3xl glass-panel p-8 sm:p-10 border border-white/10 shadow-2xl relative overflow-hidden">
            {/* Background Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="relative z-10 space-y-6">
              {/* Error Badge */}
              <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold">
                <AlertTriangle className="w-4 h-4 text-rose-400" />
                <span>Runtime Diagnostics Caught Exception</span>
              </div>

              {/* Title */}
              <div>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  Component Render Error Handled
                </h1>
                <p className="mt-2 text-sm text-slate-400 leading-relaxed">
                  The application caught an unexpected error during rendering. Your data is safe. You can reload the application or reset to demo mode below.
                </p>
              </div>

              {/* Error Message Box */}
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <p className="text-xs font-mono font-semibold text-rose-400">
                  {this.state.error?.toString() || 'Unknown Error'}
                </p>
                {this.state.errorInfo?.componentStack && (
                  <div className="pt-2">
                    <button
                      onClick={() => this.setState({ showStack: !this.state.showStack })}
                      className="text-xs text-slate-400 hover:text-white flex items-center space-x-1 font-mono underline"
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      <span>{this.state.showStack ? 'Hide Stack Trace' : 'View Component Stack'}</span>
                    </button>
                    {this.state.showStack && (
                      <pre className="mt-2 p-3 rounded-xl bg-black/60 text-[11px] text-slate-400 font-mono overflow-x-auto max-h-48 border border-white/5">
                        {this.state.errorInfo.componentStack}
                      </pre>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                <button
                  onClick={() => window.location.reload()}
                  className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-brand-600 to-indigo-600 hover:from-brand-500 hover:to-indigo-500 text-white font-semibold text-xs shadow-glow-sm transition-all flex items-center space-x-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Reload Application</span>
                </button>
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 font-semibold text-xs border border-white/10 transition-colors flex items-center space-x-2"
                >
                  <Sparkles className="w-4 h-4 text-brand-400" />
                  <span>Clear Cache & Reset Demo</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
