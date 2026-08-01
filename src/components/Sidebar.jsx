import React, { useContext } from 'react';
import { NavLink } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { 
  Award, FileText, CheckSquare, Layers, Users, 
  BarChart3, Clock, Sparkles, UserCheck, ShieldAlert 
} from 'lucide-react';

export const Sidebar = ({ isCollapsed }) => {
  const { user } = useContext(AuthContext);

  if (!user) return null;

  const role = user.role;

  // Define Navigation Items based on Role
  let navItems = [];

  if (role === 'student') {
    navItems = [
      { to: '/student', icon: Award, label: 'Scholarship Catalog', end: true },
      { to: '/student/my-applications', icon: Clock, label: 'My Applications & Status' }
    ];
  } else if (role === 'staff') {
    navItems = [
      { to: '/staff', icon: CheckSquare, label: 'Verification Queue', end: true }
    ];
  } else if (role === 'admin') {
    navItems = [
      { to: '/admin', icon: Layers, label: 'Scheme Management', end: true },
      { to: '/admin/approvals', icon: ShieldAlert, label: 'Approval Queue' },
      { to: '/admin/staff-mgmt', icon: UserCheck, label: 'Staff Allotment' },
      { to: '/admin/student-reports', icon: Users, label: 'Student Reports' },
      { to: '/admin/analytics', icon: BarChart3, label: 'Analytics' },
      { to: '/admin/audit-logs', icon: FileText, label: 'Audit Logs' }
    ];
  }

  return (
    <aside
      className={`bg-slate-900 text-slate-300 border-r border-slate-800 transition-all duration-300 flex flex-col justify-between shrink-0 z-40 ${
        isCollapsed ? 'w-16' : 'w-64'
      }`}
    >
      <div className="py-6 px-3 space-y-6">
        {/* Role Badge Indicator */}
        <div className={`px-2 py-1.5 rounded-xl bg-slate-850 border border-slate-800 flex items-center gap-2 ${
          isCollapsed ? 'justify-center' : 'justify-start'
        }`}>
          <div className={`w-2.5 h-2.5 rounded-full animate-pulse ${
            role === 'admin' ? 'bg-emerald-400' : role === 'staff' ? 'bg-indigo-400' : 'bg-blue-400'
          }`} />
          {!isCollapsed && (
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-slate-400 truncate">
              {role} Workspace
            </span>
          )}
        </div>

        {/* Vertical Navigation Links */}
        <nav className="space-y-1">
          {navItems.map((item) => {
            const IconComp = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-3 rounded-2xl text-xs font-bold transition-all group relative ${
                    isActive
                      ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/25'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800/80'
                  }`
                }
              >
                <IconComp className="w-5 h-5 shrink-0" />
                {!isCollapsed && <span className="truncate">{item.label}</span>}

                {/* Hover Tooltip when Collapsed */}
                {isCollapsed && (
                  <div className="absolute left-full ml-3 px-3 py-1.5 bg-slate-950 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-50">
                    {item.label}
                  </div>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Institutional Branding Footer */}
      {!isCollapsed && (
        <div className="p-4 border-t border-slate-800 text-[10px] text-slate-500 text-center">
          <div className="font-bold text-slate-400">BIT Sathy Portal</div>
          <div>@bitsathy.ac.in Verified</div>
        </div>
      )}
    </aside>
  );
};
