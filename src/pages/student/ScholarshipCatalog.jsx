import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from '../../context/AuthContext';
import { Search, Filter, Calendar, Award, CheckCircle2, ChevronRight, Sparkles, Building2 } from 'lucide-react';
import { ScholarshipDetailModal } from './ScholarshipDetailModal';
import { ApplicationFormModal } from './ApplicationFormModal';

export const ScholarshipCatalog = () => {
  const { user } = useContext(AuthContext);
  const [scholarships, setScholarships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedScheme, setSelectedScheme] = useState(null);
  const [applyingScheme, setApplyingScheme] = useState(null);

  const categories = ['All', 'Merit-cum-Means', 'Girls STEM', 'Category Specific', 'Tech'];

  useEffect(() => {
    fetchScholarships();
  }, [selectedCategory, search]);

  const fetchScholarships = async () => {
    setLoading(true);
    try {
      const res = await axios.get('/api/scholarships', {
        params: { status: 'active', category: selectedCategory, search }
      });
      setScholarships(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 rounded-3xl p-8 text-white shadow-xl mb-8 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl -mr-20 -mt-20"></div>
          <div className="relative z-10 max-w-2xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-blue-500/20 text-blue-300 border border-blue-400/30 mb-4">
              <Sparkles className="w-3.5 h-3.5" /> 2026 Active Financial Aid Programs
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl mb-3">
              Discover & Apply for Verified Scholarships
            </h1>
            <p className="text-slate-300 text-sm leading-relaxed">
              Explore government and corporate sponsored grant programs with automated eligibility validation, transparent verification timelines, and direct bank disbursement.
            </p>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-200 mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          {/* Search Input */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search scheme name, provider..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Category Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Catalog Grid */}
        {loading ? (
          <div className="text-center py-16 text-slate-400 font-medium">Loading scholarship schemes...</div>
        ) : scholarships.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200">
            <Award className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-800">No Scholarships Found</h3>
            <p className="text-sm text-slate-500 mt-1">Try adjusting your search criteria or category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {scholarships.map((scheme) => (
              <div
                key={scheme.id}
                className="bg-white rounded-2xl border border-slate-200 shadow-sm hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group"
              >
                <div className="p-6">
                  {/* Category & Status */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-3 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-100">
                      {scheme.category}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1 font-medium">
                      <Calendar className="w-3.5 h-3.5 text-slate-400" /> Deadline: {scheme.deadline}
                    </span>
                  </div>

                  {/* Title & Provider */}
                  <h3 className="text-base font-bold text-slate-900 group-hover:text-blue-600 transition mb-1 leading-snug line-clamp-2">
                    {scheme.title}
                  </h3>
                  <div className="text-xs text-slate-500 flex items-center gap-1 mb-4">
                    <Building2 className="w-3.5 h-3.5 text-slate-400" /> {scheme.provider}
                  </div>

                  {/* Grant Amount Card */}
                  <div className="bg-gradient-to-r from-slate-50 to-blue-50/40 rounded-xl p-3 border border-slate-100 mb-4 flex items-center justify-between">
                    <div>
                      <div className="text-[10px] text-slate-500 uppercase font-semibold">Award Financial Aid</div>
                      <div className="text-xl font-extrabold text-blue-700">₹{scheme.amount.toLocaleString()} <span className="text-xs font-normal text-slate-500">/ year</span></div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 font-semibold">Total Seats</div>
                      <div className="text-xs font-bold text-slate-800">{scheme.seats.toLocaleString()} Seats</div>
                    </div>
                  </div>

                  {/* Key Criteria Summary */}
                  <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-3">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Min Marks: <strong className="text-slate-800">{scheme.eligibilityRules.minPercentage}%</strong></span>
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                      <span>Max Income: <strong className="text-slate-800">₹{scheme.eligibilityRules.maxFamilyIncome.toLocaleString()}</strong></span>
                    </div>
                  </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 bg-slate-50 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => setSelectedScheme(scheme)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-100 transition"
                  >
                    View Details
                  </button>
                  <button
                    onClick={() => setApplyingScheme(scheme)}
                    className="flex-1 px-3 py-2 rounded-xl text-xs font-semibold text-white bg-blue-600 hover:bg-blue-500 shadow-md shadow-blue-500/20 transition flex items-center justify-center gap-1"
                  >
                    Apply Now <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Scheme Detail Modal */}
        {selectedScheme && (
          <ScholarshipDetailModal
            scheme={selectedScheme}
            onClose={() => setSelectedScheme(null)}
            onApply={() => {
              const s = selectedScheme;
              setSelectedScheme(null);
              setApplyingScheme(s);
            }}
          />
        )}

        {/* Application Form Modal */}
        {applyingScheme && (
          <ApplicationFormModal
            scheme={applyingScheme}
            onClose={() => setApplyingScheme(null)}
            onSuccess={() => {
              setApplyingScheme(null);
              fetchScholarships();
            }}
          />
        )}
      </div>
    </div>
  );
};
