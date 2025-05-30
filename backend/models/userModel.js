const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },  // Firebase UID
  email: { type: String, unique: true, sparse: true },  // Google email
  phoneNumber: { type: String, unique: true, sparse: true }, // phone number, only one unique per user
  displayName: { type: String },
  photoURL: { type: String },
  provider: { type: String, enum: ['phone', 'google'], required: true },
}, { timestamps: true });

const User =mongoose.model('User', userSchema);
module.exports = User;
