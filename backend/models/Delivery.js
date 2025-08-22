// models/Delivery.js
const mongoose = require('mongoose');

const DeliverySchema = new mongoose.Schema({
  hotel: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hotel',
    required: true
  },
  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      addressLine1: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  },
  items: { type: String, required: true },
  distance: { type: Number, required: true }, // in km
  cost: { type: Number, required: true }, // in INR
  status: {
    type: String,
    enum: ['pending', 'accepted', 'in-progress', 'delivered', 'cancelled'],
    default: 'pending'
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Delivery', DeliverySchema);