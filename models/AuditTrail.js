const mongoose = require('mongoose');

const AuditCycleSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  Name: { type: String, required: true },
  Description: { type: String },
  StartDateTime: { type: Date, required: true },
  EndDateTime: { type: Date, required: true },
  Status: { 
    type: String, 
    enum: ['Completed', 'In Progress', 'Pending'], 
    required: true 
  },
  Artifacts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Artifact' }],
  CreatedBy: { type: String, required: true },
  UpdatedBy: { type: String },
  CreatedOn: { type: Date, default: Date.now },
  UpdatedOn: { type: Date, default: Date.now }
});

module.exports = mongoose.model('AuditCycle', AuditCycleSchema);