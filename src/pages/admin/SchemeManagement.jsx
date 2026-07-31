import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Edit2, Lock, CheckCircle2, Award, Calendar, DollarSign, Building2, X } from 'lucide-react';

export const SchemeManagement = () => {
  const [schemes, setSchemes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingScheme, setEditingScheme] = useState(null);
  const [error, setError] = useState('');

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
    requiredDocuments: ['Marksheet', 'Income Certificate', 'ID Proof', 'Bank Passbook Copy']
  });

  useEffect(() => {
    fetchSchemes();
  }, []);

  const fetchSchemes = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/scholarships');
      setSchemes(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingScheme(null);
    setFormData({
      title: '',
      provider: 'Central Scholarship Authority',
      category: 'Merit-cum-Means',
      amount: 100000,
      deadline: '2026-12-31',
      seats: 1000,
      minPercentage: 75.0,
      maxFamilyIncome: 300000,
      description: 'Provides financial aid for deserving undergraduate students meeting academic and income thresholds.',
      requiresAdminApproval: true,
      requiredDocuments: ['Marksheet', 'Income Certificate', 'ID Proof', 'Bank Passbook Copy']
    });
    setShowModal(true);
  };

  const handleOpenEdit = (scheme) => {
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
      requiredDocuments: scheme.requiredDocuments || ['Marksheet', 'Income Certificate', 'ID Proof']
    });
    setShowModal(true);
  };

  const handleSaveScheme = async (e) => {
    e.preventDefault();
    setError('');

    try {
      if (editingScheme) {
        await axios.put(`/api/scholarships/${editingScheme.id}`, formData);
      } else {
        await axios.post('/api/scholarships', formData);
      }
      setShowModal(false);
      fetchSchemes();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save scheme');
    }
  };

  const handleCloseScheme = async (id) => {
    if (window.confirm('Are you sure you want to close this scheme? No new applications will be accepted.')) {
      try {
        await axios.patch(`/api/scholarships/${id}/close`);
        fetchSchemes();
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Scholarship Scheme Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Configure financial aid programs, eligibility thresholds, and seat quotas.</p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-lg shadow-emerald-600/20 transition flex items-center gap-1.5"
        >
          <Plus className="w-4 h-4" /> Create New Scheme
        </button>
      </div>

      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium">Loading schemes...</div>
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

                <div className="mt-3 text-xs text-slate-600 space-y-1">
                  <div>• Min Marks: <strong>{scheme.eligibilityRules.minPercentage}%</strong></div>
                  <div>• Max Income: <strong>₹{scheme.eligibilityRules.maxFamilyIncome.toLocaleString()}</strong></div>
                  <div>• Executive Clearance required: <strong>{scheme.requiresAdminApproval ? 'Yes (Admin approval required)' : 'No (Auto-approves on staff verification)'}</strong></div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  onClick={() => handleOpenEdit(scheme)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-xs font-semibold text-slate-700 transition flex items-center gap-1"
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit Scheme
                </button>
                {scheme.status === 'active' && (
                  <button
                    onClick={() => handleCloseScheme(scheme.id)}
                    className="px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition flex items-center gap-1"
                  >
                    <Lock className="w-3.5 h-3.5" /> Close Scheme
                  </button>
                )}
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
                {editingScheme ? 'Edit Scholarship Scheme' : 'Create New Scholarship Scheme'}
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveScheme} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl">
                  {error}
                </div>
              )}

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
                  <div className="font-bold text-slate-800">Requires Executive Admin Final Approval</div>
                  <div className="text-[10px] text-slate-400">If disabled, application auto-approves as soon as staff verifies.</div>
                </div>
                <input
                  type="checkbox"
                  checked={formData.requiresAdminApproval}
                  onChange={e => setFormData({ ...formData, requiresAdminApproval: e.target.checked })}
                  className="w-4 h-4 text-emerald-600 rounded"
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
                  className="px-5 py-2 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-500 shadow-md shadow-emerald-600/20"
                >
                  Save Scheme
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
