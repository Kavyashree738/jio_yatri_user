import React from 'react';
import '../../styles/BookingPorterSection.css';
import { FaMotorcycle, FaTruckMoving, FaShuttleVan, FaMobileAlt, FaCheckCircle } from 'react-icons/fa';

const BookingPorterSection = () => {
  return (
    <section className="booking-section">
      <div className="container">
        <h2>Fast & Easy Vehicle Booking for Deliveries</h2>
        <p className="subtitle">
          Book a bike, van, or truck in minutes with our seamless online platform – available across multiple cities.
        </p>

        <div className="steps">
          <h3>How to Book</h3>
          <ul>
            <li><FaMobileAlt /> Open the Jio Yatri app</li>
            <li><FaCheckCircle /> Choose your pickup and drop location</li>
            <li><FaCheckCircle /> Select a vehicle: bike, van, or truck</li>
            <li><FaCheckCircle /> Add delivery details and confirm booking</li>
          </ul>
        </div>

        <div className="vehicles">
          <h3>Available Vehicle Options</h3>
          <div className="vehicle-cards">
            <div className="vehicle-card">
              <FaMotorcycle className="icon" />
              <h4>Bike</h4>
              <p>For small parcels and fast intra-city deliveries.</p>
            </div>
            <div className="vehicle-card">
              <FaShuttleVan className="icon" />
              <h4>Van</h4>
              <p>Great for mid-size items like boxes, furniture, or retail stock.</p>
            </div>
            <div className="vehicle-card">
              <FaTruckMoving className="icon" />
              <h4>Truck</h4>
              <p>Perfect for heavy or bulk transport requirements.</p>
            </div>
          </div>
        </div>

        <div className="features">
          <h3>Why Choose Us?</h3>
          <ul>
            <li><FaCheckCircle /> Easy online booking</li>
            <li><FaCheckCircle /> Trusted driver-partners</li>
            <li><FaCheckCircle /> Transparent pricing</li>
            <li><FaCheckCircle /> Coverage across multiple cities</li>
          </ul>
        </div>
      </div>
    </section>
  );
};

export default BookingPorterSection;
