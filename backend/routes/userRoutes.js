const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');
router.post('/', userController.createOrUpdateUser);
router.get('/:uid', userController.getUserByUid);
router.get('/:uid/referral-code', userController.getReferralCode);
router.get('/:uid/referral-stats', userController.getReferralStats);
router.get('/referrals/leaderboard', userController.getReferralLeaderboard);

router.post('/apply-referral',verifyFirebaseToken, userController.applyReferral);

module.exports = router;