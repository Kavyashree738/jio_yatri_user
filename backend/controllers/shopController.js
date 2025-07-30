const mongoose = require('mongoose');
const Shop = require('../models/CategoryModel');
const { GridFSBucket } = require('mongodb');

let gfs;
const initGridFS = () => {
  return new Promise((resolve, reject) => {
    const conn = mongoose.connection;
    if (conn.readyState === 1) {
      gfs = new GridFSBucket(conn.db, { bucketName: 'shop_files' });
      return resolve(gfs);
    }
    conn.once('open', () => {
      gfs = new GridFSBucket(conn.db, { bucketName: 'shop_files' });
      resolve(gfs);
    });
    conn.on('error', reject);
  });
};
const gfsPromise = initGridFS();

const uploadFiles = async (files) => {
  return await Promise.all(
    files.map(file => {
      return new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStream(file.originalname);
        uploadStream.end(file.buffer);
        uploadStream.on('finish', () => resolve(uploadStream.id));
        uploadStream.on('error', reject);
      });
    })
  );
};

exports.registerShop = async (req, res) => {
  try {
    const { category, ...shopData } = req.body;
    if (!category || !['grocery', 'vegetable', 'provision', 'medical', 'hotel'].includes(category)) {
      return res.status(400).json({ success: false, error: 'Valid category is required' });
    }

    let shopImageIds = [];
    if (req.files['shopImages']) {
      shopImageIds = await uploadFiles(req.files['shopImages']);
    }

    let items = [];
    if (req.body.items) {
      items = JSON.parse(req.body.items);
      if (req.files['itemImages']) {
        const itemImages = req.files['itemImages'];
        for (let i = 0; i < items.length && i < itemImages.length; i++) {
          const fileId = await new Promise((resolve, reject) => {
            const uploadStream = gfs.openUploadStream(itemImages[i].originalname);
            uploadStream.end(itemImages[i].buffer);
            uploadStream.on('finish', () => resolve(uploadStream.id));
            uploadStream.on('error', reject);
          });
          items[i].image = fileId;
        }
      }
    }

    if (category === 'hotel' && req.body.rooms) {
      const rooms = JSON.parse(req.body.rooms);
      const roomImages = req.files['roomImages'] || [];
      let roomImgIndex = 0;
      for (let i = 0; i < rooms.length; i++) {
        rooms[i].images = [];
        for (let j = 0; j < (rooms[i].imageCount || 0); j++) {
          if (roomImgIndex < roomImages.length) {
            const fileId = await new Promise((resolve, reject) => {
              const uploadStream = gfs.openUploadStream(roomImages[roomImgIndex].originalname);
              uploadStream.end(roomImages[roomImgIndex].buffer);
              uploadStream.on('finish', () => resolve(uploadStream.id));
              uploadStream.on('error', reject);
            });
            rooms[i].images.push(fileId);
            roomImgIndex++;
          }
        }
      }
      shopData.rooms = rooms;
    }

    const parsedAddress = typeof shopData.address === 'string' 
      ? JSON.parse(shopData.address) 
      : shopData.address;

    const newShop = new Shop({
      ...shopData,
      address: parsedAddress,
      category,
      shopImages: shopImageIds,
      ...(category !== 'hotel' && { items })
    });

    await newShop.save();
    res.status(201).json({ success: true, data: newShop });
  } catch (error) {
    res.status(400).json({ success: false, error: error.message });
  }
};

