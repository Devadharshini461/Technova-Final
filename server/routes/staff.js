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
      const { password: _, ...cleanStaff } = s;
      return {
        ...cleanStaff,
        assignedCount: assignedApps,
        processedCount: processedApps
      };
    });

  res.json(staffUsers);
});

// POST /api/staff - Create new staff account (Admin only)
router.post('/', verifyToken, requireRole(['admin']), (req, res) => {
  const { name, email, password, phone, department } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const db = readDB();
  const existing = db.users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(400).json({ message: 'User with this email already exists' });
  }

  const newStaff = {
    id: `u-staff-${Date.now()}`,
    name,
    email,
    password: bcrypt.hashSync(password, 10),
    role: 'staff',
    phone: phone || '',
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
