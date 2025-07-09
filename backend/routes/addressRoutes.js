const express = require('express');
const router = express.Router();
const addressController = require('../controllers/addressController');

// Route: GET /api/address/autocomplete
router.get('/autocomplete', addressController.autocomplete);

// Route: GET /api/address/geocode
router.get('/geocode', addressController.geocode);
router.get('/reverse-geocode', addressController.reverseGeocode);

module.exports = router;
