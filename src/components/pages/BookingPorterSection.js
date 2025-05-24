import React from 'react';
import { useNavigate } from 'react-router-dom';
import '../../styles/BookingPorterSection.css';
import { FaMotorcycle, FaTruckMoving, FaShuttleVan, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

const BookingPorterSection = () => {
  const navigate = useNavigate();

  // Handler for vehicle card click
  const handleVehicleClick = (vehicleType) => {
    navigate(`/vehicle/${vehicleType}`);
  };

  return (
    <section className="booking-section">
      <div className="container">
        <h2>Fast & Easy Vehicle Booking for Deliveries</h2>
        <p className="subtitle">
          Book a bike, van, or truck in minutes with our seamless online platform – available across multiple cities.
        </p>

        <div className="vehicles">
          <h3>Available Vehicle Options</h3>
          <div className="vehicle-cards">
            <div className="vehicle-card" onClick={() => handleVehicleClick('bike')} style={{cursor: 'pointer'}}>
              <FaMotorcycle className="icon" />
              <h4>Bike</h4>
              <p>For small parcels and fast intra-city deliveries.</p>
            </div>
            <div className="vehicle-card" onClick={() => handleVehicleClick('van')} style={{cursor: 'pointer'}}>
              <FaShuttleVan className="icon" />
              <h4>Van</h4>
              <p>Great for mid-size items like boxes, furniture, or retail stock.</p>
            </div>
            <div className="vehicle-card" onClick={() => handleVehicleClick('truck')} style={{cursor: 'pointer'}}>
              <FaTruckMoving className="icon" />
              <h4>Truck</h4>
              <p>Perfect for heavy or bulk transport requirements.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default BookingPorterSection;
