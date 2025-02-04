const express = require('express');
const router = express.Router();
const AuditLog = require('../models/AuditCycles');

// Fetch all audit cycles
router.get('/', async (req, res) => {
  try {
    const logs = await AuditLog.find().sort({ timestamp: -1 }); // Latest logs first
    res.json({ logs });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Add a new audit Cycle
router.post('/', async (req, res) => {

  try {
    const newLog = new AuditLog({
      ...req.body,
    });
    await newLog.save();
    res.status(201).json({ message: 'Audit cycle added', log: newLog });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to save audit cycle' });
  }
});

module.exports = router;
