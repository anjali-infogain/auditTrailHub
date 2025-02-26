const express = require('express');
const router = express.Router();
const AuditCycle = require('../models/AuditCycles');
const constants = require('../utils/constants');
const responseHandler = require('../utils/responseHandler');

// Fetch all audit cycles
router.get('/', async (req, res) => {
  try {
    const auditCycle = await AuditCycle.find()
      .sort({ updatedAt: -1 })
      .populate('createdBy updatedBy', 'firstName lastName');
    res.json(auditCycle);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

router.get('/:id', async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findById(req.params.id).populate(
      'createdBy updatedBy',
      'firstName lastName'
    );

    if (!auditCycle) {
      return res.status(404).json({ message: 'AuditCycle not found' });
    }

    res.status(200).json(auditCycle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// DELETE AuditCycle by ID
router.delete('/:id', async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findByIdAndDelete(req.params.id);

    if (!auditCycle) {
      return res.status(404).json({ message: 'AuditCycle not found' });
    }

    res.status(200).json({ message: 'AuditCycle deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

// Add a new audit Cycle
router.post('/', async (req, res) => {
  try {
    const newLog = new AuditCycle({
      ...req.body,
    });
    await newLog.save();
    res.status(201).json({ message: 'Audit cycle added', log: newLog });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: 'Failed to save audit cycle' });
  }
});

// PUT (Update) AuditCycle by ID
router.put('/:id', async (req, res) => {
  try {
    const updatedAuditCycle = await AuditCycle.findByIdAndUpdate(
      req.params.id,
      { ...req.body, updatedOn: Date.now() }, // Update fields and timestamp
      { new: true, runValidators: true } // Return updated doc & validate changes
    );

    if (!updatedAuditCycle) {
      return res.status(404).json({ message: 'AuditCycle not found' });
    }

    res.status(200).json(updatedAuditCycle);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
});

module.exports = router;
