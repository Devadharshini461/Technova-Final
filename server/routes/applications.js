const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const { readDB, writeDB } = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

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
  limits: { fileSize: 5 * 1024 * 1024 }
});

// Auto Eligibility Check Engine
function runAutoEligibilityCheck(studentData, schemeData) {
  const reasons = [];
  let passed = true;

  const studentMarks = parseFloat(studentData.marksPercentage) || 0;
  const reqMinMarks = schemeData.eligibilityRules?.minPercentage || 0;
  if (studentMarks >= reqMinMarks) {
    reasons.push(`Academic Marks: ${studentMarks}% meets minimum ${reqMinMarks}%`);
  } else {
    passed = false;
    reasons.push(`Academic Marks: ${studentMarks}% is BELOW minimum requirement ${reqMinMarks}%`);
  }

  const studentIncome = parseFloat(studentData.familyIncome) || 0;
  const reqMaxIncome = schemeData.eligibilityRules?.maxFamilyIncome || 1000000;
  if (studentIncome <= reqMaxIncome) {
    reasons.push(`Annual Family Income: ₹${studentIncome.toLocaleString()} is within limit ₹${reqMaxIncome.toLocaleString()}`);
  } else {
    passed = false;
    reasons.push(`Annual Family Income: ₹${studentIncome.toLocaleString()} EXCEEDS maximum limit ₹${reqMaxIncome.toLocaleString()}`);
  }

  const allowedCats = schemeData.eligibilityRules?.allowedCategories || [];
  if (allowedCats.length === 0 || allowedCats.includes(studentData.category)) {
    reasons.push(`Category: Applicant category (${studentData.category}) is eligible`);
  } else {
    passed = false;
    reasons.push(`Category: Applicant category (${studentData.category}) NOT eligible (Allowed: ${allowedCats.join(', ')})`);
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

  // If staff is querying, filter by assigned staff id (Requirement #9)
  if (req.user.role === 'staff') {
    list = list.filter(a => a.assignedStaffId === req.user.id);
  } else if (staffId) {
    list = list.filter(a => a.assignedStaffId === staffId);
  }

  if (status) {
    list = list.filter(a => a.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(a => 
      a.studentName.toLowerCase().includes(q) ||
      a.scholarshipTitle.toLowerCase().includes(q) ||
      a.id.toLowerCase().includes(q)
    );
  }

  // Requirement #11: Priority Sorting based on student's total application count
  // Calculate student total application count map
  const studentAppCounts = {};
  db.applications.forEach(a => {
    studentAppCounts[a.studentId] = (studentAppCounts[a.studentId] || 0) + 1;
  });

  list = list.map(a => {
    const count = studentAppCounts[a.studentId] || 1;
    return {
      ...a,
      studentTotalApps: count,
      isLowPriority: count >= 2 // Students with max application count marked as low priority
    };
  });

  // Sort list: Normal priority first (lower app count), low priority (higher app count) at bottom
  list.sort((a, b) => (a.studentTotalApps || 0) - (b.studentTotalApps || 0));

  res.json(list);
});

// GET /api/applications/:id - Single application details
router.get('/:id', verifyToken, (req, res) => {
  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);

  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  if (req.user.role === 'student' && app.studentId !== req.user.id) {
    return res.status(403).json({ message: 'Access denied' });
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

  // Requirement #4: Deadline check
  const todayStr = new Date().toISOString().split('T')[0];
  if (scheme.deadline && scheme.deadline < todayStr) {
    return res.status(400).json({ message: 'This scholarship application deadline has expired' });
  }

  // Requirement #17: Check existing active/approved submission (allow re-applying if previously rejected)
  const existingApp = db.applications.find(a => 
    a.studentId === req.user.id && 
    a.scholarshipId === scholarshipId && 
    a.status !== 'rejected'
  );
  if (existingApp) {
    return res.status(400).json({ message: 'You already have an active or approved application for this scholarship scheme' });
  }

  // Requirement #9: Route application ONLY to assigned Staff Officer for this scheme
  let assignedStaffId = scheme.assignedStaffId;
  let assignedStaffName = scheme.assignedStaffName || 'Verification Officer';
  if (!assignedStaffId) {
    const staffMembers = db.users.filter(u => u.role === 'staff');
    if (staffMembers.length > 0) {
      const assigned = staffMembers[0];
      assignedStaffId = assigned.id;
      assignedStaffName = assigned.name;
    }
  }

  const reqDocs = scheme.requiredDocuments || ['Marksheet', 'Income Certificate', 'ID Proof'];
  const uploadedFiles = req.files || [];

  // Requirement #1: Verify all required documents are provided
  if (uploadedFiles.length < reqDocs.length) {
    return res.status(400).json({ 
      message: `All ${reqDocs.length} required documents (${reqDocs.join(', ')}) must be uploaded before submitting.` 
    });
  }

  const documents = reqDocs.map((docType, index) => {
    const file = uploadedFiles[index];
    return {
      id: `doc-${Date.now()}-${index}`,
      name: file ? file.originalname : `${docType} Copy.pdf`,
      type: docType,
      fileUrl: file ? `/uploads/${file.filename}` : 'https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf',
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

  // Requirement #12: If Auto Eligibility Check FAILS:
  // - DO NOT reach staff queue.
  // - Mark status as 'rejected' immediately.
  // - Send notification to student explicitly detailing failed criteria.
  let initialStatus = 'under_review';
  if (!autoCheck.passed) {
    initialStatus = 'rejected';
  }

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
    college: college || req.user.college || 'BIT Sathy',
    course: course || req.user.course || 'B.E Degree',
    year: year || req.user.year || '1st Year',
    marksPercentage: studentData.marksPercentage,
    familyIncome: studentData.familyIncome,
    category: studentData.category,
    bankDetails: typeof bankDetails === 'string' ? JSON.parse(bankDetails) : (bankDetails || req.user.bankDetails || {}),
    assignedStaffId,
    assignedStaffName,
    status: initialStatus,
    documents,
    autoEligibilityCheck: autoCheck,
    staffRemarks: !autoCheck.passed ? 'System Auto-Check Failed: Automatically Rejected' : '',
    staffRecommendation: !autoCheck.passed ? 'recommend_reject' : '',
    adminRemarks: '',
    disbursementDetails: null,
    submittedAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  db.applications.unshift(newApp);
  scheme.appliedCount = (scheme.appliedCount || 0) + 1;

  // Audit Log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'student',
    action: autoCheck.passed ? 'APPLICATION_SUBMIT' : 'AUTO_CHECK_REJECT',
    details: autoCheck.passed 
      ? `Submitted application ${newApp.id} for "${scheme.title}" (Assigned to Staff: ${assignedStaffName})`
      : `Application ${newApp.id} Auto-Rejected due to criteria mismatch: ${autoCheck.reasons.join('; ')}`,
    timestamp: new Date().toISOString()
  });

  // Notification for Student (Requirement #12)
  if (!autoCheck.passed) {
    const failedCriteriaStr = autoCheck.reasons.filter(r => r.includes('BELOW') || r.includes('EXCEEDS') || r.includes('NOT')).join(' | ');
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: req.user.id,
      title: 'Application Rejected (Auto-Eligibility Check)',
      message: `Your application (${newApp.id}) for ${scheme.title} was automatically rejected because criteria were not met: ${failedCriteriaStr}`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  } else {
    db.notifications.unshift({
      id: `notif-${Date.now()}`,
      userId: req.user.id,
      title: 'Application Submitted Successfully',
      message: `Your application (${newApp.id}) for ${scheme.title} was received and assigned to ${assignedStaffName} for document verification.`,
      isRead: false,
      createdAt: new Date().toISOString()
    });
  }

  writeDB(db);
  res.status(201).json(newApp);
});

// PATCH /api/applications/:id/documents/:docId - Staff verify document
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
  const { decision, remark } = req.body;
  if (!['approve', 'reject'].includes(decision)) {
    return res.status(400).json({ message: 'Decision must be approve or reject' });
  }

  const db = readDB();
  const app = db.applications.find(a => a.id === req.params.id);
  if (!app) {
    return res.status(404).json({ message: 'Application not found' });
  }

  // Requirement #7: Only when ALL documents are valid can recommend approval be submitted
  if (decision === 'approve') {
    const allValid = app.documents.every(d => d.status === 'valid');
    if (!allValid) {
      return res.status(400).json({ 
        message: 'Cannot recommend approval until ALL mandatory documents are marked as Valid' 
      });
    }
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

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'STAFF_RECOMMEND',
    details: `Staff recommended ${decision.toUpperCase()} for Application ${app.id} (${app.studentName}). Routed status: ${app.status}`,
    timestamp: new Date().toISOString()
  });

  let notifTitle = 'Verification Status Updated';
  let notifMsg = `Staff officer ${req.user.name} finished verifying application ${app.id}. Status updated to: ${app.status.replace('_', ' ')}.`;

  if (app.status === 'approved') {
    notifTitle = 'Scholarship Approved! 🎉';
    notifMsg = `Congratulations! Your application ${app.id} for ${app.scholarshipTitle} has been verified and approved by staff. It has moved to the fund distribution queue so you can receive your award.`;
  } else if (app.status === 'pending_admin_approval') {
    notifTitle = 'Document Verification Passed';
    notifMsg = `Staff officer ${req.user.name} verified your application ${app.id}. It is now awaiting final executive admin clearance.`;
  } else if (app.status === 'rejected') {
    notifTitle = 'Application Rejected';
    notifMsg = `Your application ${app.id} for ${app.scholarshipTitle} was marked as rejected during document verification. Remark: "${remark || 'Criteria not met'}".`;
  }

  db.notifications.unshift({
    id: `notif-${Date.now()}`,
    userId: app.studentId,
    title: notifTitle,
    message: notifMsg,
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
  const { decision, justification } = req.body;
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
    details: `ADMIN OVERRIDE on App ${app.id}: Changed status from "${previousStatus}" to "${app.status}". Justification: "${justification}"`,
    timestamp: new Date().toISOString()
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

  const txnId = `TXN-BIT-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
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
    message: `Scholarship grant of ₹${app.scholarshipAmount.toLocaleString()} has been transferred to your bank account. Txn ID: ${txnId}`,
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
  app.staffRecommendation = '';
  app.staffRemarks = 'Document resubmitted by student; pending re-inspection';
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
