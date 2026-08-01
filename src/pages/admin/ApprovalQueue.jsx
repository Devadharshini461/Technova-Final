import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { StatusBadge } from '../../components/StatusBadge';
import { FormValidationBanner } from '../../components/FormValidationBanner';
import { 
  CheckCircle2, XCircle, ShieldAlert, DollarSign, RefreshCw, 
  Shield, MessageSquare, ArrowDown, Sparkles 
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
    fetchApplications(true);
  }, [search]);

  // Silent fetch: Only set loading = true on initial boot
  const fetchApplications = async (isInitial = false) => {
    if (isInitial && applications.length === 0) {
      setLoading(true);
    }
    try {
      const res = await axios.get('/api/applications', { params: { search } });
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (appId, e) => {
    if (e) e.preventDefault();
    try {
      const res = await axios.patch(`/api/applications/${appId}/approve`, { remark: 'Final Executive Approval Granted' });
      setApplications(prev => prev.map(a => a.id === appId ? res.data : a));
    } catch (err) {
      alert(err.response?.data?.message || 'Approval failed');
    }
  };

  const handleReject = async (appId, e) => {
    if (e) e.preventDefault();
    const remark = prompt('Enter rejection reason for audit log:');
    if (remark !== null) {
      try {
        const res = await axios.patch(`/api/applications/${appId}/reject`, { remark });
        setApplications(prev => prev.map(a => a.id === appId ? res.data : a));
      } catch (err) {
        alert(err.response?.data?.message || 'Rejection failed');
      }
    }
  };

  const handleDisburse = async (appId, e) => {
    if (e) e.preventDefault();
    if (window.confirm('Trigger instant fund transfer transaction via NPCI/DBT bridge?')) {
      try {
        const res = await axios.patch(`/api/applications/${appId}/disburse`);
        setApplications(prev => prev.map(a => a.id === appId ? res.data : a));
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
      const res = await axios.patch(`/api/applications/${overrideApp.id}/override`, {
        decision: overrideDecision,
        justification: overrideJustification
      });
      setApplications(prev => prev.map(a => a.id === overrideApp.id ? res.data : a));
      setOverrideApp(null);
      setOverrideJustification('');
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
          type="button"
          onClick={() => fetchApplications(false)}
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
          <span className="text-[11px] font-semibold text-slate-500">
            Sorted by Priority (Students with fewer previous applications first)
          </span>
        </div>

        {loading ? (
          <div className="p-8 text-center text-slate-400 text-xs font-medium">Loading pending queue...</div>
        ) : pendingAdminApps.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">No applications currently pending executive clearance.</div>
        ) : (
          <div className="divide-y divide-slate-100 text-xs">
            {pendingAdminApps.map((app) => (
              <div key={app.id} className={`p-6 transition space-y-4 ${app.isLowPriority ? 'bg-slate-50/80' : 'hover:bg-slate-50/50'}`}>
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-emerald-700">{app.id}</span>
                      <StatusBadge status={app.status} />

                      {app.isLowPriority ? (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 text-slate-700 border border-slate-300 flex items-center gap-1">
                          <ArrowDown className="w-3 h-3 text-slate-500" /> Low Priority (App Count: {app.studentTotalApps})
                        </span>
                      ) : (
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                          <Sparkles className="w-3 h-3 text-emerald-600" /> High Priority (First-time Applicant)
                        </span>
                      )}
                    </div>

                    <h4 className="text-base font-bold text-slate-900 mt-1">{app.studentName}</h4>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Scheme: <strong className="text-slate-800">{app.scholarshipTitle}</strong> • Award: <strong className="text-blue-700">₹{app.scholarshipAmount?.toLocaleString()}</strong>
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => handleApprove(app.id, e)}
                      className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-4 h-4" /> Final Approve
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleReject(app.id, e)}
                      className="px-3 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold text-xs transition flex items-center gap-1"
                    >
                      <XCircle className="w-4 h-4" /> Reject
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
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
                    <span className="font-bold">Assigned Staff Inspector ({app.assignedStaffName}):</span> Marked "{app.staffRecommendation?.replace('_', ' ')}". 
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
                        type="button"
                        onClick={(e) => handleDisburse(app.id, e)}
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
                  placeholder="State clear reasons for overriding staff recommendation..."
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
              </div>

              {/* Requirement #3: Validation error banner immediately above Cancel/Submit */}
              <FormValidationBanner error={error} />

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
