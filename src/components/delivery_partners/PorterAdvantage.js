import React from 'react';
import '../../styles/delivery_partners/PorterAdvantage.css'; // You can create this CSS file

const PorterAdvantage = () => {
  const advantages = [
    {
      title: 'Consistent Deliveries',
      description:
        'With our expanding network across many cities, there’s always plenty of delivery demand. You’ll stay busy with steady work opportunities.',
    },
    {
      title: 'Higher Income',
      description:
        'Boost your earnings by teaming up with the top delivery platform! Consistent tasks and reliable operations help maximize what you take home.',
    },
    {
      title: 'Reliable Payments',
      description:
        'Rest easy knowing your payouts will always be on time. Get unmatched support when you rent or attach your vehicle and driver with Porter.',
    },
  ];

  return (
    <section className="porter-advantage-section">
      <h2 className="section-title">🚛 PORTER ADVANTAGE</h2>
      <div className="advantage-cards">
        {advantages.map((item, index) => (
          <div className="advantage-card" key={index}>
            <h3 className="advantage-title">{item.title}</h3>
            <p className="advantage-description">{item.description}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default PorterAdvantage;
