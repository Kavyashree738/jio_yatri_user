// const mongoose = require('mongoose');
// const Shop = require('../models/CategoryModel');
// const { GridFSBucket } = require('mongodb');

// let gfs;
// const initGridFS = () => {
//   return new Promise((resolve, reject) => {
//     const conn = mongoose.connection;
//     if (conn.readyState === 1) {
//       gfs = new GridFSBucket(conn.db, { bucketName: 'shop_files' });
//       return resolve(gfs);
//     }
//     conn.once('open', () => {
//       gfs = new GridFSBucket(conn.db, { bucketName: 'shop_files' });
//       resolve(gfs);
//     });
//     conn.on('error', reject);
//   });
// };
// const gfsPromise = initGridFS();

// const uploadFiles = async (files) => {
//   return await Promise.all(
//     files.map(file => {
//       return new Promise((resolve, reject) => {
//         const uploadStream = gfs.openUploadStream(file.originalname);
//         uploadStream.end(file.buffer);
//         uploadStream.on('finish', () => resolve(uploadStream.id));
//         uploadStream.on('error', reject);
//       });
//     })
//   );
// };

// exports.registerShop = async (req, res) => {
//   try {
//     const { category, ...shopData } = req.body;
//     if (!category || !['grocery', 'vegetable', 'provision', 'medical', 'hotel'].includes(category)) {
//       return res.status(400).json({ success: false, error: 'Valid category is required' });
//     }

//     let shopImageIds = [];
//     if (req.files['shopImages']) {
//       shopImageIds = await uploadFiles(req.files['shopImages']);
//     }

//     let items = [];
//     if (req.body.items) {
//       items = JSON.parse(req.body.items);
//       if (req.files['itemImages']) {
//         const itemImages = req.files['itemImages'];
//         for (let i = 0; i < items.length && i < itemImages.length; i++) {
//           const fileId = await new Promise((resolve, reject) => {
//             const uploadStream = gfs.openUploadStream(itemImages[i].originalname);
//             uploadStream.end(itemImages[i].buffer);
//             uploadStream.on('finish', () => resolve(uploadStream.id));
//             uploadStream.on('error', reject);
//           });
//           items[i].image = fileId;
//         }
//       }
//     }

//     if (category === 'hotel' && req.body.rooms) {
//       const rooms = JSON.parse(req.body.rooms);
//       const roomImages = req.files['roomImages'] || [];
//       let roomImgIndex = 0;
//       for (let i = 0; i < rooms.length; i++) {
//         rooms[i].images = [];
//         for (let j = 0; j < (rooms[i].imageCount || 0); j++) {
//           if (roomImgIndex < roomImages.length) {
//             const fileId = await new Promise((resolve, reject) => {
//               const uploadStream = gfs.openUploadStream(roomImages[roomImgIndex].originalname);
//               uploadStream.end(roomImages[roomImgIndex].buffer);
//               uploadStream.on('finish', () => resolve(uploadStream.id));
//               uploadStream.on('error', reject);
//             });
//             rooms[i].images.push(fileId);
//             roomImgIndex++;
//           }
//         }
//       }
//       shopData.rooms = rooms;
//     }

//     const parsedAddress = typeof shopData.address === 'string' 
//       ? JSON.parse(shopData.address) 
//       : shopData.address;

//     const newShop = new Shop({
//       ...shopData,
//       address: parsedAddress,
//       category,
//       shopImages: shopImageIds,
//       ...(category !== 'hotel' && { items })
//     });

//     await newShop.save();
//     res.status(201).json({ success: true, data: newShop });
//   } catch (error) {
//     res.status(400).json({ success: false, error: error.message });
//   }
// };

// exports.getShopsByCategory = async (req, res) => {
//   try {
//     const { category } = req.params;
    
//     // Find shops without populating (since GridFS files can't be properly populated)
//     const shops = await Shop.find({ category }).sort({ createdAt: -1 }).lean();
    
//     // Process shops to add image URLs
//     const shopsWithUrls = shops.map(shop => ({
//       ...shop,
//       shopImageUrls: shop.shopImages?.map(imgId => 
//         `https://jio-yatri-user.onrender.com/api/shops/images/${imgId}`
//       ) || [],
//       items: shop.items?.map(item => ({
//         ...item,
//         imageUrl: item.image ? 
//           `https://jio-yatri-user.onrender.com/api/shops/images/${item.image}` : 
//           null
//       })) || [],
//       rooms: shop.rooms?.map(room => ({
//         ...room,
//         imageUrls: room.images?.map(imgId => 
//           `https://jio-yatri-user.onrender.com/api/shops/images/${imgId}`
//         ) || []
//       })) || []
//     }));

