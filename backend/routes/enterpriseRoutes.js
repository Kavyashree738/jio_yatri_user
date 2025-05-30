const express = require('express');
const router = express.Router();

const enterpriseController = require('../controllers/enterpriseController');

router.post('/enterprise', enterpriseController.createEnterprise);

module.exports = router;
