import React, { useEffect, useRef } from 'react';
import '../../styles/WelcomeSection.css';
import courierImage from '../../assets/images/hero-image.jpg';
import '../../styles/global.css'
import { useTranslation } from "react-i18next";

const WelcomeSection = () => {
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const { t } = useTranslation();


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
           <span className="brand">JIOYATRI</span> {t("welcome_title")} 
          </h1>

          <h2>{t("welcome_subtitle")}</h2>
          <p>
            {t("welcome_description")}
          </p>
          <button className="book-button">{t("book_delivery")}</button>

          <div className="stats">
            <div className="stat">
              <h3>300+</h3>
              <p>{t("stat_bike")}</p>
            </div>
            <div className="stat">
              <h3>150+</h3>
              <p>{t("stat_van")}</p>
            </div>
            <div className="stat">
              <h3>100+</h3>
              <p>{t("stat_truck")}</p>
            </div>
            <div className="stat">
              <h3>5000+</h3>
              <p>{t("stat_parcels")}</p>
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
