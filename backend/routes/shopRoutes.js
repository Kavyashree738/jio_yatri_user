const express = require('express');
const router = express.Router();
const shopController = require('../controllers/shopController');
const multer = require('multer');

const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

// Register shop
router.post(
  '/register',
  upload.fields([
    { name: 'shopImages', maxCount: 5 },
    { name: 'itemImages', maxCount: 20 },
    { name: 'roomImages', maxCount: 20 } // For hotel rooms
  ]),
  shopController.registerShop
);

// Get shops by category
router.get('/category/:category', shopController.getShopsByCategory);

// Get single shop
router.get('/:id', shopController.getShopById);

// Get image
router.get('/images/:id', shopController.getImage);

// Update shop
router.put(
  '/:id',
  upload.fields([
    { name: 'shopImages', maxCount: 5 },
    { name: 'itemImages', maxCount: 20 },
    { name: 'roomImages', maxCount: 20 }
  ]),
  shopController.updateShop
);

// Delete shop
router.delete('/:id', shopController.deleteShop);

module.exports = router;