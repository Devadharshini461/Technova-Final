import React from 'react';
import { X, CheckCircle2, ShieldCheck, FileText, Calendar, Building2, Award, ChevronRight } from 'lucide-react';

export const ScholarshipDetailModal = ({ scheme, onClose, onApply }) => {
  if (!scheme) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-900 p-6 text-white relative">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 rounded-full transition"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="inline-block px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-2">
            {scheme.category}
          </div>
          <h2 className="text-xl font-bold">{scheme.title}</h2>
          <div className="flex items-center gap-2 text-xs text-slate-300 mt-2">
            <Building2 className="w-3.5 h-3.5" /> {scheme.provider}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto">
          {/* Key Overview Cards */}
          <div className="grid grid-cols-3 gap-4">
            <div className="p-4 rounded-2xl bg-blue-50/60 border border-blue-100 text-center">
              <div className="text-[10px] uppercase font-bold text-blue-600">Financial Aid</div>
              <div className="text-lg font-extrabold text-blue-900 mt-0.5">₹{scheme.amount.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
              <div className="text-[10px] uppercase font-bold text-slate-500">Available Seats</div>
              <div className="text-lg font-extrabold text-slate-800 mt-0.5">{scheme.seats.toLocaleString()}</div>
            </div>
            <div className="p-4 rounded-2xl bg-amber-50/60 border border-amber-100 text-center">
              <div className="text-[10px] uppercase font-bold text-amber-700">Deadline</div>
              <div className="text-xs font-bold text-amber-900 mt-1">{scheme.deadline}</div>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-2">Program Overview & Eligibility Description</h3>
            <p className="text-xs text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
              {scheme.eligibilityRules.description}
            </p>
          </div>

          {/* Eligibility Criteria Matrix */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Eligibility Requirements Matrix</h3>
            <div className="space-y-2 text-xs text-slate-700">
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Minimum Academic Marks: <strong>{scheme.eligibilityRules.minPercentage}%</strong> in qualifying standard</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Annual Family Income Limit: <strong>₹{scheme.eligibilityRules.maxFamilyIncome.toLocaleString()}</strong> / annum</span>
              </div>
              <div className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50">
                <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>Eligible Social Categories: <strong>{scheme.eligibilityRules.allowedCategories.join(', ')}</strong></span>
              </div>
            </div>
          </div>

          {/* Mandatory Documents Checklist */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 mb-3">Mandatory Documents to Upload</h3>
            <div className="grid grid-cols-2 gap-2">
              {scheme.requiredDocuments.map((doc, idx) => (
                <div key={idx} className="flex items-center gap-2 p-3 rounded-xl border border-slate-200 text-xs font-medium text-slate-800">
                  <FileText className="w-4 h-4 text-blue-600" />
                  <span>{doc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-600 hover:bg-slate-200 transition"
          >
            Close
          </button>
          <button
            onClick={onApply}
            className="px-6 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition flex items-center gap-1.5"
          >
            Proceed to Application <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
