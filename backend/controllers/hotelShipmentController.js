const HotelShipment = require('../models/HotelShipment');
const Hotel = require('../models/Hotel');
const { v4: uuidv4 } = require('uuid');
const axios = require('axios');

// Calculate distance (same as regular shipment)
exports.calculateDistance = async (req, res) => {
  try {
    const { origin, destination } = req.body;
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
    
    const distanceInKm = response.data.routes[0].legs[0].distance.value / 1000;
    res.json({ distance: distanceInKm });
  } catch (error) {
    res.status(500).json({ error: 'Failed to calculate distance' });
  }
};

// Create hotel shipment
exports.createHotelShipment = async (req, res) => {
  try {
    const { hotelId, receiver, vehicleType, distance, cost } = req.body;
    const userId = req.user.uid;

    // Get hotel details
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({ error: 'Hotel not found' });
    }

    const trackingNumber = uuidv4().split('-')[0].toUpperCase();

    const newShipment = new HotelShipment({
      userId,
      hotelId,
      sender: {
        name: hotel.name,
        phone: hotel.phone,
        address: {
          addressLine1: hotel.address.address,
          coordinates: hotel.address.coordinates
        }
      },
      receiver: {
        name: receiver.name,
        phone: receiver.phone,
        address: {
          addressLine1: receiver.address.addressLine1,
          coordinates: receiver.address.coordinates
        }
      },
      vehicleType,
      distance,
      cost,
      trackingNumber,
      status: 'pending'
    });

    const savedShipment = await newShipment.save();
    res.status(201).json(savedShipment);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create hotel shipment' });
  }
};

// Other controller methods similar to regular shipments...
// getHotelShipments, getHotelShipmentById, acceptHotelShipment, etc.