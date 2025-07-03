// const mongoose = require('mongoose');

// const driverSchema = new mongoose.Schema({
//   userId:    { type: String, required: true, unique: true },
//   name:      { type: String, required: true },
//   phone:     { type: String, required: true },
//   profileImage: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'fs.files',
//     default: null
//   },
//   vehicleType: { type: String, enum: ['TwoWheeler', 'ThreeWheeler', 'Truck'], required: true },
//   vehicleNumber: {
//     type: String, required: true,
//     validate: {
//       validator: v => /^[A-Z]{2}[0-9]{1,2}[A-Z]{1,2}[0-9]{4}$/.test(v),
//       message: props => `${props.value} is not a valid vehicle number!`
//     }
//   },
//   documents: {
//     license: { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' },
//     rc:      { type: mongoose.Schema.Types.ObjectId, ref: 'fs.files' }
//   },
//   status:     { type: String, enum: ['active', 'inactive'], default: 'inactive' },
//   lastUpdated:{ type: Date, default: Date.now },
//   location: {
//     type: {
//       type: String,
//       enum: ['Point'],
//       default: 'Point'
//     },
//     coordinates: {
//       type: [Number], // [longitude, latitude]
//       default: [0, 0]
//     },
//     lastUpdated: { type: Date, default: Date.now },
//     address:     { type: String, default: '' }
//   },
//   isLocationActive: { type: Boolean, default: false },
//   fcmToken: { type: String, default: null }, 
//    activeShipment: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: 'Shipment',
//     default: null
//   },
// });

// // Geospatial index for proximity queries
// driverSchema.index({ location: '2dsphere' });

// module.exports = mongoose.model('Driver', driverSchema);

const mongoose = require('mongoose');

const driverSchema = new mongoose.Schema({
  userId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  phone: { type: String, required: true },
  vehicleType: { type: String, enum: ['TwoWheeler', 'ThreeWheeler', 'Truck'], required: true },
  vehicleNumber: { type: String, required: true },
  status: { type: String, enum: ['active', 'inactive'], default: 'inactive' },
  ratings: {
    average: { 
      type: Number, 
      default: 0,
      min: 0,
      max: 5
    },
    count: { 
      type: Number, 
      default: 0 
    },
    details: [{
      shipmentId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'Shipment' 
      },
      rating: { 
        type: Number, 
        required: true,
        min: 1,
        max: 5
      },
      feedback: String,
      userId: {
        type: String,
        required: true
      },
      createdAt: { 
        type: Date, 
        default: Date.now 
      }
    }]
  },
  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: { type: [Number], default: [0, 0] }
  },
  isAvailable: { type: Boolean, default: true },
  activeShipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
  earnings: { type: Number, default: 0 },
  paymentBreakdown: {
    cash: { type: Number, default: 0 },
    online: { type: Number, default: 0 }
  },

  collectedPayments: [{
    shipment: { type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' },
    amount: Number,
    method: String,
    collectedAt: { type: Date, default: Date.now }
  }]
});

driverSchema.index({ location: '2dsphere' });
driverSchema.index({ earnings: 1 });

module.exports = mongoose.model('Driver', driverSchema);
