// const mongoose = require('mongoose');
// const Hotel = require('../models/Hotel');
// const { GridFSBucket } = require('mongodb');

// console.log('Initializing hotel controller...'); // Debug log

// let gfs;
// const initGridFS = () => {
//   console.log('Initializing GridFS...'); // Debug log
//   return new Promise((resolve, reject) => {
//     const conn = mongoose.connection;
//     if (conn.readyState === 1) {
//       console.log('Mongoose already connected, creating GridFSBucket'); // Debug log
//       gfs = new GridFSBucket(conn.db, { bucketName: 'hotel_files' });
//       return resolve(gfs);
//     }
//     conn.once('open', () => {
//       console.log('Mongoose connection opened, creating GridFSBucket'); // Debug log
//       gfs = new GridFSBucket(conn.db, { bucketName: 'hotel_files' });
//       resolve(gfs);
//     });
//     conn.on('error', (err) => {
//       console.error('Mongoose connection error:', err); // Debug log
//       reject(err);
//     });
//   });
// };
// const gfsPromise = initGridFS();

// // Register Hotel
// exports.registerHotel = async (req, res) => {
//   console.log('Starting hotel registration...'); // Debug log
//   try {
//     const { name, phone, phonePeNumber, email, address, openingTime, closingTime, category, menuItems } = req.body;

//     console.log('Request body:', req.body); // Debug log

//     if (!name || !phone || !phonePeNumber || !address || !openingTime || !closingTime || !category) {
//       console.log('Missing required fields:', { // Debug log
//         name, phone, phonePeNumber, address, openingTime, closingTime, category
//       });
//       return res.status(400).json({ 
//         success: false,
//         error: 'All required fields must be provided.' 
//       });
//     }

//     console.log('Processing images...'); // Debug log
//     let menuImageId = null;
//     let hotelImageIds = [];

//     if (req.files['menuImage']?.[0]) {
//       console.log('Processing menu image...'); // Debug log
//       const file = req.files['menuImage'][0];
//       menuImageId = await new Promise((resolve, reject) => {
//         const uploadStream = gfs.openUploadStream(file.originalname);
//         uploadStream.end(file.buffer);
//         uploadStream.on('finish', () => {
//           console.log('Menu image uploaded with ID:', uploadStream.id); // Debug log
//           resolve(uploadStream.id);
//         });
//         uploadStream.on('error', (err) => {
//           console.error('Menu image upload error:', err); // Debug log
//           reject(err);
//         });
//       });
//     }

//     if (req.files['hotelImages']) {
//       console.log('Processing hotel images...'); // Debug log
//       hotelImageIds = await Promise.all(
//         req.files['hotelImages'].map(file => {
//           return new Promise((resolve, reject) => {
//             const uploadStream = gfs.openUploadStream(file.originalname);
//             uploadStream.end(file.buffer);
//             uploadStream.on('finish', () => {
//               console.log('Hotel image uploaded with ID:', uploadStream.id); // Debug log
//               resolve(uploadStream.id);
//             });
//             uploadStream.on('error', (err) => {
//               console.error('Hotel image upload error:', err); // Debug log
//               reject(err);
//             });
//           });
//         })
//       );
//     }

//     console.log('Creating new hotel document...'); // Debug log
//     const newHotel = new Hotel({
//       name,
//       phone,
//       phonePeNumber,
//       email,
//       address: typeof address === 'string' ? JSON.parse(address) : address,
//       openingTime,
//       closingTime,
//       category,
//       menuItems: menuItems ? JSON.parse(menuItems) : [],
//       menuImage: menuImageId,
//       hotelImages: hotelImageIds
//     });

//     await newHotel.save();
//     console.log('Hotel saved successfully:', newHotel); // Debug log
    
//     res.status(201).json({ 
//       success: true, 
//       data: newHotel 
//     });
//   } catch (error) {
//     console.error('Error in registerHotel:', error); // Debug log
//     res.status(400).json({
//       success: false,
//       error: error.message,
//       details: error.errors || error.stack
//     });
//   }
// };

// // Get all hotels
// exports.getHotels = async (req, res) => {
//   console.log('Fetching all hotels...'); // Debug log
//   try {
//     const hotels = await Hotel.find().sort({ createdAt: -1 });
//     console.log('Hotels fetched:', hotels.length); // Debug log
//     res.status(200).json({ 
//       success: true, 
//       data: hotels 
//     });
//   } catch (err) {
//     console.error('Error fetching hotels:', err); // Debug log
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch hotels' 
//     });
//   }
// };

