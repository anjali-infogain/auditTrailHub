const mongoose = require('mongoose');

const AuditCycleSchema = new mongoose.Schema(
  {
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
    createdBy: {
      type: mongoose.Schema.Types.String,
      ref: 'User',
      required: true,
    }, // User ID reference
    updatedBy: { type: mongoose.Schema.Types.String, ref: 'User' }, // User ID reference
  },
  { timestamps: true }
);

module.exports = mongoose.model('AuditCycle', AuditCycleSchema);
