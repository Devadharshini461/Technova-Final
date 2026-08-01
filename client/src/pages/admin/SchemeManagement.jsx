import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormValidationBanner } from '../../components/FormValidationBanner';
import { Plus, Edit2, Lock, Unlock, Trash2, Building2, X, UserCheck, AlertCircle } from 'lucide-react';

export const SchemeManagement = () => {
  const [schemes, setSchemes] = useState([]);
  const [staffList, setStaffList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [schemesRes, staffRes] = await Promise.all([
        axios.get('/api/scholarships?includeExpired=true'),
        axios.get('/api/staff')
      ]);
      setSchemes(schemesRes.data);
      setStaffList(staffRes.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = (e) => {
    if (e) e.preventDefault();
    setEditingScheme(null);
    setFormData({
      title: '',
      provider: 'BIT Sathy & Government CSR',
      category: 'Merit-cum-Means',
      amount: 100000,
      deadline: '2026-12-31',
      seats: 1000,
      minPercentage: 75.0,
      maxFamilyIncome: 300000,
      description: 'Provides financial aid for deserving BIT Sathy undergraduate students meeting academic and income thresholds.',
      requiresAdminApproval: true,
      assignedStaffId: staffList[0]?.id || '',
      requiredDocuments: ['Marksheet', 'Income Certificate', 'ID Proof', 'Bank Passbook Copy']
    });
    setShowModal(true);
  };

  const handleOpenEdit = (scheme, e) => {
    if (e) e.preventDefault();
    setEditingScheme(scheme);
    setFormData({
      title: scheme.title,
      provider: scheme.provider,
      category: scheme.category,
      amount: scheme.amount,
      deadline: scheme.deadline,
      seats: scheme.seats,
      minPercentage: scheme.eligibilityRules.minPercentage,
      maxFamilyIncome: scheme.eligibilityRules.maxFamilyIncome,
      description: scheme.eligibilityRules.description,
      requiresAdminApproval: scheme.requiresAdminApproval,
      assignedStaffId: scheme.assignedStaffId || '',
      requiredDocuments: scheme.requiredDocuments || ['Marksheet', 'Income Certificate', 'ID Proof']
    });
    setShowModal(true);
  };

  const [formData, setFormData] = useState({
    title: '',
    provider: '',
    category: 'Merit-cum-Means',
    amount: 100000,
    deadline: '2026-12-31',
    seats: 1000,
    minPercentage: 75.0,
    maxFamilyIncome: 300000,
    description: '',
    requiresAdminApproval: true,
    assignedStaffId: '',
    requiredDocuments: ['Marksheet', 'Income Certificate', 'ID Proof', 'Bank Passbook Copy']
  });

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    setError('');

    // Requirement #6: Validate deadline date is not less than current date
    const todayStr = new Date().toISOString().split('T')[0];
    if (formData.deadline < todayStr) {
      setError('Invalid deadline date! Deadline cannot be set to a date in the past.');
      return;
    }

    try {
      if (editingScheme) {
        const res = await axios.put(`/api/scholarships/${editingScheme.id}`, formData);
        setSchemes(prev => prev.map(s => s.id === res.data.id ? res.data : s));
      } else {
        const res = await axios.post('/api/scholarships', formData);
        setSchemes(prev => [res.data, ...prev]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save scheme');
    }
  };

  // Requirement #5: Admin close & open scheme toggle
  const handleToggleSchemeStatus = async (id, currentStatus, title, e) => {
    if (e) e.preventDefault();
    const actionName = currentStatus === 'active' ? 'close' : 're-open';
    if (window.confirm(`Are you sure you want to ${actionName} scholarship scheme "${title}"?`)) {
      try {
        const res = await axios.patch(`/api/scholarships/${id}/toggle-status`);
        setSchemes(prev => prev.map(s => s.id === id ? res.data : s));
      } catch (err) {
        alert(err.response?.data?.message || `Failed to ${actionName} scheme`);
      }
    }
  };

  // Requirement #16: Admin delete scholarship option
  const handleDeleteScheme = async (id, title, e) => {
    if (e) e.preventDefault();
    if (window.confirm(`Are you sure you want to permanently delete scholarship scheme "${title}"?`)) {
      try {
        await axios.delete(`/api/scholarships/${id}`);
        setSchemes(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete scheme');
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Scholarship Scheme Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure financial aid programs, assign designated staff officers, and set eligibility rules.</p>
        </div>

        <button
          type="button"
          onClick={(e) => handleOpenCreate(e)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create New Scheme
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium text-xs">Loading schemes...</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {schemes.map((scheme) => (
            <div key={scheme.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                    {scheme.category}
                  </span>
                  <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-bold uppercase ${
                    scheme.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-700'
                  }`}>
                    {scheme.status}
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{scheme.title}</h3>
                <div className="text-xs text-slate-500 mt-1 flex items-center gap-1">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" /> {scheme.provider}
                </div>

                <div className="mt-3 p-2.5 bg-indigo-50/70 border border-indigo-100 rounded-xl flex items-center gap-2 text-xs">
                  <UserCheck className="w-4 h-4 text-indigo-600 shrink-0" />
                  <div>
                    <div className="text-[10px] font-bold text-indigo-900 uppercase">Assigned Verification Officer</div>
                    <div className="font-bold text-indigo-950">{scheme.assignedStaffName || 'Unassigned'}</div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-3 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Grant Amount</div>
                    <div className="font-extrabold text-blue-700 mt-0.5">₹{scheme.amount.toLocaleString()}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Seats / Apps</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">{scheme.appliedCount} / {scheme.seats}</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Deadline</div>
                    <div className="font-bold text-amber-700 mt-0.5">{scheme.deadline}</div>
                  </div>
                </div>
              </div>

              {/* Requirement #5 & #16: Edit, Open/Close, and Delete Scheme Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2 flex-wrap">
                <button
                  type="button"
                  onClick={(e) => handleOpenEdit(scheme, e)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>

                {/* Requirement #5: Admin Open/Close scheme toggle button */}
                <button
                  type="button"
                  onClick={(e) => handleToggleSchemeStatus(scheme.id, scheme.status, scheme.title, e)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition flex items-center gap-1 ${
                    scheme.status === 'active'
                      ? 'bg-amber-50 hover:bg-amber-100 text-amber-800'
                      : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800'
                  }`}
                >
                  {scheme.status === 'active' ? (
                    <><Lock className="w-3.5 h-3.5" /> Close Scheme</>
                  ) : (
                    <><Unlock className="w-3.5 h-3.5" /> Open Scheme</>
                  )}
                </button>

                {/* Requirement #16: Admin Delete Scheme button */}
                <button
                  type="button"
                  onClick={(e) => handleDeleteScheme(scheme.id, scheme.title, e)}
                  className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition flex items-center gap-1"
                  title="Permanently Delete Scholarship Scheme"
                >
                  <Trash2 className="w-3.5 h-3.5" /> Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-8">
            <div className="bg-slate-900 p-5 text-white flex items-center justify-between">
              <h3 className="text-base font-bold">
                {editingScheme ? 'Edit Scheme & Staff Allotment' : 'Create Scheme & Assign Staff'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheme} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div>
                <label className="block font-bold text-slate-800 mb-1">Scheme Title</label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={e => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-indigo-50/70 border border-indigo-200 rounded-2xl">
                <label className="block font-bold text-indigo-950 mb-1 flex items-center gap-1">
                  <UserCheck className="w-4 h-4 text-indigo-600" /> Allot Verification Staff Officer
                </label>
                <select
                  required
                  value={formData.assignedStaffId}
                  onChange={e => setFormData({ ...formData, assignedStaffId: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-indigo-200 font-bold text-slate-900 bg-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="">-- Select Staff Officer --</option>
                  {staffList.map(st => (
                    <option key={st.id} value={st.id}>
                      {st.name} ({st.email})
                    </option>
                  ))}
                </select>
                <p className="text-[10px] text-indigo-800 mt-1">
                  Applications submitted for this scheme will report ONLY to this assigned officer.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Provider / Sponsor</label>
                  <input
                    type="text"
                    required
                    value={formData.provider}
                    onChange={e => setFormData({ ...formData, provider: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  >
                    <option value="Merit-cum-Means">Merit-cum-Means</option>
                    <option value="Girls STEM">Girls STEM</option>
                    <option value="Category Specific">Category Specific</option>
                    <option value="Tech">Tech</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Grant Amount (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.amount}
                    onChange={e => setFormData({ ...formData, amount: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Total Seats</label>
                  <input
                    type="number"
                    required
                    value={formData.seats}
                    onChange={e => setFormData({ ...formData, seats: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Deadline Date</label>
                  <input
                    type="date"
                    required
                    value={formData.deadline}
                    onChange={e => setFormData({ ...formData, deadline: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Minimum Marks Required (%)</label>
                  <input
                    type="number"
                    step="0.1"
                    required
                    value={formData.minPercentage}
                    onChange={e => setFormData({ ...formData, minPercentage: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Max Annual Income Ceiling (₹)</label>
                  <input
                    type="number"
                    required
                    value={formData.maxFamilyIncome}
                    onChange={e => setFormData({ ...formData, maxFamilyIncome: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-800 mb-1">Description & Overview</label>
                <textarea
                  rows="2"
                  value={formData.description}
                  onChange={e => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                />
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                <div>
                  <div className="font-bold text-slate-800">Requires Executive Admin Approval</div>
                  <div className="text-[10px] text-slate-400">If disabled, application auto-approves as soon as staff verifies.</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.requiresAdminApproval}
                  onChange={e => setFormData({ ...formData, requiresAdminApproval: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
                />
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  Save Scheme & Allotment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
