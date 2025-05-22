import React from 'react';
import '../../styles/HelpCenter.css';

const HelpCenter = () => {
  return (
    <section className="help-center-section" id="help">
      <h2 className="title">Help Center</h2>
      <p className="subtitle">
        Need assistance? We’re happy to help. Reach out through the contact options below.
      </p>

      <div className="support-grid">
        <div className="support-card">
          <h3>Customer Support</h3>
          <p><strong>📄</strong> <a href="#faq">Read our FAQs</a></p>
          <p>Need help with your bookings or questions? Reach us at</p>
          <p><strong>📧</strong> help@jioyatri.com</p>
          <p><strong>📞</strong> 9844559599</p>
        </div>

        <div className="support-card">
          <h3>Packers & Movers</h3>
          <p>Facing issues with your shifting booking? Reach us at</p>
          <p><strong>📧</strong> packermover@jioyatri.com</p>
          <p><strong>📞</strong> 9844559599</p>
        </div>

        <div className="support-card">
          <h3>Enterprise Services</h3>
          <p>If you're a business looking for logistics help, <a href="/">click here</a></p>
          <p><strong>📧</strong> help@jioyatri.com</p>
        </div>

        <div className="support-card">
          <h3>Drive with Us</h3>
          <p>Got a mini truck or bike? <a href="/">Join Porter</a></p>
          <p><strong>📞</strong> 9844559599</p>
        </div>
      </div>
    </section>
  );
};

export default HelpCenter;
