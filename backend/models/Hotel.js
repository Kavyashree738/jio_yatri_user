const mongoose = require('mongoose');

const menuItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  price: { type: Number, required: true, min: 0 },
  description: { type: String }
});

const hotelSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true
  },
  name: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  phonePeNumber: {
    type: String,
    required: true,
    validate: {
      validator: function (v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid PhonePe number!`
    }
  },
  email: {
    type: String,
    lowercase: true,
    trim: true,
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: props => `${props.value} is not a valid email!`
    }
  },
  address: {
    address: { type: String, required: true },
    coordinates: {
      lat: { type: Number, required: true },
      lng: { type: Number, required: true }
    }
  },
  openingTime: { type: String, required: true },
  closingTime: { type: String, required: true },
  category: {
    type: String,
    enum: ['veg', 'non-veg', 'both'],
    required: true,
    default: 'both'
  },
  menuItems: [menuItemSchema],
  menuImage: { type: mongoose.Schema.Types.ObjectId, ref: 'hotel_files.files' },
  hotelImages: [{ type: mongoose.Schema.Types.ObjectId, ref: 'hotel_files.files' }],
  createdAt: { type: Date, default: Date.now }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});
// Virtual for getting menu image URL
hotelSchema.virtual('menuImageUrl').get(function () {
  if (!this.menuImage) return null;
  return `https://jio-yatri-user.onrender.com/api/hotels/images/${this.menuImage}`;
});

// Virtual for getting hotel image URLs
hotelSchema.virtual('hotelImageUrls').get(function () {
  if (!this.hotelImages || this.hotelImages.length === 0) return [];
  return this.hotelImages.map(img =>
    `https://jio-yatri-user.onrender.com/api/hotels/images/${img}`
  );
});

module.exports = mongoose.model('Hotel', hotelSchema);
