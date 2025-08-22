const ShopOrder = require('../models/ShopOrder');
const Shop = require('../models/CategoryModel');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');
const mongoose = require('mongoose');

// Calculate distance between two points
exports.calculateDistance = async (req, res) => {
  try {
    console.log('--- STARTING DISTANCE CALCULATION ---');
    const { origin, destination } = req.body;
    
    // 1. Log the incoming request data
    console.log('Request body:', JSON.stringify(req.body, null, 2));
    console.log('Origin coordinates:', origin);
    console.log('Destination coordinates:', destination);

    // 2. Validate coordinates
    if (!origin || !destination) {
      console.error('Missing origin or destination coordinates');
      return res.status(400).json({ error: 'Origin and destination coordinates are required' });
    }

    if (!origin.lat || !origin.lng || !destination.lat || !destination.lng) {
      console.error('Invalid coordinate format');
      return res.status(400).json({ error: 'Coordinates must have lat and lng properties' });
    }

    // 3. Log Google Maps API key status
    console.log('Google Maps API Key exists:', !!process.env.GOOGLE_MAPS_API_KEY);
    
    // 4. Construct the API request URL
    const apiUrl = `https://maps.googleapis.com/maps/api/directions/json?origin=${origin.lat},${origin.lng}&destination=${destination.lat},${destination.lng}&key=${process.env.GOOGLE_MAPS_API_KEY}&units=metric`;
    console.log('Google Maps API Request URL:', apiUrl);

    // 5. Make the API request
    console.log('Making request to Google Maps API...');
    const response = await axios.get(
      'https://maps.googleapis.com/maps/api/directions/json',
      {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${destination.lat},${destination.lng}`,
          key: process.env.GOOGLE_MAPS_API_KEY,
          units: 'metric'
        }
      }
    );

    // 6. Log the full API response
    console.log('Google Maps API Response:', {
      status: response.status,
      statusText: response.statusText,
      data: response.data
    });

    // 7. Validate the response data
    if (!response.data.routes || response.data.routes.length === 0) {
      console.error('No routes found in response');
      return res.status(500).json({ error: 'No routes available between these points' });
    }

    if (!response.data.routes[0].legs || response.data.routes[0].legs.length === 0) {
      console.error('No legs found in route');
      return res.status(500).json({ error: 'No path information available' });
    }

    // 8. Calculate and return distance
    const distanceInMeters = response.data.routes[0].legs[0].distance.value;
    const distanceInKm = distanceInMeters / 1000;
    
    console.log('Calculated distance:', {
      meters: distanceInMeters,
      kilometers: distanceInKm
    });

    console.log('--- DISTANCE CALCULATION SUCCESSFUL ---');
    res.json({ distance: distanceInKm });

  } catch (error) {
    console.error('--- DISTANCE CALCULATION FAILED ---');
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      response: error.response?.data
    });

    // Handle specific Google Maps API errors
    if (error.response) {
      if (error.response.data.error_message) {
        console.error('Google Maps API error:', error.response.data.error_message);
        return res.status(500).json({ 
          error: 'Google Maps API error',
          details: error.response.data.error_message 
        });
      }
      
      return res.status(error.response.status).json({
        error: 'Failed to calculate distance',
        details: error.response.data
      });
    }

    res.status(500).json({ 
      error: 'Failed to calculate distance',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Create a new shop order
exports.createShopOrder = async (req, res) => {
  try {
    const { shopId, items, receiver, vehicleType, distance, cost, paymentMethod } = req.body;
    const userId = req.user.uid;

    // Get shop details
    const shop = await Shop.findById(shopId);
    if (!shop) {
      return res.status(404).json({ error: 'Shop not found' });
    }

    const trackingNumber = uuidv4().split('-')[0].toUpperCase();

    const newOrder = new ShopOrder({
      userId,
      shopId,
      items,
      receiver: {
        name: receiver.name,
        phone: receiver.phone,
        address: {
          addressLine1: receiver.address.addressLine1,
          coordinates: {
            lat: receiver.address.coordinates.lat,
            lng: receiver.address.coordinates.lng
          }
        }
      },
      vehicleType,
      distance,
      cost,
      trackingNumber,
      status: 'pending',
      payment: {
        method: paymentMethod,
        status: paymentMethod === 'cod' ? 'pending' : 'pending'
      }
    });

    const savedOrder = await newOrder.save();
    res.status(201).json({
      order: savedOrder,
      trackingNumber
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to create shop order' });
  }
};

// Get user's shop orders
exports.getUserShopOrders = async (req, res) => {
  try {
    const userId = req.user.uid;
    const orders = await ShopOrder.find({ userId }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop orders' });
  }
};

// Get specific shop order by ID
exports.getShopOrderById = async (req, res) => {
  try {
    const order = await ShopOrder.findById(req.params.id)
      .select({
        _id: 1,
        status: 1,
        'deliveryPerson.location.coordinates': 1,
        'receiver.address.coordinates': 1,
        trackingNumber: 1,
        deliveryPerson: 1
      })
      .lean();

    if (!order) {
      return res.status(404).json({ error: 'Shop order not found' });
    }
    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch shop order' });
  }
};

// Get available shop orders for delivery persons
exports.getAvailableShopOrders = async (req, res) => {
  try {
    const { vehicleType } = req.query;

    const matchingOrders = await ShopOrder.find({
      vehicleType,
      status: 'confirmed'
    });

    res.json(matchingOrders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch available shop orders' });
  }
};

// Accept a shop order (delivery person)
exports.acceptShopOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { location } = req.body;
    const userId = req.user.uid;

    // Validate location
    if (location) {
      if (!Array.isArray(location) || location.length !== 2 ||
        typeof location[0] !== 'number' || typeof location[1] !== 'number') {
        return res.status(400).json({ error: 'Invalid location format' });
      }
    }

    // Update order
    const orderUpdate = {
      status: 'out_for_delivery',
      deliveryPerson: {
        userId,
        name: req.user.name || 'Delivery Person',
        phone: req.user.phone,
        vehicleType: req.user.vehicleType,
        vehicleNumber: req.user.vehicleNumber,
        location: {
          type: 'Point',
          coordinates: location || [0, 0]
        }
      }
    };

    const order = await ShopOrder.findByIdAndUpdate(
      id,
      { $set: orderUpdate },
      { new: true, session }
    );

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Shop order not found' });
    }

    await session.commitTransaction();

    // Emit real-time update if using Socket.io
    if (req.io) {
      req.io.to(`shop_order_${order._id}`).emit('shop_order_updated', order);
    }

    res.json({
      message: 'Shop order accepted successfully',
      order,
      deliveryLocation: order.deliveryPerson.location
    });

  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to accept shop order' });
  } finally {
    session.endSession();
  }
};

// Update delivery person location
exports.updateDeliveryLocation = async (req, res) => {
  try {
    const { coordinates } = req.body;
    const { id } = req.params;

    if (!coordinates || !Array.isArray(coordinates) || coordinates.length !== 2) {
      return res.status(400).json({ error: 'Invalid coordinates format' });
    }

    const order = await ShopOrder.findByIdAndUpdate(
      id,
      {
        'deliveryPerson.location': {
          type: 'Point',
          coordinates: coordinates
        }
      },
      { new: true }
    );

    if (!order) {
      return res.status(404).json({ error: 'Shop order not found' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update delivery location' });
  }
};

// Cancel shop order
exports.cancelShopOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;
    const { reason } = req.body;

    // Validate input
    if (!reason || typeof reason !== 'string') {
      await session.abortTransaction();
      return res.status(400).json({ error: 'Valid cancellation reason is required' });
    }

    const existingOrder = await ShopOrder.findById(id).session(session);
    if (!existingOrder) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Shop order not found' });
    }

    // Update order
    const order = await ShopOrder.findByIdAndUpdate(
      id,
      {
        status: 'cancelled',
        cancellationReason: reason,
        $unset: { 'deliveryPerson.location': 1 }
      },
      { new: true, session }
    );

    await session.commitTransaction();

    // Emit real-time update
    if (req.io) {
      req.io.to(`shop_order_${order._id}`).emit('shop_order_updated', order);
    }

    return res.json({
      success: true,
      message: 'Shop order cancelled successfully',
      orderId: order._id
    });

  } catch (error) {
    await session.abortTransaction();
    return res.status(500).json({
      error: 'Failed to cancel shop order',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  } finally {
    await session.endSession();
  }
};

// Deliver shop order
exports.deliverShopOrder = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { id } = req.params;

    // Update order
    const order = await ShopOrder.findByIdAndUpdate(
      id,
      {
        status: 'delivered',
        deliveredAt: new Date(),
        $unset: { 'deliveryPerson.location': 1 }
      },
      { new: true, session }
    );

    if (!order) {
      await session.abortTransaction();
      return res.status(404).json({ error: 'Shop order not found' });
    }

    await session.commitTransaction();

    // Emit real-time update
    if (req.io) {
      req.io.to(`shop_order_${order._id}`).emit('shop_order_updated', order);
    }

    res.json({ message: 'Shop order delivered successfully' });
  } catch (error) {
    await session.abortTransaction();
    res.status(500).json({ error: 'Failed to deliver shop order' });
  } finally {
    session.endSession();
  }
};

// Get delivery person's order history
exports.getDeliveryPersonHistory = async (req, res) => {
  try {
    const { status } = req.query;
    const userId = req.user.uid;

    let query = { 'deliveryPerson.userId': userId };
    if (status && status !== 'all') {
      query.status = status;
    }

    const orders = await ShopOrder.find(query)
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch delivery history' });
  }
};