const express = require('express');
const router = express.Router();
const shipmentController = require('../controllers/shipmentController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
const Shipment = require('../models/Shipment');
// Debugging check
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
router.get('/:id', verifyFirebaseToken, shipmentController.getShipmentById);

router.put('/:id/accept', verifyFirebaseToken, shipmentController.acceptShipment);

router.get('/:orderId/status', verifyFirebaseToken, shipmentController.getOrderStatus);

router.get('/matching',verifyFirebaseToken , shipmentController.getMatchingShipments);

router.put('/:id/cancel', verifyFirebaseToken, shipmentController.cancelShipment);

// Mark shipment as delivered
router.put('/:id/deliver', verifyFirebaseToken, shipmentController.deliverShipment);

router.put(
  '/:id/cancel',
  verifyFirebaseToken,
  shipmentController.cancelShipment
);

router.put(
  '/:id/deliver',
  verifyFirebaseToken,
  shipmentController.deliverShipment
);


router.put(
  '/:id/driver-location',
  verifyFirebaseToken,
  shipmentController.updateDriverLocation
);

router.get('/driver/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('[Debug] Fetching shipments for userId:', userId);

    const shipments = await Shipment.find({ 'assignedDriver.userId': userId });

    console.log('[Debug] Shipments found:', shipments.length);
    res.status(200).json(shipments);
  } catch (error) {
    console.error('[Error] Failed to fetch shipments:', error);
    res.status(500).json({ error: 'Failed to fetch shipments' });
  }
});




module.exports = router;
