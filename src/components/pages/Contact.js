import React from 'react';
import '../../styles/Contact.css'; 
import { FaPhoneAlt, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { useTranslation } from "react-i18next";

const ContactSection = () => {
  const { t } = useTranslation();

  return (
    <div className="contact-section" id="contact">
      <h2 className="contact-title">{t("contact_title")}</h2>

      <div className="contact-cards">

        <div className="contact-card">
          <FaPhoneAlt className="contact-icon" />
          <h4>{t("contact_phone")}</h4>
          <p>+91 9844559599</p>
        </div>

        <div className="contact-card">
          <FaEnvelope className="contact-icon" />
          <h4>{t("contact_email")}</h4>
          <p>helpjioyatri@gmail.com</p>
        </div>

        <div className="contact-card">
          <FaMapMarkerAlt className="contact-icon" />
          <h4>{t("contact_address")}</h4>
          <p>Ward No 10, Nr Extention, Chikabalapur, Chintamani, Kolar, Karnataka, India, 563125</p>
        </div>

      </div>
    </div>
  );
};

export default ContactSection;
