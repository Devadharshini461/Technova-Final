const express = require('express');
const router = express.Router();
const { readDB } = require('../db');
const { verifyToken, requireRole } = require('../middleware/auth');

// GET /api/analytics/summary
router.get('/summary', verifyToken, requireRole(['admin']), (req, res) => {
  const db = readDB();
  const apps = db.applications;
  const schemes = db.scholarships;

  const totalApplications = apps.length;
  const statusCounts = {
    submitted: apps.filter(a => a.status === 'submitted').length,
    under_review: apps.filter(a => a.status === 'under_review').length,
    verified: apps.filter(a => a.status === 'verified').length,
    pending_admin_approval: apps.filter(a => a.status === 'pending_admin_approval').length,
    approved: apps.filter(a => a.status === 'approved').length,
    rejected: apps.filter(a => a.status === 'rejected').length,
    disbursed: apps.filter(a => a.status === 'disbursed').length
  };

  const totalDisbursedAmount = apps
    .filter(a => a.status === 'disbursed')
    .reduce((sum, a) => sum + (a.scholarshipAmount || 0), 0);

  const totalAllocatedBudget = schemes.reduce((sum, s) => sum + (s.amount * s.seats), 0);

  // Status breakdown pie data
  const statusPieData = [
    { name: 'Under Review', value: statusCounts.under_review + statusCounts.submitted, color: '#3b82f6' },
    { name: 'Pending Admin', value: statusCounts.pending_admin_approval, color: '#f59e0b' },
    { name: 'Approved', value: statusCounts.approved, color: '#10b981' },
    { name: 'Disbursed', value: statusCounts.disbursed, color: '#06b6d4' },
    { name: 'Rejected', value: statusCounts.rejected, color: '#ef4444' }
  ];

  // Scheme approval rate bar data
  const schemeBarData = schemes.map(s => {
    const schemeApps = apps.filter(a => a.scholarshipId === s.id);
    const approved = schemeApps.filter(a => a.status === 'approved' || a.status === 'disbursed').length;
    const total = schemeApps.length;
    return {
      name: s.title.split(' ')[0] + '...',
      fullName: s.title,
      total,
      approved,
      rate: total > 0 ? Math.round((approved / total) * 100) : 0
    };
  });

  // Fund utilization progress
  const fundUtilization = schemes.map(s => {
    const disbursedForScheme = apps
      .filter(a => a.scholarshipId === s.id && a.status === 'disbursed')
      .reduce((sum, a) => sum + a.scholarshipAmount, 0);
    const totalSchemeBudget = s.amount * s.seats;

    return {
      schemeId: s.id,
      title: s.title,
      totalBudget: totalSchemeBudget,
      disbursedAmount: disbursedForScheme,
      percentageUsed: totalSchemeBudget > 0 ? Math.round((disbursedForScheme / totalSchemeBudget) * 100) : 0
    };
  });

  res.json({
    totalApplications,
    statusCounts,
    totalDisbursedAmount,
    totalAllocatedBudget,
    statusPieData,
    schemeBarData,
    fundUtilization
  });
});

// GET /api/analytics/trends
router.get('/trends', verifyToken, requireRole(['admin']), (req, res) => {
  // Mock recent daily trend data for line charts
  const lineChartData = [
    { date: 'Jul 25', Applications: 12, Approved: 8, Disbursed: 5 },
    { date: 'Jul 26', Applications: 18, Approved: 12, Disbursed: 10 },
    { date: 'Jul 27', Applications: 25, Approved: 16, Disbursed: 14 },
    { date: 'Jul 28', Applications: 22, Approved: 15, Disbursed: 12 },
    { date: 'Jul 29', Applications: 35, Approved: 24, Disbursed: 20 },
    { date: 'Jul 30', Applications: 42, Approved: 30, Disbursed: 25 },
    { date: 'Jul 31', Applications: 50, Approved: 38, Disbursed: 32 }
  ];

  res.json(lineChartData);
});

module.exports = router;
