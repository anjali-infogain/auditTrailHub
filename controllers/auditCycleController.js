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
    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.SUCCESS,
      auditCycle
    );
  } catch (err) {
    console.error(err);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

router.get('/:id', async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findById(req.params.id).populate(
      'createdBy updatedBy',
      'firstName lastName'
    );

    if (!auditCycle) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.NOT_FOUND,
        constants.STATUS_CODES.NOT_FOUND
      );
    }

    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.SUCCESS,
      auditCycle
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

// DELETE AuditCycle by ID
router.delete('/:id', async (req, res) => {
  try {
    const auditCycle = await AuditCycle.findByIdAndDelete(req.params.id);

    if (!auditCycle) {
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.NOT_FOUND,
        constants.STATUS_CODES.NOT_FOUND
      );
    }
    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.AUDIT_CYCLE_DELETE_SUCCESS
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

// Add a new audit Cycle
router.post('/', async (req, res) => {
  try {
    const newLog = new AuditCycle({
      ...req.body,
    });
    await newLog.save();
    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.AUDIT_CYCLE_CREATED,
      newLog,
      constants.STATUS_CODES.CREATED
    );
  } catch (err) {
    console.error(err);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.AUDIT_CYCLE_SAVE_FAIL,
      constants.STATUS_CODES.SERVER_ERROR
    );
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
      return responseHandler.error(
        res,
        constants.RESPONSE_MESSAGES.NOT_FOUND,
        constants.STATUS_CODES.NOT_FOUND
      );
    }

    return responseHandler.success(
      res,
      constants.RESPONSE_MESSAGES.SUCCESS,
      updatedAuditCycle
    );
  } catch (error) {
    console.error(error);
    return responseHandler.error(
      res,
      constants.RESPONSE_MESSAGES.SERVER_ERROR,
      constants.STATUS_CODES.SERVER_ERROR
    );
  }
});

module.exports = router;
