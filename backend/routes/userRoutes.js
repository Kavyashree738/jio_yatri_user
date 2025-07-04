const express = require('express');
const router = express.Router();
const { createOrGetUser } = require('../controllers/userController');
const verifyFirebaseToken = require('../middleware/verifyFirebaseToken');

router.post('/', verifyFirebaseToken, createOrGetUser);

module.exports = router;
