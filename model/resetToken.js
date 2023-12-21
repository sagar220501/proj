
const mongoose = require('mongoose');

const resetTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'user', required: true },
  resetToken: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('ResetToken', resetTokenSchema);