//     res.status(200).json({ success: true, data: shopsWithUrls });
//   } catch (err) {
//     console.error('Error in getShopsByCategory:', err);
//     res.status(500).json({ success: false, error: 'Failed to fetch shops' });
//   }
// };
// exports.getShopById = async (req, res) => {
//   try {
//     const shop = await Shop.findById(req.params.id);
//     if (!shop) {
//       return res.status(404).json({ success: false, error: 'Shop not found' });
//     }
//     res.status(200).json({ success: true, data: shop });
//   } catch (err) {
//     res.status(500).json({ success: false, error: 'Failed to fetch shop' });
//   }
// };

// exports.getImage = async (req, res) => {
//   try {
//     console.log('1. Starting getImage function');
//     console.log(`2. Image ID received: ${req.params.id}`);

//     await gfsPromise;
//     console.log('3. GridFS connection established');

//     const fileId = new mongoose.Types.ObjectId(req.params.id);
//     console.log(`4. Converted to ObjectId: ${fileId}`);

//     console.log('5. Searching for file in GridFS...');
//     const files = await gfs.find({ _id: fileId }).toArray();
//     console.log(`6. Found ${files.length} matching files`);

//     if (!files || files.length === 0) {
//       console.log('7. No files found');
//       return res.status(404).json({ success: false, error: 'File not found' });
//     }

//     console.log('8. Preparing to stream file...');
//     res.set('Content-Type', files[0].contentType || 'application/octet-stream');
//     const downloadStream = gfs.openDownloadStream(fileId);
    
//     downloadStream.on('error', (err) => {
//       console.error('9. Error streaming file:', err);
//       res.status(500).json({ success: false, error: 'Error streaming file' });
//     });

//     console.log('10. Starting file stream');
//     downloadStream.pipe(res);
//   } catch (err) {
//     console.error('11. Error in getImage:', err);
//     console.error('12. Error details:', {
//       message: err.message,
//       stack: err.stack,
//       name: err.name
//     });
//     res.status(500).json({ success: false, error: err.message });
//   }
// };

// exports.updateShop = async (req, res) => {
//   try {
//     const { userId, ...updateData } = req.body;
//     const existingShop = await Shop.findById(req.params.id);
//     if (!existingShop) {
//       return res.status(404).json({ success: false, error: "Shop not found" });
//     }

//     if (existingShop.userId !== userId) {
//       return res.status(403).json({ success: false, error: "Unauthorized" });
//     }

//     if (req.files?.shopImages) {
//       const newImageIds = await uploadFiles(req.files.shopImages);
//       updateData.shopImages = [...existingShop.shopImages, ...newImageIds];
//     }

//     if (req.files?.itemImages && req.body.items) {
//       const items = JSON.parse(req.body.items);
//       const itemImages = req.files.itemImages;

//       for (let i = 0; i < items.length && i < itemImages.length; i++) {
//         if (!items[i].image) {
//           items[i].image = await new Promise((resolve, reject) => {
//             const uploadStream = gfs.openUploadStream(itemImages[i].originalname);
//             uploadStream.end(itemImages[i].buffer);
//             uploadStream.on("finish", () => resolve(uploadStream.id));
//             uploadStream.on("error", reject);
//           });
//         }
//       }
//       updateData.items = items;
//     }
//      if (typeof updateData.address === 'string') {
//       updateData.address = JSON.parse(updateData.address);
//     }
//     const updatedShop = await Shop.findByIdAndUpdate(req.params.id, updateData, { new: true });
//     res.json({ success: true, data: updatedShop });
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Failed to update shop" });
//   }
// };

// exports.deleteShop = async (req, res) => {
//   try {
//     const { userId } = req.body;
//     const existingShop = await Shop.findById(req.params.id);
//     if (!existingShop) {
//       return res.status(404).json({ success: false, error: "Shop not found" });
//     }

//     if (existingShop.userId !== userId) {
//       return res.status(403).json({ success: false, error: "Unauthorized" });
//     }

//     const allImageIds = [
//       ...existingShop.shopImages,
//       ...(existingShop.items?.map(item => item.image).filter(Boolean)) || [],
//       ...(existingShop.rooms?.flatMap(room => room.images) || [])
//     ];

