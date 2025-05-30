import React, { useState, useEffect, useRef } from 'react';

const DeliveryCalculator = ({ onOrderCreated }) => {
  const [formData, setFormData] = useState({
    origin: '',
    destination: '',
    senderName: '',
    senderPhone: '',
    receiverName: '',
    receiverPhone: '',
    vehicleType: 'car',
    parcelWeight: 1,
    urgency: 'standard',
  });

  const [originCoords, setOriginCoords] = useState(null);
  const [destinationCoords, setDestinationCoords] = useState(null);

  const [suggestions, setSuggestions] = useState({ origin: [], destination: [] });
  const [focusedInput, setFocusedInput] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const debounceTimers = useRef({});
  const autocompleteService = useRef(null);
  const placesService = useRef(null);

  useEffect(() => {
    if (window.google && window.google.maps) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService();
      placesService.current = new window.google.maps.places.PlacesService(document.createElement('div'));
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    setError('');
    if (name === 'origin' || name === 'destination') {
      if (debounceTimers.current[name]) clearTimeout(debounceTimers.current[name]);
      debounceTimers.current[name] = setTimeout(() => {
        if (value.length >= 3) {
          fetchPlaceSuggestions(name, value);
        } else {
          setSuggestions(prev => ({ ...prev, [name]: [] }));
          if (name === 'origin') setOriginCoords(null);
          if (name === 'destination') setDestinationCoords(null);
        }
      }, 500);
    }
  };

  const fetchPlaceSuggestions = (field, query) => {
    if (!autocompleteService.current) return;
    autocompleteService.current.getPlacePredictions({ input: query }, (predictions, status) => {
      if (status === window.google.maps.places.PlacesServiceStatus.OK && predictions) {
        const places = predictions.map(p => ({
          description: p.description,
          place_id: p.place_id,
        }));
        setSuggestions(prev => ({ ...prev, [field]: places }));
      } else {
        setSuggestions(prev => ({ ...prev, [field]: [] }));
      }
    });
  };

  const handleSuggestionClick = (field, description, place_id) => {
    setFormData(prev => ({ ...prev, [field]: description }));
    setSuggestions(prev => ({ ...prev, [field]: [] }));

    // Get lat/lng of selected place
    if (placesService.current && place_id) {
      placesService.current.getDetails({ placeId: place_id }, (place, status) => {
        if (status === window.google.maps.places.PlacesServiceStatus.OK && place.geometry) {
          const coords = {
            lat: place.geometry.location.lat(),
            lng: place.geometry.location.lng(),
          };
          if (field === 'origin') setOriginCoords(coords);
          else if (field === 'destination') setDestinationCoords(coords);
        }
      });
    }
  };

  const calculateDelivery = async () => {
    if (!originCoords || !destinationCoords) {
      setError('Please select valid origin and destination from suggestions.');
      return;
    }
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch('/api/shipments/calculate-distance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ origin: originCoords, destination: destinationCoords }),
      });
      if (!response.ok) throw new Error('Failed to calculate distance');
      const data = await response.json();

      // Calculate cost based on distance and vehicle type (example logic)
      let costPerKm = 10;
      if (formData.vehicleType === 'bike') costPerKm = 5;
      else if (formData.vehicleType === 'car') costPerKm = 10;
      else if (formData.vehicleType === 'van') costPerKm = 15;

      const totalCost = data.distance * costPerKm;

      setResult({
        distance: data.distance.toFixed(2),
        duration: data.duration,
        cost: totalCost.toFixed(2),
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="delivery-calculator-container">
      <h2>New Delivery Order</h2>
      <form onSubmit={e => e.preventDefault()}>
        {/* Origin Input */}
        <label>Sender Address</label>
        <div className="autocomplete-container" style={{ position: 'relative' }}>
          <input
            type="text"
            name="origin"
            value={formData.origin}
            onChange={handleChange}
            onFocus={() => setFocusedInput('origin')}
            autoComplete="off"
            placeholder="Enter sender address"
            required
          />
          {focusedInput === 'origin' && suggestions.origin.length > 0 && (
            <ul className="autocomplete-list" style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: '#fff', border: '1px solid #ccc',
              maxHeight: '150px', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none', zIndex: 10
            }}>
              {suggestions.origin.map(item => (
                <li
                  key={item.place_id}
                  onClick={() => handleSuggestionClick('origin', item.description, item.place_id)}
                  style={{ padding: '8px', cursor: 'pointer' }}
                >
                  {item.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Destination Input */}
        <label>Delivery Address</label>
        <div className="autocomplete-container" style={{ position: 'relative' }}>
          <input
            type="text"
            name="destination"
            value={formData.destination}
            onChange={handleChange}
            onFocus={() => setFocusedInput('destination')}
            autoComplete="off"
            placeholder="Enter delivery address"
            required
          />
          {focusedInput === 'destination' && suggestions.destination.length > 0 && (
            <ul className="autocomplete-list" style={{
              position: 'absolute', top: '100%', left: 0, right: 0,
              backgroundColor: '#fff', border: '1px solid #ccc',
              maxHeight: '150px', overflowY: 'auto', margin: 0, padding: 0, listStyle: 'none', zIndex: 10
            }}>
              {suggestions.destination.map(item => (
                <li
                  key={item.place_id}
                  onClick={() => handleSuggestionClick('destination', item.description, item.place_id)}
                  style={{ padding: '8px', cursor: 'pointer' }}
                >
                  {item.description}
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Other inputs */}
        <label>Sender Name</label>
        <input
          type="text"
          name="senderName"
          value={formData.senderName}
          onChange={e => setFormData(prev => ({ ...prev, senderName: e.target.value }))}
          required
        />

        <label>Sender Phone</label>
        <input
          type="tel"
          name="senderPhone"
          value={formData.senderPhone}
          onChange={e => setFormData(prev => ({ ...prev, senderPhone: e.target.value }))}
          required
        />

        <label>Receiver Name</label>
        <input
          type="text"
          name="receiverName"
          value={formData.receiverName}
          onChange={e => setFormData(prev => ({ ...prev, receiverName: e.target.value }))}
          required
        />

        <label>Receiver Phone</label>
        <input
          type="tel"
          name="receiverPhone"
          value={formData.receiverPhone}
          onChange={e => setFormData(prev => ({ ...prev, receiverPhone: e.target.value }))}
          required
        />

        <label>Vehicle Type</label>
        <select
          name="vehicleType"
          value={formData.vehicleType}
          onChange={e => setFormData(prev => ({ ...prev, vehicleType: e.target.value }))}
        >
          <option value="bike">Bike</option>
          <option value="car">Car</option>
          <option value="van">Van</option>
        </select>

        <button type="button" onClick={calculateDelivery} disabled={loading}>
          {loading ? 'Calculating...' : 'Calculate Delivery'}
        </button>
      </form>

      {error && <p style={{ color: 'red' }}>{error}</p>}

      {result && (
        <div className="result-container">
          <h3>Delivery Details</h3>
          <p><strong>Distance:</strong> {result.distance} km</p>
          <p><strong>Estimated Duration:</strong> {result.duration}</p>
          <p><strong>Estimated Cost:</strong> ₹{result.cost}</p>
        </div>
      )}
    </div>
  );
};

export default DeliveryCalculator;
