const express = require('express');
const router = express.Router();
const hotelController = require('../controllers/hotelController');
const multer = require('multer');

console.log('Initializing hotel routes...'); // Debug log

// Configure multer storage
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

console.log('Multer configuration complete'); // Debug log

// POST /api/hotels/register
router.post(
  '/register',
  upload.fields([
    { name: 'menuImage', maxCount: 1 },
    { name: 'hotelImages', maxCount: 5 }
  ]),
  (req, res, next) => {
    console.log('Files received:', req.files); // Debug log
    console.log('Body received:', req.body); // Debug log
    next();
  },
  hotelController.registerHotel
);

// GET /api/hotels
router.get('/', hotelController.getHotels);

// GET /api/hotels/:id
router.get('/:id', hotelController.getHotelById);
router.get('/images/:id', hotelController.getImage);


router.put(
  "/:id",
  upload.fields([
    { name: "menuImage", maxCount: 1 },
    { name: "hotelImages", maxCount: 10 },
  ]),
  hotelController.updateHotel
);



console.log('Hotel routes setup complete'); // Debug log

module.exports = router;