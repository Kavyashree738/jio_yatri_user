import React, { useState, useEffect, useRef } from 'react';

const GOOGLE_MAPS_API_KEY = 'AIzaSyDbz4GPnMSZQZjNLrgrfcIV_bVCP0UQZVM'; // Replace with your API key

// Load Google Maps script dynamically for autocomplete
function loadScript(url) {
  const index = window.document.getElementsByTagName('script')[0];
  const script = window.document.createElement('script');
  script.src = url;
  script.async = true;
  script.defer = true;
  index.parentNode.insertBefore(script, index);
}

const DeliveryEstimator = () => {
  const [pickup, setPickup] = useState('');
  const [drop, setDrop] = useState('');
  const [distanceKm, setDistanceKm] = useState(null);
  const [cost, setCost] = useState(null);
  const [vehicle, setVehicle] = useState(null);
  const [loadWeight, setLoadWeight] = useState('');
  const pickupRef = useRef(null);
  const dropRef = useRef(null);

  // Price per km for each vehicle type
  const pricing = {
    bicycle: 5, // ₹5 per km
    twoWheeler: 8,
    van: 15,
    truck: 25,
  };

  // Load Google Maps Places API once
  useEffect(() => {
    if (!window.google) {
      loadScript(
        `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`
      );
    } else {
      initAutocomplete();
    }
  }, []);

  // Initialize Google Places Autocomplete inputs
  const initAutocomplete = () => {
    if (window.google) {
      if (pickupRef.current) {
        const autocompletePickup = new window.google.maps.places.Autocomplete(
          pickupRef.current,
          { types: ['geocode'] }
        );
        autocompletePickup.addListener('place_changed', () => {
          const place = autocompletePickup.getPlace();
          setPickup(place.formatted_address || pickupRef.current.value);
        });
      }
      if (dropRef.current) {
        const autocompleteDrop = new window.google.maps.places.Autocomplete(
          dropRef.current,
          { types: ['geocode'] }
        );
        autocompleteDrop.addListener('place_changed', () => {
          const place = autocompleteDrop.getPlace();
          setDrop(place.formatted_address || dropRef.current.value);
        });
      }
    }
  };

  // Re-init autocomplete after script loads
  useEffect(() => {
    if (window.google && (!pickupRef.current.autocomplete || !dropRef.current.autocomplete)) {
      initAutocomplete();
    }
  }, [pickupRef.current, dropRef.current]);

  // Calculate distance using Google Distance Matrix API
  const calculateDistance = async () => {
    if (!pickup || !drop) {
      alert('Please enter both Pickup and Drop addresses');
      return;
    }
    const service = new window.google.maps.DistanceMatrixService();
    service.getDistanceMatrix(
      {
        origins: [pickup],
        destinations: [drop],
        travelMode: window.google.maps.TravelMode.DRIVING,
      },
      (response, status) => {
        if (status === 'OK') {
          const results = response.rows[0].elements[0];
          if (results.status === 'OK') {
            const distInMeters = results.distance.value;
            const distKm = distInMeters / 1000;
            setDistanceKm(distKm.toFixed(2));
            calculateCostAndVehicle(distKm, loadWeight);
          } else {
            alert('Could not calculate distance for the given addresses.');
          }
        } else {
          alert('Distance Matrix API failed due to: ' + status);
        }
      }
    );
  };

  // Decide vehicle based on load and calculate cost based on distance
  const calculateCostAndVehicle = (distKm, load) => {
    const weight = parseFloat(load);
    if (isNaN(weight) || weight <= 0) {
      alert('Please enter a valid load weight (kg).');
      setCost(null);
      setVehicle(null);
      return;
    }

    let chosenVehicle = '';
    let pricePerKm = 0;

    if (weight <= 20) {
      chosenVehicle = 'Bicycle';
      pricePerKm = pricing.bicycle;
    } else if (weight <= 100) {
      chosenVehicle = 'Two-wheeler';
      pricePerKm = pricing.twoWheeler;
    } else if (weight <= 500) {
      chosenVehicle = 'Van';
      pricePerKm = pricing.van;
    } else {
      chosenVehicle = 'Truck';
      pricePerKm = pricing.truck;
    }

    const estimatedCost = distKm * pricePerKm;

    setVehicle(chosenVehicle);
    setCost(estimatedCost.toFixed(2));
  };

  // Handle form submit
  const handleEstimate = () => {
    calculateDistance();
  };

  return (
    <div style={styles.container}>
      <h2>Porter-like Delivery Estimator</h2>

      <input
        type="text"
        placeholder="Sending from (Pickup Address)"
        ref={pickupRef}
        defaultValue={pickup}
        onChange={(e) => setPickup(e.target.value)}
        style={styles.input}
      />

      <input
        type="text"
        placeholder="Sending to (Drop Address)"
        ref={dropRef}
        defaultValue={drop}
        onChange={(e) => setDrop(e.target.value)}
        style={styles.input}
      />

      <input
        type="number"
        placeholder="Enter load weight in kg"
        value={loadWeight}
        onChange={(e) => setLoadWeight(e.target.value)}
        style={styles.input}
      />

      <button onClick={handleEstimate} style={styles.button}>
        Get Estimate
      </button>

      {distanceKm && cost && vehicle && (
        <div style={styles.result}>
          <h3>Suggested Vehicle: {vehicle}</h3>
          <p><strong>Distance:</strong> {distanceKm} km</p>
          <p><strong>Estimated Cost:</strong> ₹{cost}</p>
          <p><strong>Load Capacity:</strong> {loadWeight} kg</p>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '420px',
    margin: '20px auto',
    fontFamily: 'Arial, sans-serif',
    padding: '20px',
    border: '1px solid #ccc',
    borderRadius: '10px',
  },
  input: {
    width: '100%',
    padding: '12px',
    marginBottom: '10px',
    borderRadius: '8px',
    border: '1px solid #aaa',
    fontSize: '16px',
  },
  button: {
    width: '100%',
    padding: '12px',
    backgroundColor: '#007bff',
    border: 'none',
    color: 'white',
    fontWeight: 'bold',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  result: {
    marginTop: '20px',
    backgroundColor: '#f7f7f7',
    padding: '15px',
    borderRadius: '8px',
    border: '1px solid #ddd',
  },
};

export default DeliveryEstimator;
