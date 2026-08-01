import React, { useContext } from 'react';
import { Routes, Route, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SchemeManagement } from './SchemeManagement';
import { ApprovalQueue } from './ApprovalQueue';
import { StaffManagement } from './StaffManagement';
import { StudentReports } from './StudentReports';
import { AnalyticsView } from './AnalyticsView';
import { AuditLogView } from './AuditLogView';
import { Shield, Plus, CheckSquare } from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  return (
    <div className="space-y-6">
      
      {/* Admin Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
            <Shield className="w-4 h-4" /> Executive Governance & Oversight
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name || 'Superintendent Admin'}</h1>
          <p className="text-xs sm:text-sm text-slate-300 mt-1">
            BIT Sathy Central Authority • Email: <strong className="text-emerald-300">{user?.email}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/admin')}
            className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" /> Manage Schemes
          </button>
          <button
            type="button"
            onClick={() => navigate('/admin/approvals')}
            className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/25 transition flex items-center gap-1.5"
          >
            <CheckSquare className="w-4 h-4" /> Approval Queue
          </button>
        </div>
      </div>

      {/* 
        NO Horizontal Tab Navigation Bar (REMOVED).
        Navigation is exclusively handled via the left vertical sidebar (Sidebar.jsx)
        connected to React Router routes below.
      */}

      {/* Nested React Router Routes for Admin Pages */}
      <div>
        <Routes>
          <Route index element={<SchemeManagement />} />
          <Route path="approvals" element={<ApprovalQueue />} />
          <Route path="staff-mgmt" element={<StaffManagement />} />
          <Route path="student-reports" element={<StudentReports />} />
          <Route path="analytics" element={<AnalyticsView />} />
          <Route path="audit-logs" element={<AuditLogView />} />
        </Routes>
      </div>

    </div>
  );
};
