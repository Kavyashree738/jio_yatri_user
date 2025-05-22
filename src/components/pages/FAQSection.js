import React, { useState } from 'react';
import '../../styles/FAQSection.css';

const faqData = [
  {
    question: "What services does your courier platform offer?",
    answer: "We offer door-to-door delivery, parcel tracking, and real-time updates across 21+ cities."
  },
  {
    question: "How do I book a pickup service?",
    answer: "You can book through our website or app by entering pickup and delivery details and choosing your preferred time slot."
  },
  {
    question: "What items can I send?",
    answer: "You can send documents, small packages up to 20kg, food items, forgotten items, and more."
  },
  {
    question: "Do you offer same-day delivery?",
    answer: "Yes, same-day delivery is available for most city deliveries depending on the time of booking."
  },
];

const FAQSection = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(index === openIndex ? null : index);
  };

  return (
    <section className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqData.map((faq, index) => (
          <div key={index} className="faq-item">
            <div
              className="faq-question"
              onClick={() => toggleFAQ(index)}
            >
              {faq.question}
              <span>{openIndex === index ? "−" : "+"}</span>
            </div>
            {openIndex === index && (
              <div className="faq-answer">
                {faq.answer}
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQSection;
