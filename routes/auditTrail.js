const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditTrail');

// Fetch all audit logs
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }); // Latest logs first
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new audit log
router.post('/log', async (req, res) => {
  const { user, action, timestamp } = req.body;
  if (!user || !action) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  try {
    const newLog = new AuditLog({
      user,
      action,
      timestamp: timestamp || Date.now(),
    });
    await newLog.save();
    res.status(201).json({ message: 'Audit log added', log: newLog });
  } catch (err) {
    res.status(500).json({ error: 'Failed to save log' });
  }
});

module.exports = router;
