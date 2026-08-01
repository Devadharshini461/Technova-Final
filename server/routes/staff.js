const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const { readDB, writeDB } = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/staff - List all staff accounts + workload metrics (Admin only)
router.get('/', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const staffUsers = db.users
    .filter(u => u.role === 'staff')
    .map(s => {
      const assignedApps = db.applications.filter(a => a.assignedStaffId === s.id && a.status === 'under_review').length;
      const processedApps = db.applications.filter(a => a.assignedStaffId === s.id && a.status !== 'under_review').length;
      const assignedSchemes = db.scholarships.filter(sch => sch.assignedStaffId === s.id).map(sch => sch.title);
      const { password: _, ...cleanStaff } = s;
      return {
        ...cleanStaff,
        assignedCount: assignedApps,
        processedCount: processedApps,
        assignedSchemes
      };
    });

  res.json(staffUsers);
});

// Requirement #10: GET /api/staff/student-reports - Student directory & scholarship count report
router.get('/student-reports', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const students = db.users.filter(u => u.role === 'student');

  const reports = students.map(st => {
    const studentApps = db.applications.filter(a => a.studentId === st.id);
    const scholarshipNames = studentApps.map(a => a.scholarshipTitle);
    const { password: _, ...cleanStudent } = st;

    return {
      ...cleanStudent,
      applicationCount: studentApps.length,
      scholarshipsApplied: scholarshipNames,
      disbursedCount: studentApps.filter(a => a.status === 'disbursed').length
    };
  });

  res.json(reports);
});

// Helper to format & validate 10-digit phone number with +91 prefix (Requirement #9)
function formatAndValidatePhone(phoneInput) {
  if (!phoneInput) return '';
  const digits = String(phoneInput).replace(/\D/g, '');
  // If digits start with 91 and total length is 12, take last 10
  const cleanDigits = (digits.length === 12 && digits.startsWith('91')) ? digits.slice(2) : digits;
  if (cleanDigits.length !== 10) {
    throw new Error('Phone number must contain exactly 10 digits');
  }
  return `+91 ${cleanDigits}`;
}

