import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { 
  GraduationCap, Search, Award, CheckCircle2, ShieldCheck, 
  ArrowRight, Users, Sparkles, Building2, ChevronRight, DollarSign, Clock 
} from 'lucide-react';

export const HomePage = () => {
  const { quickSwitchRole } = useContext(AuthContext);
  const [featuredSchemes, setFeaturedSchemes] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get('/api/scholarships', { params: { status: 'active' } })
      .then(res => setFeaturedSchemes(res.data.slice(0, 3)))
      .catch(err => console.error(err));
  }, []);

  const handleRoleLaunch = async (role) => {
    try {
      await quickSwitchRole(role);
      if (role === 'admin') navigate('/admin');
      else if (role === 'staff') navigate('/staff');
      else navigate('/student');
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      
      {/* Hero Banner Section (Buddy4Study Style) */}
      <section className="bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white relative overflow-hidden py-16 sm:py-24 px-4 sm:px-6 lg:px-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.15),transparent_50%)]" />
        
        <div className="max-w-7xl mx-auto relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <span className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full text-xs font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30">
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" /> Official National Scholarship Verification Portal
            </span>

            <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight">
              Empowering Education Through <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-indigo-300 to-emerald-400">Verified Grants & Scholarships</span>
            </h1>

            <p className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed">
              India's transparent multi-stakeholder scholarship engine. Streamlined application submission, automated eligibility checking, institutional staff document verification, and direct bank account disbursement.
            </p>

            {/* Quick Hero Actions */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                to="/student"
                className="px-6 py-3.5 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-xl shadow-blue-500/25 transition flex items-center gap-2"
              >
                Browse All Scholarships <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                to="/register"
                className="px-6 py-3.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs sm:text-sm border border-slate-700 transition"
              >
                Student Registration
              </Link>
            </div>
          </div>

          {/* Right Quick Role Login Cards */}
          <div className="lg:col-span-5 bg-white/10 backdrop-blur-md rounded-3xl p-6 border border-white/10 space-y-4">
            <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" /> Interactive Demo Role Switcher
            </h3>

            <div 
              onClick={() => handleRoleLaunch('student')}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-blue-500 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600/30 text-blue-400 flex items-center justify-center font-bold text-sm">
                  🎓
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-blue-400 transition">Student Applicant</div>
                  <div className="text-[11px] text-slate-400">Browse schemes, apply & track status</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-blue-400 group-hover:translate-x-1 transition" />
            </div>

            <div 
              onClick={() => handleRoleLaunch('staff')}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-indigo-600/30 text-indigo-400 flex items-center justify-center font-bold text-sm">
                  🔍
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-indigo-400 transition">Staff Verification Officer</div>
                  <div className="text-[11px] text-slate-400">Inspect docs, auto-check & recommend</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition" />
            </div>

            <div 
              onClick={() => handleRoleLaunch('admin')}
              className="p-4 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500 cursor-pointer transition flex items-center justify-between group"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-sm">
                  🛡️
                </div>
                <div>
                  <div className="text-sm font-bold text-white group-hover:text-emerald-400 transition">Superintendent Admin</div>
                  <div className="text-[11px] text-slate-400">Manage schemes, final approval & disburse</div>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-emerald-400 group-hover:translate-x-1 transition" />
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Counter Bar */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 relative z-20">
        <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6 text-center divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
          <div>
            <div className="text-2xl sm:text-3xl font-extrabold text-blue-600">₹5.2 Cr+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Grants Disbursed</div>
          </div>
          <div className="pt-4 sm:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">18,500+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Students Assisted</div>
          </div>
          <div className="pt-4 lg:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-indigo-600">120+</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Verified Schemes</div>
          </div>
          <div className="pt-4 lg:pt-0">
            <div className="text-2xl sm:text-3xl font-extrabold text-cyan-600">99.4%</div>
            <div className="text-xs font-semibold text-slate-500 uppercase mt-1">Verification Accuracy</div>
          </div>
        </div>
      </section>

      {/* Featured Scholarships Section */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-extrabold text-slate-900">Featured Active Scholarships</h2>
            <p className="text-xs text-slate-500 mt-1">Top government and corporate CSR sponsored grants currently accepting applications.</p>
          </div>
          <Link
            to="/student"
            className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            View All Programs <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {featuredSchemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4">
              <div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                  {scheme.category}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-3">{scheme.title}</h3>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {scheme.provider}
                </div>

                <div className="mt-4 bg-slate-50 p-3 rounded-2xl border border-slate-100 flex items-center justify-between">
                  <div>
                    <div className="text-[10px] text-slate-400 uppercase font-bold">Financial Grant</div>
                    <div className="text-lg font-extrabold text-blue-700">₹{scheme.amount.toLocaleString()}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Deadline</div>
                    <div className="text-xs font-bold text-amber-700">{scheme.deadline}</div>
                  </div>
                </div>
              </div>

              <Link
                to="/student"
                className="w-full py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs text-center transition block shadow-md shadow-blue-500/20"
              >
                Apply Now
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Verification Lifecycle Timeline */}
      <section className="bg-white py-16 border-t border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">Transparent 4-Stage Verification Workflow</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-2">Every application moves through a rigorous state machine with real-time notifications at every milestone.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                1
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Student Applies</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Student selects scheme, fills academic details, and uploads authentic certificates.</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                2
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Staff Verification</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Verification officer inspects documents and checks system auto-eligibility rules.</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                3
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Admin Clearance</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Superintendent approves recommendation or executes logged executive override.</p>
            </div>

            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-200 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-emerald-600 text-white flex items-center justify-center font-bold text-lg mx-auto shadow-md">
                4
              </div>
              <h3 className="font-bold text-slate-900 text-sm">Direct Disbursement</h3>
              <p className="text-xs text-slate-500 leading-relaxed">Funds transferred via DBT to registered bank account with NPCI reference ID.</p>
            </div>
          </div>
        </div>
      </section>

    </div>
  );
};
