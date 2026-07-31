import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatusBadge } from '../../components/StatusBadge';
import { 
  CheckCircle2, XCircle, ShieldAlert, DollarSign, RefreshCw, 
  Search, Shield, AlertTriangle, MessageSquare, ArrowRight 
} from 'lucide-react';

export const ApprovalQueue = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [overrideApp, setOverrideApp] = useState(null);
  const [overrideJustification, setOverrideJustification] = useState('');
  const [overrideDecision, setOverrideDecision] = useState('approved');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, [search]);

  const fetchApplications = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/applications', { params: { search } });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId) => {
    try {
      await axios.patch(`/api/applications/${appId}/approve`, { remark: 'Final Executive Approval Granted' });
      fetchApplications();
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (appId) => {
    const remark = prompt('Enter rejection reason for audit log:');
    if (remark !== null) {
      try {
        await axios.patch(`/api/applications/${appId}/reject`, { remark });
        fetchApplications();
      } catch (err) {
        alert(err.response?.data?.message || 'Rejection failed');
      }
    }
  };

  const handleDisburse = async (appId) => {
    if (window.confirm('Trigger instant fund transfer transaction via NPCI/DBT bridge?')) {
      try {
        await axios.patch(`/api/applications/${appId}/disburse`);
        fetchApplications();
      } catch (err) {
        alert(err.response?.data?.message || 'Disbursement failed');
      }
    }
  };

  const handleSubmitOverride = async (e) => {
    e.preventDefault();
    setError('');

    if (!overrideJustification || overrideJustification.trim().length < 5) {
      setError('Mandatory justification statement required (at least 5 characters)');
      return;
    }

    try {
      await axios.patch(`/api/applications/${overrideApp.id}/override`, {
        decision: overrideDecision,
        justification: overrideJustification
      });
      setOverrideApp(null);
      setOverrideJustification('');
      fetchApplications();
    } catch (err) {
      setError(err.response?.data?.message || 'Override action failed');
    }
  };

  const pendingAdminApps = applications.filter(a => a.status === 'pending_admin_approval');
  const approvedApps = applications.filter(a => a.status === 'approved');

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Executive Approval & Disbursement Queue</h2>
          <p className="text-xs text-slate-500 mt-0.5">Final authorization clearance, executive override authority, and fund disbursement engine.</p>
        </div>

        <button
          onClick={fetchApplications}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Queue
        </button>
      </div>

      {/* Pending Clearance Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-amber-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-amber-600" />
            <h3 className="text-sm font-bold text-amber-950">Awaiting Final Admin Clearance ({pendingAdminApps.length})</h3>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs">Loading pending queue...</div>
        ) : pendingAdminApps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No applications currently pending executive clearance.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {pendingAdminApps.map((app) => (
              <div key={app.id} className="p-6 hover:bg-slate-50/80 transition space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-700">{app.id}</span>
                      <StatusBadge status={app.status} />
                    </div>
                    <h4 className="text-base font-bold text-slate-900 mt-1">{app.studentName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Scheme: <strong className="text-slate-800">{app.scholarshipTitle}</strong> • Award: <strong className="text-blue-700">₹{app.scholarshipAmount?.toLocaleString()}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleApprove(app.id)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Final Approve
                    </button>
                    <button
                      onClick={() => handleReject(app.id)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      onClick={() => {
                        setOverrideApp(app);
                        setOverrideJustification('');
                      }}
                      className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 font-bold text-xs border border-amber-200 transition flex items-center gap-1"
                    >
                      <Shield className="w-4 h-4 text-amber-600" /> Admin Override
                    </button>
                  </div>
                </div>

                {/* Staff Recommendation Summary */}
                <div className="p-3 rounded-2xl bg-indigo-50/60 border border-indigo-100 text-indigo-950 flex items-center gap-3">
                  <MessageSquare className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <span className="font-bold">Staff Inspector Recommendation:</span> {app.assignedStaffName} marked "{app.staffRecommendation?.replace('_', ' ')}". 
                    <span className="italic text-indigo-800 ml-1">"{app.staffRemarks || 'Documents authentic and verified'}"</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Ready for Disbursement Section */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 bg-cyan-50/40 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-5 h-5 text-cyan-700" />
            <h3 className="text-sm font-bold text-cyan-950">Approved Applications Ready for Disbursement ({approvedApps.length})</h3>
          </div>
        </div>

        {approvedApps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No applications waiting for disbursement trigger.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase">
                  <th className="py-3 px-6">App ID</th>
                  <th className="py-3 px-6">Student Name</th>
                  <th className="py-3 px-6">Grant Amount</th>
                  <th className="py-3 px-6">Bank Account Ref</th>
                  <th className="py-3 px-6 text-right">Disbursement Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {approvedApps.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50 transition">
                    <td className="py-4 px-6 font-mono font-bold text-slate-700">{app.id}</td>
                    <td className="py-4 px-6 font-bold text-slate-900">{app.studentName}</td>
                    <td className="py-4 px-6 font-extrabold text-blue-700">₹{app.scholarshipAmount?.toLocaleString()}</td>
                    <td className="py-4 px-6 font-mono text-slate-600">
                      {app.bankDetails ? `${app.bankDetails.bankName} (${app.bankDetails.accountNo})` : 'Registered Bank'}
                    </td>
                    <td className="py-4 px-6 text-right">
                      <button
                        onClick={() => handleDisburse(app.id)}
                        className="px-4 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs shadow-md shadow-cyan-600/20 transition inline-flex items-center gap-1.5"
                      >
                        <DollarSign className="w-3.5 h-3.5" /> Trigger Fund Transfer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Executive Override Modal */}
      {overrideApp && (
        <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center gap-2 text-amber-700 font-bold text-base border-b border-slate-100 pb-3">
              <Shield className="w-5 h-5 text-amber-600" /> Executive Admin Override Authority
            </div>

            <p className="text-xs text-slate-600">
              Overriding application <strong className="text-slate-900">{overrideApp.id}</strong> ({overrideApp.studentName}). Every override action is permanently recorded in system audit logs with mandatory justification.
            </p>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmitOverride} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Target Override Status</label>
                <select
                  value={overrideDecision}
                  onChange={e => setOverrideDecision(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 font-semibold focus:ring-2 focus:ring-amber-500 focus:outline-none"
                >
                  <option value="approved">Override & APPROVE Application</option>
                  <option value="rejected">Override & REJECT Application</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Mandatory Override Justification (Logged)</label>
                <textarea
                  rows="3"
                  required
                  value={overrideJustification}
                  onChange={e => setOverrideJustification(e.target.value)}
                  placeholder="State clear reasons for overriding staff recommendation (e.g. Special discretionary clearance granted by Department Head)..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setOverrideApp(null)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-600 text-white font-bold hover:bg-amber-500 shadow-md shadow-amber-600/20"
                >
                  Execute Logged Override
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
