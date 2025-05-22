import React from 'react';
import '../../styles/TestimonialsSection.css';

const TestimonialsSection = () => {
  const testimonials = [
    {
      quote: "Affordable and trustworthy delivery service. I’ve recommended them to friends and family too! The booking process is smooth, and the delivery staff is always courteous. I’m really happy with the consistent quality of service they provide.",
      name: "Rahul M.",
    },
    {
      quote: "Professional and timely service. The staff communicates well and handles every parcel with care. Great experience overall!",
      name: "Priya S.",
    },
    {
      quote: "Quick, secure, and budget-friendly deliveries. I’ve been using them for months and never had an issue. Highly recommended!",
      name: "Arjun K.",
    }
  ];

  return (
    <div className="testimonials-section" id="testimonials">
      <h2 className="section-title">What Our Customers Say</h2>
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