// // Get single hotel
// exports.getHotelById = async (req, res) => {
//   console.log('Fetching hotel by ID:', req.params.id); // Debug log
//   try {
//     const hotel = await Hotel.findById(req.params.id);
//     if (!hotel) {
//       console.log('Hotel not found:', req.params.id); // Debug log
//       return res.status(404).json({ 
//         success: false,
//         error: 'Hotel not found' 
//       });
//     }
//     console.log('Hotel found:', hotel.name); // Debug log
//     res.status(200).json({ 
//       success: true, 
//       data: hotel 
//     });
//   } catch (err) {
//     console.error('Error fetching hotel:', err); // Debug log
//     res.status(500).json({ 
//       success: false,
//       error: 'Failed to fetch hotel' 
//     });
//   }
// };

// exports.getImage = async (req, res) => {
//   try {
//     await gfsPromise; // Ensure GridFS is initialized
    
//     const fileId = new mongoose.Types.ObjectId(req.params.id);
    
//     // Check if file exists
//     const files = await gfs.find({ _id: fileId }).toArray();
//     if (!files || files.length === 0) {
//       return res.status(404).json({ 
//         success: false,
//         error: 'File not found' 
//       });
//     }

//     // Set appropriate content type
//     const file = files[0];
//     if (file.contentType) {
//       res.set('Content-Type', file.contentType);
//     }

//     // Stream the file to response
//     const downloadStream = gfs.openDownloadStream(fileId);
//     downloadStream.pipe(res);
    
//     downloadStream.on('error', (err) => {
//       console.error('Error streaming file:', err);
//       res.status(500).json({ 
//         success: false,
//         error: 'Error streaming file' 
//       });
//     });

//   } catch (err) {
//     console.error('Error fetching image:', err);
//     res.status(500).json({ 
//       success: false,
//       error: err.message || 'Failed to fetch image' 
//     });
//   }
// };

// exports.updateHotel = async (req, res) => {
//   try {
//     const { name, phone, phonePeNumber, email, address, openingTime, closingTime, category, menuItems } = req.body;
    
//     let updateData = {
//       name,
//       phone,
//       phonePeNumber,
//       email,
//       address: typeof address === "string" ? JSON.parse(address) : address,
//       openingTime,
//       closingTime,
//       category,
//       menuItems: menuItems ? JSON.parse(menuItems) : [],
//     };

//     // Menu image
//     if (req.files?.menuImage?.[0]) {
//       const file = req.files["menuImage"][0];
//       const uploadStream = gfs.openUploadStream(file.originalname);
//       uploadStream.end(file.buffer);
//       await new Promise((resolve, reject) => {
//         uploadStream.on("finish", () => {
//           updateData.menuImage = uploadStream.id;
//           resolve();
//         });
//         uploadStream.on("error", reject);
//       });
//     }

//     // Hotel images
//     if (req.files?.hotelImages) {
//       const imageIds = await Promise.all(
//         req.files.hotelImages.map((file) => {
//           return new Promise((resolve, reject) => {
//             const uploadStream = gfs.openUploadStream(file.originalname);
//             uploadStream.end(file.buffer);
//             uploadStream.on("finish", () => resolve(uploadStream.id));
//             uploadStream.on("error", reject);
//           });
//         })
//       );
//       updateData.hotelImages = imageIds;
//     }

//     const updatedHotel = await Hotel.findByIdAndUpdate(req.params.id, updateData, { new: true });

//     if (!updatedHotel) {
//       return res.status(404).json({ success: false, error: "Hotel not found" });
//     }

//     res.json({ success: true, data: updatedHotel });
//   } catch (error) {
//     console.error("Update error:", error);
//     res.status(500).json({ success: false, error: "Failed to update hotel" });
//   }
// };
const mongoose = require('mongoose');
const Hotel = require('../models/Hotel');
const { GridFSBucket } = require('mongodb');

console.log('Initializing hotel controller...');

// Initialize GridFS
let gfs;
const initGridFS = () => {
  console.log('Initializing GridFS...');
  return new Promise((resolve, reject) => {
    const conn = mongoose.connection;
    if (conn.readyState === 1) {
      console.log('Mongoose already connected, creating GridFSBucket');
      gfs = new GridFSBucket(conn.db, { bucketName: 'hotel_files' });
      return resolve(gfs);
    }
    conn.once('open', () => {
      console.log('Mongoose connection opened, creating GridFSBucket');
      gfs = new GridFSBucket(conn.db, { bucketName: 'hotel_files' });
      resolve(gfs);
    });
    conn.on('error', (err) => {
      console.error('Mongoose connection error:', err);
      reject(err);
    });
  });
};
const gfsPromise = initGridFS();

