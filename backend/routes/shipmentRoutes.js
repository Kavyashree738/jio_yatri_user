const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');

// POST /api/shipments/calculate-distance
router.post('/calculate-distance', shipmentController.calculateDistance);

// POST /api/shipments
router.post('/', shipmentController.createShipment);

router.get('/user/:userId', shipmentController.getUserShipments);
module.exports = router;
