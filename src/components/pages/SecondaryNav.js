// src/components/layout/SecondaryNav.js
import React from 'react';
import { Link } from 'react-router-dom';

import hotelIcon from '../../assets/images/header/hotel-food.jpg';
import groceryIcon from '../../assets/images/header/grocery.png';
import vegetableIcon from '../../assets/images/header/vegetables.png';
import provisionIcon from '../../assets/images/header/provision.png';
import medicalIcon from '../../assets/images/header/medical.png';

// NEW: add images for bakery & cafe
import bakeryIcon from '../../assets/images/header/bakery.png';
import cafeIcon from '../../assets/images/header/cafe.png';

import '../../styles/SecondaryNav.css';

const secondaryNavItems = [
  { name: { en: "Hotels", kn: "ಹೋಟೆಲ್" }, path: "/shops/hotel", icon: hotelIcon },
  { name: { en: "Groceries", kn: "ಕಿರಾಣಿ ಅಂಗಡಿ" }, path: "/shops/grocery", icon: groceryIcon },
  { name: { en: "Vegetables", kn: "ತರಕಾರಿ ಅಂಗಡಿ" }, path: "/shops/vegetable", icon: vegetableIcon },
  { name: { en: "Provisions", kn: "ಚಿಲ್ಲರೆ ಅಂಗಡಿ" }, path: "/shops/provision", icon: provisionIcon },
  { name: { en: "Medical-Store", kn: "ಔಷಧಿ ಅಂಗಡಿ" }, path: "/shops/medical", icon: medicalIcon },
  { name: { en: "Bakery", kn: "ಬೇಕರಿ" }, path: "/shops/bakery", icon: bakeryIcon },
  { name: { en: "Cafe", kn: "ಕಫೆ" }, path: "/shops/cafe", icon: cafeIcon },
];


const SecondaryNav = () => {
  return (
    <>
      <div className="mobile-category-bar custom-mobile-nav">
        {secondaryNavItems.map((item) => (
          <Link to={item.path} className="mobile-category-item" key={item.path}>
            <img src={item.icon} className="category-icon-img" />
            <span>
              {item.name.en}
              <br />
              <small>{item.name.kn}</small>
            </span>
          </Link>
        ))}

      </div>
      <div className="delivery-text">
        <p>City to City. Door-to-Door Delivery.</p>
      </div>
    </>

  );
};

export default SecondaryNav;