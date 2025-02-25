const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  _id: { type: String, required: true }, // Azure AD Object ID
  firstName: String,
  lastName: String,
  email: { type: String, required: true, unique: true },
  role: { type: String, enum: ["Admin", "Auditor", "Viewer"], default: "Viewer" },
  createdBy: String,
  updatedBy: String,
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
