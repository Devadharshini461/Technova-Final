import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { DocumentReviewModal } from './DocumentReviewModal';
import { 
  ShieldCheck, Clock, CheckCircle2, Search, 
  FileText, ArrowRight, UserCheck, RefreshCw, BarChart2 
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ pendingQueueCount: 0, processedCount: 0, approvalRate: 100, avgTurnaroundDays: 1.2 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  const [statusFilter, setStatusFilter] = useState('ALL');

  const statusOptions = [
    { label: 'ALL', value: 'ALL' },
    { label: 'Pending Review', value: 'under_review' },
    { label: 'Pending Admin Approval', value: 'pending_admin_approval' },
    { label: 'Approved', value: 'approved' },
    { label: 'Rejected', value: 'rejected' },
    { label: 'Disbursed', value: 'disbursed' }
  ];

  useEffect(() => {
    fetchData(true);
  }, [search]);

  // Silent refresh handler: Only set loading on initial boot to prevent scroll resets
  const fetchData = async (isInitial = false) => {
    if (isInitial && applications.length === 0) {
      setLoading(true);
    }
    try {
      const [appsRes, statsRes] = await Promise.all([
        axios.get('/api/applications', { params: { search } }),
        axios.get('/api/staff/stats')
      ]);
      setApplications(appsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAppUpdate = (updatedApp) => {
    // Update applications list in-place in background without altering selectedApp reference
    setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
  };

  // Requirement #15: Filter queue by selected status tab
  const displayApplications = applications.filter(app => {
    if (statusFilter === 'ALL') return true;
    return app.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
            <UserCheck className="w-4 h-4" /> Verification & Inspection Officer Desk
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name || 'Staff Officer'}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            Department: <strong className="text-indigo-300">{user?.department || 'Document Verification Cell'}</strong> • Email: {user?.email}
          </p>
        </div>

        <button 
          type="button"
          onClick={() => fetchData(false)}
          className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition flex items-center gap-2"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Review Queue
        </button>
      </div>

      {/* Workload Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Pending Verification</div>
            <div className="text-xl font-extrabold text-amber-600 mt-0.5">{stats.pendingQueueCount} Apps</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Processed Complete</div>
            <div className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.processedCount} Apps</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BarChart2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Approval Ratio</div>
            <div className="text-xl font-extrabold text-blue-700 mt-0.5">{stats.approvalRate}%</div>
          </div>
        </div>

        <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm flex items-center gap-4">
          <div className="w-11 h-11 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center font-bold">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-[10px] text-slate-400 font-semibold uppercase">Avg Turnaround</div>
            <div className="text-xl font-extrabold text-slate-800 mt-0.5">{stats.avgTurnaroundDays} Days</div>
          </div>
        </div>
      </div>

      {/* Search & Requirement #15: Status Filters Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search applicant name, scheme, app ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />
        </div>

        {/* Requirement #15: Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {statusOptions.map(opt => (
            <button
              type="button"
              key={opt.value}
              onClick={() => setStatusFilter(opt.value)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition ${
                statusFilter === opt.value
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Verification Queue Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FileText className="w-5 h-5 text-indigo-600" /> Verification Review Queue ({displayApplications.length})
          </h2>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium text-xs">Loading assigned verification queue...</div>
        ) : displayApplications.length === 0 ? (
          <div className="p-12 text-center text-slate-500">
            <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
            <div className="font-bold text-slate-800">No Applications Found for Selected Filter</div>
            <div className="text-xs text-slate-400 mt-1">Try switching status filters or clear search term.</div>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">App ID</th>
                  <th className="py-3.5 px-6">Applicant Name</th>
                  <th className="py-3.5 px-6">Scheme Name</th>
                  <th className="py-3.5 px-6">Academic Marks</th>
                  <th className="py-3.5 px-6">Family Income</th>
                  <th className="py-3.5 px-6">Current Status</th>
                  <th className="py-3.5 px-6 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs">
                {displayApplications.map((app) => {
                  // Requirement #3: Disable button if staff already recommended approval/rejection or application status is no longer under_review
                  const isDecisionMade = Boolean(app.staffRecommendation) || app.status !== 'under_review';

                  return (
                    <tr key={app.id} className="hover:bg-slate-50/80 transition">
                      <td className="py-4 px-6 font-mono font-bold text-indigo-600">{app.id}</td>
                      <td className="py-4 px-6">
                        <div className="font-bold text-slate-900">{app.studentName}</div>
                        <div className="text-[10px] text-slate-400">{app.college}</div>
                      </td>
                      <td className="py-4 px-6">
                        <div className="font-semibold text-slate-800 line-clamp-1">{app.scholarshipTitle}</div>
                        <div className="text-[10px] text-slate-400">Award: ₹{app.scholarshipAmount?.toLocaleString()}</div>
                      </td>
                      <td className="py-4 px-6 font-extrabold text-blue-700">{app.marksPercentage}%</td>
                      <td className="py-4 px-6 font-bold text-slate-900">₹{app.familyIncome?.toLocaleString()}</td>
                      <td className="py-4 px-6">
                        <StatusBadge status={app.status} />
                      </td>
                      <td className="py-4 px-6 text-right">
                        {/* Requirement #3: Disabled Inspect & Verify Button */}
                        <button
                          type="button"
                          disabled={isDecisionMade}
                          onClick={(e) => {
                            e.preventDefault();
                            if (!isDecisionMade) setSelectedApp(app);
                          }}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition inline-flex items-center gap-1.5 ${
                            isDecisionMade
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                              : 'text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 cursor-pointer'
                          }`}
                          title={isDecisionMade ? 'Inspection and recommendation already completed' : 'Inspect documents & make decision'}
                        >
                          {isDecisionMade ? 'Verified / Decision Made' : 'Inspect & Verify'} {!isDecisionMade && <ArrowRight className="w-3.5 h-3.5" />}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {selectedApp && (
        <DocumentReviewModal
          application={selectedApp}
          onClose={() => setSelectedApp(null)}
          onUpdateDoc={handleAppUpdate}
          onSuccess={(updatedApp) => {
            setSelectedApp(null);
            if (updatedApp && updatedApp.id) {
              setApplications(prev => prev.map(a => a.id === updatedApp.id ? updatedApp : a));
              axios.get('/api/staff/stats').then(res => setStats(res.data)).catch(console.error);
            } else {
              fetchData(false);
            }
          }}
        />
      )}
    </div>
  );
};