//     await Promise.all(
//       allImageIds.map(imageId =>
//         gfs.delete(new mongoose.Types.ObjectId(imageId)).catch(() => { })
//       )
//     );

//     await Shop.findByIdAndDelete(req.params.id);
//     res.json({ success: true, data: {} });
//   } catch (error) {
//     res.status(500).json({ success: false, error: "Failed to delete shop" });
//   }
// };

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

    // Handle shop images upload
    let shopImageIds = [];
    if (req.files['shopImages']) {
      shopImageIds = await uploadFiles(req.files['shopImages']);
    }

    // Handle items for ALL categories (including hotel)
    let items = [];
    if (req.body.items) {
      items = JSON.parse(req.body.items);
      
      // Process item images
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

      // Validate required fields for hotel items
      if (category === 'hotel') {
        for (const item of items) {
          if (!item.image) {
            return res.status(400).json({ 
              success: false, 
              error: 'Image is required for each food item' 
            });
          }
        }
      }
    }

    const parsedAddress = typeof shopData.address === 'string'
      ? JSON.parse(shopData.address)
      : shopData.address;

    // Create the shop document
    const newShop = new Shop({
      ...shopData,
      address: parsedAddress,
      category,
      shopImages: shopImageIds,
      items // Include items for ALL categories
    });

    await newShop.save();
    
    res.status(201).json({ 
      success: true, 
      data: newShop 
    });
  } catch (error) {
    res.status(400).json({ 
      success: false, 
      error: error.message 
    });
  }
};


// controllers/shopController.js
exports.getShopsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    console.log(`[ShopController] Fetching shops for category: ${category}`);

    // Fetch all shops by category (no location filter)
    const shops = await Shop.find({ category }).sort({ createdAt: -1 }).lean();

    const baseUrl = "https://jio-yatri-user.onrender.com";

    // Attach image URLs
    const shopsWithUrls = shops.map(shop => ({
      ...shop,
      shopImageUrls: shop.shopImages?.map(imgId => `${baseUrl}/api/shops/images/${imgId}`) || [],
      items: shop.items?.map(item => ({
        ...item,
        imageUrl: item.image ? `${baseUrl}/api/shops/images/${item.image}` : null
      })) || []
    }));

    console.log(`[ShopController] Found ${shopsWithUrls.length} shops`);
    res.status(200).json({ success: true, data: shopsWithUrls });
  } catch (err) {
    console.error("[ShopController] Error in getShopsByCategory:", err.message);
    res.status(500).json({
      success: false,
      error: "Failed to fetch shops",
      message: err.message
    });
  }
};


exports.getShopById = async (req, res) => {
  try {
    const shop = await Shop.findById(req.params.id).lean();
    if (!shop) {
      return res.status(404).json({ success: false, error: 'Shop not found' });
    }

    // Add image URLs to the response
    const response = {
      ...shop,
      shopImageUrls: shop.shopImages?.map(imgId =>
        `https://jio-yatri-user.onrender.com/api/shops/images/${imgId}`
      ) || [],
      items: shop.items?.map(item => ({
        ...item,
        imageUrl: item.image ?
          `https://jio-yatri-user.onrender.com/api/shops/images/${item.image}` :
          null
      })) || []
    };

    res.status(200).json({ success: true, data: response });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch shop' });
  }
};

