const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { readDB, writeDB } = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// Multer storage setup for handling document file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    const fs = require('fs');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  }
});

const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit
});

// Helper for Auto Eligibility Check Engine
function runAutoEligibilityCheck(studentData, schemeData) {
  const reasons = [];
  let passed = true;

  const studentMarks = parseFloat(studentData.marksPercentage) || 0;
  const reqMinMarks = schemeData.eligibilityRules.minPercentage || 0;
  if (studentMarks >= reqMinMarks) {
    reasons.push(`Academic Marks: ${studentMarks}% meets/exceeds required minimum ${reqMinMarks}%`);
  } else {
    passed = false;
    reasons.push(`Academic Marks: ${studentMarks}% is below required minimum ${reqMinMarks}%`);
  }

  const studentIncome = parseFloat(studentData.familyIncome) || 0;
  const reqMaxIncome = schemeData.eligibilityRules.maxFamilyIncome || 1000000;
  if (studentIncome <= reqMaxIncome) {
    reasons.push(`Annual Family Income: ₹${studentIncome.toLocaleString()} is within ceiling limit ₹${reqMaxIncome.toLocaleString()}`);
  } else {
    passed = false;
    reasons.push(`Annual Family Income: ₹${studentIncome.toLocaleString()} exceeds ceiling limit ₹${reqMaxIncome.toLocaleString()}`);
  }

  const allowedCats = schemeData.eligibilityRules.allowedCategories || [];
  if (allowedCats.length === 0 || allowedCats.includes(studentData.category)) {
    reasons.push(`Category: Applicant category (${studentData.category}) is eligible for this scheme`);
  } else {
    passed = false;
    reasons.push(`Category: Applicant category (${studentData.category}) is not eligible (Allowed: ${allowedCats.join(', ')})`);
  }

  return { passed, reasons };
}

// GET /api/applications/my - Student's own applications
router.get('/my', verifyToken, requireRole(['student']), (req, res) => {
  const db = readDB();
  const myApps = db.applications.filter(a => a.studentId === req.user.id);
  res.json(myApps);
});

