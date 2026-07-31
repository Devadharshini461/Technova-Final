import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import { GraduationCap, ArrowRight, User, Mail, Lock, Phone, Building, CreditCard } from 'lucide-react';

export const RegisterPage = () => {
  const { register } = useContext(AuthContext);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    college: '',
    course: '',
    year: '1st Year',
    marksPercentage: 85.0,
    familyIncome: 200000,
    category: 'General',
    bankAccountNo: '309812345678',
    bankIfsc: 'SBIN0001234',
    bankName: 'State Bank of India'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await register({
        ...formData,
        bankDetails: {
          accountNo: formData.bankAccountNo,
          ifscCode: formData.bankIfsc,
          bankName: formData.bankName,
          accountHolder: formData.name
        }
      });
      navigate('/student');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 py-12">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 p-8 text-white text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center mx-auto mb-3 text-white shadow-lg">
            <GraduationCap className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold">Student Portal Registration</h2>
          <p className="text-xs text-slate-300 mt-1">Create your verified student profile to discover and apply for scholarships</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-8 space-y-6 text-xs">
          {error && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
              {error}
            </div>
          )}

          {/* Account Details */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <User className="w-4 h-4 text-blue-600" /> Account Security Credentials
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Student Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Rahul Verma"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  placeholder="rahul.verma@gmail.com"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Password</label>
                <input
                  type="password"
                  required
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+91 91234 56789"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Academic Profile */}
          <div>
            <h3 className="font-bold text-slate-900 text-sm mb-3 pb-1 border-b border-slate-100 flex items-center gap-1.5">
              <Building className="w-4 h-4 text-blue-600" /> Academic & Eligibility Details
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-bold text-slate-800 mb-1">College / Institution</label>
                <input
                  type="text"
                  required
                  value={formData.college}
                  onChange={e => setFormData({ ...formData, college: e.target.value })}
                  placeholder="Indian Institute of Technology, Delhi"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Degree Course</label>
                <input
                  type="text"
                  required
                  value={formData.course}
                  onChange={e => setFormData({ ...formData, course: e.target.value })}
                  placeholder="B.Tech Computer Science"
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Academic Percentage (%)</label>
                <input
                  type="number"
                  step="0.1"
                  required
                  value={formData.marksPercentage}
                  onChange={e => setFormData({ ...formData, marksPercentage: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Annual Family Income (₹)</label>
                <input
                  type="number"
                  required
                  value={formData.familyIncome}
                  onChange={e => setFormData({ ...formData, familyIncome: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>
              <div>
                <label className="block font-bold text-slate-800 mb-1">Social Category</label>
                <select
                  value={formData.category}
                  onChange={e => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                >
                  <option value="General">General</option>
                  <option value="OBC">OBC</option>
                  <option value="SC">SC</option>
                  <option value="ST">ST</option>
                  <option value="EWS">EWS</option>
                </select>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-500/25 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
          >
            {loading ? 'Registering Account...' : 'Complete Student Registration'} <ArrowRight className="w-4 h-4" />
          </button>

          <div className="text-center text-xs text-slate-500 border-t border-slate-100 pt-4">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-blue-600 hover:underline">
              Sign In Here
            </Link>
          </div>
        </form>

      </div>
    </div>
  );
};
