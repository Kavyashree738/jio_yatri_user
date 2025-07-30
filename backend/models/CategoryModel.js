const mongoose = require('mongoose');

// 1. First register the GridFS collections schemas
mongoose.model('shop_files.files', new mongoose.Schema({}, { strict: false }));
mongoose.model('shop_files.chunks', new mongoose.Schema({}, { strict: false }));

// 2. Base shop schema
const baseShopSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  shopName: { type: String, required: true, trim: true },
  phone: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
        return /^[0-9]{10}$/.test(v);
      },
      message: props => `${props.value} is not a valid phone number!`
    }
  },
  phonePeNumber: {
    type: String,
    required: true,
    validate: {
      validator: function(v) {
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
      validator: function(v) {
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
  shopImages: [{ type: mongoose.Schema.Types.ObjectId }], // Removed ref as we handle manually
  category: { 
    type: String, 
    required: true, 
    enum: ['grocery', 'vegetable', 'provision', 'medical', 'hotel'] 
  }
}, {
  timestamps: true,
  discriminatorKey: 'category',
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for shop image URLs
baseShopSchema.virtual('shopImageUrls').get(function() {
  if (!this.shopImages || this.shopImages.length === 0) return [];
  return this.shopImages.map(img => 
    `https://jio-yatri-user.onrender.com/api/shops/images/${img}`
  );
});

// Create base Shop model
const Shop = mongoose.model('Shop', baseShopSchema);

// 3. Category-specific schemas with their own virtuals

// Grocery schema
const grocerySchema = new mongoose.Schema({
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    description: { type: String },
    image: { type: mongoose.Schema.Types.ObjectId } // Removed ref
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

grocerySchema.virtual('itemsWithUrls').get(function() {
  if (!this.items) return [];
  return this.items.map(item => ({
    ...item.toObject(),
    imageUrl: item.image ? 
      `https://jio-yatri-user.onrender.com/api/shops/images/${item.image}` : 
      null
  }));
});

// Vegetable schema
const vegetableSchema = new mongoose.Schema({
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    organic: { type: Boolean, default: false },
    image: { type: mongoose.Schema.Types.ObjectId }
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

vegetableSchema.virtual('itemsWithUrls').get(function() {
  if (!this.items) return [];
  return this.items.map(item => ({
    ...item.toObject(),
    imageUrl: item.image ? 
      `https://jio-yatri-user.onrender.com/api/shops/images/${item.image}` : 
      null
  }));
});

// Provision schema
const provisionSchema = new mongoose.Schema({
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    weight: { type: String },
    brand: { type: String },
    image: { type: mongoose.Schema.Types.ObjectId }
  }]
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

provisionSchema.virtual('itemsWithUrls').get(function() {
  if (!this.items) return [];
  return this.items.map(item => ({
    ...item.toObject(),
    imageUrl: item.image ? 
      `https://jio-yatri-user.onrender.com/api/shops/images/${item.image}` : 
      null
  }));
});

// Medical schema
const medicalSchema = new mongoose.Schema({
  items: [{
    name: { type: String, required: true },
    price: { type: Number, required: true, min: 0 },
    prescriptionRequired: { type: Boolean, default: false },
    image: { type: mongoose.Schema.Types.ObjectId }
  }],
  hasPharmacy: { type: Boolean, default: false }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

medicalSchema.virtual('itemsWithUrls').get(function() {
  if (!this.items) return [];
  return this.items.map(item => ({
    ...item.toObject(),
    imageUrl: item.image ? 
      `https://jio-yatri-user.onrender.com/api/shops/images/${item.image}` : 
      null
  }));
});

// Hotel schema
const hotelSchema = new mongoose.Schema({
  rooms: [{
    type: { type: String, required: true, enum: ['single', 'double', 'suite'] },
    pricePerNight: { type: Number, required: true, min: 0 },
    amenities: [{ type: String }],
    images: [{ type: mongoose.Schema.Types.ObjectId }]
  }],
  cuisineTypes: [{ type: String }],
  hasRestaurant: { type: Boolean, default: false }
}, {
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

hotelSchema.virtual('roomsWithUrls').get(function() {
  if (!this.rooms) return [];
  return this.rooms.map(room => ({
    ...room.toObject(),
    imageUrls: room.images ? 
      room.images.map(img => 
        `https://jio-yatri-user.onrender.com/api/shops/images/${img}`
      ) : []
  }));
});

// 4. Register discriminators
Shop.discriminator('grocery', grocerySchema);
Shop.discriminator('vegetable', vegetableSchema);
Shop.discriminator('provision', provisionSchema);
Shop.discriminator('medical', medicalSchema);
Shop.discriminator('hotel', hotelSchema);

module.exports = Shop;
