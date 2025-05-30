const express = require('express');
const router = express.Router();
const partnerController = require('../controllers/partnerController');

router.post('/partners', partnerController.createPartner);

module.exports = router;
