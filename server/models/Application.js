const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  name: { type: String, required: true },
  type: { type: String, required: true },
  fileUrl: { type: String, required: true },
  status: { type: String, default: 'pending' },
  remark: { type: String, default: '' }
}, { _id: false });

const applicationSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  scholarshipId: { type: String, required: true },
  scholarshipTitle: { type: String, required: true },
  scholarshipAmount: { type: Number, required: true },
  requiresAdminApproval: { type: Boolean, default: true },
  studentId: { type: String, required: true },
  studentName: { type: String, required: true },
  studentEmail: { type: String, required: true },
  studentPhone: { type: String },
  college: { type: String },
  course: { type: String },
  year: { type: String },
  marksPercentage: { type: Number },
  familyIncome: { type: Number },
  category: { type: String },
  assignedStaffId: { type: String },
  assignedStaffName: { type: String },
  status: { type: String, default: 'submitted' },
  documents: [documentSchema],
  autoEligibilityCheck: {
    passed: Boolean,
    reasons: [String]
  },
  staffRemarks: { type: String, default: '' },
  staffRecommendation: { type: String, default: '' },
  adminRemarks: { type: String, default: '' },
  disbursementDetails: {
    transactionId: String,
    amount: Number,
    disbursedDate: String,
    bankAccount: String,
    ifsc: String
  },
  submittedAt: { type: String, default: () => new Date().toISOString() },
  updatedAt: { type: String, default: () => new Date().toISOString() }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
