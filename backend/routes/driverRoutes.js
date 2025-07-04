const express = require('express');
const router = express.Router();
const { registerDriver,checkDriverExists, getDriver, updateDriverStatus,getDriverStatus ,updateDriverLocation,getDriverLocation,getAvailableShipments,registerFCMToken} = require('../controllers/driverController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

router.get('/check/:userId', verifyFirebaseToken, checkDriverExists);
router.post('/register', verifyFirebaseToken, registerDriver);
router.get('/info/:userId', verifyFirebaseToken, getDriver);
router.get('/status', verifyFirebaseToken, getDriverStatus);
router.put('/status', verifyFirebaseToken, updateDriverStatus);

// Location endpoints
router.get('/location', verifyFirebaseToken, getDriverLocation);
router.put('/location', verifyFirebaseToken, updateDriverLocation);

// backend/routes/driverRoutes.js
router.post('/fcm-token', verifyFirebaseToken, registerFCMToken);

// router.get('/:driverId/location', verifyFirebaseToken, getDriverLocation);

module.exports = router;
