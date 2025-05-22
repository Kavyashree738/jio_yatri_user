import React from 'react';
import '../../styles/EstimateForm.css';

const EstimateSection = () => {
  return (
    <section className="estimate-wrapper">
      <h2 className="estimate-title">Get a Quick Estimate</h2>
      <div className="estimate-form">

        <select>
          <option value="">Select City</option>
          <option value="bangalore">Bangalore</option>
          <option value="mysore">Mysore</option>
          <option value="chickballapur">Chickballapur</option>
          <option value="tumkur">Tumkur</option>
          <option value="kolar">Kolar</option>
        </select>

        <input type="text" placeholder="Pickup Location" />
        <input type="text" placeholder="Drop Location" />
        <input type="tel" placeholder="Phone Number" />
        <input type="text" placeholder="Your Name" />

        <select>
          <option value="">Who are you?</option>
          <option value="personal">Personal User</option>
          <option value="business">Business User</option>
        </select>

        <button>Get Estimate</button>
      </div>
    </section>
  );
};

export default EstimateSection;
