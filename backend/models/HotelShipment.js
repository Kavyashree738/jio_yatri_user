const mongoose = require('mongoose');

const hotelShipmentSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  hotelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hotel', required: true },
  sender: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      addressLine1: { type: String, required: true },
      coordinates: { type: Object, required: true }
    }
  },
  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      addressLine1: { type: String, required: true },
      coordinates: { type: Object, required: true }
    }
  },
  vehicleType: { type: String, required: true },
  distance: { type: Number, required: true },
  cost: { type: Number, required: true },
  trackingNumber: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['pending', 'assigned', 'picked_up', 'delivered', 'cancelled'],
    default: 'pending'
  },
  assignedDriver: {
    _id: { type: mongoose.Schema.Types.ObjectId, ref: 'Driver' },
    userId: { type: String },
    name: String,
    phone: String,
    vehicleNumber: String
  },
  driverLocation: {
    type: { type: String, default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  payment: {
    method: { type: String, enum: ['razorpay', 'cash', null], default: null },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String,
    collectedAt: Date
  },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

hotelShipmentSchema.index({ 'driverLocation': '2dsphere' });
module.exports = mongoose.model('HotelShipment', hotelShipmentSchema);