import React from "react";
import '../../styles/HouseShiftingFeatures.css'
const HouseShiftingFeatures = () => {
  return (
    <section className="shifting-container">
      <h2>Reliable House Shifting Services</h2>
      <div className="feature-cards">
        <div className="feature-card">
          <div className="icon-placeholder">🚚</div>
          <h3>Secure Relocation</h3>
          <p>Trusted moving solutions with guaranteed safe and secure transport. We handle your belongings with utmost care.</p>
        </div>

        <div className="feature-card">
          <div className="icon-placeholder">💰</div>
          <h3>Cost-Effective Services</h3>
          <p>Budget-friendly options with transparent pricing. Get quality service without breaking the bank.</p>
        </div>

        <div className="feature-card">
          <div className="icon-placeholder">🛠️</div>
          <h3>Professional Expertise</h3>
          <p>Skilled staff trained for careful packing and damage-free handling. Experience you can trust at every step.</p>
        </div>
      </div>
    </section>
  );
};

export default HouseShiftingFeatures;
