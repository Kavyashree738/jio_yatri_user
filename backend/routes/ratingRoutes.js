const express = require('express');
const router = express.Router();
const { submitRating } = require('../controllers/ratingController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

router.post('/', verifyFirebaseToken, submitRating);

module.exports = router;