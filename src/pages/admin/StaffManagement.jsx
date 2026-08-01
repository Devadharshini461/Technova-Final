import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { UserPlus, Trash2, Mail, Phone, X } from 'lucide-react';

export const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: 'password123',
    phone: '',
    department: 'Document Verification Cell'
  });
  const [error, setError] = useState('');

  useEffect(() => {
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/staff');
      setStaffList(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddStaff = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await axios.post('/api/staff', formData);
      // In-place state update: append new staff without page refresh
      setStaffList(prev => [...prev, res.data]);
      setShowModal(false);
      setFormData({
        name: '',
        email: '',
        password: 'password123',
        phone: '',
        department: 'Document Verification Cell'
      });
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add staff account');
    }
  };

  const handleRemoveStaff = async (id, name, e) => {
    if (e) e.preventDefault();
    if (window.confirm(`Are you sure you want to remove staff account "${name}"?`)) {
      try {
        await axios.delete(`/api/staff/${id}`);
        // In-place state update: remove staff without page refresh or scroll reset
        setStaffList(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete staff account');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Staff Account Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Manage verification officer accounts, monitor inspection workloads, and assign teams.</p>
        </div>

        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" /> Add New Verification Officer
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium text-xs">Loading staff accounts...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {staffList.map((s) => (
            <div key={s.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold text-sm">
                    {s.name ? s.name[0] : 'S'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-100 text-indigo-800 uppercase">
                    Verification Inspector
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{s.department || 'Document Verification Cell'}</div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400" />
                    <span className="truncate">{s.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    <span>{s.phone || '+91 98765 43210'}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Pending Queue</div>
                    <div className="font-extrabold text-amber-600 mt-0.5">{s.assignedCount} Apps</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Processed</div>
                    <div className="font-extrabold text-emerald-700 mt-0.5">{s.processedCount} Apps</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end">
                <button
                  type="button"
                  onClick={(e) => handleRemoveStaff(s.id, s.name, e)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove Staff
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">Add New Verification Officer</h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl">
                {error}
              </div>
            )}

            <form onSubmit={handleAddStaff} className="space-y-3 text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Dr. Ramesh Verma"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Official Email Address (@bitsathy.ac.in)</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={e => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="staff.ramesh@bitsathy.ac.in"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Password</label>
                <input
                  type="text"
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
                  value={formData.phone}
                  onChange={e => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="+91 98765 43210"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-blue-600 text-white font-bold hover:bg-blue-500 shadow-md shadow-blue-600/20"
                >
                  Create Staff Account
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