// POST /api/staff - Create new staff account (Admin only)
router.post('/', verifyToken, requireRole(['admin']), (req, res) => {
  const { name, email, password, phone, department } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (!email.toLowerCase().trim().endsWith('@bitsathy.ac.in')) {
    return res.status(403).json({ message: 'Only @bitsathy.ac.in emails permitted for staff creation' });
  }

  let formattedPhone = '';
  if (phone) {
    try {
      formattedPhone = formatAndValidatePhone(phone);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const newStaff = {
    id: `u-staff-${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    password: bcrypt.hashSync(password, 10),
    role: 'staff',
    phone: formattedPhone || '+91 98765 43210',
    department: department || 'Document Verification Cell',
    assignedCount: 0,
    processedCount: 0,
    createdAt: new Date().toISOString()
  };

  db.users.push(newStaff);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'STAFF_CREATE',
    details: `Added new Staff Verification Officer: ${name} (${email})`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);

  const { password: _, ...cleanStaff } = newStaff;
  res.status(201).json(cleanStaff);
});

// PUT /api/staff/:id - Edit staff account (Requirement #10 - Admin only)
router.put('/:id', verifyToken, requireRole(['admin']), (req, res) => {
  const { name, email, phone, department, password } = req.body;
  const db = readDB();
  const user = db.users.find(u => u.id === req.params.id && u.role === 'staff');
  
  if (!user) {
    return res.status(404).json({ message: 'Staff member not found' });
  }

  if (email && email.toLowerCase().trim() !== user.email) {
    if (!email.toLowerCase().trim().endsWith('@bitsathy.ac.in')) {
      return res.status(403).json({ message: 'Only @bitsathy.ac.in emails permitted' });
    }
    const duplicate = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== user.id);
    if (duplicate) {
      return res.status(400).json({ message: 'Email address already in use by another user' });
    }
    user.email = email.toLowerCase().trim();
  }

  if (name) user.name = name;
  if (department) user.department = department;
  if (password && password.trim() !== '') {
    user.password = bcrypt.hashSync(password, 10);
  }
  if (phone) {
    try {
      user.phone = formatAndValidatePhone(phone);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'STAFF_UPDATE',
    details: `Updated Staff account details for ${user.name} (${user.email})`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);

  const { password: _, ...cleanStaff } = user;
  res.json(cleanStaff);
});

// DELETE /api/staff/:id - Remove staff account (Admin only)
router.delete('/:id', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const index = db.users.findIndex(u => u.id === req.params.id && u.role === 'staff');
  if (index === -1) {
    return res.status(404).json({ message: 'Staff member not found' });
  }

  const removed = db.users.splice(index, 1)[0];

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'STAFF_DELETE',
    details: `Removed Staff account: ${removed.name} (${removed.email})`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json({ message: 'Staff account removed successfully' });
});

// Requirement #11: STUDENT MANAGEMENT ENDPOINTS FOR ADMIN
// GET /api/staff/students - List all student accounts (Admin only)
router.get('/students', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const students = db.users.filter(u => u.role === 'student').map(st => {
    const { password: _, ...cleanStudent } = st;
    return cleanStudent;
  });
  res.json(students);
});

// POST /api/staff/students - Add new student account (Requirement #11 - Admin only)
router.post('/students', verifyToken, requireRole(['admin']), (req, res) => {
  const { 
    name, email, password, phone, college, course, year, 
    marksPercentage, familyIncome, category, bankDetails 
  } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  if (!email.toLowerCase().trim().endsWith('@bitsathy.ac.in')) {
    return res.status(403).json({ message: 'Only @bitsathy.ac.in emails permitted for student accounts' });
  }

  let formattedPhone = '';
  if (phone) {
    try {
      formattedPhone = formatAndValidatePhone(phone);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const newStudent = {
    id: `u-student-${Date.now()}`,
    name,
    email: email.toLowerCase().trim(),
    password: bcrypt.hashSync(password, 10),
    role: 'student',
    phone: formattedPhone || '+91 91234 56789',
    college: college || 'Bannari Amman Institute of Technology (BIT Sathy)',
    course: course || 'B.E Computer Science',
    year: year || '1st Year',
    marksPercentage: parseFloat(marksPercentage) || 80.0,
    familyIncome: parseFloat(familyIncome) || 200000,
    category: category || 'General',
    bankDetails: typeof bankDetails === 'string' ? JSON.parse(bankDetails) : (bankDetails || {
      accountNo: '309812345678',
      ifscCode: 'SBIN0001234',
      bankName: 'State Bank of India',
      accountHolder: name
    }),
    createdAt: new Date().toISOString()
  };

  db.users.push(newStudent);

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'STUDENT_CREATE',
    details: `Admin added new Student account: ${name} (${email})`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);

  const { password: _, ...cleanStudent } = newStudent;
  res.status(201).json(cleanStudent);
});

// PUT /api/staff/students/:id - Edit student account (Requirement #11 - Admin only)
router.put('/students/:id', verifyToken, requireRole(['admin']), (req, res) => {
  const { 
    name, email, password, phone, college, course, year, 
    marksPercentage, familyIncome, category, bankDetails 
  } = req.body;

  const db = readDB();
  const student = db.users.find(u => u.id === req.params.id && u.role === 'student');

  if (!student) {
    return res.status(404).json({ message: 'Student account not found' });
  }

  if (email && email.toLowerCase().trim() !== student.email) {
    if (!email.toLowerCase().trim().endsWith('@bitsathy.ac.in')) {
      return res.status(403).json({ message: 'Only @bitsathy.ac.in emails permitted' });
    }
    const duplicate = db.users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.id !== student.id);
    if (duplicate) {
      return res.status(400).json({ message: 'Email address already in use' });
    }
    student.email = email.toLowerCase().trim();
  }

  if (name) student.name = name;
  if (password && password.trim() !== '') student.password = bcrypt.hashSync(password, 10);
  if (phone) {
    try {
      student.phone = formatAndValidatePhone(phone);
    } catch (err) {
      return res.status(400).json({ message: err.message });
    }
  }
  if (college) student.college = college;
  if (course) student.course = course;
  if (year) student.year = year;
  if (marksPercentage !== undefined) student.marksPercentage = parseFloat(marksPercentage);
  if (familyIncome !== undefined) student.familyIncome = parseFloat(familyIncome);
  if (category) student.category = category;
  if (bankDetails) student.bankDetails = typeof bankDetails === 'string' ? JSON.parse(bankDetails) : bankDetails;

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'STUDENT_UPDATE',
    details: `Updated Student profile for ${student.name} (${student.email})`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);

  const { password: _, ...cleanStudent } = student;
  res.json(cleanStudent);
});

// DELETE /api/staff/students/:id - Remove student account (Requirement #11 - Admin only)
router.delete('/students/:id', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const index = db.users.findIndex(u => u.id === req.params.id && u.role === 'student');
  if (index === -1) {
    return res.status(404).json({ message: 'Student account not found' });
  }

  const removed = db.users.splice(index, 1)[0];

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: 'admin',
    action: 'STUDENT_DELETE',
    details: `Removed Student account: ${removed.name} (${removed.email})`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json({ message: 'Student account removed successfully' });
});

// GET /api/staff/stats - Staff's own workload summary
router.get('/stats', verifyToken, requireRole(['staff']), (req, res) => {
  const db = readDB();
  const staffId = req.user.id;

  const assignedApps = db.applications.filter(a => a.assignedStaffId === staffId && a.status === 'under_review');
  const processedApps = db.applications.filter(a => a.assignedStaffId === staffId && a.status !== 'under_review');
  const recommendedApprove = db.applications.filter(a => a.assignedStaffId === staffId && a.staffRecommendation === 'recommend_approve');

  res.json({
    pendingQueueCount: assignedApps.length,
    processedCount: processedApps.length,
    approvalRate: processedApps.length > 0 ? Math.round((recommendedApprove.length / processedApps.length) * 100) : 100,
    avgTurnaroundDays: 1.2
  });
});

module.exports = router;
