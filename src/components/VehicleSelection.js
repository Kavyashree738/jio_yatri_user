import React, { useState, useEffect } from 'react';
import axios from 'axios';
import '../styles/components.css';

const vehicleTypes = [
  { type: 'bicycle', name: 'Bicycle', rate: 10, emoji: '🏍️' },
  { type: 'car', name: 'Car', rate: 20, emoji: '🚗' },
  { type: 'van', name: 'Van', rate: 30, emoji: '🚐' }
];

function VehicleSelection({ 
  vehicleType, 
  updateData,
  updateDistanceAndCost,
  senderAddress,
  receiverAddress,
  onNext,
  onBack
}) {
  const [selectedVehicle, setSelectedVehicle] = useState(vehicleType || 'car');
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState(null);

  const validCoordinates = (coords) => {
    return coords &&
      typeof coords.lat === 'number' && !isNaN(coords.lat) &&
      typeof coords.lng === 'number' && !isNaN(coords.lng);
  };

  useEffect(() => {
    if (validCoordinates(senderAddress?.coordinates) && 
        validCoordinates(receiverAddress?.coordinates)) {
      calculateDistance();
    }
  }, [senderAddress, receiverAddress, selectedVehicle]);

  const calculateDistance = async () => {
    if (!validCoordinates(senderAddress?.coordinates) || 
        !validCoordinates(receiverAddress?.coordinates)) {
      setError('Invalid address coordinates');
      return;
    }

    setIsCalculating(true);
    setError(null);

    try {
      const response = await axios.post('https://jio-yatri-user.onrender.com/api/shipments/calculate-distance', {
        origin: senderAddress.coordinates,
        destination: receiverAddress.coordinates
      });

      const calculatedDistance = response.data.distance;
      const vehicle = vehicleTypes.find(v => v.type === selectedVehicle);
      const calculatedCost = calculatedDistance * vehicle.rate;

      updateDistanceAndCost(calculatedDistance, calculatedCost);
    } catch (error) {
      setError('Failed to calculate distance. Please try again.');
      console.error('Distance calculation error:', error);
    } finally {
      setIsCalculating(false);
    }
  };

  const handleVehicleSelect = (type) => {
    setSelectedVehicle(type);
    updateData(type);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onNext();
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Select Vehicle Type</h2>
      
      <div className="vehicle-grid">
        {vehicleTypes.map((vehicle) => (
          <div 
            key={vehicle.type}
            className={`vehicle-card ${selectedVehicle === vehicle.type ? 'selected' : ''}`}
            onClick={() => handleVehicleSelect(vehicle.type)}
          >
            <div className="vehicle-info">
              <input
                type="radio"
                name="vehicle"
                checked={selectedVehicle === vehicle.type}
                onChange={() => {}}
              />
              <div>
                <h3>
                  <span className="vehicle-emoji">{vehicle.emoji}</span>
                  {vehicle.name}
                </h3>
                <p>₹{vehicle.rate} per km</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
          disabled={isCalculating}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={!selectedVehicle || isCalculating}
        >
          {isCalculating ? 'Calculating...' : 'Next'}
        </button>
      </div>
    </form>
  );
}

export default VehicleSelection;