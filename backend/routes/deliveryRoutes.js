// routes/deliveryRoutes.js
const express = require('express');
const router = express.Router();
const Delivery = require('../models/Delivery');
const { calculateDistance } = require('../utils/geoUtils');

router.post('/calculate-distance', async (req, res) => {
  try {
    const { origin, destination } = req.body;
    
    // Use Google Maps API or similar
    const distance = await calculateDistance(origin, destination);
    
    res.json({
      success: true,
      distance: distance // in kilometers
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

router.post('/', async (req, res) => {
  try {
    const { hotelId, receiver, items, distance, cost } = req.body;
    
    const delivery = new Delivery({
      hotel: hotelId,
      receiver,
      items,
      distance,
      cost,
      status: 'pending',
      createdAt: new Date()
    });

    await delivery.save();

    res.json({
      success: true,
      deliveryId: delivery._id
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;