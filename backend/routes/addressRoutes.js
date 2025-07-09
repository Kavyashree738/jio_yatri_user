const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');


router.get('/autocomplete', addressController.autocomplete);


router.get('/geocode', addressController.geocode);
router.get('/reverse-geocode', addressController.reverseGeocode);

module.exports = router;
