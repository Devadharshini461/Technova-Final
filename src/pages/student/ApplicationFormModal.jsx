import React, { useState, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { X, Upload, CheckCircle2, FileText, AlertCircle, Building, User, CreditCard } from 'lucide-react';

export const ApplicationFormModal = ({ scheme, onClose, onSuccess }) => {
  const { user } = useContext(AuthContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    college: user?.college || 'Indian Institute of Technology, Delhi',
    course: user?.course || 'B.Tech Computer Science',
    year: user?.year || '3rd Year',
    marksPercentage: user?.marksPercentage || 85.0,
    familyIncome: user?.familyIncome || 180000,
    category: user?.category || 'OBC',
    bankAccountNo: user?.bankDetails?.accountNo || '309812345678',
    bankIfsc: user?.bankDetails?.ifscCode || 'SBIN0001234',
    bankName: user?.bankDetails?.bankName || 'State Bank of India',
    bankAccountHolder: user?.bankDetails?.accountHolder || user?.name || ''
  });

  const [files, setFiles] = useState({});

  const handleFileChange = (docType, e) => {
    if (e.target.files && e.target.files[0]) {
      setFiles(prev => ({
        ...prev,
        [docType]: e.target.files[0]
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('scholarshipId', scheme.id);
      data.append('college', formData.college);
      data.append('course', formData.course);
      data.append('year', formData.year);
      data.append('marksPercentage', formData.marksPercentage);
      data.append('familyIncome', formData.familyIncome);
      data.append('category', formData.category);
      data.append('bankDetails', JSON.stringify({
        accountNo: formData.bankAccountNo,
        ifscCode: formData.bankIfsc,
        bankName: formData.bankName,
        accountHolder: formData.bankAccountHolder
      }));

      // Append documents
      scheme.requiredDocuments.forEach((docType) => {
        if (files[docType]) {
          data.append('documents', files[docType]);
        }
      });

      await axios.post('/api/applications', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-3xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-xs font-semibold text-blue-300 uppercase tracking-wider mb-1">Scholarship Application Form</div>
          <h2 className="text-xl font-bold">{scheme.title}</h2>
          <div className="text-xs text-slate-300 mt-1">
            Grant Award: <strong className="text-amber-300">₹{scheme.amount.toLocaleString()}</strong>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 max-h-[75vh] overflow-y-auto">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Section 1: Academic & Institutional Info */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Building className="w-4 h-4 text-blue-600" /> Academic & Institutional Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">College / University Name</label>
                <input
                  type="text"
                  required
                  value={formData.college}
                  onChange={e => setFormData({ ...formData, college: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Course / Specialization</label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Current Year / Semester</label>
                <input
                  type="text"
                  required
                  value={formData.year}
                  onChange={e => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Qualifying Marks / CGPA (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.marksPercentage}
                  onChange={e => setFormData({ ...formData, marksPercentage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Socio-Economic Profile */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="w-4 h-4 text-blue-600" /> Socio-Economic Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.familyIncome}
                  onChange={e => setFormData({ ...formData, familyIncome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Social Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Bank Account Details for Disbursement */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="w-4 h-4 text-blue-600" /> Bank Account Details (DBT Direct Transfer)
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Holder Name</label>
                <input
                  type="text"
                  required
                  value={formData.bankAccountHolder}
                  onChange={e => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  required
                  value={formData.bankName}
                  onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  required
                  value={formData.bankAccountNo}
                  onChange={e => setFormData({ ...formData, bankAccountNo: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  required
                  value={formData.bankIfsc}
                  onChange={e => setFormData({ ...formData, bankIfsc: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                />
              </div>
            </div>
          </div>

          {/* Section 4: Document Uploads */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2 border-b border-slate-100 pb-2">
              <FileText className="w-4 h-4 text-blue-600" /> Mandatory Document Uploads (PDF / Images max 5MB)
            </h3>
            <div className="space-y-3">
              {scheme.requiredDocuments.map((docType) => (
                <div key={docType} className="p-3 rounded-2xl border border-slate-200 bg-slate-50 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{docType}</div>
                    <div className="text-[10px] text-slate-500">Attach clear copy of your authentic {docType}</div>
                  </div>
                  <div>
                    <label className="cursor-pointer inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-300 hover:bg-slate-100 text-xs font-semibold text-slate-700 shadow-sm transition">
                      <Upload className="w-3.5 h-3.5 text-blue-600" />
                      {files[docType] ? files[docType].name : 'Choose File'}
                      <input
                        type="file"
                        accept=".pdf,.png,.jpg,.jpeg"
                        onChange={(e) => handleFileChange(docType, e)}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Footer Submit Button */}
          <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
