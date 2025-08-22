const express = require('express');
const router = express.Router();
const porterBookingController = require('../controllers/porter');

// Calculate distance
router.post('/calculate-distance', porterBookingController.calculateDistance);

// Create booking
router.post('/', porterBookingController.createPorterBooking);

module.exports = router;