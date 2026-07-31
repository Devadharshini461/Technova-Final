import React, { useState } from 'react';
import axios from 'axios';
import { 
  X, CheckCircle2, XCircle, AlertTriangle, FileText, Eye, 
  ThumbsUp, ThumbsDown, Building2, User, CreditCard, ShieldCheck 
} from 'lucide-react';

export const DocumentReviewModal = ({ application, onClose, onSuccess }) => {
  const [appData, setAppData] = useState(application);
  const [selectedDoc, setSelectedDoc] = useState(application.documents[0] || null);
  const [staffRemark, setStaffRemark] = useState(application.staffRemarks || '');
  const [docRemarks, setDocRemarks] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleVerifyDoc = async (docId, status) => {
    try {
      const remark = docRemarks[docId] || '';
      const res = await axios.patch(`/api/applications/${appData.id}/documents/${docId}`, {
        status,
        remark
      });
      setAppData(res.data);
    } catch (err) {
      console.error(err);
      setError('Failed to update document status');
    }
  };

  const handleRecommendation = async (decision) => {
    setSubmitting(true);
    setError('');

    try {
      await axios.patch(`/api/applications/${appData.id}/recommend`, {
        decision,
        remark: staffRemark
      });
      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit recommendation');
    } finally {
      setSubmitting(false);
    }
  };

  const autoCheck = appData.autoEligibilityCheck || { passed: true, reasons: [] };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/70 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-6xl w-full h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Top Header */}
        <div className="bg-slate-900 p-5 text-white flex items-center justify-between border-b border-slate-800 shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-blue-600/30 text-blue-300 font-bold border border-blue-500/40">
                {appData.id}
              </span>
              <span className="text-xs text-slate-400 font-medium">Verification Inspector Queue</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-0.5">{appData.scholarshipTitle}</h2>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Panel Body */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 overflow-hidden">
          
          {/* Left Panel: Student Details, Auto-Check & Doc Controls (7 cols) */}
          <div className="lg:col-span-7 p-6 overflow-y-auto space-y-6 border-r border-slate-200">
            
            {/* Auto-Eligibility Engine Check Banner */}
            <div className={`p-4 rounded-2xl border ${
              autoCheck.passed 
                ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950' 
                : 'bg-rose-50/70 border-rose-200 text-rose-950'
            }`}>
              <div className="flex items-center gap-2 font-bold text-sm mb-2">
                {autoCheck.passed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Auto-Eligibility Auto-Check: PASSED CRITERIA</span>
                  </>
                ) : (
                  <>
                    <XCircle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>Auto-Eligibility Auto-Check: CRITERIA MISMATCH</span>
                  </>
                )}
              </div>

              <ul className="space-y-1 text-xs pl-7 list-disc">
                {autoCheck.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            {/* Applicant Profile Card */}
            <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" /> Applicant Demographic & Academic Record
              </h3>
              
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Student Name</div>
                  <div className="font-bold text-slate-900">{appData.studentName}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Email</div>
                  <div className="font-medium text-slate-700 truncate">{appData.studentEmail}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Phone</div>
                  <div className="font-medium text-slate-700">{appData.studentPhone}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Academic Marks</div>
                  <div className="font-extrabold text-blue-700">{appData.marksPercentage}%</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Annual Family Income</div>
                  <div className="font-extrabold text-slate-900">₹{appData.familyIncome?.toLocaleString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-slate-400 font-semibold">Social Category</div>
                  <div className="font-bold text-slate-800">{appData.category}</div>
                </div>
              </div>

              <div className="pt-2 border-t border-slate-200/80 text-xs">
                <span className="text-slate-500 font-semibold">College:</span> <span className="font-bold text-slate-800">{appData.college}</span> ({appData.course} - {appData.year})
              </div>
            </div>

            {/* Document Inspection & Verification Section */}
            <div>
              <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600" /> Document Verification checklist
              </h3>

              <div className="space-y-3">
                {appData.documents.map((doc) => (
                  <div 
                    key={doc.id}
                    className={`p-4 rounded-2xl border transition-all ${
                      selectedDoc?.id === doc.id
                        ? 'border-blue-500 ring-2 ring-blue-100 bg-blue-50/20'
                        : 'border-slate-200 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <div className="font-bold text-xs text-slate-900 flex items-center gap-2">
                          <span>{doc.type}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            doc.status === 'valid'
                              ? 'bg-emerald-100 text-emerald-800'
                              : doc.status === 'invalid'
                              ? 'bg-rose-100 text-rose-800'
                              : doc.status === 'needs_resubmission'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-slate-100 text-slate-600'
                          }`}>
                            {doc.status.replace('_', ' ')}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">{doc.name}</div>
                      </div>

                      <button
                        onClick={() => setSelectedDoc(doc)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold flex items-center gap-1 shrink-0"
                      >
                        <Eye className="w-3.5 h-3.5" /> Preview Doc
                      </button>
                    </div>

                    {/* Verification Control Buttons per document */}
                    <div className="mt-3 pt-3 border-t border-slate-100 flex flex-col sm:flex-row items-center gap-2">
                      <input
                        type="text"
                        placeholder="Staff remark (optional)..."
                        value={docRemarks[doc.id] !== undefined ? docRemarks[doc.id] : doc.remark || ''}
                        onChange={(e) => setDocRemarks({ ...docRemarks, [doc.id]: e.target.value })}
                        className="w-full px-3 py-1.5 rounded-xl border border-slate-200 text-xs focus:ring-1 focus:ring-blue-500 focus:outline-none"
                      />

                      <div className="flex items-center gap-1.5 shrink-0 w-full sm:w-auto">
                        <button
                          onClick={() => handleVerifyDoc(doc.id, 'valid')}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                            doc.status === 'valid'
                              ? 'bg-emerald-600 text-white shadow-sm'
                              : 'bg-slate-100 text-emerald-700 hover:bg-emerald-50'
                          }`}
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" /> Valid
                        </button>
                        <button
                          onClick={() => handleVerifyDoc(doc.id, 'needs_resubmission')}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                            doc.status === 'needs_resubmission'
                              ? 'bg-amber-600 text-white shadow-sm'
                              : 'bg-slate-100 text-amber-700 hover:bg-amber-50'
                          }`}
                        >
                          <AlertTriangle className="w-3.5 h-3.5" /> Flag Resubmit
                        </button>
                        <button
                          onClick={() => handleVerifyDoc(doc.id, 'invalid')}
                          className={`flex-1 sm:flex-none px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1 ${
                            doc.status === 'invalid'
                              ? 'bg-rose-600 text-white shadow-sm'
                              : 'bg-slate-100 text-rose-700 hover:bg-rose-50'
                          }`}
                        >
                          <XCircle className="w-3.5 h-3.5" /> Invalid
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Overall Staff Remarks Input */}
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Staff Inspection Summary & Recommendation Notes
              </label>
              <textarea
                rows="3"
                value={staffRemark}
                onChange={(e) => setStaffRemark(e.target.value)}
                placeholder="Add overall observations, verification remarks, or discrepancies found..."
                className="w-full px-3 py-2 rounded-2xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Right Panel: Document Viewer (5 cols) */}
          <div className="lg:col-span-5 bg-slate-900 p-6 flex flex-col justify-between overflow-y-auto text-white">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
                <div className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Eye className="w-4 h-4 text-blue-400" /> Inline Document Inspection
                </div>
                {selectedDoc && (
                  <span className="text-[11px] font-mono px-2 py-0.5 bg-slate-800 rounded text-slate-300">
                    {selectedDoc.type}
                  </span>
                )}
              </div>

              {selectedDoc ? (
                <div className="space-y-4">
                  <div className="bg-slate-950 rounded-2xl border border-slate-800 p-2 overflow-hidden flex items-center justify-center min-h-[300px]">
                    <img
                      src={selectedDoc.fileUrl}
                      alt={selectedDoc.name}
                      className="max-h-[380px] object-contain rounded-xl shadow-lg"
                    />
                  </div>
                  <div className="text-xs text-slate-400">
                    <div>Filename: <strong className="text-slate-200">{selectedDoc.name}</strong></div>
                    <div className="mt-1">
                      Verification Status: <strong className="capitalize text-blue-400">{selectedDoc.status.replace('_', ' ')}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="text-center py-24 text-slate-500 text-xs">
                  Select a document from the left checklist to inspect here.
                </div>
              )}
            </div>

            {/* Bottom Recommendation Action Buttons */}
            <div className="pt-6 border-t border-slate-800 mt-6 space-y-3">
              {error && (
                <div className="p-2.5 bg-rose-950/80 border border-rose-800 text-rose-200 text-xs rounded-xl">
                  {error}
                </div>
              )}

              <div className="text-xs font-bold text-slate-300">Final Verification Decision:</div>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleRecommendation('reject')}
                  disabled={submitting}
                  className="px-4 py-3 rounded-2xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow-lg transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ThumbsDown className="w-4 h-4" /> Recommend Rejection
                </button>
                <button
                  onClick={() => handleRecommendation('approve')}
                  disabled={submitting}
                  className="px-4 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-lg shadow-emerald-600/25 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  <ThumbsUp className="w-4 h-4" /> Recommend Approval
                </button>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};
