const mongoose = require('mongoose');

const ArtifactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: {
    type: String,
    enum: ['Draft', 'Under Review', 'Approved', 'Amended'],
    required: true,
  },
  commentIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Comment' }], // Foreign Key reference to Comment
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // User ID reference
  updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // User ID reference
}, { timestamps: true }); // Automatically manages createdAt and updatedAt

module.exports = mongoose.model('Artifact', ArtifactSchema);