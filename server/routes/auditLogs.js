const express = require('express');
const router = express.Router();
const { readDB } = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/audit-logs - Searchable & filterable audit log list (Admin only)
router.get('/', verifyToken, requireRole(['admin']), (req, res) => {
  const { actorRole, action, search } = req.query;
  const db = readDB();
  let logs = [...db.auditLogs];

  if (actorRole) {
    logs = logs.filter(l => l.actorRole === actorRole);
  }

  if (action) {
    logs = logs.filter(l => l.action === action);
  }

  if (search) {
    const q = search.toLowerCase();
    logs = logs.filter(l => 
      l.actorName.toLowerCase().includes(q) ||
      l.details.toLowerCase().includes(q) ||
      l.action.toLowerCase().includes(q)
    );
  }

  res.json(logs);
});

module.exports = router;
