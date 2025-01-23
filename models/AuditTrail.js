const mongoose = require('mongoose');

const AuditTrailSchema = new mongoose.Schema({
  user: {
    type: String,
    required: true,
  },
  action: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('AuditTrail', AuditTrailSchema);
