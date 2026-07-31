import React, { useContext, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { 
  GraduationCap, Bell, User, LogOut, Shield, FileText, 
  BarChart3, CheckSquare, Users, ChevronDown, Check, Sparkles
} from 'lucide-react';

export const Navbar = () => {
  const { user, logout, quickSwitchRole } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleRoleSwitch = async (role) => {
    try {
      await quickSwitchRole(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      console.error(err);
    }
  };

  const isActive = (path) => location.pathname === path;

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-lg border-b border-slate-800">
      {/* Top Demo Toolbar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-medium text-slate-200">Interactive Role Switcher:</span>
          <span className="text-slate-400 hidden md:inline">Test multi-stage approval workflow end-to-end</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleRoleSwitch('student')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'student' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎓 Student (Rahul)
          </button>
          <button 
            onClick={() => handleRoleSwitch('staff')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'staff' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔍 Staff (Dr. Sharma)
          </button>
          <button 
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'admin' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🛡️ Admin (Superintendent)
          </button>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="font-extrabold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
              ScholarPortal<span className="text-blue-400">.gov</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wider font-semibold uppercase">
              Verification & Grant Engine
            </div>
          </div>
        </Link>

        {/* Role Specific Navigation Links */}
        <nav className="hidden md:flex items-center gap-1">
          <Link 
            to="/" 
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Home
          </Link>
          <Link 
            to="/scholarships" 
            className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
              isActive('/scholarships') ? 'bg-slate-800 text-white' : 'text-slate-300 hover:text-white hover:bg-slate-800/50'
            }`}
          >
            Scholarship Catalog
          </Link>

          {/* Student Links */}
          {user?.role === 'student' && (
            <Link 
              to="/student" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/student') ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40' : 'text-slate-300 hover:text-white'
              }`}
            >
              My Dashboard
            </Link>
          )}

          {/* Staff Links */}
          {user?.role === 'staff' && (
            <Link 
              to="/staff" 
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                isActive('/staff') ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/40' : 'text-slate-300 hover:text-white'
              }`}
            >
              Verification Queue
            </Link>
          )}

          {/* Admin Links */}
          {user?.role === 'admin' && (
            <>
              <Link 
                to="/admin" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/admin') ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-300 hover:text-white'
                }`}
              >
                Admin Panel
              </Link>
              <Link 
                to="/admin/analytics" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/admin/analytics') ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-300 hover:text-white'
                }`}
              >
                Analytics
              </Link>
              <Link 
                to="/admin/audit-logs" 
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  isActive('/admin/audit-logs') ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40' : 'text-slate-300 hover:text-white'
                }`}
              >
                Audit Logs
              </Link>
            </>
          )}
        </nav>

        {/* Right Side Actions: Notifications & User Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notifications Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition"
                  title="In-app Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 w-4 h-4 bg-rose-500 text-white rounded-full text-[10px] font-bold flex items-center justify-center animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifs && (
                  <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-2xl shadow-2xl border border-slate-200 text-slate-900 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-3 bg-slate-900 text-white flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="w-4 h-4 text-blue-400" />
                        <span className="font-bold text-sm">Notifications</span>
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          onClick={markAllAsRead} 
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition ${
                              !n.isRead ? 'bg-blue-50/50 font-medium' : ''
                            }`}
                          >
                            <div className="flex justify-between items-start text-slate-800 font-bold mb-1">
                              <span>{n.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-slate-600">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* User Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 transition"
                >
                  <div className="w-7 h-7 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold text-xs uppercase">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                    <div className="text-[10px] text-blue-400 font-mono capitalize leading-tight mt-0.5">
                      Role: {user.role}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-slate-200 text-slate-900 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                    </div>
                    {user.role === 'student' && (
                      <Link 
                        to="/student" 
                        onClick={() => setShowUserMenu(false)} 
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Student Dashboard
                      </Link>
                    )}
                    {user.role === 'staff' && (
                      <Link 
                        to="/staff" 
                        onClick={() => setShowUserMenu(false)} 
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Staff Verification Panel
                      </Link>
                    )}
                    {user.role === 'admin' && (
                      <Link 
                        to="/admin" 
                        onClick={() => setShowUserMenu(false)} 
                        className="block px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                      >
                        Admin Control Dashboard
                      </Link>
                    )}
                    <button
                      onClick={() => {
                        setShowUserMenu(false);
                        logout();
                        navigate('/login');
                      }}
                      className="w-full text-left px-4 py-2 text-xs text-rose-600 font-semibold hover:bg-rose-50 flex items-center gap-2 border-t border-slate-100"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2">
              <Link 
                to="/login" 
                className="px-4 py-2 text-xs font-semibold text-slate-200 hover:text-white hover:bg-slate-800 rounded-xl transition"
              >
                Sign In
              </Link>
              <Link 
                to="/register" 
                className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 rounded-xl shadow-md shadow-blue-500/20 transition"
              >
                Student Register
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
