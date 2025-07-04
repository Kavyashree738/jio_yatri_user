const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

// Debug logs
console.log('[Debug] Middleware type:', typeof verifyFirebaseToken);
console.log('[Debug] Controller methods:', {
  calculateDistance: typeof shipmentController.calculateDistance,
  createShipment: typeof shipmentController.createShipment,
  getUserShipments: typeof shipmentController.getUserShipments
});

// Routes
router.post('/calculate-distance', shipmentController.calculateDistance);
router.post('/', verifyFirebaseToken, shipmentController.createShipment);

router.get('/my-shipments', verifyFirebaseToken, shipmentController.getUserShipments);

// Reorder these two ↓↓↓
router.get('/:orderId/status', verifyFirebaseToken, shipmentController.getOrderStatus);
router.get('/:id', verifyFirebaseToken, shipmentController.getShipmentById);

module.exports = router;
