const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../.env') });
const mongoose = require('mongoose');
const { readDB } = require('./db');

const User = require('./models/User');
const Scholarship = require('./models/Scholarship');
const Application = require('./models/Application');
const AuditLog = require('./models/AuditLog');
const Notification = require('./models/Notification');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/scholarship_db';

const migrate = async () => {
  try {
    console.log(`====================================================`);
    console.log(`🍃 Connecting to MongoDB at: ${MONGODB_URI}`);
    console.log(`====================================================`);

    await mongoose.connect(MONGODB_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('✅ Connected successfully to MongoDB!');

    const data = readDB();

    // 1. Migrate Users
    if (data.users && data.users.length > 0) {
      for (const u of data.users) {
        await User.findOneAndUpdate({ id: u.id }, u, { upsert: true, new: true });
      }
      console.log(`👥 Migrated ${data.users.length} Users`);
    }

    // 2. Migrate Scholarships
    if (data.scholarships && data.scholarships.length > 0) {
      for (const s of data.scholarships) {
        await Scholarship.findOneAndUpdate({ id: s.id }, s, { upsert: true, new: true });
      }
      console.log(`📜 Migrated ${data.scholarships.length} Scholarships`);
    }

    // 3. Migrate Applications
    if (data.applications && data.applications.length > 0) {
      for (const a of data.applications) {
        await Application.findOneAndUpdate({ id: a.id }, a, { upsert: true, new: true });
      }
      console.log(`📋 Migrated ${data.applications.length} Applications`);
    }

    // 4. Migrate AuditLogs
    if (data.auditLogs && data.auditLogs.length > 0) {
      for (const log of data.auditLogs) {
        await AuditLog.findOneAndUpdate({ id: log.id }, log, { upsert: true, new: true });
      }
      console.log(`📜 Migrated ${data.auditLogs.length} Audit Logs`);
    }

    // 5. Migrate Notifications
    if (data.notifications && data.notifications.length > 0) {
      for (const n of data.notifications) {
        await Notification.findOneAndUpdate({ id: n.id }, n, { upsert: true, new: true });
      }
      console.log(`🔔 Migrated ${data.notifications.length} Notifications`);
    }

    console.log(`====================================================`);
    console.log(`🎉 DATA MIGRATION COMPLETE! All data from server/data.json is now saved in MongoDB!`);
    console.log(`====================================================`);

    process.exit(0);
  } catch (err) {
    console.error('❌ Migration failed:', err);
    process.exit(1);
  }
};

migrate();
