import React, { useContext, useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { ScholarshipCatalog } from './pages/student/ScholarshipCatalog';
import { StudentDashboard } from './pages/student/StudentDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { AdminDashboard } from './pages/admin/AdminDashboard';

// Protected Workspace Shell layout with Top Navbar and Left Sidebar
const WorkspaceLayout = ({ children, allowedRoles }) => {
  const { user, loading } = useContext(AuthContext);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300 font-medium text-xs">
        Authenticating institutional user session...
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'staff') return <Navigate to="/staff" replace />;
    return <Navigate to="/student" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      {/* Requirement #3: Top Horizontal Navbar */}
      <Navbar 
        onToggleSidebar={() => setIsSidebarCollapsed(!isSidebarCollapsed)} 
        isSidebarCollapsed={isSidebarCollapsed} 
      />

      <div className="flex flex-1 overflow-hidden">
        {/* Requirement #3: Left Collapsible Vertical Sidebar */}
        <Sidebar isCollapsed={isSidebarCollapsed} />

        {/* Main Content Workspace (No Footer as per Requirement #8) */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
};

// Root index redirect component
const RootRedirect = () => {
  const { user, loading } = useContext(AuthContext);

  if (loading) return null;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (user.role === 'admin') return <Navigate to="/admin" replace />;
  if (user.role === 'staff') return <Navigate to="/staff" replace />;
  return <Navigate to="/student" replace />;
};

export default function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <BrowserRouter>
          <Routes>
            {/* Requirement #1 & #2: Root lands on Login page or direct Dashboard */}
            <Route path="/" element={<RootRedirect />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />

            {/* Student Routes */}
            <Route
              path="/student/*"
              element={
                <WorkspaceLayout allowedRoles={['student']}>
                  <ScholarshipCatalog />
                </WorkspaceLayout>
              }
            />

            <Route
              path="/student/my-applications"
              element={
                <WorkspaceLayout allowedRoles={['student']}>
                  <StudentDashboard />
                </WorkspaceLayout>
              }
            />

            {/* Staff Routes */}
            <Route
              path="/staff/*"
              element={
                <WorkspaceLayout allowedRoles={['staff', 'admin']}>
                  <StaffDashboard />
                </WorkspaceLayout>
              }
            />

            {/* Admin Routes */}
            <Route
              path="/admin/*"
              element={
                <WorkspaceLayout allowedRoles={['admin']}>
                  <AdminDashboard />
                </WorkspaceLayout>
              }
            />

            {/* Fallback Catch-All */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}
