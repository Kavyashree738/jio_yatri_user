const express = require('express');
const { createOrUpdateUser, getUserByUid } = require('../controllers/userController');

const router = express.Router();

router.post('/', createOrUpdateUser);
router.get('/:uid', getUserByUid);

module.exports = router;
