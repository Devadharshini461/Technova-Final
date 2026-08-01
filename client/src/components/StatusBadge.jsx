import React from 'react';
import { CheckCircle2, Clock, AlertCircle, XCircle, DollarSign, ShieldAlert } from 'lucide-react';

export const StatusBadge = ({ status }) => {
  const config = {
    submitted: {
      label: 'Submitted',
      bg: 'bg-blue-50 text-blue-700 border-blue-200',
      icon: Clock
    },
    under_review: {
      label: 'Under Staff Review',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-200',
      icon: Clock
    },
    verified: {
      label: 'Staff Verified',
      bg: 'bg-teal-50 text-teal-700 border-teal-200',
      icon: CheckCircle2
    },
    pending_admin_approval: {
      label: 'Pending Admin Approval',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      icon: ShieldAlert
    },
    approved: {
      label: 'Approved',
      bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      icon: CheckCircle2
    },
    rejected: {
      label: 'Rejected',
      bg: 'bg-rose-50 text-rose-700 border-rose-200',
      icon: XCircle
    },
    disbursed: {
      label: 'Funds Disbursed',
      bg: 'bg-cyan-50 text-cyan-800 border-cyan-300 font-semibold',
      icon: DollarSign
    }
  };

  const curr = config[status] || {
    label: status ? status.replace('_', ' ') : 'Unknown',
    bg: 'bg-slate-100 text-slate-700 border-slate-200',
    icon: AlertCircle
  };

  const IconComponent = curr.icon;

  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs border ${curr.bg}`}>
      <IconComponent className="w-3.5 h-3.5" />
      <span className="capitalize">{curr.label}</span>
    </span>
  );
};
