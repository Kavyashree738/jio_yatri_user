// routes/orders.js
const express = require('express');
const router = express.Router();
const orderCtrl = require('../controllers/orderController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
router.post('/', verifyFirebaseToken,orderCtrl.createOrder);

// put specific routes BEFORE generic ones
router.get('/owner/:ownerId', /*verifyFirebaseToken,*/ orderCtrl.getOrdersByOwner);
router.get('/shop/:shopId', /*verifyFirebaseToken,*/ orderCtrl.getOrdersByShop);

router.get('/', orderCtrl.getOrdersByUser);

router.get('/user', verifyFirebaseToken, orderCtrl.getOrdersByUser);

router.patch('/:id/payment', orderCtrl.updatePaymentStatus);
router.get('/:id', orderCtrl.getOrder);

router.patch('/:id/status', verifyFirebaseToken, orderCtrl.updateOrderStatus);
module.exports = router;
