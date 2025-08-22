const mongoose = require('mongoose');

const shopOrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  shopId: { type: mongoose.Schema.Types.ObjectId, ref: 'Shop', required: true },
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true },
    quantity: { type: Number, required: true, default: 1 },
    imageUrl: { type: String },
    productId: { type: mongoose.Schema.Types.ObjectId }
  }],
  receiver: {
    name: { type: String, required: true },
    phone: { type: String, required: true },
    address: {
      addressLine1: { type: String, required: true },
      coordinates: {
        lat: { type: Number, required: true },
        lng: { type: Number, required: true }
      }
    }
  },
  vehicleType: { type: String, required: true },
  distance: { type: Number, required: true },
  cost: { type: Number, required: true },
  trackingNumber: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered', 'cancelled'],
    default: 'pending'
  },
  payment: {
    method: { type: String, enum: ['cod', 'razorpay'], required: true },
    status: { type: String, enum: ['pending', 'paid', 'failed'], default: 'pending' },
    razorpayOrderId: String,
    razorpayPaymentId: String,
    razorpaySignature: String
  },
    shopId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Shop'
  },
  isShopOrder: {
    type: Boolean,
    default: false
  },
  deliveryPerson: {
    userId: { type: String },
    name: { type: String },
    phone: { type: String },
    vehicleType: { type: String },
    vehicleNumber: { type: String },
    location: {
      type: { type: String, default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] }
    }
  },
  cancellationReason: { type: String },
  deliveredAt: { type: Date },
  createdAt: { type: Date, default: Date.now }
}, { timestamps: true });

shopOrderSchema.index({ 'deliveryPerson.location': '2dsphere' });

module.exports = mongoose.model('ShopOrder', shopOrderSchema);