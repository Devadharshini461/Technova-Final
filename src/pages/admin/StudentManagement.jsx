import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FormValidationBanner } from '../../components/FormValidationBanner';
import { UserPlus, Edit, Trash2, Mail, Phone, GraduationCap, X, Search, CreditCard } from 'lucide-react';

export const StudentManagement = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingStudent, setEditingStudent] = useState(null);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    college: 'Bannari Amman Institute of Technology (BIT Sathy)',
    course: 'B.E Computer Science',
    year: '1st Year',
    marksPercentage: 85.0,
    familyIncome: 200000,
    category: 'General',
    bankAccountNo: '',
    bankIfsc: '',
    bankName: 'State Bank of India',
    bankAccountHolder: ''
  });

  useEffect(() => {
    fetchStudents();
  }, []);

  const fetchStudents = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/staff/students');
      setStudents(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenCreate = () => {
    setEditingStudent(null);
    setFormData({
      name: '',
      email: '',
      password: 'password123',
      phone: '',
      college: 'Bannari Amman Institute of Technology (BIT Sathy)',
      course: 'B.E Computer Science',
      year: '1st Year',
      marksPercentage: 85.0,
      familyIncome: 200000,
      category: 'General',
      bankAccountNo: '309812345678',
      bankIfsc: 'SBIN0001234',
      bankName: 'State Bank of India',
      bankAccountHolder: ''
    });
    setError('');
    setShowModal(true);
  };

  const handleOpenEdit = (st) => {
    setEditingStudent(st);
    const rawPhone = st.phone ? st.phone.replace(/\D/g, '').slice(-10) : '';
    setFormData({
      name: st.name || '',
      email: st.email || '',
      password: '',
      phone: rawPhone,
      college: st.college || 'Bannari Amman Institute of Technology (BIT Sathy)',
      course: st.course || '',
      year: st.year || '',
      marksPercentage: st.marksPercentage || 80,
      familyIncome: st.familyIncome || 200000,
      category: st.category || 'General',
      bankAccountNo: st.bankDetails?.accountNo || '',
      bankIfsc: st.bankDetails?.ifscCode || '',
      bankName: st.bankDetails?.bankName || 'State Bank of India',
      bankAccountHolder: st.bankDetails?.accountHolder || st.name || ''
    });
    setError('');
    setShowModal(true);
  };

  const handleSaveStudent = async (e) => {
    e.preventDefault();
    setError('');

    // Requirement #9: Phone validation (must be 10 digits)
    if (formData.phone) {
      const digits = formData.phone.replace(/\D/g, '');
      if (digits.length !== 10) {
        setError('Phone number must contain exactly 10 digits!');
        return;
      }
    }

    const payload = {
      name: formData.name,
      email: formData.email,
      password: formData.password,
      phone: formData.phone,
      college: formData.college,
      course: formData.course,
      year: formData.year,
      marksPercentage: parseFloat(formData.marksPercentage),
      familyIncome: parseFloat(formData.familyIncome),
      category: formData.category,
      bankDetails: {
        accountNo: formData.bankAccountNo,
        ifscCode: formData.bankIfsc,
        bankName: formData.bankName,
        accountHolder: formData.bankAccountHolder || formData.name
      }
    };

    try {
      if (editingStudent) {
        const res = await axios.put(`/api/staff/students/${editingStudent.id}`, payload);
        setStudents(prev => prev.map(s => s.id === res.data.id ? res.data : s));
      } else {
        const res = await axios.post('/api/staff/students', payload);
        setStudents(prev => [...prev, res.data]);
      }
      setShowModal(false);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save student account');
    }
  };

  const handleRemoveStudent = async (id, name, e) => {
    if (e) e.preventDefault();
    if (window.confirm(`Are you sure you want to remove student account "${name}"?`)) {
      try {
        await axios.delete(`/api/staff/students/${id}`);
        setStudents(prev => prev.filter(s => s.id !== id));
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete student account');
      }
    }
  };

  const filteredStudents = students.filter(st => 
    st.name?.toLowerCase().includes(search.toLowerCase()) ||
    st.email?.toLowerCase().includes(search.toLowerCase()) ||
    st.course?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Account Management</h2>
          <p className="text-xs text-slate-500 mt-0.5">Register new students, update academic records, and manage institutional student profiles.</p>
        </div>

        {/* Requirement #11: Add New Student Button */}
        <button
          type="button"
          onClick={handleOpenCreate}
          className="px-4 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold shadow-lg shadow-blue-600/20 transition flex items-center gap-1.5"
        >
          <UserPlus className="w-4 h-4" /> Add New Student Account
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, email, course..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="text-xs font-semibold text-slate-500">
          Total Registered Students ({filteredStudents.length})
        </div>
      </div>

      {/* Students List */}
      {loading ? (
        <div className="text-center py-12 text-slate-400 font-medium text-xs">Loading student directory...</div>
      ) : filteredStudents.length === 0 ? (
        <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
          <GraduationCap className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-800">No Students Found</h3>
          <p className="text-xs text-slate-500 mt-1">Try adjusting search parameters or add a new student.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredStudents.map((st) => (
            <div key={st.id} className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold text-sm">
                    {st.name ? st.name[0] : 'S'}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 uppercase">
                    Student ({st.category})
                  </span>
                </div>

                <h3 className="text-base font-bold text-slate-900">{st.name}</h3>
                <div className="text-xs text-slate-500 mt-0.5">{st.course} • {st.year}</div>

                <div className="mt-4 space-y-1.5 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{st.email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{st.phone || '+91 91234 56789'}</span>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-2xl border border-slate-100 text-center text-xs">
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Qualifying Marks</div>
                    <div className="font-extrabold text-blue-700 mt-0.5">{st.marksPercentage}%</div>
                  </div>
                  <div>
                    <div className="text-[10px] text-slate-400 font-bold uppercase">Family Income</div>
                    <div className="font-extrabold text-slate-800 mt-0.5">₹{st.familyIncome?.toLocaleString()}</div>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => handleOpenEdit(st)}
                  className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 text-xs font-semibold transition flex items-center gap-1"
                >
                  <Edit className="w-3.5 h-3.5" /> Edit Profile
                </button>
                <button
                  type="button"
                  onClick={(e) => handleRemoveStudent(st.id, st.name, e)}
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
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 space-y-4 my-8">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h3 className="text-base font-bold text-slate-900">
                {editingStudent ? 'Edit Student Account' : 'Add New Student Account'}
              </h3>
              <button type="button" onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveStudent} className="space-y-4 max-h-[75vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Full Student Name</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="Rahul Verma"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Institutional Email (@bitsathy.ac.in)</label>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={e => setFormData({ ...formData, email: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="rahul.verma@bitsathy.ac.in"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">
                    {editingStudent ? 'Password (Leave blank to keep)' : 'Password'}
                  </label>
                  <input
                    type="text"
                    required={!editingStudent}
                    value={formData.password}
                    onChange={e => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    placeholder="••••••••"
                  />
                </div>

                {/* Requirement #9: 10-Digit Mobile Number */}
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
                      placeholder="9123456789"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Course / Major</label>
                  <input
                    type="text"
                    required
                    value={formData.course}
                    onChange={e => setFormData({ ...formData, course: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Current Year</label>
                  <input
                    type="text"
                    required
                    value={formData.year}
                    onChange={e => setFormData({ ...formData, year: e.target.value })}
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

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-800 mb-1">Qualifying Marks / CGPA (%)</label>
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
              </div>

              {/* Bank Account Details */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-3">
                <div className="font-bold text-slate-800 flex items-center gap-1.5">
                  <CreditCard className="w-4 h-4 text-blue-600" /> Bank Details for Grant Transfer
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                    <input
                      type="text"
                      value={formData.bankName}
                      onChange={e => setFormData({ ...formData, bankName: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                    <input
                      type="text"
                      value={formData.bankAccountNo}
                      onChange={e => setFormData({ ...formData, bankAccountNo: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                    <input
                      type="text"
                      value={formData.bankIfsc}
                      onChange={e => setFormData({ ...formData, bankIfsc: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Account Holder</label>
                    <input
                      type="text"
                      value={formData.bankAccountHolder}
                      onChange={e => setFormData({ ...formData, bankAccountHolder: e.target.value })}
                      className="w-full px-3 py-1.5 bg-white rounded-xl border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    />
                  </div>
                </div>
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
                  {editingStudent ? 'Update Student Account' : 'Create Student Account'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
