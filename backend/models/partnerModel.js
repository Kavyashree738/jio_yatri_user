const mongoose = require('mongoose');

const partnerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  mobile: { type: String, required: true },
  city: { type: String, required: true },
  vehicle: { type: String, required: true },
  source: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model('Partner', partnerSchema);
