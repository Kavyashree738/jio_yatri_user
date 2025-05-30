const express = require('express');
const router = express.Router();
const { createOrGetUser } = require('../controllers/userController');
const verifyFirebaseToken = require('../middleware/auth'); // import default export

router.post('/', verifyFirebaseToken, createOrGetUser);

module.exports = router;
