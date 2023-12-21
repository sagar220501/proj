
const mongoose = require('mongoose');

const forgotPasswordSchema = new mongoose.Schema({
  email: { type: String, required: true },
  resetToken: { type: String, required: true },
  expiresAt: { type: Date, required: true }
});

module.exports = mongoose.model('ForgotPassword', forgotPasswordSchema);
