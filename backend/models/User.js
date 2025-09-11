const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true, index: true },
  name: { type: String, default: '' },
 email: { 
  type: String, 
  default: null,  // Change from empty string to null
  index: {
    unique: true,
    partialFilterExpression: { email: { $exists: true, $ne: null, $ne: "" } }
  }
},

  phone: { type: String, default: '' },
  photo: { type: String, default: '' },
  referralCode: { 
    type: String, 
    unique: true, 
    sparse: true  // Add sparse index
  },
  referredBy: { type: String, default: null, index: true },
  referralRewards: [{
    amount: { type: Number, default: 20 },
    description: { type: String, default: '' },
    referredUserId: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
  }],
  totalShipments: { type: Number, default: 0 },
  totalAmountPaid: { type: Number, default: 0 },
  shipments: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Shipment' }]
}, { 
  timestamps: true
});

// Pre-save hook for referral code
UserSchema.pre('save', async function() {
  if (!this.referralCode) {
    let attempts = 0;
    let code;
    do {
      const randomPart = Math.floor(1000 + Math.random() * 9000); // 4-digit number
      const prefix = 'MG'; // fixed prefix
      code = `${prefix}${randomPart}`;
      attempts++;
      if (attempts > 5) {
        throw new Error('Failed to generate unique referral code');
      }
    } while (await mongoose.model('User').exists({ referralCode: code }));
    
    this.referralCode = code;
  }
});



module.exports = mongoose.model('User', UserSchema);

