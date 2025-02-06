const mongoose = require('mongoose');

const AuditCycleSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  startDateTime: { type: String, required: true },
  endDateTime: { type: String, required: true },
  status: {
    type: String,
    enum: ['Completed', 'In Progress', 'Pending'],
    required: true,
  },
  artifacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' }],
  createdBy: { type: String, required: true },
  updatedBy: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('AuditCycle', AuditCycleSchema);