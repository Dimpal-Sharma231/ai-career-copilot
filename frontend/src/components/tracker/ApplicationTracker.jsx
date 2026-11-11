import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Kanban, 
  Table2, 
  Plus, 
  ExternalLink, 
  Search, 
  Filter, 
  Trash2, 
  Calendar, 
  X,
  Briefcase,
  CheckCircle2,
  DollarSign
} from 'lucide-react';

const STATUS_COLUMNS = [
  { id: 'Applied', label: 'Applied / OA Round', color: 'border-blue-500/30 text-blue-400 bg-blue-500/10' },
  { id: 'Interviewing', label: 'Interviewing (Tech/DSA)', color: 'border-saffron-500/30 text-saffron-300 bg-saffron-500/10' },
  { id: 'Offered', label: 'Offered / PPO', color: 'border-emerald-500/30 text-emerald-400 bg-emerald-500/10' },
  { id: 'Rejected', label: 'Rejected', color: 'border-rose-500/30 text-rose-400 bg-rose-500/10' }
];

export const ApplicationTracker = ({ 
  applications = [], 
  onAddApplication, 
  onUpdateStatus, 
  onDeleteApplication,
  triggerToast 
}) => {
  const [viewMode, setViewMode] = useState('kanban'); // 'kanban' or 'table'
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // New Application Form State with Salary & Deadline support
  const [formData, setFormData] = useState({
    company: '',
    role: '',
    salary: '',
    deadline: '',
    link: '',
    status: 'Applied',
    appliedDate: new Date().toISOString().split('T')[0],
    matchScore: 85,
    notes: ''
  });

  const handleFormSubmit = async (e) => {
    e.preventDefault();
    if (!formData.company || !formData.role) return;

    if (onAddApplication) {
      await onAddApplication(formData);
    }
    setIsAddModalOpen(false);
    setFormData({
      company: '',
      role: '',
      salary: '',
      deadline: '',
      link: '',
      status: 'Applied',
      appliedDate: new Date().toISOString().split('T')[0],
      matchScore: 85,
      notes: ''
    });
  };

  const filteredApps = applications.filter(app => {
    const matchesSearch =
      (app.company || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (app.role || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || app.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <motion.div 
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="space-y-8 max-w-7xl mx-auto"
    >
      {/* Header Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Placement Application Tracker
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-saffron-500/20 text-saffron-300 border border-saffron-500/30 font-mono font-semibold">
              {applications.length} Drives Saved
            </span>
          </div>
          <p className="mt-1 text-sm text-slate-400">
            Monitor and advance your recruitment pipeline across stages from submission to offer.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-white/5 border border-white/10">
            <button
              onClick={() => setViewMode('kanban')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                viewMode === 'kanban'
                  ? 'bg-saffron-500 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Kanban className="w-3.5 h-3.5" />
              <span>Kanban</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`p-2 rounded-lg text-xs font-medium flex items-center space-x-1.5 transition-all ${
                viewMode === 'table'
                  ? 'bg-saffron-500 text-white shadow-glow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Table2 className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
          </div>

          {/* Add Application CTA */}
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-saffron-500 via-orange-500 to-brand-500 hover:from-saffron-400 hover:to-orange-400 text-white text-xs font-semibold shadow-glow hover:shadow-glow-lg transition-all flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Track Application</span>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 rounded-2xl bg-white/[0.02] border border-white/5">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search company or role..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-saffron-500 transition-colors"
          />
        </div>

        <div className="flex items-center space-x-2 w-full sm:w-auto overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              statusFilter === 'all'
                ? 'bg-saffron-500/20 text-saffron-300 border border-saffron-500/30'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            All ({applications.length})
          </button>
          {STATUS_COLUMNS.map((col) => {
            const count = applications.filter(a => a.status === col.id).length;
            return (
              <button
                key={col.id}
                onClick={() => setStatusFilter(col.id)}
                className={`px-3 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-all ${
                  statusFilter === col.id
                    ? 'bg-saffron-500/20 text-saffron-300 border border-saffron-500/30'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {col.label.split(' ')[0]} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Empty State */}
      {applications.length === 0 ? (
        <div className="p-12 rounded-3xl bg-white/[0.015] border border-dashed border-white/10 text-center space-y-4">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-slate-400">
            <Briefcase className="w-8 h-8 text-saffron-400" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-lg font-bold text-white">No applications tracked yet</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Track your campus placement drives and off-campus tech roles (e.g. Zomato, Razorpay, Flipkart, Swiggy) to follow your interview conversion rates.
            </p>
          </div>
          <button
            onClick={() => setIsAddModalOpen(true)}
            className="px-5 py-2.5 rounded-xl bg-saffron-500 hover:bg-saffron-400 text-white font-semibold text-xs shadow-glow-sm transition-all inline-flex items-center space-x-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Add First Application</span>
          </button>
        </div>
      ) : viewMode === 'kanban' ? (
        /* Kanban Board View */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {STATUS_COLUMNS.map((col) => {
            const colApps = filteredApps.filter(a => a.status === col.id);
            return (
              <div
                key={col.id}
                className="rounded-3xl bg-white/[0.015] border border-white/5 p-4 flex flex-col space-y-3 min-h-[450px]"
              >
                {/* Column Header */}
                <div className="flex items-center justify-between pb-3 border-b border-white/5">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold text-white">{col.label}</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold bg-white/5 text-slate-300">
                      {colApps.length}
                    </span>
                  </div>
                </div>

                {/* Column Cards */}
                <div className="space-y-3 flex-1 overflow-y-auto">
                  {colApps.map((app) => (
                    <div
                      key={app.id}
                      className="p-4 rounded-2xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/5 hover:border-saffron-500/30 transition-all space-y-3 group"
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-sm font-bold text-white group-hover:text-saffron-300 transition-colors">
                            {app.company}
                          </h4>
                          <p className="text-xs text-slate-300 mt-0.5">{app.role}</p>
                        </div>
                        <button
                          onClick={() => onDeleteApplication(app.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 transition-all"
                          title="Delete application"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {app.notes && (
                        <p className="text-[11px] text-slate-400 bg-white/[0.02] p-2 rounded-lg border border-white/5">
                          {app.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between pt-1 text-[11px] text-slate-400">
                        <span className="font-mono text-emerald-400 font-semibold">
                          {app.matchScore}% Match
                        </span>
                        <span>{new Date(app.appliedDate).toLocaleDateString()}</span>
                      </div>

                      {/* Status Transition Selector */}
                      <div className="pt-2 border-t border-white/5">
                        <select
                          value={app.status}
                          onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                          className="w-full px-2 py-1 rounded-lg bg-[#0F1422] border border-white/10 text-[11px] text-slate-300 focus:outline-none focus:border-saffron-500"
                        >
                          <option value="Applied">Move to: Applied</option>
                          <option value="Interviewing">Move to: Interviewing</option>
                          <option value="Offered">Move to: Offered / PPO</option>
                          <option value="Rejected">Move to: Rejected</option>
                        </select>
                      </div>
                    </div>
                  ))}

                  {colApps.length === 0 && (
                    <div className="h-32 flex items-center justify-center border border-dashed border-white/5 rounded-2xl text-[11px] text-slate-500">
                      Empty stage
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Table View */
        <div className="p-4 rounded-3xl bg-white/[0.02] border border-white/5 overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-white/10 text-slate-400 uppercase font-semibold text-[10px] tracking-wider">
                <th className="py-3 px-4">Company</th>
                <th className="py-3 px-4">Role</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Job Fit %</th>
                <th className="py-3 px-4">Details / Notes</th>
                <th className="py-3 px-4">Applied Date</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {filteredApps.map((app) => (
                <tr key={app.id} className="hover:bg-white/[0.02] transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-white">{app.company}</td>
                  <td className="py-3.5 px-4 text-slate-300">{app.role}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={app.status}
                      onChange={(e) => onUpdateStatus(app.id, e.target.value)}
                      className="px-2 py-1 rounded-lg bg-[#0F1422] border border-white/10 text-xs text-slate-300 focus:outline-none"
                    >
                      <option value="Applied">Applied</option>
                      <option value="Interviewing">Interviewing</option>
                      <option value="Offered">Offered</option>
                      <option value="Rejected">Rejected</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 font-mono font-bold text-emerald-400">
                    {app.matchScore}%
                  </td>
                  <td className="py-3.5 px-4 text-slate-400 max-w-xs truncate">
                    {app.notes || '—'}
                  </td>
                  <td className="py-3.5 px-4 text-slate-400">
                    {new Date(app.appliedDate).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <button
                      onClick={() => onDeleteApplication(app.id)}
                      className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Add Application Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg rounded-3xl glass-panel p-6 space-y-5 border border-saffron-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center space-x-2">
                <Briefcase className="w-5 h-5 text-saffron-400" />
                <h3 className="text-base font-bold text-white">Track New Job Application</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                    placeholder="e.g. Zomato, Razorpay, Flipkart"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Role Title *</label>
                  <input
                    type="text"
                    required
                    value={formData.role}
                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                    placeholder="e.g. SDE-1, Backend Intern"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Salary / Stipend</label>
                  <input
                    type="text"
                    value={formData.salary}
                    onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                    placeholder="e.g. ₹18-24 LPA or ₹60k/mo"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Application Deadline</label>
                  <input
                    type="date"
                    value={formData.deadline}
                    onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F1422] border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Pipeline Stage</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-[#0F1422] border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500"
                  >
                    <option value="Applied">Applied / OA Round</option>
                    <option value="Interviewing">Interviewing (Tech/DSA)</option>
                    <option value="Offered">Offered / PPO</option>
                    <option value="Rejected">Rejected</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-300">Estimated Match %</label>
                  <input
                    type="number"
                    min="50"
                    max="100"
                    value={formData.matchScore}
                    onChange={(e) => setFormData({ ...formData, matchScore: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-300">Recruiter Notes / Drive Info</label>
                <textarea
                  rows={2}
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  placeholder="On-campus Day-1 schedule, round details, referral contact..."
                  className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:outline-none focus:border-saffron-500 resize-none"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-3 border-t border-white/5">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-gradient-to-r from-saffron-500 to-orange-500 hover:from-saffron-400 hover:to-orange-400 text-white text-xs font-semibold shadow-glow-sm"
                >
                  Save to Pipeline
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </motion.div>
  );
};
