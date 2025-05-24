import React from 'react';
import { Link } from 'react-router-dom';  // if you use React Router
import '../../styles/HelpCenter.css';

const HelpCenter = () => {
  return (
    <section className="help-center-section" id="help">
      <h2 className="title">Help Center</h2>
      <p className="subtitle">
        Need assistance? We’re happy to help. Click below to see all support options.
      </p>
      <Link to="/help-details" className="know-more-btn">
        Know More
      </Link>
    </section>
  );
};

export default HelpCenter;
