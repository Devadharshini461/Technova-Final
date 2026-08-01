const mongoose = require('mongoose');

const scholarshipSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  title: { type: String, required: true },
  provider: { type: String, required: true },
  category: { type: String, required: true },
  amount: { type: Number, required: true },
  deadline: { type: String, required: true },
  seats: { type: Number, default: 0 },
  appliedCount: { type: Number, default: 0 },
  status: { type: String, default: 'active' },
  requiresAdminApproval: { type: Boolean, default: true },
  assignedStaffId: { type: String },
  assignedStaffName: { type: String },
  eligibilityRules: {
    minPercentage: Number,
    maxFamilyIncome: Number,
    allowedCategories: [String],
    description: String
  },
  requiredDocuments: [String],
  createdDate: { type: String, default: () => new Date().toISOString().split('T')[0] }
}, { timestamps: true });

module.exports = mongoose.model('Scholarship', scholarshipSchema);
