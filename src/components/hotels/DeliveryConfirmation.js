import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { 
  FaCheckCircle, 
  FaWhatsapp, 
  FaHome,
  FaShoppingBag,
  FaMoneyBillWave
} from 'react-icons/fa';
import Header from '../pages/Header';
import Footer from '../pages/Footer';
import "../../styles/hotels/DeliveryConfirmation.css";
const DeliveryConfirmation = () => {
  const { state } = useLocation();
  const navigate = useNavigate();

  const openWhatsApp = () => {
    const message = encodeURIComponent(
      `Delivery Confirmation\n\n` +
      `ID: ${state.deliveryId}\n` +
      `Hotel: ${state.hotelName}\n` +
      `Items: ${state.items}\n` +
      `Amount Paid: ₹${state.cost.toFixed(2)}`
    );
    window.open(`https://wa.me/91${state.hotelPhone}?text=${message}`, '_blank');
  };

  return (
    <>
      <Header />
      <div className="confirmation-container">
        <div className="confirmation-card">
          <FaCheckCircle className="success-icon" />
          <h2>Delivery Scheduled!</h2>
          
          <div className="confirmation-details">
            <div className="detail-item">
              <FaShoppingBag className="icon" />
              <span>From: <strong>{state.hotelName}</strong></span>
            </div>
            <div className="detail-item">
              <FaMoneyBillWave className="icon" />
              <span>Delivery Fee: <strong>₹{state.cost.toFixed(2)}</strong></span>
            </div>
            <div className="detail-item">
              <span>Order ID: <strong>{state.deliveryId}</strong></span>
            </div>
          </div>

          <div className="confirmation-actions">
            <button className="whatsapp-btn" onClick={openWhatsApp}>
              <FaWhatsapp /> Contact Hotel
            </button>
            <button 
              className="home-btn"
              onClick={() => navigate('/hotels')}
            >
              <FaHome /> Back to Hotels
            </button>
          </div>

          <div className="delivery-instructions">
            <h3>What happens next?</h3>
            <ol>
              <li>Your request has been sent to the hotel</li>
              <li>Hotel will prepare your items</li>
              <li>Our porter will collect and deliver to you</li>
              <li>Pay the hotel directly for the items when delivered</li>
            </ol>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default DeliveryConfirmation;