// src/components/layout/SecondaryNav.js
import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from "react-i18next";

import hotelIcon from '../../assets/images/header/hotel-food.jpg';
import groceryIcon from '../../assets/images/header/grocery.png';
import vegetableIcon from '../../assets/images/header/vegetables.png';
import provisionIcon from '../../assets/images/header/provision.png';
import medicalIcon from '../../assets/images/header/medical.png';
import bakeryIcon from '../../assets/images/header/bakery.png';
import cafeIcon from '../../assets/images/header/cafe.png';

import '../../styles/SecondaryNav.css';

const secondaryNavItems = [
  { key: "category_hotels", path: "/shops/hotel", icon: hotelIcon },
  { key: "category_groceries", path: "/shops/grocery", icon: groceryIcon },
  { key: "category_vegetables", path: "/shops/vegetable", icon: vegetableIcon },
  { key: "category_provisions", path: "/shops/provision", icon: provisionIcon },
  { key: "category_medical", path: "/shops/medical", icon: medicalIcon },
  { key: "category_bakery", path: "/shops/bakery", icon: bakeryIcon },
  { key: "category_cafe", path: "/shops/cafe", icon: cafeIcon },
];

const SecondaryNav = () => {
  const { t } = useTranslation();

  return (
    <>
      {/* Top Category Bar */}
      <div className="mobile-category-bar custom-mobile-nav">
        {secondaryNavItems.map((item) => (
          <Link to={item.path} className="mobile-category-item" key={item.path}>
            <img src={item.icon} className="category-icon-img" alt={t(item.key)} />
            <span>{t(item.key)}</span>
          </Link>
        ))}
      </div>

      {/* Below Text */}
      <div className="delivery-text">
        <p>{t("city_to_city_delivery")}</p>
      </div>
    </>
  );
};

export default SecondaryNav;
