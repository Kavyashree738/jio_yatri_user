import React from 'react';
import '../../styles/PorterPromo.css';
import qr from '../../assets/images/qr-code.png'; 

const PorterPromo = () => {
  return (
    <div className="porter-promo-container">
      <h2 className="porter-promo-title">Fast, Safe, and Affordable – That’s Porter!</h2>
      <p className="porter-promo-subtitle">The easiest way to send your packages anywhere.</p>
      <div className="qr-section">
        <img src={qr} alt="Porter App QR Code" className="qr-code-image" />
        <p className="qr-caption">Get the Porter app now and start shipping!</p>
      </div>
    </div>
  );
};

export default PorterPromo;
