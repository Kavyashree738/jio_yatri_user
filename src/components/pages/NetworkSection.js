import React from 'react';
import '../../styles/NetworkSection.css'; 
const NetworkSection = () => {
  return (
    <section className="network-section">
      <h2 className="section-title h2">OUR EXPANDING REACH</h2>
      <div className="network-stats">
        <div className="stat-card">
          <h3>21+</h3>
          <p>LOCATIONS COVERED</p>
        </div>
        <div className="stat-card">
          <h3>750,000+</h3>
          <p>PROFESSIONAL DRIVERS</p>
        </div>
        <div className="stat-card">
          <h3>5000+</h3>
          <p>BUSINESS PARTNERS</p>
        </div>
      </div>
    </section>
  );
};

export default NetworkSection;
