import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Users, GraduationCap, FileText, Search, RefreshCw, Award } from 'lucide-react';

export const StudentReports = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchStudentReports();
  }, []);

  const fetchStudentReports = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/staff/student-reports');
      setReports(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredReports = reports.filter(st => 
    st.name.toLowerCase().includes(search.toLowerCase()) ||
    st.email.toLowerCase().includes(search.toLowerCase()) ||
    st.college.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Student Application Reports Directory</h2>
          <p className="text-xs text-slate-500 mt-0.5">Comprehensive audit breakdown of registered students, application submission counts, and scholarship scheme names.</p>
        </div>

        <button
          type="button"
          onClick={fetchStudentReports}
          className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold border border-slate-200 transition flex items-center gap-1.5"
        >
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Reports
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 flex items-center justify-between">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search student name, email, department..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </div>
        <div className="text-xs font-bold text-slate-500">
          Total Registered Students: {reports.length}
        </div>
      </div>

      {/* Student Reports Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-12 text-center text-slate-400 font-medium text-xs">Loading student application reports...</div>
        ) : filteredReports.length === 0 ? (
          <div className="p-12 text-center text-slate-400 text-xs">No student reports found.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">Student Info</th>
                  <th className="py-3.5 px-6">Academic Marks</th>
                  <th className="py-3.5 px-6">Family Income</th>
                  <th className="py-3.5 px-6">Total Apps Submitted</th>
                  <th className="py-3.5 px-6">Applied Scholarship Names</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredReports.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-slate-900 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-blue-600 shrink-0" />
                        <span>{st.name}</span>
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono mt-0.5">{st.email}</div>
                      <div className="text-[10px] text-slate-500">{st.college} ({st.course})</div>
                    </td>
                    <td className="py-4 px-6 font-extrabold text-blue-700">{st.marksPercentage}%</td>
                    <td className="py-4 px-6 font-bold text-slate-900">₹{st.familyIncome?.toLocaleString()}</td>
                    <td className="py-4 px-6">
                      <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-blue-50 text-blue-800 border border-blue-200">
                        {st.applicationCount} Applications
                      </span>
                    </td>
                    <td className="py-4 px-6">
                      {st.scholarshipsApplied && st.scholarshipsApplied.length > 0 ? (
                        <div className="space-y-1">
                          {st.scholarshipsApplied.map((name, i) => (
                            <div key={i} className="inline-block px-2.5 py-1 rounded-lg bg-slate-100 text-slate-800 text-[11px] font-medium border border-slate-200 mr-1 mb-1">
                              • {name}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">No applications submitted yet</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
