import React from 'react';
import '../../styles/Contact.css'; 
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const ContactSection = () => {
  return (
    <div className="contact-section" id="contact">
      <h2 className="contact-title">Get in Touch</h2>
      <div className="contact-cards">
        <div className="contact-card">
          <FaPhoneAlt className="contact-icon" />
          <h4>Phone</h4>
          <p>+91 9844559599</p>
        </div>
        <div className="contact-card">
          <FaEnvelope className="contact-icon" />
          <h4>Email</h4>
          <p>helpjioyatri@gmail.com</p>
        </div>
        <div className="contact-card">
          <FaMapMarkerAlt className="contact-icon" />
          <h4>Address</h4>
          <p>Ward No 10, Nr Extention, Chintamani taluk, Chickballapura District Karnataka, India, 563125</p>
        </div>
      </div>
    </div>
  );
};

export default ContactSection;
