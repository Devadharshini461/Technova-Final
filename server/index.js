const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { readDB } = require('./db');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarship_db';

// Try connecting to MongoDB via Mongoose if available
mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log(`🍃 Connected successfully to MongoDB at ${MONGODB_URI}`);
  })
  .catch(err => {
    console.log(`ℹ️  MongoDB instance not detected locally. System running seamlessly on local persistent database (server/data.json).`);
  });

// Middlewares
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static uploads serving
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Pre-initialize DB on boot
readDB();

// API Route Mounts
app.use('/api/auth', require('./routes/auth'));
app.use('/api/scholarships', require('./routes/scholarships'));
app.use('/api/applications', require('./routes/applications'));
app.use('/api/staff', require('./routes/staff'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/audit-logs', require('./routes/auditLogs'));
app.use('/api/notifications', require('./routes/notifications'));

// Root endpoint status check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    system: 'Scholarship Management and Verification Portal API',
    timestamp: new Date().toISOString()
  });
});

// Serve built frontend static assets
const distPath = path.join(__dirname, '../dist');
app.use(express.static(distPath));

// SPA Catch-all Fallback
app.get(/.*/, (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return next();
  }
  res.sendFile(path.join(distPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).json({ message: "Frontend build files not found. Please run 'npm run build' first." });
    }
  });
});

app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Scholarship Management Backend API running on port ${PORT}`);
  console.log(`====================================================`);
});

module.exports = app;
