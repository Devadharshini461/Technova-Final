import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { DocumentReviewModal } from './DocumentReviewModal';
import { 
  ShieldCheck, Clock, CheckCircle2, AlertCircle, Search, 
  Filter, FileText, ArrowRight, UserCheck, RefreshCw, BarChart2 
} from 'lucide-react';

export const StaffDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [stats, setStats] = useState({ pendingQueueCount: 0, processedCount: 0, approvalRate: 100, avgTurnaroundDays: 1.2 });
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedApp, setSelectedApp] = useState(null);

  useEffect(() => {
    fetchData();
  }, [search]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [appsRes, statsRes] = await Promise.all([
        axios.get('/api/applications', { params: { search } }),
        axios.get('/api/staff/stats')
      ]);
      // Filter for staff queue
      const staffQueue = appsRes.data.filter(a => a.status === 'under_review' || a.assignedStaffId === user?.id);
      setApplications(staffQueue);
      setStats(statsRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Banner */}
        <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-400/30 mb-3">
              <UserCheck className="w-4 h-4" /> Verification & Inspection Officer Desk
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name || 'Staff Officer'}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Department: <strong className="text-indigo-300">{user?.department || 'Document Verification Cell'}</strong> • Role ID: {user?.id}
            </p>
          </div>

          <button 
            onClick={fetchData}
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

        {/* Search Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
          <div className="relative w-full sm:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search applicant name, scheme, app ID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <div className="text-xs font-semibold text-slate-500">
            Assigned Applications Queue ({applications.length})
          </div>
        </div>

        {/* Verification Queue Table */}
        <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <FileText className="w-5 h-5 text-indigo-600" /> Verification Review Queue
            </h2>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-400 font-medium">Loading assigned verification queue...</div>
          ) : applications.length === 0 ? (
            <div className="p-12 text-center text-slate-500">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <div className="font-bold text-slate-800">Review Queue Empty!</div>
              <div className="text-xs text-slate-400 mt-1">All assigned applications have been inspected and processed.</div>
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
                  {applications.map((app) => (
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
                        <button
                          onClick={() => setSelectedApp(app)}
                          className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-500 shadow-md shadow-indigo-600/20 transition inline-flex items-center gap-1.5"
                        >
                          Inspect & Verify <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  ))}
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
            onSuccess={() => {
              setSelectedApp(null);
              fetchData();
            }}
          />
        )}
      </div>
    </div>
  );
};
