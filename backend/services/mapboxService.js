const axios = require('axios');

class MapboxService {
  constructor(accessToken) {
    this.accessToken = accessToken;
  }

  async autocompleteAddress(query, country = 'IN') {
    const response = await axios.get(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(query)}.json`,
      {        params: {
          access_token: this.accessToken,
          country,
          autocomplete: true,
          types: 'address'
        }
      }
    );
    return response.data.features;
  }

  async calculateDistance(origin, destination) {
    const response = await axios.get(
      `https://api.mapbox.com/directions/v5/mapbox/driving/${origin.lng},${origin.lat};${destination.lng},${destination.lat}`,
      {
        params: {
          access_token: this.accessToken,
          geometries: 'geojson'
        }
      }
    );
    return response.data.routes[0].distance / 1000; // Convert to km
  }
}

module.exports = new MapboxService(process.env.MAPBOX_ACCESS_TOKEN);