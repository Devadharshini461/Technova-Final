import React from 'react';
import { Shield, Phone, Mail, HelpCircle, GraduationCap } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-900 pt-12 pb-8 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 pb-8 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-white font-bold text-base mb-3">
              <GraduationCap className="w-5 h-5 text-blue-400" />
              ScholarPortal.gov
            </div>
            <p className="text-slate-400 leading-relaxed">
              India's premier digital scholarship verification and fund disbursement engine modeled after Buddy4Study standards.
            </p>
          </div>

          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px]">Portal Quick Links</h4>
            <ul className="space-y-2">
              <li><a href="/scholarships" className="hover:text-white transition">Browse All Schemes</a></li>
              <li><a href="/student" className="hover:text-white transition">Track Application Status</a></li>
              <li><a href="/login" className="hover:text-white transition">Institutional Staff Login</a></li>
              <li><a href="/admin" className="hover:text-white transition">Department Governance</a></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px]">Categories & Grants</h4>
            <ul className="space-y-2">
              <li><span className="hover:text-white transition cursor-pointer">Merit-cum-Means Grants</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Girls STEM Technical Aid</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Post-Matric Minority Assistance</span></li>
              <li><span className="hover:text-white transition cursor-pointer">Corporate CSR Innovations</span></li>
            </ul>
          </div>

          <div>
            <h4 className="text-slate-200 font-bold mb-3 uppercase tracking-wider text-[11px]">Helpdesk & Support</h4>
            <ul className="space-y-2">
              <li className="flex items-center gap-2 text-slate-300">
                <Phone className="w-4 h-4 text-blue-400" /> 1800-111-2026 (Toll Free)
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <Mail className="w-4 h-4 text-blue-400" /> support@scholarships.gov.in
              </li>
              <li className="flex items-center gap-2 text-slate-300">
                <HelpCircle className="w-4 h-4 text-blue-400" /> Mon-Sat (9:00 AM - 6:00 PM)
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-slate-400">
          <div>
            © 2026 Scholarship Management & Verification Portal. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 text-emerald-400">
              <Shield className="w-4 h-4" /> Digilocker & Direct Benefit Transfer (DBT) Verified
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};
