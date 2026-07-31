import React, { useState, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { SchemeManagement } from './SchemeManagement';
import { ApprovalQueue } from './ApprovalQueue';
import { StaffManagement } from './StaffManagement';
import { AnalyticsView } from './AnalyticsView';
import { AuditLogView } from './AuditLogView';
import { 
  Shield, Layers, CheckSquare, Users, BarChart3, 
  FileText, Sparkles, Plus, DollarSign 
} from 'lucide-react';

export const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const location = useLocation();
  const navigate = useNavigate();

  // Determine active tab from URL subpath or default tab
  const getTabFromPath = () => {
    if (location.pathname.includes('/analytics')) return 'analytics';
    if (location.pathname.includes('/audit-logs')) return 'audit';
    if (location.pathname.includes('/schemes')) return 'schemes';
    if (location.pathname.includes('/approvals')) return 'approvals';
    if (location.pathname.includes('/staff-mgmt')) return 'staff';
    return 'schemes';
  };

  const [activeTab, setActiveTab] = useState(getTabFromPath());

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    if (tab === 'analytics') navigate('/admin/analytics');
    else if (tab === 'audit') navigate('/admin/audit-logs');
    else navigate('/admin');
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* Admin Header Banner */}
        <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 mb-3">
              <Shield className="w-4 h-4" /> Executive Governance & Oversight
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold">{user?.name || 'Superintendent Admin'}</h1>
            <p className="text-xs sm:text-sm text-slate-300 mt-1">
              Central Authority Office • Department: <strong className="text-emerald-300">{user?.department || 'Scholarship Administration'}</strong>
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTabChange('schemes')}
              className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/25 transition flex items-center gap-1.5"
            >
              <Plus className="w-4 h-4" /> Manage Schemes
            </button>
            <button
              onClick={() => handleTabChange('approvals')}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold shadow-lg shadow-amber-600/25 transition flex items-center gap-1.5"
            >
              <CheckSquare className="w-4 h-4" /> Approval Queue
            </button>
          </div>
        </div>

        {/* Tab Navigation Pill Bar */}
        <div className="bg-white p-2 rounded-2xl border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => handleTabChange('schemes')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'schemes'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Layers className="w-4 h-4 text-emerald-400" /> Scheme Management
          </button>
          <button
            onClick={() => handleTabChange('approvals')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'approvals'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CheckSquare className="w-4 h-4 text-amber-400" /> Executive Approvals & Disbursement
          </button>
          <button
            onClick={() => handleTabChange('staff')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'staff'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4 text-blue-400" /> Staff Accounts
          </button>
          <button
            onClick={() => handleTabChange('analytics')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'analytics'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-indigo-400" /> Analytics & Reports
          </button>
          <button
            onClick={() => handleTabChange('audit')}
            className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 whitespace-nowrap ${
              activeTab === 'audit'
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4 text-rose-400" /> Audit Log
          </button>
        </div>

        {/* Tab View Component Mount */}
        <div>
          {activeTab === 'schemes' && <SchemeManagement />}
          {activeTab === 'approvals' && <ApprovalQueue />}
          {activeTab === 'staff' && <StaffManagement />}
          {activeTab === 'analytics' && <AnalyticsView />}
          {activeTab === 'audit' && <AuditLogView />}
        </div>
      </div>
    </div>
  );
};
