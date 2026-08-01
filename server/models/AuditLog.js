const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  actorName: { type: String, required: true },
  actorRole: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  timestamp: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

module.exports = mongoose.model('AuditLog', auditLogSchema);
