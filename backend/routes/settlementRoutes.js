const express = require('express');
const router = express.Router();
const settlementController = require('../controllers/settlementController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
console.log('---------------------')
router.post('/record', verifyFirebaseToken, settlementController.recordPayment);
router.get('/driver/:userId', verifyFirebaseToken, settlementController.getDriverSettlement);
router.post('/complete/:userId', verifyFirebaseToken, settlementController.completeSettlement);
router.post('/daily', settlementController.dailySettlement); // Should be protected in production

module.exports = router;