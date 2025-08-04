import React, { useEffect, useRef } from 'react';
import '../../styles/WelcomeSection.css';
import courierImage from '../../assets/images/hero-image.jpg';

const WelcomeSection = () => {
  const textRef = useRef(null);
  const imageRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
          }
        });
      },
      { threshold: 0.2 }
    );

    if (textRef.current) observer.observe(textRef.current);
    if (imageRef.current) observer.observe(imageRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <section className="welcome-section" id="welcome-section">
      <div className="welcome-content">
        <div
          ref={textRef}
          className="text-side animate-on-scroll animate-left"
        >
          <h1>
            Welcome to <span className="brand">JIOYATRI</span>
          </h1>
          <h2>Your Trusted Intercity Courier Partner</h2>
          <p>
            Experience fast, safe, and reliable courier delivery from Bangalore
            to across India. Whether it's a small parcel or a large shipment,
            we deliver via <strong>bike, van, and truck</strong>—tailored to
            your needs.
          </p>
          <button className="book-button">Book a Delivery</button>

          <div className="stats">
            <div className="stat">
              <h3>300+</h3>
              <p>Bike Deliveries</p>
            </div>
            <div className="stat">
              <h3>150+</h3>
              <p>Van Shipments</p>
            </div>
            <div className="stat">
              <h3>100+</h3>
              <p>Truck Loads</p>
            </div>
            <div className="stat">
              <h3>5000+</h3>
              <p>Parcels Delivered</p>
            </div>
          </div>
        </div>

        <div
          ref={imageRef}
          className="image-side animate-on-scroll animate-right"
        >
          <img src={courierImage} alt="Courier Delivery" />
        </div>
      </div>
    </section>
  );
};

export default WelcomeSection;
