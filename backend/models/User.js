// // models/User.js
// const mongoose = require('mongoose');

// const UserSchema = new mongoose.Schema({
//   uid:   { type: String, required: true, unique: true, index: true },
//   name:  { type: String, default: '' },
//   email: { type: String, default: '' }, // not unique by design
//   phone: { type: String, default: '' },
//   photo: { type: String, default: '' },
// }, { timestamps: true });

// module.exports = mongoose.model('User', UserSchema);



const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  uid:   { type: String, required: true, unique: true, index: true },
  name:  { type: String, default: '' },
  email: { type: String, default: '' },
  phone: { type: String, default: '' },
  photo: { type: String, default: '' },

 
  totalShipments: { type: Number, default: 0 },
  totalAmountPaid: { type: Number, default: 0 },

  shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' }]
}, { timestamps: true });
module.exports = mongoose.model('User', UserSchema);