// GET /api/applications - Admin / Staff query applications
router.get('/', verifyToken, requireRole(['admin', 'staff']), (req, res) => {
  const { status, search, staffId } = req.query;
  const db = readDB();
  let list = [...db.applications];

  if (status) {
    list = list.filter(a => a.status === status);
  }

  if (staffId) {
    list = list.filter(a => a.assignedStaffId === staffId);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(a => 
      a.studentName.toLowerCase().includes(q) ||
      a.scholarshipTitle.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

// GET /api/applications/:id - Single application details
router.get('/:id', verifyToken, (req, res) => {
  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);

  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  // Security check: Students can only view their own
  if (req.user.role === 'student' && app.studentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied to this application' });
  }

  res.json(app);
});

// POST /api/applications - Submit new application (Student)
router.post('/', verifyToken, requireRole(['student']), upload.array('documents'), (req, res) => {
  const { scholarshipId, college, course, year, marksPercentage, familyIncome, category, bankDetails } = req.body;

  if (!scholarshipId) {
    return res.status(400).json({ message: 'scholarshipId is required' });
  }

  const db = readDB();
  const scheme = db.scholarships.find(s => s.id === scholarshipId);
  if (!scheme) {
    return res.status(404).json({ message: 'Scholarship scheme not found' });
  }

  if (scheme.status === 'closed') {
    return res.status(400).json({ message: 'This scholarship scheme is closed' });
  }

  // Check existing submission
  const existingApp = db.applications.find(a => a.studentId === req.user.id && a.scholarshipId === scholarshipId);
  if (existingApp) {
    return res.status(400).json({ message: 'You have already submitted an application for this scholarship' });
  }

  // Auto assign staff member round-robin
  const staffMembers = db.users.filter(u => u.role === 'staff');
  let assignedStaff = staffMembers[0] || { id: 'u-staff-1', name: 'Verification Officer' };
  if (staffMembers.length > 0) {
    assignedStaff = staffMembers[db.applications.length % staffMembers.length];
  }

  // Build document list from files or default placeholders
  const reqDocs = scheme.requiredDocuments || ['Marksheet', 'Income Certificate', 'ID Proof'];
  const uploadedFiles = req.files || [];

  const documents = reqDocs.map((docType, index) => {
    const file = uploadedFiles[index];
    return {
      id: `doc-${Date.now()}-${index}`,
      name: file ? file.originalname : `${docType} - Uploaded Copy.pdf`,
      type: docType,
      fileUrl: file ? `/uploads/${file.filename}` : 'https://images.unsplash.com/photo-1568602471122-7832951cc4c5?w=600&auto=format&fit=crop&q=60',
      status: 'pending',
      remark: ''
    };
  });

  const studentData = {
    marksPercentage: parseFloat(marksPercentage) || req.user.marksPercentage || 80,
    familyIncome: parseFloat(familyIncome) || req.user.familyIncome || 200000,
    category: category || req.user.category || 'General'
  };

  const autoCheck = runAutoEligibilityCheck(studentData, scheme);

  const newApp = {
    id: `app-${Date.now()}`,
    scholarshipId: scheme.id,
    scholarshipTitle: scheme.title,
    scholarshipAmount: scheme.amount,
    requiresAdminApproval: scheme.requiresAdminApproval,
    studentId: req.user.id,
    studentName: req.user.name,
    studentEmail: req.user.email,
    studentPhone: req.user.phone || '+91 98765 43210',
    college: college || req.user.college || 'State University',
    course: course || req.user.course || 'Undergraduate Degree',
    year: year || req.user.year || '1st Year',
    marksPercentage: studentData.marksPercentage,
    familyIncome: studentData.familyIncome,
    category: studentData.category,
    bankDetails: typeof bankDetails === 'string' ? JSON.parse(bankDetails) : (bankDetails || req.user.bankDetails || {}),
    assignedStaffId: assignedStaff.id,
    assignedStaffName: assignedStaff.name,
    status: 'under_review',
    documents,
    autoEligibilityCheck: autoCheck,
    staffRemarks: '',
    staffRecommendation: '',
    adminRemarks: '',
    disbursementDetails: null,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.applications.unshift(newApp);
  scheme.appliedCount = (scheme.appliedCount || 0) + 1;

  // Audit log & Notification
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'student',
    action: 'APPLICATION_SUBMIT',
    details: `Submitted application ${newApp.id} for scheme "${scheme.title}"`,
    timestamp: new Date().toISOString()
  });

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: req.user.id,
    title: 'Application Submitted',
    message: `Your application (${newApp.id}) for ${scheme.title} was received and assigned to ${assignedStaff.name} for verification.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.status(201).json(newApp);
});

// PATCH /api/applications/:id/documents/:docId - Staff verify individual document
router.patch('/:id/documents/:docId', verifyToken, requireRole(['staff', 'admin']), (req, res) => {
  const { status, remark } = req.body;
  if (!['valid', 'invalid', 'needs_resubmission'].includes(status)) {
    return res.status(400).json({ message: 'Invalid document status' });
  }

  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const doc = app.documents.find(d => d.id === req.params.docId);
  if (!doc) {
    return res.status(404).json({ message: 'Document not found' });
  }

  doc.status = status;
  doc.remark = remark || '';
  app.updatedAt = new Date().toISOString();

  // If any document is flagged as invalid or needs resubmission, notify student
  if (status === 'invalid' || status === 'needs_resubmission') {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: app.studentId,
      title: 'Action Required: Document Flagged',
      message: `Your document "${doc.type}" in application ${app.id} was marked as ${status.replace('_', ' ')}. Remark: "${remark || 'Please re-upload standard clear copy'}"`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  writeDB(db);
  res.json(app);
});

// PATCH /api/applications/:id/recommend - Staff submit recommendation
router.patch('/:id/recommend', verifyToken, requireRole(['staff', 'admin']), (req, res) => {
  const { decision, remark } = req.body; // decision = 'approve' | 'reject'
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ message: 'Decision must be approve or reject' });
  }

  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  app.staffRemarks = remark || '';
  app.staffRecommendation = decision === 'approve' ? 'recommend_approve' : 'recommend_reject';
  app.updatedAt = new Date().toISOString();

  if (decision === 'approve') {
    if (app.requiresAdminApproval) {
      app.status = 'pending_admin_approval';
    } else {
      app.status = 'approved';
    }
  } else {
    app.status = 'rejected';
  }

  // Audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'STAFF_RECOMMEND',
    details: `Staff recommended ${decision.toUpperCase()} for Application ${app.id} (${app.studentName}). Routed to status: ${app.status}`,
    timestamp: new Date().toISOString()
  });

  // Notification for student
  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: app.studentId,
    title: 'Verification Status Updated',
    message: `Staff officer ${req.user.name} finished verifying application ${app.id}. Status updated to: ${app.status.replace('_', ' ')}.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json(app);
});

// PATCH /api/applications/:id/approve - Admin final approval
router.patch('/:id/approve', verifyToken, requireRole(['admin']), (req, res) => {
  const { remark } = req.body;
  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  app.status = 'approved';
  app.adminRemarks = remark || 'Final Admin Approval Granted';
  app.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'ADMIN_APPROVE',
    details: `Admin approved application ${app.id} (${app.scholarshipTitle}) for ${app.studentName}`,
    timestamp: new Date().toISOString()
  });

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: app.studentId,
    title: 'Scholarship Approved! 🎉',
    message: `Congratulations! Your scholarship application ${app.id} for ${app.scholarshipTitle} has received final Admin Approval!`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json(app);
});

