import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { GraduationCap, Lock, Mail, ArrowRight, Sparkles, ShieldCheck } from 'lucide-react';

export const LoginPage = () => {
  const { login, quickSwitchRole } = useContext(AuthContext);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Requirement #13 domain check
    if (!email.toLowerCase().trim().endsWith('@bitsathy.ac.in')) {
      setError('Access restricted! Only institutional emails ending with "@bitsathy.ac.in" can access the portal.');
      setLoading(false);
      return;
    }

    try {
      const user = await login(email, password);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid institutional email or password');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickLogin = async (role) => {
    setLoading(true);
    try {
      const user = await quickSwitchRole(role);
      if (user.role === 'admin') navigate('/admin');
      else if (user.role === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      setError('Quick login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 p-8 text-white text-center relative">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center mx-auto mb-3 text-white shadow-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight">ScholarPortal.bitsathy</h2>
          <p className="text-xs text-slate-300 mt-1">BIT Sathy Single Sign-On Authentication Engine</p>
          <div className="mt-2 inline-flex items-center gap-1 px-3 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Only @bitsathy.ac.in Authorized
          </div>
        </div>

        {/* Form Body */}
        <div className="p-8 space-y-6">
          
          {/* Quick Demo Login Preset Bar */}
          <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-2xl space-y-2">
            <div className="text-[11px] font-bold text-blue-900 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" /> One-Click Quick Role Sign-in:
            </div>
            <div className="grid grid-cols-3 gap-1.5 text-[11px]">
              <button
                type="button"
                onClick={() => handleQuickLogin('student')}
                className="py-1.5 bg-white border border-blue-200 hover:bg-blue-600 hover:text-white rounded-xl font-semibold text-blue-700 transition"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('staff')}
                className="py-1.5 bg-white border border-indigo-200 hover:bg-indigo-600 hover:text-white rounded-xl font-semibold text-indigo-700 transition"
              >
                🔍 Staff
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('admin')}
                className="py-1.5 bg-white border border-emerald-200 hover:bg-emerald-600 hover:text-white rounded-xl font-semibold text-emerald-700 transition"
              >
                🛡️ Admin
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium leading-relaxed">
              {error}
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">
                Institutional Email (@bitsathy.ac.in)
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="rahul.verma@bitsathy.ac.in"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-800 mb-1">Password</label>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Don't have a BIT Sathy student account?{' '}
            <Link to="/register" className="font-bold text-blue-600 hover:underline">
              Register Here
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};
