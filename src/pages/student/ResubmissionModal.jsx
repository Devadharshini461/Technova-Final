import React, { useState } from 'react';
import axios from 'axios';
import { X, Upload, AlertTriangle, FileText } from 'lucide-react';

export const ResubmissionModal = ({ application, docToResubmit, onClose, onSuccess }) => {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to upload');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const data = new FormData();
      data.append('document', file);

      await axios.patch(`/api/applications/${application.id}/documents/${docToResubmit.id}/resubmit`, data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      onSuccess();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to resubmit document');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        <div className="bg-gradient-to-r from-amber-600 to-orange-600 p-5 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-white/80 hover:text-white bg-black/20 hover:bg-black/40 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-200" />
            <h2 className="text-base font-bold">Document Resubmission Required</h2>
          </div>
          <p className="text-xs text-amber-100 mt-1">Application ID: {application.id}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
              {error}
            </div>
          )}

          <div className="p-3 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900">
            <div className="font-bold mb-0.5">Verifier Staff Remark:</div>
            <div>"{docToResubmit.remark || 'Document unreadable or invalid format'}"</div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 mb-1">
              Re-upload Document ({docToResubmit.type})
            </label>
            <div className="border-2 border-dashed border-slate-300 rounded-2xl p-6 text-center bg-slate-50 hover:bg-slate-100/80 transition cursor-pointer">
              <Upload className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <div className="text-xs font-semibold text-slate-700">
                {file ? file.name : 'Click to browse new file copy'}
              </div>
              <div className="text-[10px] text-slate-400 mt-1">Supported formats: PDF, JPG, PNG (Max 5MB)</div>
              <input
                type="file"
                accept=".pdf,.png,.jpg,.jpeg"
                onChange={(e) => setFile(e.target.files[0])}
                className="hidden"
                id="resubmit-file-input"
              />
              <label
                htmlFor="resubmit-file-input"
                className="mt-3 inline-block px-4 py-1.5 rounded-xl bg-blue-600 text-white text-xs font-semibold shadow-sm hover:bg-blue-500 transition cursor-pointer"
              >
                Select File
              </label>
            </div>
          </div>

          <div className="pt-2 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-100 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !file}
              className="px-5 py-2 rounded-xl text-xs font-bold text-white bg-amber-600 hover:bg-amber-500 shadow-md shadow-amber-500/20 transition disabled:opacity-50"
            >
              {loading ? 'Uploading...' : 'Submit Re-upload'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