// Register Hotel
exports.registerHotel = async (req, res) => {
  console.log('Starting hotel registration...');
  try {
    const { 
      name, 
      phone, 
      phonePeNumber, 
      email, 
      address, 
      openingTime, 
      closingTime, 
      category, 
      menuItems, 
      userId 
    } = req.body;

    console.log('Request body:', req.body);

    // Validate required fields including userId
    if (!name || !phone || !phonePeNumber || !address || 
        !openingTime || !closingTime || !category || !userId) {
      console.log('Missing required fields:', req.body);
      return res.status(400).json({ 
        success: false,
        error: 'All required fields must be provided including userId.' 
      });
    }

    console.log('Processing images...');
    let menuImageId = null;
    let hotelImageIds = [];

    // Process menu image if exists
    if (req.files['menuImage']?.[0]) {
      console.log('Processing menu image...');
      const file = req.files['menuImage'][0];
      menuImageId = await new Promise((resolve, reject) => {
        const uploadStream = gfs.openUploadStream(file.originalname);
        uploadStream.end(file.buffer);
        uploadStream.on('finish', () => {
          console.log('Menu image uploaded with ID:', uploadStream.id);
          resolve(uploadStream.id);
        });
        uploadStream.on('error', (err) => {
          console.error('Menu image upload error:', err);
          reject(err);
        });
      });
    }

    // Process hotel images if exists
    if (req.files['hotelImages']) {
      console.log('Processing hotel images...');
      hotelImageIds = await Promise.all(
        req.files['hotelImages'].map(file => {
          return new Promise((resolve, reject) => {
            const uploadStream = gfs.openUploadStream(file.originalname);
            uploadStream.end(file.buffer);
            uploadStream.on('finish', () => {
              console.log('Hotel image uploaded with ID:', uploadStream.id);
              resolve(uploadStream.id);
            });
            uploadStream.on('error', (err) => {
              console.error('Hotel image upload error:', err);
              reject(err);
            });
          });
        })
      );
    }

    console.log('Creating new hotel document...');
    const newHotel = new Hotel({
      userId, // Add userId to the document
      name,
      phone,
      phonePeNumber,
      email,
      address: typeof address === 'string' ? JSON.parse(address) : address,
      openingTime,
      closingTime,
      category,
      menuItems: menuItems ? JSON.parse(menuItems) : [],
      menuImage: menuImageId,
      hotelImages: hotelImageIds
    });

    await newHotel.save();
    console.log('Hotel saved successfully:', newHotel);
    
    res.status(201).json({ 
      success: true, 
      data: newHotel 
    });
  } catch (error) {
    console.error('Error in registerHotel:', error);
    res.status(400).json({
      success: false,
      error: error.message,
      details: error.errors || error.stack
    });
  }
};

// Get all hotels (with optional userId filter)
exports.getHotels = async (req, res) => {
  console.log('Fetching all hotels...');
  try {
    const { userId } = req.query;
    let query = {};
    
    if (userId) {
      query.userId = userId;
      console.log('Filtering hotels by userId:', userId);
    }

    const hotels = await Hotel.find(query).sort({ createdAt: -1 });
    console.log('Hotels fetched:', hotels.length);
    res.status(200).json({ 
      success: true, 
      data: hotels 
    });
  } catch (err) {
    console.error('Error fetching hotels:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch hotels' 
    });
  }
};

// Get hotels by user ID
exports.getHotelsByUser = async (req, res) => {
  console.log('Fetching hotels by user ID:', req.params.userId);
  try {
    const hotels = await Hotel.find({ userId: req.params.userId }).sort({ createdAt: -1 });
    console.log('Hotels found:', hotels.length);
    res.status(200).json({ 
      success: true, 
      data: hotels 
    });
  } catch (err) {
    console.error('Error fetching user hotels:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch user hotels' 
    });
  }
};

// Get single hotel
exports.getHotelById = async (req, res) => {
  console.log('Fetching hotel by ID:', req.params.id);
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      console.log('Hotel not found:', req.params.id);
      return res.status(404).json({ 
        success: false,
        error: 'Hotel not found' 
      });
    }
    console.log('Hotel found:', hotel.name);
    res.status(200).json({ 
      success: true, 
      data: hotel 
    });
  } catch (err) {
    console.error('Error fetching hotel:', err);
    res.status(500).json({ 
      success: false,
      error: 'Failed to fetch hotel' 
    });
  }
};