exports.getShopsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    
    // Find shops without populating (since GridFS files can't be properly populated)
    const shops = await Shop.find({ category }).sort({ createdAt: -1 }).lean();
    
    // Process shops to add image URLs
    const shopsWithUrls = shops.map(shop => ({
      ...shop,
      shopImageUrls: shop.shopImages?.map(imgId => 
        `https://jio-yatri-user.onrender.com/api/shops/images/${imgId}`
      ) || [],
      items: shop.items?.map(item => ({
        ...item,
        imageUrl: item.image ? 
          `https://jio-yatri-user.onrender.com/api/shops/images/${item.image}` : 
          null
      })) || [],
      rooms: shop.rooms?.map(room => ({
        ...room,
        imageUrls: room.images?.map(imgId => 
          `https://jio-yatri-user.onrender.com/api/shops/images/${imgId}`
        ) || []
      })) || []
    }));

    res.status(200).json({ success: true, data: shopsWithUrls });
  } catch (err) {
    console.error('Error in getShopsByCategory:', err);
    res.status(500).json({ success: false, error: 'Failed to fetch shops' });
  }
};
exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id);
    if (!shop) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }
    res.status(200).json({ success: true, data: shop });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch shop' });
  }
};

exports.getImage = async (req, res) => {
  try {
    console.log('1. Starting getImage function');
    console.log(`2. Image ID received: ${req.params.id}`);

    await gfsPromise;
    console.log('3. GridFS connection established');

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    console.log(`4. Converted to ObjectId: ${fileId}`);

    console.log('5. Searching for file in GridFS...');
    const files = await gfs.find({ _id: fileId }).toArray();
    console.log(`6. Found ${files.length} matching files`);

    if (!files || files.length === 0) {
      console.log('7. No files found');
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    console.log('8. Preparing to stream file...');
    res.set('Content-Type', files[0].contentType || 'application/octet-stream');
    const downloadStream = gfs.openDownloadStream(fileId);
    
    downloadStream.on('error', (err) => {
      console.error('9. Error streaming file:', err);
      res.status(500).json({ success: false, error: 'Error streaming file' });
    });

    console.log('10. Starting file stream');
    downloadStream.pipe(res);
  } catch (err) {
    console.error('11. Error in getImage:', err);
    console.error('12. Error details:', {
      message: err.message,
      stack: err.stack,
      name: err.name
    });
    res.status(500).json({ success: false, error: err.message });
  }
};

exports.updateShop = async (req, res) => {
  try {
    const { userId, ...updateData } = req.body;
    const existingShop = await Shop.findById(req.params.id);
    if (!existingShop) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }

    if (existingShop.userId !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    if (req.files?.shopImages) {
      const newImageIds = await uploadFiles(req.files.shopImages);
      updateData.shopImages = [...existingShop.shopImages, ...newImageIds];
    }

    if (req.files?.itemImages && req.body.items) {
      const items = JSON.parse(req.body.items);
      const itemImages = req.files.itemImages;

      for (let i = 0; i < items.length && i < itemImages.length; i++) {
        if (!items[i].image) {
          items[i].image = await new Promise((resolve, reject) => {
            const uploadStream = gfs.openUploadStream(itemImages[i].originalname);
            uploadStream.end(itemImages[i].buffer);
            uploadStream.on("finish", () => resolve(uploadStream.id));
            uploadStream.on("error", reject);
          });
        }
      }
      updateData.items = items;
    }

    const updatedShop = await Shop.findByIdAndUpdate(req.params.id, updateData, { new: true });
    res.json({ success: true, data: updatedShop });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to update shop" });
  }
};

exports.deleteShop = async (req, res) => {
  try {
    const { userId } = req.body;
    const existingShop = await Shop.findById(req.params.id);
    if (!existingShop) {
      return res.status(404).json({ success: false, error: "Shop not found" });
    }

    if (existingShop.userId !== userId) {
      return res.status(403).json({ success: false, error: "Unauthorized" });
    }

    const allImageIds = [
      ...existingShop.shopImages,
      ...(existingShop.items?.map(item => item.image).filter(Boolean)) || [],
      ...(existingShop.rooms?.flatMap(room => room.images) || [])
    ];

    await Promise.all(
      allImageIds.map(imageId =>
        gfs.delete(new mongoose.Types.ObjectId(imageId)).catch(() => { })
      )
    );

    await Shop.findByIdAndDelete(req.params.id);
    res.json({ success: true, data: {} });
  } catch (error) {
    res.status(500).json({ success: false, error: "Failed to delete shop" });
  }
};
