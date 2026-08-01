import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { NotificationContext } from '../context/NotificationContext';
import { 
  GraduationCap, Bell, LogOut, ChevronDown, Check, 
  Menu, X, Sparkles, Shield
} from 'lucide-react';

export const Navbar = ({ onToggleSidebar, isSidebarCollapsed }) => {
  const { user, logout, quickSwitchRole } = useContext(AuthContext);
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useContext(NotificationContext);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

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

  const [showAllNotifsModal, setShowAllNotifsModal] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-slate-900 text-white shadow-md border-b border-slate-800">
      {/* Top Quick Demo Role Toolbar */}
      <div className="bg-slate-950 text-slate-300 text-xs py-1.5 px-4 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
          <span className="font-semibold text-slate-200">BIT Sathy (@bitsathy.ac.in) Portal</span>
        </div>
        <div className="flex items-center gap-2">
          <button 
            type="button"
            onClick={() => handleRoleSwitch('student')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'student' ? 'bg-blue-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🎓 Student
          </button>
          <button 
            type="button"
            onClick={() => handleRoleSwitch('staff')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'staff' ? 'bg-indigo-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🔍 Staff
          </button>
          <button 
            type="button"
            onClick={() => handleRoleSwitch('admin')}
            className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition ${
              user?.role === 'admin' ? 'bg-emerald-600 text-white shadow' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
            }`}
          >
            🛡️ Admin
          </button>
        </div>
      </div>

      {/* Main Navbar Bar */}
      <div className="px-4 h-16 flex items-center justify-between">
        
        {/* Requirement #3: Left Corner App Logo Button (Toggles Sidebar) */}
        <div className="flex items-center gap-3">
          {user && (
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition focus:outline-none"
              title="Toggle Sidebar Navigation"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <div className="flex items-center gap-3 cursor-pointer" onClick={() => user ? navigate(`/${user.role}`) : navigate('/login')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <GraduationCap className="w-6 h-6" />
            </div>
            <div>
              <div className="font-extrabold text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-300">
                ScholarPortal<span className="text-blue-400">.bitsathy</span>
              </div>
              <div className="text-[10px] text-slate-400 font-semibold tracking-wider uppercase">
                BIT Sathy Verification Portal
              </div>
            </div>
          </div>
        </div>

        {/* Right Corner Notification & User Logo Menu */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              {/* Notification Bell Dropdown */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowNotifs(!showNotifs)}
                  className="relative p-2 rounded-xl text-slate-300 hover:text-white hover:bg-slate-800 transition"
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
                        <span className="font-bold text-sm">Notifications Inbox</span>
                      </div>
                      {unreadCount > 0 && (
                        <button 
                          type="button"
                          onClick={markAllAsRead} 
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium"
                        >
                          <Check className="w-3.5 h-3.5" /> Mark all read
                        </button>
                      )}
                    </div>

                    {/* Requirement #13: Show Top 3 Notifications */}
                    <div className="max-h-80 overflow-y-auto divide-y divide-slate-100">
                      {notifications.length === 0 ? (
                        <div className="p-6 text-center text-slate-400 text-sm">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.slice(0, 3).map((n) => (
                          <div 
                            key={n.id} 
                            onClick={() => markAsRead(n.id)}
                            className={`p-3 text-xs cursor-pointer hover:bg-slate-50 transition flex gap-2.5 items-start ${
                              !n.isRead ? 'bg-blue-50/70 font-semibold' : ''
                            }`}
                          >
                            {/* Requirement #12: Read / Unread Colored Dots */}
                            <span 
                              className={`mt-1.5 w-2.5 h-2.5 rounded-full shrink-0 ${
                                !n.isRead ? 'bg-blue-600 ring-2 ring-blue-200' : 'bg-slate-300'
                              }`} 
                              title={!n.isRead ? 'Unread Notification' : 'Read Notification'}
                            />
                            <div className="flex-1 min-w-0">
                              <div className="flex justify-between items-start text-slate-800 font-bold mb-1">
                                <span className="truncate">{n.title}</span>
                                <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">
                                  {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                </span>
                              </div>
                              <p className="text-slate-600 font-normal leading-relaxed text-[11px] line-clamp-2">{n.message}</p>
                            </div>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Requirement #13: View All Notifications Button */}
                    {notifications.length > 0 && (
                      <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                        <button
                          type="button"
                          onClick={() => {
                            setShowNotifs(false);
                            setShowAllNotifsModal(true);
                          }}
                          className="w-full py-1.5 text-xs font-bold text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-xl transition"
                        >
                          View All Notifications ({notifications.length}) →
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* User Profile Menu */}
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="flex items-center gap-2 p-1.5 rounded-xl border border-slate-700 bg-slate-800 hover:bg-slate-750 transition"
                >
                  <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-extrabold text-xs uppercase shadow-inner">
                    {user.name ? user.name[0] : 'U'}
                  </div>
                  <div className="hidden lg:block text-left">
                    <div className="text-xs font-semibold text-white leading-none">{user.name}</div>
                    <div className="text-[10px] text-blue-400 font-mono leading-tight mt-0.5">
                      {user.email}
                    </div>
                  </div>
                  <ChevronDown className="w-4 h-4 text-slate-400" />
                </button>

                {showUserMenu && (
                  <div className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-slate-200 text-slate-900 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-bold text-slate-900">{user.name}</p>
                      <p className="text-[11px] text-slate-500 font-mono">{user.email}</p>
                      <span className="inline-block mt-1 px-2 py-0.5 rounded bg-blue-100 text-blue-800 text-[10px] font-bold uppercase">
                        {user.role}
                      </span>
                    </div>

                    <button
                      type="button"
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
          ) : null}
        </div>
      </div>

      {/* Requirement #13: All Notifications Modal */}
      {showAllNotifsModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold">All System Notifications ({notifications.length})</h3>
              </div>
              <button 
                type="button"
                onClick={() => setShowAllNotifsModal(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-full transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
              <span className="text-xs text-slate-600 font-medium">
                {unreadCount > 0 ? `${unreadCount} unread notification(s)` : 'All notifications read'}
              </span>
              {unreadCount > 0 && (
                <button 
                  type="button"
                  onClick={markAllAsRead} 
                  className="text-xs text-blue-600 hover:text-blue-700 font-bold flex items-center gap-1"
                >
                  <Check className="w-3.5 h-3.5" /> Mark all read
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto divide-y divide-slate-100 p-2">
              {notifications.length === 0 ? (
                <div className="p-12 text-center text-slate-400 text-xs">
                  No notifications recorded.
                </div>
              ) : (
                notifications.map((n) => (
                  <div 
                    key={n.id} 
                    onClick={() => markAsRead(n.id)}
                    className={`p-4 text-xs cursor-pointer hover:bg-slate-50 transition rounded-2xl flex gap-3 items-start my-1 ${
                      !n.isRead ? 'bg-blue-50/70 font-semibold' : 'bg-white'
                    }`}
                  >
                    {/* Requirement #12: Colored dot indicator */}
                    <span 
                      className={`mt-1 w-3 h-3 rounded-full shrink-0 ${
                        !n.isRead ? 'bg-blue-600 ring-4 ring-blue-100' : 'bg-slate-300'
                      }`} 
                    />
                    <div className="flex-1">
                      <div className="flex justify-between items-start text-slate-900 font-bold mb-1">
                        <span className="text-sm">{n.title}</span>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0 ml-2">
                          {new Date(n.createdAt).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-slate-600 font-normal leading-relaxed text-xs">{n.message}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 text-right">
              <button
                type="button"
                onClick={() => setShowAllNotifsModal(false)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
