const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  // Sender details
  senderName: { type: String, required: true },
  senderPhone: { type: String, required: true },
  senderEmail: { type: String, default: '' },
  senderAddressLine1: { type: String, required: true },

  // Receiver details
  receiverName: { type: String, required: true },
  receiverPhone: { type: String, required: true },
  receiverEmail: { type: String, default: '' },
  receiverAddressLine1: { type: String, required: true },

  // Shipment details
  vehicleType: { type: String, required: true },
  distance: { type: Number, required: true },
  cost: { type: Number, required: true },
  trackingNumber: { type: String, required: true, unique: true },

  createdAt: { type: Date, default: Date.now }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