// PATCH /api/applications/:id/reject - Admin final rejection
router.patch('/:id/reject', verifyToken, requireRole(['admin']), (req, res) => {
  const { remark } = req.body;
  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  app.status = 'rejected';
  app.adminRemarks = remark || 'Application rejected during final admin review';
  app.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'ADMIN_REJECT',
    details: `Admin rejected application ${app.id} (${app.studentName}). Reason: ${remark || 'N/A'}`,
    timestamp: new Date().toISOString()
  });

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: app.studentId,
    title: 'Scholarship Application Update',
    message: `Your application ${app.id} for ${app.scholarshipTitle} was rejected during final review. Reason: ${remark || 'Criteria not met'}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json(app);
});

// PATCH /api/applications/:id/override - Admin override staff decision
router.patch('/:id/override', verifyToken, requireRole(['admin']), (req, res) => {
  const { decision, justification } = req.body; // decision = 'approved' | 'rejected'
  if (!justification || justification.trim().length < 5) {
    return res.status(400).json({ message: 'Mandatory justification statement required for Admin Override' });
  }

  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  const previousStatus = app.status;
  app.status = decision === 'approved' ? 'approved' : 'rejected';
  app.adminRemarks = `[ADMIN OVERRIDE]: ${justification}`;
  app.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'ADMIN_OVERRIDE',
    details: `ADMIN OVERRIDE on App ${app.id}: Changed status from "${previousStatus}" to "${app.status}". Mandatory Justification: "${justification}"`,
    timestamp: new Date().toISOString()
  });

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: app.studentId,
    title: 'Application Status Updated (Executive Review)',
    message: `Your application ${app.id} status was revised to ${app.status} following executive review.`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json(app);
});

// PATCH /api/applications/:id/disburse - Admin trigger fund disbursement
router.patch('/:id/disburse', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  if (app.status !== 'approved') {
    return res.status(400).json({ message: 'Only approved applications can be marked as disbursed' });
  }

  const txnId = `TXN-NPCI-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
  app.status = 'disbursed';
  app.disbursementDetails = {
    transactionId: txnId,
    amount: app.scholarshipAmount,
    disbursedDate: new Date().toISOString(),
    bankAccount: app.bankDetails ? app.bankDetails.accountNo : 'XXXXXXXX3456',
    ifsc: app.bankDetails ? app.bankDetails.ifscCode : 'SBIN0001234'
  };
  app.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'FUND_DISBURSEMENT',
    details: `Disbursed ₹${app.scholarshipAmount.toLocaleString()} to ${app.studentName} for App ${app.id}. Txn Ref: ${txnId}`,
    timestamp: new Date().toISOString()
  });

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: app.studentId,
    title: 'Funds Disbursed! 💰',
    message: `Scholarship grant of ₹${app.scholarshipAmount.toLocaleString()} has been transferred to your bank account (${app.bankDetails ? app.bankDetails.accountNo : 'Registered Bank'}). Txn ID: ${txnId}`,
    isRead: false,
    createdAt: new Date().toISOString()
  });

  writeDB(db);
  res.json(app);
});

// PATCH /api/applications/:id/documents/:docId/resubmit - Student re-upload document
router.patch('/:id/documents/:docId/resubmit', verifyToken, requireRole(['student']), upload.single('document'), (req, res) => {
  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  if (app.studentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
  }

  const doc = app.documents.find(d => d.id === req.params.docId);
  if (!doc) {
    return res.status(404).json({ message: 'Document not found' });
  }

  if (req.file) {
    doc.fileUrl = `/uploads/${req.file.filename}`;
    doc.name = req.file.originalname;
  }
  doc.status = 'pending';
  doc.remark = 'Resubmitted by student';
  app.status = 'under_review';
  app.updatedAt = new Date().toISOString();

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'student',
    action: 'DOC_RESUBMIT',
    details: `Re-uploaded document "${doc.type}" for Application ${app.id}. Application returned to Staff review queue.`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json(app);
});

module.exports = router;
