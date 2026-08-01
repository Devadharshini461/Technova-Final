import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormValidationBanner } from '../../components/FormValidationBanner';
import { UserPlus, Edit, Trash2, Mail, Phone, X } from 'lucide-react';

export const StaffManagement = () => {
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
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

  const handleOpenCreate = () => {
    setEditingStaff(null);
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      phone: '',
      department: 'Document Verification Cell'
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (staff) => {
    setEditingStaff(staff);
    // Extract raw 10 digits from stored phone for display in input
    const rawPhone = staff.phone ? staff.phone.replace(/\D/g, '').slice(-10) : '';
    setFormData({
      name: staff.name,
      email: staff.email,
      password: '',
      phone: rawPhone,
      department: staff.department || 'Document Verification Cell'
    });
    setError('');
    setShowModal(true);
  };

  const handleSaveStaff = async (e) => {
    e.preventDefault();
    setError('');

    // Requirement #9: Phone number validation - must be 10 digits
    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        setError('Phone number must contain exactly 10 digits!');
        return;
      }
    }

    try {
      if (editingStaff) {
        const res = await axios.put(`/api/staff/${editingStaff.id}`, formData);
        setStaffList(prev => prev.map(s => s.id === res.data.id ? { ...s, ...res.data } : s));
      } else {
        const res = await axios.post('/api/staff', formData);
        setStaffList(prev => [...prev, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save staff account');
    }
  };

  const handleRemoveStaff = async (id, name, e) => {
    if (e) e.preventDefault();
    if (window.confirm(`Are you sure you want to remove staff account "${name}"?`)) {
      try {
        await axios.delete(`/api/staff/${id}`);
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
          onClick={handleOpenCreate}
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

              {/* Requirement #10: Edit Staff alongside Remove Staff */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(s)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Staff
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemoveStaff(s.id, s.name, e)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition flex items-center gap-1"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Remove
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
              <h3 className="text-base font-bold text-slate-900">
                {editingStaff ? 'Edit Verification Officer' : 'Add New Verification Officer'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStaff} className="space-y-3 text-xs">
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
                <label className="block font-bold text-slate-800 mb-1">
                  Department
                </label>
                <input
                  type="text"
                  value={formData.department}
                  onChange={e => setFormData({ ...formData, department: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="Document Verification Cell"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  {editingStaff ? 'Password (Leave blank to keep unchanged)' : 'Password'}
                </label>
                <input
                  type="text"
                  required={!editingStaff}
                  value={formData.password}
                  onChange={e => setFormData({ ...formData, password: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  placeholder="••••••••"
                />
              </div>

              {/* Requirement #9: 10-digit phone number input with default +91 prefix */}
              <div>
                <label className="block font-bold text-slate-800 mb-1">
                  10-Digit Mobile Number (+91 default added)
                </label>
                <div className="flex items-center">
                  <span className="px-3 py-2 bg-slate-100 border border-r-0 border-slate-200 rounded-l-xl text-slate-600 font-bold text-xs">
                    +91
                  </span>
                  <input
                    type="text"
                    maxLength="10"
                    value={formData.phone}
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      setFormData({ ...formData, phone: val });
                    }}
                    className="w-full px-3 py-2 rounded-r-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    placeholder="9876543210"
                  />
                </div>
                <span className="text-[10px] text-slate-400 mt-0.5 block">Must be exactly 10 digits</span>
              </div>

              {/* Requirement #3: Validation error banner immediately above Cancel/Submit */}
              <FormValidationBanner error={error} />

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
                  {editingStaff ? 'Update Staff Account' : 'Create Staff Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
