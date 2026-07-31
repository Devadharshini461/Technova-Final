const express = require('express');
const router = express.Router();
const { readDB, writeDB } = require('../db');
const { verifyToken } = require('../middleware/auth');

// GET /api/notifications/my - Get user notifications
router.get('/my', verifyToken, (req, res) => {
  const db = readDB();
  const userNotifs = db.notifications.filter(n => n.userId === req.user.id);
  res.json(userNotifs);
});

// PATCH /api/notifications/:id/read - Mark notification as read
router.patch('/:id/read', verifyToken, (req, res) => {
  const db = readDB();
  const notif = db.notifications.find(n => n.id === req.params.id && n.userId === req.user.id);
  if (notif) {
    notif.isRead = true;
    writeDB(db);
  }
  res.json({ message: 'Notification marked as read' });
});

// PATCH /api/notifications/read-all - Mark all read
router.patch('/read-all', verifyToken, (req, res) => {
  const db = readDB();
  db.notifications.forEach(n => {
    if (n.userId === req.user.id) {
      n.isRead = true;
    }
  });
  writeDB(db);
  res.json({ message: 'All notifications marked as read' });
});

module.exports = router;