// Get image
exports.getImage = async (req, res) => {
  try {
    await gfsPromise; // Ensure GridFS is initialized
    
    const fileId = new mongoose.Types.ObjectId(req.params.id);
    
    // Check if file exists
    const files = await gfs.find({ _id: fileId }).toArray();
    if (!files || files.length === 0) {
      return res.status(404).json({ 
        success: false,
        error: 'File not found' 
      });
    }

    // Set appropriate content type
    const file = files[0];
    if (file.contentType) {
      res.set('Content-Type', file.contentType);
    }

    // Stream the file to response
    const downloadStream = gfs.openDownloadStream(fileId);
    downloadStream.pipe(res);
    
    downloadStream.on('error', (err) => {
      console.error('Error streaming file:', err);
      res.status(500).json({ 
        success: false,
        error: 'Error streaming file' 
      });
    });

  } catch (err) {
    console.error('Error fetching image:', err);
    res.status(500).json({ 
      success: false,
      error: err.message || 'Failed to fetch image' 
    });
  }
};

// Update hotel
exports.updateHotel = async (req, res) => {
  try {
    const { 
      name, 
      phone, 
      phonePeNumber, 
      email, 
      address, 
      openingTime, 
      closingTime, 
      category, 
      menuItems, 
      userId 
    } = req.body;
    
    // First get the existing hotel to verify ownership
    const existingHotel = await Hotel.findById(req.params.id);
    if (!existingHotel) {
      return res.status(404).json({ success: false, error: "Hotel not found" });
    }

    // Verify the requesting user owns this hotel
    if (existingHotel.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized: You can only update hotels you own" 
      });
    }

    let updateData = {
      name,
      phone,
      phonePeNumber,
      email,
      address: typeof address === "string" ? JSON.parse(address) : address,
      openingTime,
      closingTime,
      category,
      menuItems: menuItems ? JSON.parse(menuItems) : [],
    };

    // Menu image
    if (req.files?.menuImage?.[0]) {
      const file = req.files["menuImage"][0];
      const uploadStream = gfs.openUploadStream(file.originalname);
      uploadStream.end(file.buffer);
      await new Promise((resolve, reject) => {
        uploadStream.on("finish", () => {
          updateData.menuImage = uploadStream.id;
          resolve();
        });
        uploadStream.on("error", reject);
      });
    }

    // Hotel images
    if (req.files?.hotelImages) {
      const imageIds = await Promise.all(
        req.files.hotelImages.map((file) => {
          return new Promise((resolve, reject) => {
            const uploadStream = gfs.openUploadStream(file.originalname);
            uploadStream.end(file.buffer);
            uploadStream.on("finish", () => resolve(uploadStream.id));
            uploadStream.on("error", reject);
          });
        })
      );
      updateData.hotelImages = imageIds;
    }

    const updatedHotel = await Hotel.findByIdAndUpdate(
      req.params.id, 
      updateData, 
      { new: true }
    );

    res.json({ success: true, data: updatedHotel });
  } catch (error) {
    console.error("Update error:", error);
    res.status(500).json({ success: false, error: "Failed to update hotel" });
  }
};

// Delete hotel
exports.deleteHotel = async (req, res) => {
  try {
    const { userId } = req.body;

    // First get the existing hotel to verify ownership
    const existingHotel = await Hotel.findById(req.params.id);
    if (!existingHotel) {
      return res.status(404).json({ success: false, error: "Hotel not found" });
    }

    // Verify the requesting user owns this hotel
    if (existingHotel.userId !== userId) {
      return res.status(403).json({ 
        success: false, 
        error: "Unauthorized: You can only delete hotels you own" 
      });
    }

    // Delete associated images from GridFS
    if (existingHotel.menuImage) {
      await gfs.delete(new mongoose.Types.ObjectId(existingHotel.menuImage));
    }

    if (existingHotel.hotelImages && existingHotel.hotelImages.length > 0) {
      await Promise.all(
        existingHotel.hotelImages.map(imageId => 
          gfs.delete(new mongoose.Types.ObjectId(imageId))
      ));
    }

    // Delete the hotel document
    await Hotel.findByIdAndDelete(req.params.id);

    res.json({ success: true, data: {} });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ success: false, error: "Failed to delete hotel" });
  }
};