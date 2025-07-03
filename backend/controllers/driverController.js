const Driver = require('../models/Driver');

// Check if driver exists before registration
exports.checkDriverExists = async (req, res) => {
  try {
    const { userId } = req.params;
    const driver = await Driver.findOne({ userId });
    
    res.status(200).json({
      exists: !!driver,
      isRegistered: !!driver,
      driver: driver || null
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Server error while checking driver status' 
    });
  }
};

// Register driver with proper validation
exports.registerDriver = async (req, res) => {
  try {
    const { userId, name, phone, vehicleType, vehicleNumber, licenseFileId, rcFileId } = req.body;
    
    // Validate required fields
    if (!userId || !name || !phone || !vehicleType || !vehicleNumber || !licenseFileId || !rcFileId) {
      return res.status(400).json({
        success: false,
        error: 'All fields are required'
      });
    }

    // Check if driver already exists
    const existingDriver = await Driver.findOne({ userId });
    if (existingDriver) {
      return res.status(400).json({
        success: false,
        error: 'Driver already registered',
        driver: existingDriver
      });
    }

    // Create new driver
    const driver = new Driver({
      userId,
      name,
      phone,
      vehicleType,
      vehicleNumber,
      documents: {
        license: licenseFileId,
        rc: rcFileId
      },
      status: 'active'
    });
    console.log(`the driver details ${driver}`)
    await driver.save();
    
    res.status(201).json({ 
      success: true, 
      data: driver 
    });
  } catch (err) {
    if (err.code === 11000) {
      // If somehow we still hit duplicate key (race condition)
      const existingDriver = await Driver.findOne({ userId: req.body.userId });
      return res.status(400).json({
        success: false,
        error: 'Driver registration failed - already exists',
        driver: existingDriver
      });
    }
    res.status(500).json({ 
      success: false, 
      error: err.message 
    });
  }
};

// Get driver by userId
exports.getDriver = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.params.userId });
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        error: 'Driver not found' 
      });
    }
    res.status(200).json({ 
      success: true, 
      data: driver 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Server error' 
    });
  }
};

// Update driver status
exports.updateDriverStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['active', 'inactive'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid status. Must be either "active" or "inactive"'
      });
    }

    const driver = await Driver.findOneAndUpdate(
      { userId: req.user.uid },
      {
        status,
        lastUpdated: Date.now()
      },
      {
        new: true,
        runValidators: true
      }
    );

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: {
        status: driver.status,
        lastUpdated: driver.lastUpdated
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while updating status'
    });
  }
};

// Get driver status
exports.getDriverStatus = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.uid })
      .select('status lastUpdated -_id');

    if (!driver) {
      return res.status(404).json({
        success: false,
        error: 'Driver not found'
      });
    }

    res.status(200).json({
      success: true,
      data: driver
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error while fetching status'
    });
  }
};


exports.getDriverLocation = async (req, res) => {
  try {
    const driver = await Driver.findOne({ userId: req.user.uid })
      .select('location isLocationActive -_id');
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        error: 'Driver not found' 
      });
    }

    res.status(200).json({
      success: true,
      data: {
        location: driver.location,
        isLocationActive: driver.isLocationActive
      }
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Server error while fetching location' 
    });
  }
};

// UPDATE driver location
exports.updateDriverLocation = async (req, res) => {
  try {
    console.log('Incoming location update:', req.body); // Debug log

    // Validate coordinates if location is being activated
    if (req.body.isLocationActive !== false) {
      if (!req.body.coordinates || !Array.isArray(req.body.coordinates)) {
        return res.status(400).json({
          success: false,
          error: 'Coordinates must be provided as an array [longitude, latitude]'
        });
      }

      // Additional coordinate validation
      const [lng, lat] = req.body.coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' ||
          lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        return res.status(400).json({
          success: false,
          error: 'Invalid coordinates. Longitude must be [-180,180] and latitude [-90,90]'
        });
      }
    }

    const update = req.body.isLocationActive === false
      ? { 
          isLocationActive: false,
          'location.lastUpdated': Date.now()
        }
      : {
          location: {
            type: 'Point',
            coordinates: req.body.coordinates,
            lastUpdated: Date.now(),
            address: req.body.address || ''
          },
          isLocationActive: true
        };

    const driver = await Driver.findOneAndUpdate(
      { userId: req.user.uid },
      { $set: update },
      { new: true, runValidators: true }
    );
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        error: 'Driver not found' 
      });
    }

    console.log('Updated driver location:', driver.location); // Debug log

    res.status(200).json({
      success: true,
      data: {
        coordinates: driver.location.coordinates,
        lastUpdated: driver.location.lastUpdated,
        isLocationActive: driver.isLocationActive
      }
    });
  } catch (err) {
    console.error('Error updating location:', err);
    res.status(500).json({ 
      success: false, 
      error: err.message || 'Failed to update location' 
    });
  }
};

// In your driverController.js
exports.getDriverLocation = async (req, res) => {
  try {
    const driver = await Driver.findOne({ 
      userId: req.params.driverId 
    }).select('location -_id');
    
    if (!driver) {
      return res.status(404).json({ 
        success: false, 
        error: 'Driver not found' 
      });
    }

    res.status(200).json({ 
      success: true, 
      location: driver.location 
    });
  } catch (err) {
    res.status(500).json({ 
      success: false, 
      error: 'Failed to get driver location' 
    });
  }
};

// In your driverRoutes.js


// In your driverController.js
exports.registerFCMToken = async (req, res) => {
  try {
    const { token } = req.body;
    const userId = req.user.uid;
    
    if (!token) {
      return res.status(400).json({ 
        success: false,
        error: 'FCM token is required' 
      });
    }

    const driver = await Driver.findOneAndUpdate(
      { userId },
      { fcmToken: token },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'FCM token saved successfully',
      driver
    });
  } catch (error) {
    console.error('Error saving FCM token:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to save FCM token'
    });
  }
};
