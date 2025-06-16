import React from "react";
import '../../styles/delivery_partners/OwnVehiclesSection.css';
import image from '../../assets/images/hero-image.jpg'
export default function OwnVehiclesSection() {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <section className="own-vehicles-section">
      <div className="image-container">
        <img 
          src={image} 
          alt="Fleet Management"
        />
      </div>

      <div className="text-container">
        <h2>MANAGE YOUR FLEET WITH EASE</h2>
        <p>
          Own several vehicles? Managing them efficiently can be overwhelming.<br />
          Join Jioyatri delivery to simplify fleet tracking and maximize your business potential effortlessly.
        </p>
        <button onClick={scrollToTop} className="contact-us-btn">
          REACH OUT TO US
        </button>
      </div>
    </section>
  );
}
