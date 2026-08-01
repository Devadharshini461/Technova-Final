const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/scholarships - Public & Student browsing
router.get('/', (req, res) => {
  const { status, category, search, includeExpired } = req.query;
  const db = readDB();
  let list = [...db.scholarships];

  const todayStr = new Date().toISOString().split('T')[0];

  // Requirement #4: If deadline is over, DO NOT display in student dashboard unless explicitly requested by admin
  if (!includeExpired || includeExpired !== 'true') {
    list = list.filter(s => !s.deadline || s.deadline >= todayStr);
  }

  if (status) {
    list = list.filter(s => s.status === status);
  }

  if (category && category !== 'All') {
    list = list.filter(s => s.category.toLowerCase() === category.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    list = list.filter(s => 
      s.title.toLowerCase().includes(q) || 
      s.provider.toLowerCase().includes(q) ||
      s.eligibilityRules.description.toLowerCase().includes(q)
    );
  }

  res.json(list);
});

// GET /api/scholarships/:id - Scheme details
router.get('/:id', (req, res) => {
  const db = readDB();
  const scheme = db.scholarships.find(s => s.id === req.params.id);
  if (!scheme) {
    return res.status(404).json({ message: 'Scholarship scheme not found' });
  }
  res.json(scheme);
});

// POST /api/scholarships - Create scheme (Admin only, includes Staff Allotment Requirement #9)
router.post('/', verifyToken, requireRole(['admin']), (req, res) => {
  const { 
    title, provider, category, amount, deadline, seats, 
    minPercentage, maxFamilyIncome, allowedCategories, description,
    requiredDocuments, requiresAdminApproval, assignedStaffId 
  } = req.body;

  if (!title || !amount || !deadline) {
    return res.status(400).json({ message: 'Title, amount, and deadline are required' });
  }

  const db = readDB();
  let assignedStaffName = 'Unassigned';
  if (assignedStaffId) {
    const staffUser = db.users.find(u => u.id === assignedStaffId);
    if (staffUser) assignedStaffName = staffUser.name;
  }

  const newScheme = {
    id: `sch-${Date.now()}`,
    title,
    provider: provider || 'BIT Sathy & Government CSR',
    category: category || 'Merit-cum-Means',
    amount: parseFloat(amount),
    deadline,
    seats: parseInt(seats) || 100,
    appliedCount: 0,
    status: 'active',
    requiresAdminApproval: requiresAdminApproval !== undefined ? Boolean(requiresAdminApproval) : true,
    assignedStaffId: assignedStaffId || '',
    assignedStaffName: assignedStaffName,
    eligibilityRules: {
      minPercentage: parseFloat(minPercentage) || 0,
      maxFamilyIncome: parseFloat(maxFamilyIncome) || 1000000,
      allowedCategories: allowedCategories || ['General', 'OBC', 'SC', 'ST', 'EWS'],
      description: description || ''
    },
    requiredDocuments: requiredDocuments || ['Marksheet', 'Income Certificate', 'ID Proof'],
    createdDate: new Date().toISOString().split('T')[0]
  };

  db.scholarships.unshift(newScheme);

  // Add audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'SCHEME_CREATE',
    details: `Created scholarship scheme "${title}" (Assigned to Staff: ${assignedStaffName})`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.status(201).json(newScheme);
});

// PUT /api/scholarships/:id - Edit scheme (Admin only, includes Staff Allotment Requirement #9)
router.put('/:id', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const index = db.scholarships.findIndex(s => s.id === req.params.id);

  if (index === -1) {
    return res.status(404).json({ message: 'Scholarship scheme not found' });
  }

  const existing = db.scholarships[index];
  const { 
    title, provider, category, amount, deadline, seats, status,
    minPercentage, maxFamilyIncome, allowedCategories, description,
    requiredDocuments, requiresAdminApproval, assignedStaffId 
  } = req.body;

  let assignedStaffName = existing.assignedStaffName || 'Unassigned';
  if (assignedStaffId !== undefined) {
    const staffUser = db.users.find(u => u.id === assignedStaffId);
    assignedStaffName = staffUser ? staffUser.name : 'Unassigned';
  }

  const updatedScheme = {
    ...existing,
    title: title !== undefined ? title : existing.title,
    provider: provider !== undefined ? provider : existing.provider,
    category: category !== undefined ? category : existing.category,
    amount: amount !== undefined ? parseFloat(amount) : existing.amount,
    deadline: deadline !== undefined ? deadline : existing.deadline,
    seats: seats !== undefined ? parseInt(seats) : existing.seats,
    status: status !== undefined ? status : existing.status,
    requiresAdminApproval: requiresAdminApproval !== undefined ? Boolean(requiresAdminApproval) : existing.requiresAdminApproval,
    assignedStaffId: assignedStaffId !== undefined ? assignedStaffId : existing.assignedStaffId,
    assignedStaffName,
    eligibilityRules: {
      ...existing.eligibilityRules,
      minPercentage: minPercentage !== undefined ? parseFloat(minPercentage) : existing.eligibilityRules.minPercentage,
      maxFamilyIncome: maxFamilyIncome !== undefined ? parseFloat(maxFamilyIncome) : existing.eligibilityRules.maxFamilyIncome,
      allowedCategories: allowedCategories !== undefined ? allowedCategories : existing.eligibilityRules.allowedCategories,
      description: description !== undefined ? description : existing.eligibilityRules.description
    },
    requiredDocuments: requiredDocuments !== undefined ? requiredDocuments : existing.requiredDocuments
  };

  db.scholarships[index] = updatedScheme;

  // Add audit log
  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'SCHEME_UPDATE',
    details: `Updated scholarship scheme "${updatedScheme.title}" (Assigned Staff: ${assignedStaffName})`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json(updatedScheme);
});

// PATCH /api/scholarships/:id/close - Close scheme (Admin only)
router.patch('/:id/close', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const scheme = db.scholarships.find(s => s.id === req.params.id);

  if (!scheme) {
    return res.status(404).json({ message: 'Scholarship scheme not found' });
  }

  scheme.status = 'closed';

  db.auditLogs.unshift({
    id: `log-${Date.now()}`,
    actorName: req.user.name,
    actorRole: req.user.role,
    action: 'SCHEME_CLOSE',
    details: `Closed scholarship scheme "${scheme.title}"`,
    timestamp: new Date().toISOString()
  });

  writeDB(db);
  res.json(scheme);
});

module.exports = router;