exports.getImage = async (req, res) => {
  try {
    // console.log('1. Starting getImage function');
    // console.log(`2. Image ID received: ${req.params.id}`);

    await gfsPromise;
    // console.log('3. GridFS connection established');

    const fileId = new mongoose.Types.ObjectId(req.params.id);
    // console.log(`4. Converted to ObjectId: ${fileId}`);

    // console.log('5. Searching for file in GridFS...');
    const files = await gfs.find({ _id: fileId }).toArray();
    // console.log(`6. Found ${files.length} matching files`);

    if (!files || files.length === 0) {
    //   console.log('7. No files found');
      return res.status(404).json({ success: false, error: 'File not found' });
    }

    // console.log('8. Preparing to stream file...');
    res.set('Content-Type', files[0].contentType || 'application/octet-stream');
    const downloadStream = gfs.openDownloadStream(fileId);

    downloadStream.on('error', (err) => {
    //   console.error('9. Error streaming file:', err);
      res.status(500).json({ success: false, error: 'Error streaming file' });
    });

    // console.log('10. Starting file stream');
    downloadStream.pipe(res);
  } catch (err) {
    // console.error('11. Error in getImage:', err);
    // console.error('12. Error details:', {
    //   message: err.message,
    //   stack: err.stack,
    //   name: err.name
    // });
    res.status(500).json({ success: false, error: err.message });
  }
};
exports.updateShop = async (req, res) => {
    // console.log('--- STARTING SHOP UPDATE ---');
    // console.log('[DEBUG] Request received with:', {
    //     params: req.params,
    //     body: req.body,
    //     files: req.files ? Object.keys(req.files) : 'No files'
    // });

    try {
        // console.log('[DEBUG] Initializing GridFS connection');
        await gfsPromise;
        // console.log('[DEBUG] GridFS connection ready');

        // Parse request data with validation
        // console.log('[DEBUG] Parsing request data');
        const updateData = {
            ...req.body,
            userId: req.body.userId,
            shopId: req.params.id,
            existingShopImages: req.body.existingShopImages ? JSON.parse(req.body.existingShopImages) : [],
            existingItemImages: req.body.existingItemImages ? JSON.parse(req.body.existingItemImages) : [],
            items: req.body.items ? JSON.parse(req.body.items) : [],
            cuisineTypes: req.body.cuisineTypes ? JSON.parse(req.body.cuisineTypes) : [],
            address: req.body.address ? JSON.parse(req.body.address) : null
        };

        // console.log('[DEBUG] Parsed update data:', {
        //     userId: updateData.userId,
        //     itemCount: updateData.items.length,
        //     shopImagesCount: updateData.existingShopImages.length,
        //     itemImagesCount: updateData.existingItemImages.length
        // });

        // Validate and find shop
        // console.log(`[DEBUG] Finding shop with ID: ${req.params.id}`);
        const existingShop = await Shop.findById(req.params.id);
        if (!existingShop) {
            // console.error('[ERROR] Shop not found');
            return res.status(404).json({ success: false, error: "Shop not found" });
        }
        if (existingShop.userId !== updateData.userId) {
            // console.error('[ERROR] Unauthorized access attempt');
            return res.status(403).json({ success: false, error: "Unauthorized" });
        }

        // console.log('[DEBUG] Shop found:', {
        //     shopName: existingShop.shopName,
        //     currentItems: existingShop.items.length,
        //     currentImages: existingShop.shopImages.length
        // });

        // Process shop images
        // console.log('[DEBUG] Processing shop images');
        const newShopImageIds = [];
        if (req.files?.shopImages) {
            // console.log(`[DEBUG] Found ${req.files.shopImages.length} new shop images to upload`);
            for (const [index, file] of req.files.shopImages.entries()) {
                // console.log(`[DEBUG] Uploading shop image ${index + 1}: ${file.originalname}`);
                const uploadedId = await uploadFile(file);
                // console.log(`[DEBUG] Uploaded shop image ${index + 1} with ID: ${uploadedId}`);
                newShopImageIds.push(uploadedId);
            }
        }

        // Process item images - ALTERNATIVE APPROACH using push()
        // console.log('[DEBUG] Processing item images');
        const itemImages = req.files?.itemImages || [];
        
        // Clear existing items if we want to rebuild them completely
        existingShop.items = [];
        
        // Process each item with its image
        for (let i = 0; i < updateData.items.length; i++) {
            const item = updateData.items[i];
            // console.log(`[DEBUG] Processing item ${i + 1}: ${item.name}`);
            
            let imageId = null;
            
            // Handle new image upload
            if (i < itemImages.length) {
                // console.log(`[DEBUG] Uploading new image for item ${i + 1}`);
                imageId = await uploadFile(itemImages[i]);
                // console.log(`[DEBUG] New image uploaded with ID: ${imageId}`);
            } 
            // Keep existing image if no new one was uploaded
            else if (item.imageUrl) {
                const urlParts = item.imageUrl.split('/');
                imageId = urlParts[urlParts.length - 1];
                // console.log(`[DEBUG] Keeping existing image with ID: ${imageId}`);
            }
            
            // Push the updated item to the array
            existingShop.items.push({
                name: item.name,
                price: item.price,
                veg: item.veg,
                category: item.category,
                description: item.description,
                image: imageId
            });
            
            // console.log(`[DEBUG] Item ${i + 1} processed with image ID: ${imageId}`);
        }

        // Update shop images
        existingShop.shopImages = [...updateData.existingShopImages, ...newShopImageIds];
        existingShop.cuisineTypes = updateData.cuisineTypes;
        existingShop.address = updateData.address;
        existingShop.openingTime = updateData.openingTime;
        existingShop.closingTime = updateData.closingTime;
        // Add any other fields you need to update

        // console.log('[DEBUG] Saving updated shop document');
        const updatedShop = await existingShop.save();
        // console.log('[DEBUG] Shop document saved successfully');

        // Generate proper image URLs
        const baseUrl = 'https://jio-yatri-user.onrender.com';
        
        const responseData = {
            ...updatedShop.toObject(),
            shopImageUrls: updatedShop.shopImages.map(imgId => 
                `${baseUrl}/api/shops/images/${imgId}`
            ),
            items: updatedShop.items.map(item => ({
                ...item,
                imageUrl: item.image ? 
                    `${baseUrl}/api/shops/images/${item.image}` : 
                    null
            }))
        };

        // console.log('[DEBUG] Update successful with:', {
        //     shopId: responseData._id,
        //     itemCount: responseData.items.length,
        //     firstItem: {
        //         name: responseData.items[0]?.name,
        //         imageUrl: responseData.items[0]?.imageUrl
        //     },
        //     shopImages: responseData.shopImageUrls.length
        // });

        res.json({ 
            success: true, 
            data: responseData,
            message: 'Shop updated successfully'
        });

    } catch (error) {
        // console.error('[ERROR] Update failed:', {
        //     message: error.message,
        //     stack: error.stack,
        //     ...(error.response && { response: error.response.data })
        // });
        res.status(500).json({ 
            success: false, 
            error: error.message || "Failed to update shop",
            ...(process.env.NODE_ENV === 'development' && { stack: error.stack })
        });
    }
};

