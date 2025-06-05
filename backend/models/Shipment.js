const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
  // Sender details
  userId: { type: String, required: true }, // Store the Firebase UID
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


  createdAt: { type: Date, default: Date.now },


  // Add to your existing schema
status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },
  assignedDriver: { type: String, default: null }, // Stores driver's Firebase UID
  driverLocation: { // For live tracking (optional)
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  }
});

const Shipment = mongoose.model('Shipment', shipmentSchema);

module.exports = Shipment;
