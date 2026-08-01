import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { StatusBadge } from '../../components/StatusBadge';
import { StatusStepper } from '../../components/StatusStepper';
import { ResubmissionModal } from './ResubmissionModal';
import { 
  GraduationCap, FileCheck, DollarSign, Clock, AlertTriangle, 
  ExternalLink, ArrowRight, ShieldCheck, Download, Sparkles 
} from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useContext(AuthContext);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [resubmittingDoc, setResubmittingDoc] = useState(null);
  const [activeAppForResubmit, setActiveAppForResubmit] = useState(null);

  useEffect(() => {
    fetchMyApplications(true);
    const interval = setInterval(() => fetchMyApplications(false), 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchMyApplications = async (isInitial = false) => {
    if (isInitial && applications.length === 0) {
      setLoading(true);
    }
    try {
      const res = await axios.get('/api/applications/my');
      setApplications(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const totalDisbursed = applications
    .filter(a => a.status === 'disbursed')
    .reduce((sum, a) => sum + (a.scholarshipAmount || 0), 0);

  const actionNeededApps = applications.filter(a => 
    a.documents && a.documents.some(d => d.status === 'invalid' || d.status === 'needs_resubmission')
  );

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Welcome Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-3">
              <GraduationCap className="w-4 h-4" /> Applicant Portal
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">
              Welcome back, {user?.name || 'Student'}!
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              {user?.college || 'University Student'} • {user?.course || 'Undergraduate'} • Marks: <strong className="text-emerald-300">{user?.marksPercentage}%</strong>
            </p>
          </div>

          <Link
            to="/student"
            className="px-5 py-3 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-500/25 transition flex items-center gap-2"
          >
            <Sparkles className="w-4 h-4" /> Explore New Grants <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
              <FileCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Submitted Applications</div>
              <div className="text-2xl font-extrabold text-slate-900 mt-0.5">{applications.length}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
              <DollarSign className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Total Grant Disbursed</div>
              <div className="text-2xl font-extrabold text-emerald-700 mt-0.5">₹{totalDisbursed.toLocaleString()}</div>
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-500 font-semibold uppercase">Action Required</div>
              <div className="text-2xl font-extrabold text-amber-600 mt-0.5">{actionNeededApps.length}</div>
            </div>
          </div>
        </div>

        {/* Main Application Trackers List */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-blue-600" /> Active Application Trackers
            </h2>
          </div>

          {loading ? (
            <div className="text-center py-12 text-slate-400 font-medium">Loading applications...</div>
          ) : applications.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-sm">
              <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="text-base font-bold text-slate-800">No Applications Submitted Yet</h3>
              <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                Browse our active scholarship catalog and submit your first application to begin receiving financial assistance.
              </p>
              <Link
                to="/student"
                className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 transition shadow-md"
              >
                Browse Scholarships Catalog
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {applications.map((app) => (
                <div key={app.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-6">
                  {/* Top Row: Title, Amount, Status */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-100">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono font-bold text-slate-400">{app.id}</span>
                        <StatusBadge status={app.status} />
                      </div>
                      <h3 className="text-lg font-bold text-slate-900 mt-1">{app.scholarshipTitle}</h3>
                      <div className="text-xs text-slate-500 mt-0.5">
                        Assigned Officer: <strong className="text-slate-700">{app.assignedStaffName}</strong> • Submitted: {new Date(app.submittedAt).toLocaleDateString()}
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100 text-right sm:text-right">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Grant Amount</div>
                      <div className="text-xl font-extrabold text-blue-700">₹{app.scholarshipAmount?.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Visual Stepper Tracker */}
                  <div className="bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                    <div className="text-xs font-bold text-slate-700 mb-2">Live Verification Stepper</div>
                    <StatusStepper currentStatus={app.status} />
                  </div>

                  {/* Disbursement Confirmation Card (if disbursed) */}
                  {app.status === 'disbursed' && app.disbursementDetails && (
                    <div className="p-4 rounded-2xl bg-cyan-50 border border-cyan-200 text-cyan-900 text-xs flex items-center justify-between">
                      <div>
                        <div className="font-bold flex items-center gap-1.5 text-cyan-950">
                          <ShieldCheck className="w-4 h-4 text-cyan-600" /> Funds Disbursed to Registered Bank
                        </div>
                        <div className="mt-1 text-[11px] font-mono text-cyan-800">
                          Txn Reference: <strong>{app.disbursementDetails.transactionId}</strong> • Date: {new Date(app.disbursementDetails.disbursedDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="px-3 py-1 bg-cyan-600 text-white rounded-lg text-xs font-bold">
                          ₹{app.disbursementDetails.amount.toLocaleString()} Credited
                        </span>
                      </div>
                    </div>
                  )}

                  {/* Submitted Documents & Resubmission Actions */}
                  <div>
                    <h4 className="text-xs font-bold text-slate-800 mb-3">Submitted Documents Status Checklist</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                      {app.documents.map((doc) => (
                        <div
                          key={doc.id}
                          className={`p-3 rounded-2xl border text-xs flex flex-col justify-between ${
                            doc.status === 'valid'
                              ? 'bg-emerald-50/50 border-emerald-200 text-emerald-900'
                              : doc.status === 'invalid' || doc.status === 'needs_resubmission'
                              ? 'bg-rose-50 border-rose-200 text-rose-900 ring-2 ring-rose-300/50 animate-pulse'
                              : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}
                        >
                          <div>
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-bold truncate">{doc.type}</span>
                              <span className={`text-[10px] px-2 py-0.5 rounded-md font-semibold capitalize ${
                                doc.status === 'valid'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : doc.status === 'invalid' || doc.status === 'needs_resubmission'
                                  ? 'bg-rose-100 text-rose-800 font-bold'
                                  : 'bg-slate-200 text-slate-700'
                              }`}>
                                {doc.status.replace('_', ' ')}
                              </span>
                            </div>
                            <div className="text-[11px] text-slate-500 truncate mb-2">{doc.name}</div>

                            {doc.remark && (
                              <div className="text-[10px] italic p-1.5 rounded bg-white/80 border border-slate-200 mb-2">
                                Remark: "{doc.remark}"
                              </div>
                            )}
                          </div>

                          {/* Requirement #7: ONLY display Re-upload Document button if staff flagged for resubmission (needs_resubmission). DO NOT display if marked invalid. */}
                          {doc.status === 'needs_resubmission' && (
                            <button
                              type="button"
                              onClick={() => {
                                setActiveAppForResubmit(app);
                                setResubmittingDoc(doc);
                              }}
                              className="w-full mt-2 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-xl text-[11px] font-bold shadow transition"
                            >
                              Re-upload Document
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Resubmission Modal */}
          {resubmittingDoc && activeAppForResubmit && (
            <ResubmissionModal
              application={activeAppForResubmit}
              docToResubmit={resubmittingDoc}
              onClose={() => {
                setResubmittingDoc(null);
                setActiveAppForResubmit(null);
              }}
              onSuccess={() => {
                setResubmittingDoc(null);
                setActiveAppForResubmit(null);
                fetchMyApplications();
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
};
