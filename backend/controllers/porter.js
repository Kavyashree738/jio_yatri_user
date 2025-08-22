const axios = require('axios');
const PorterBooking = require('../models/PorterBooking');
const Hotel = require('../models/Hotel');

// Calculate distance between two points
exports.calculateDistance = async (req, res) => {
  const { origin, destination } = req.body;

  // Validate input coordinates
  if (
    !origin || !destination ||
    typeof origin.lat !== 'number' || typeof origin.lng !== 'number' ||
    typeof destination.lat !== 'number' || typeof destination.lng !== 'number'
  ) {
    return res.status(400).json({
      success: false,
      error: 'Invalid coordinates format',
      details: 'Expected { lat: number, lng: number } for both origin and destination'
    });
  }

  try {
    const response = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${origin.lat},${origin.lng}`,
        destination: `${destination.lat},${destination.lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
        units: 'metric'
      }
    });

    if (response.data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        error: 'Could not calculate route',
        status: response.data.status,
        message: response.data.error_message || 'No route could be found between the specified locations'
      });
    }

    const route = response.data.routes[0];
    const leg = route.legs[0];
    const distanceInKm = leg.distance.value / 1000;
    const cost = calculatePorterCost(distanceInKm);

    return res.json({
      success: true,
      distance: distanceInKm,
      duration: leg.duration.text,
      cost,
      polyline: route.overview_polyline?.points || null
    });

  } catch (error) {
    console.error('Route calculation error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to calculate distance',
      details: error.message
    });
  }
};

// Create porter booking
exports.createPorterBooking = async (req, res) => {
  const { customer, hotelId, itemsDescription, paymentMethod } = req.body;

  try {
    const hotel = await Hotel.findById(hotelId);
    if (!hotel) {
      return res.status(404).json({
        success: false,
        error: 'Hotel not found'
      });
    }

    const distanceResponse = await axios.get('https://maps.googleapis.com/maps/api/directions/json', {
      params: {
        origin: `${hotel.address.coordinates.lat},${hotel.address.coordinates.lng}`,
        destination: `${customer.address.coordinates.lat},${customer.address.coordinates.lng}`,
        key: process.env.GOOGLE_MAPS_API_KEY,
        units: 'metric'
      }
    });

    if (distanceResponse.data.status !== 'OK') {
      return res.status(400).json({
        success: false,
        error: 'Could not calculate route',
        message: distanceResponse.data.error_message || 'Failed to calculate distance'
      });
    }

    const distanceInKm = distanceResponse.data.routes[0].legs[0].distance.value / 1000;
    const cost = calculatePorterCost(distanceInKm);

    const booking = await PorterBooking.create({
      customer,
      hotel: {
        name: hotel.name,
        address: hotel.address,
        phone: hotel.phone,
        hotelId: hotel._id
      },
      itemsDescription,
      distance: distanceInKm,
      cost,
      paymentMethod: paymentMethod || 'razorpay'
    });

    return res.status(201).json({
      success: true,
      data: booking
    });

  } catch (error) {
    console.error('Create booking error:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to create booking',
      details: error.message
    });
  }
};

// Helper function to calculate porter cost
function calculatePorterCost(distanceInKm) {
  const baseFee = 50; // ₹50 base fee
  const perKmRate = 20; // ₹20 per km
  return baseFee + (distanceInKm * perKmRate);
}