// Helper function with enhanced debugging
const uploadFile = async (file) => {
    // console.log(`[DEBUG] Starting upload for file: ${file.originalname}`);
    return new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStream(file.originalname, {
            contentType: file.mimetype,
            metadata: { 
                uploadedAt: new Date(),
                originalName: file.originalname 
            }
        });
        
        uploadStream.on('finish', () => {
            console.log(`[DEBUG] File uploaded successfully: ${file.originalname} as ${uploadStream.id}`);
            resolve(uploadStream.id);
        });
        
        uploadStream.on('error', (err) => {
            // console.error(`[ERROR] File upload failed for ${file.originalname}:`, {
            //     message: err.message,
            //     stack: err.stack
            // });
            reject(err);
        });
        
        uploadStream.end(file.buffer);
    });
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


exports.calculateDistances = async (req, res) => {
  try {
    const { userLat, userLng, shops } = req.body;
    
    console.log(`[ShopController] Calculating distances for ${shops.length} shops from user location`);

    // Validate required parameters
    if (!userLat || !userLng) {
      return res.status(400).json({ 
        success: false, 
        error: 'User location coordinates are required' 
      });
    }

    if (!shops || !Array.isArray(shops)) {
      return res.status(400).json({ 
        success: false, 
        error: 'Shops array is required' 
      });
    }

    // Calculate distance for each shop
    const shopsWithDistance = shops.map(shop => {
      let distance = null;
      
      // Only calculate distance if shop has coordinates
      if (shop.address?.coordinates?.lat && shop.address?.coordinates?.lng) {
        distance = calculateDistance(
          userLat, 
          userLng, 
          shop.address.coordinates.lat, 
          shop.address.coordinates.lng
        );
      }
      
      return {
        ...shop,
        distance: distance
      };
    });

    // Sort by distance (nearest first)
    // Shops without distance will go to the end
    const sortedShops = shopsWithDistance.sort((a, b) => {
      if (a.distance === null && b.distance === null) return 0;
      if (a.distance === null) return 1; // Put shops without distance at end
      if (b.distance === null) return -1; // Put shops with distance first
      return a.distance - b.distance; // Sort by distance ascending
    });

    // console.log(`[ShopController] Calculated distances and sorted ${sortedShops.length} shops`);

    res.status(200).json({ 
      success: true, 
      data: sortedShops,
      metadata: {
        totalShops: sortedShops.length,
        shopsWithDistance: sortedShops.filter(s => s.distance !== null).length,
        userLocation: { lat: userLat, lng: userLng }
      }
    });

  } catch (err) {
    // console.error('[ShopController] Error in calculateDistances:', err);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to calculate distances',
      message: err.message 
    });
  }
};

// Helper function to calculate distance between two coordinates (Haversine formula)
function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c;
  return Math.round(distance * 10) / 10; // Round to 1 decimal place
}



