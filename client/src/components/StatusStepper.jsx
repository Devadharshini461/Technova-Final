import React from 'react';
import { Check, Clock, AlertTriangle, X } from 'lucide-react';

export const StatusStepper = ({ currentStatus }) => {
  const steps = [
    { key: 'submitted', label: 'Submitted' },
    { key: 'under_review', label: 'Staff Verification' },
    { key: 'pending_admin_approval', label: 'Admin Approval' },
    { key: 'disbursed', label: 'Funds Disbursed' }
  ];

  // Helper map to determine active step index
  const getStepIndex = (status) => {
    switch (status) {
      case 'submitted': return 0;
      case 'under_review': return 1;
      case 'verified': return 2;
      case 'pending_admin_approval': return 2;
      case 'approved': return 2;
      case 'disbursed': return 3;
      case 'rejected': return -1;
      default: return 0;
    }
  };

  const activeIndex = getStepIndex(currentStatus);
  const isRejected = currentStatus === 'rejected';

  return (
    <div className="w-full py-4">
      {isRejected ? (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center gap-3 text-rose-700">
          <div className="w-8 h-8 rounded-full bg-rose-100 flex items-center justify-center font-bold">
            <X className="w-5 h-5 text-rose-600" />
          </div>
          <div>
            <div className="font-bold text-sm">Application Rejected</div>
            <div className="text-xs text-rose-600">This application was reviewed and rejected. See remarks for breakdown.</div>
          </div>
        </div>
      ) : (
        <div className="relative flex items-center justify-between">
          {/* Connecting Line */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 w-full h-1 bg-slate-200 z-0">
            <div 
              className="h-full bg-blue-600 transition-all duration-500 ease-in-out"
              style={{ width: `${(Math.max(0, activeIndex) / (steps.length - 1)) * 100}%` }}
            />
          </div>

          {/* Stepper Nodes */}
          {steps.map((step, idx) => {
            const isCompleted = idx < activeIndex || (idx === steps.length - 1 && currentStatus === 'disbursed');
            const isCurrent = idx === activeIndex && currentStatus !== 'disbursed';

            return (
              <div key={step.key} className="relative z-10 flex flex-col items-center group">
                <div 
                  className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-semibold transition-all ${
                    isCompleted 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-200' 
                      : isCurrent 
                      ? 'bg-amber-500 text-white ring-4 ring-amber-100 animate-pulse' 
                      : 'bg-slate-100 text-slate-400 border-2 border-slate-300'
                  }`}
                >
                  {isCompleted ? (
                    <Check className="w-5 h-5 stroke-[2.5]" />
                  ) : isCurrent ? (
                    <Clock className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>0{idx + 1}</span>
                  )}
                </div>

                <div className="mt-2 text-center">
                  <span className={`block text-xs font-semibold ${
                    isCompleted || isCurrent ? 'text-slate-800' : 'text-slate-400'
                  }`}>
                    {step.label}
                  </span>
                  <span className="block text-[10px] text-slate-400">
                    {isCompleted ? 'Completed' : isCurrent ? 'In Progress' : 'Pending'}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
