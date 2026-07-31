const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_FILE = path.join(__dirname, 'data.json');

// Default initial data seed
const getInitialData = () => {
  const hashedPassword = bcrypt.hashSync('password123', 10);

  const defaultUsers = [
    {
      id: 'u-admin-1',
      name: 'Superintendent Administration',
      email: 'admin@scholarships.gov.in',
      password: hashedPassword,
      role: 'admin',
      phone: '+91 98765 43210',
      department: 'Central Scholarship Authority',
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-staff-1',
      name: 'Dr. Rajesh Sharma (Verification Officer)',
      email: 'staff.sharma@scholarships.gov.in',
      password: hashedPassword,
      role: 'staff',
      phone: '+91 98123 45678',
      assignedCount: 4,
      processedCount: 18,
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-staff-2',
      name: 'Priya Mukherjee (Senior Inspector)',
      email: 'staff.priya@scholarships.gov.in',
      password: hashedPassword,
      role: 'staff',
      phone: '+91 97111 22334',
      assignedCount: 2,
      processedCount: 24,
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-student-1',
      name: 'Rahul Verma',
      email: 'rahul.verma@gmail.com',
      password: hashedPassword,
      role: 'student',
      phone: '+91 91234 56789',
      college: 'Indian Institute of Technology, Delhi',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      marksPercentage: 88.5,
      familyIncome: 180000,
      category: 'OBC',
      bankDetails: {
        accountNo: '309812345678',
        ifscCode: 'SBIN0001234',
        bankName: 'State Bank of India',
        accountHolder: 'Rahul Verma'
      },
      createdAt: new Date().toISOString()
    },
    {
      id: 'u-student-2',
      name: 'Ananya Deshmukh',
      email: 'ananya.d@gmail.com',
      password: hashedPassword,
      role: 'student',
      phone: '+91 98220 11223',
      college: 'Delhi University (SRCC)',
      course: 'B.Com (Hons)',
      year: '2nd Year',
      marksPercentage: 92.0,
      familyIncome: 220000,
      category: 'General',
      bankDetails: {
        accountNo: '458901237890',
        ifscCode: 'HDFC0000456',
        bankName: 'HDFC Bank',
        accountHolder: 'Ananya Deshmukh'
      },
      createdAt: new Date().toISOString()
    }
  ];

  const defaultScholarships = [
    {
      id: 'sch-101',
      title: 'Reliance Foundation Undergraduate Scholarship 2026',
      provider: 'Reliance Foundation & Ministry of Education',
      category: 'Merit-cum-Means',
      amount: 200000,
      deadline: '2026-10-31',
      seats: 5000,
      appliedCount: 1420,
      status: 'active', // active, closed
      requiresAdminApproval: true,
      eligibilityRules: {
        minPercentage: 75.0,
        maxFamilyIncome: 250000,
        allowedCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
        description: 'Open for 1st, 2nd, and 3rd year undergraduate students with minimum 75% marks in 12th standard and annual family income below ₹2.5 Lakhs.'
      },
      requiredDocuments: ['Marksheet', 'Income Certificate', 'ID Proof', 'Bank Passbook Copy'],
      createdDate: '2026-06-01'
    },
    {
      id: 'sch-102',
      title: 'Pragati Scholarship for Girls (Technical Education)',
      provider: 'AICTE & Central Government',
      category: 'Girls STEM',
      amount: 50000,
      deadline: '2026-09-15',
      seats: 2000,
      appliedCount: 890,
      status: 'active',
      requiresAdminApproval: false, // Auto-approves once staff verifies
      eligibilityRules: {
        minPercentage: 70.0,
        maxFamilyIncome: 800000,
        allowedCategories: ['General', 'OBC', 'SC', 'ST'],
        description: 'Dedicated financial support for female students pursuing Degree/Diploma in engineering or technology from AICTE-approved institutions.'
      },
      requiredDocuments: ['Marksheet', 'Income Certificate', 'College ID', 'Bank Passbook Copy'],
      createdDate: '2026-05-15'
    },
    {
      id: 'sch-103',
      title: 'Post-Matric National Merit Grant for SC/ST Students',
      provider: 'Department of Social Justice & Empowerment',
      category: 'Category Specific',
      amount: 75000,
      deadline: '2026-11-15',
      seats: 10000,
      appliedCount: 3120,
      status: 'active',
      requiresAdminApproval: true,
      eligibilityRules: {
        minPercentage: 60.0,
        maxFamilyIncome: 300000,
        allowedCategories: ['SC', 'ST'],
        description: 'Post-matric assistance for SC and ST category candidates enrolled in recognized post-secondary education.'
      },
      requiredDocuments: ['Marksheet', 'Category Certificate', 'Income Certificate', 'Bank Passbook Copy'],
      createdDate: '2026-04-10'
    },
    {
      id: 'sch-104',
      title: 'Buddy4Study Tech Future Innovators Award',
      provider: 'Tech CSR Consortium',
      category: 'Merit-cum-Means',
      amount: 120000,
      deadline: '2026-08-30',
      seats: 500,
      appliedCount: 450,
      status: 'active',
      requiresAdminApproval: true,
      eligibilityRules: {
        minPercentage: 80.0,
        maxFamilyIncome: 500000,
        allowedCategories: ['General', 'OBC', 'SC', 'ST', 'EWS'],
        description: 'Merit-based grant for computer science and IT engineering students demonstrating academic excellence.'
      },
      requiredDocuments: ['Marksheet', 'Income Certificate', 'ID Proof'],
      createdDate: '2026-07-01'
    }
  ];

  const defaultApplications = [
    {
      id: 'app-2001',
      scholarshipId: 'sch-101',
      scholarshipTitle: 'Reliance Foundation Undergraduate Scholarship 2026',
      scholarshipAmount: 200000,
      requiresAdminApproval: true,
      studentId: 'u-student-1',
      studentName: 'Rahul Verma',
      studentEmail: 'rahul.verma@gmail.com',
      studentPhone: '+91 91234 56789',
      college: 'Indian Institute of Technology, Delhi',
      course: 'B.Tech Computer Science',
      year: '3rd Year',
      marksPercentage: 88.5,
      familyIncome: 180000,
      category: 'OBC',
      assignedStaffId: 'u-staff-1',
      assignedStaffName: 'Dr. Rajesh Sharma',
      status: 'under_review', // submitted, under_review, verified, pending_admin_approval, approved, rejected, disbursed
      documents: [
        {
          id: 'doc-1',
          name: '12th Marksheet & Semester Transcripts',
          type: 'Marksheet',
          fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=60',
          status: 'pending', // pending, valid, invalid, needs_resubmission
          remark: ''
        },
        {
          id: 'doc-2',
          name: 'Tahsildar Income Certificate',
          type: 'Income Certificate',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
          status: 'pending',
          remark: ''
        },
        {
          id: 'doc-3',
          name: 'Aadhaar Card Copy',
          type: 'ID Proof',
          fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
          status: 'pending',
          remark: ''
        },
        {
          id: 'doc-4',
          name: 'Bank Account Passbook Front Page',
          type: 'Bank Passbook Copy',
          fileUrl: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=60',
          status: 'pending',
          remark: ''
        }
      ],
      autoEligibilityCheck: {
        passed: true,
        reasons: ['Marks 88.5% >= Min 75.0%', 'Family Income ₹1.8L <= Max ₹2.5L', 'Category OBC is eligible']
      },
      staffRemarks: '',
      staffRecommendation: '', // recommend_approve, recommend_reject
      adminRemarks: '',
      disbursementDetails: null,
      submittedAt: new Date(Date.now() - 3600000 * 48).toISOString(),
      updatedAt: new Date().toISOString()
    },
    {
      id: 'app-2002',
      scholarshipId: 'sch-102',
      scholarshipTitle: 'Pragati Scholarship for Girls (Technical Education)',
      scholarshipAmount: 50000,
      requiresAdminApproval: false,
      studentId: 'u-student-2',
      studentName: 'Ananya Deshmukh',
      studentEmail: 'ananya.d@gmail.com',
      studentPhone: '+91 98220 11223',
      college: 'Delhi University (SRCC)',
      course: 'B.Com (Hons)',
      year: '2nd Year',
      marksPercentage: 92.0,
      familyIncome: 220000,
      category: 'General',
      assignedStaffId: 'u-staff-2',
      assignedStaffName: 'Priya Mukherjee',
      status: 'pending_admin_approval',
      documents: [
        {
          id: 'doc-21',
          name: '12th Board Marksheet',
          type: 'Marksheet',
          fileUrl: 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=60',
          status: 'valid',
          remark: 'Verified against Digilocker'
        },
        {
          id: 'doc-22',
          name: 'Annual Family Income Statement',
          type: 'Income Certificate',
          fileUrl: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=600&auto=format&fit=crop&q=60',
          status: 'valid',
          remark: 'Valid government stamp verified'
        },
        {
          id: 'doc-23',
          name: 'College ID Card',
          type: 'College ID',
          fileUrl: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=600&auto=format&fit=crop&q=60',
          status: 'valid',
          remark: 'Active enrollment confirmed'
        }
      ],
      autoEligibilityCheck: {
        passed: true,
        reasons: ['Marks 92.0% >= Min 70.0%', 'Family Income ₹2.2L <= Max ₹8.0L']
      },
      staffRemarks: 'Applicant profile authentic. High academic score. Strongly recommended.',
      staffRecommendation: 'recommend_approve',
      adminRemarks: '',
      disbursementDetails: null,
      submittedAt: new Date(Date.now() - 3600000 * 96).toISOString(),
      updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  const defaultAuditLogs = [
    {
      id: 'log-1',
      actorName: 'Superintendent Administration',
      actorRole: 'admin',
      action: 'SCHEME_CREATE',
      details: 'Created new scheme: Reliance Foundation Undergraduate Scholarship 2026',
      timestamp: new Date(Date.now() - 3600000 * 120).toISOString()
    },
    {
      id: 'log-2',
      actorName: 'Rahul Verma',
      actorRole: 'student',
      action: 'APPLICATION_SUBMIT',
      details: 'Submitted application app-2001 for Reliance Foundation Undergraduate Scholarship 2026',
      timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 'log-3',
      actorName: 'Priya Mukherjee',
      actorRole: 'staff',
      action: 'STAFF_RECOMMEND',
      details: 'Recommended Approval for app-2002 (Ananya Deshmukh)',
      timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  const defaultNotifications = [
    {
      id: 'notif-1',
      userId: 'u-student-1',
      title: 'Application Submitted Successfully',
      message: 'Your application app-2001 for Reliance Foundation Undergraduate Scholarship 2026 is currently under staff review.',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
    },
    {
      id: 'notif-2',
      userId: 'u-student-2',
      title: 'Verification Complete',
      message: 'Your documents have been verified by Staff Priya Mukherjee. Application is pending final Admin clearance.',
      isRead: false,
      createdAt: new Date(Date.now() - 3600000 * 12).toISOString()
    }
  ];

  return {
    users: defaultUsers,
    scholarships: defaultScholarships,
    applications: defaultApplications,
    auditLogs: defaultAuditLogs,
    notifications: defaultNotifications
  };
};

// Helper read/write database handlers
const readDB = () => {
  if (!fs.existsSync(DATA_FILE)) {
    const initial = getInitialData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
  try {
    const content = fs.readFileSync(DATA_FILE, 'utf8');
    return JSON.parse(content);
  } catch (err) {
    console.error('Error reading database file, re-initializing...', err);
    const initial = getInitialData();
    fs.writeFileSync(DATA_FILE, JSON.stringify(initial, null, 2));
    return initial;
  }
};

const writeDB = (data) => {
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2));
};

module.exports = {
  readDB,
  writeDB
};
