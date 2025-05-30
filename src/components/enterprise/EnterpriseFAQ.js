import React from 'react';
import { Link } from 'react-router-dom';
import '../../styles/enterprise/EnterpriseFAQ.css';

export default function EnterpriseFAQ() {
  return (
    <div className="enterprise-faq">
      <div className="faq-icon">
        <img
          src="https://dom-website-prod-cdn-cms.porter.in/faq_icon_4a391321b6.svg"
          alt="FAQ Icon"
        />
      </div>
      <div className="faq-text">
        <h3>Have questions about our Enterprise Services?</h3>
        <Link to="/faq" className="read-faq-link">
          READ OUR FAQs →
        </Link>
      </div>
    </div>
  );
}
