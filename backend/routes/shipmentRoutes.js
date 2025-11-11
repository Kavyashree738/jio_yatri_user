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

router.get("/my-latest", verifyFirebaseToken, async (req, res) => {
  try {
    const userId = req.user.uid; // ✅ decoded Firebase user
    console.log("🟦 [ShopOrder] Request received from user:", userId);

    // Find latest shop order that’s still awaiting payment
    console.log("🔍 Searching for latest shop order where:");
    console.log("   → userId:", userId);
    console.log("   → isShopOrder: true");
    console.log("   → status: 'awaiting_payment'");
    console.log("   → payment.status: 'pending'");

    const latestShopOrder = await Shipment.findOne({
      userId,
      isShopOrder: true,
      status: { $in: ["awaiting_payment", "picked_up"] }, // ✅ allow both
    })
      .sort({ createdAt: -1 })
      .populate("assignedDriver");


    // Log query result
    if (!latestShopOrder) {
      console.log("ℹ️ No active shop orders for user:", userId);
      return res.status(200).json({
        found: false,
        message: "No active shop orders found",
        order: null
      });
    }


    console.log("✅ Shop order found:", {
      trackingNumber: latestShopOrder.trackingNumber,
      status: latestShopOrder.status,
      paymentStatus: latestShopOrder.payment?.status,
      isShopOrder: latestShopOrder.isShopOrder,
      driver: latestShopOrder.assignedDriver?.name || "N/A",
    });

    res.status(200).json(latestShopOrder);
  } catch (err) {
    console.error("❌ Error fetching latest shop order:", err);
    res.status(500).json({ error: "Server error while fetching shop order" });
  }
});


router.get("/count", verifyFirebaseToken, shipmentController.getPaidShipmentCount);
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
router.get('/shop/:shopId', verifyFirebaseToken, shipmentController.getShopShipments);
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

router.get("/tracking/:trackingNumber", shipmentController.getShipmentByTrackingNumber);




module.exports = router;
