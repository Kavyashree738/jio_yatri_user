const Partner = require('../models/partnerModel');

exports.createPartner = async (req, res) => {
  try {
    const { name, mobile, city, vehicle, source } = req.body;

    // Check if partner with mobile already exists
    const existingPartner = await Partner.findOne({ mobile });
    if (existingPartner) {
      return res.status(409).json({ error: 'Partner with this mobile number already exists' });
    }

    // Create new partner document
    const newPartner = new Partner({ name, mobile, city, vehicle, source });
    await newPartner.save();

    res.status(201).json({ message: 'Partner saved successfully', partner: newPartner });
  } catch (error) {
    console.error('Error saving partner:', error);

    if (error.name === 'ValidationError') {
      return res.status(400).json({ error: 'Validation failed', details: error.errors });
    }

    res.status(500).json({ error: 'Error saving partner details' });
  }
};
