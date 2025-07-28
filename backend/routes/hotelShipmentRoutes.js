const express = require('express');
const router = express.Router();
const hotelShipmentController = require('../controllers/hotelShipmentController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

router.post('/calculate-distance', hotelShipmentController.calculateDistance);
router.post('/',verifyFirebaseToken, hotelShipmentController.createHotelShipment);
// Add other routes as needed

module.exports = router;