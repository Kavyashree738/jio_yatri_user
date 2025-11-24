import React from 'react';
import '../../styles/TestimonialsSection.css';
import { useTranslation } from "react-i18next";

const TestimonialsSection = () => {
  const { t } = useTranslation();

  const testimonials = [
    { quote: t("testi_1_quote"), name: t("testi_1_name") },
    { quote: t("testi_2_quote"), name: t("testi_2_name") },
    { quote: t("testi_3_quote"), name: t("testi_3_name") }
  ];

  return (
    <div className="testimonials-section" id="testimonials">
      <h2 className="section-title">{t("testimonials_title")}</h2>

      <div className="testimonials-container">
        {testimonials.map((item, index) => (
          <div className="testimonial-card" key={index}>
            <h1>🙍‍♂️</h1>
            <p className="testimonial-quote">“{item.quote}”</p>
            <h4 className="testimonial-name">{item.name}</h4>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TestimonialsSection;
