// src/components/layout/SecondaryNav.js
import React from 'react';
import { Link } from 'react-router-dom';

import hotelIcon from '../../assets/images/header/hotel-food.jpg';
import groceryIcon from '../../assets/images/header/grocery.jpg';
import vegetableIcon from '../../assets/images/header/vegetables.jpg';
import provisionIcon from '../../assets/images/header/provision.jpg';
import medicalIcon from '../../assets/images/header/medical.jpg';
import hotel from '../../assets/images/header/hotel.jpg';
// NEW: add images for bakery & cafe
import bakeryIcon from '../../assets/images/header/bakery.jpg';
import cafeIcon from '../../assets/images/header/cafe.jpg';

import '../../styles/SecondaryNav.css';

const secondaryNavItems = [
  { name: 'Hotels', path: '/shops/hotel', icon: hotelIcon },
  { name: 'Hotels', path: '/shops/hotel-book', icon: hotel },
  { name: 'Groceries', path: '/shops/grocery', icon: groceryIcon },
  { name: 'Vegetables', path: '/shops/vegetable', icon: vegetableIcon },
  { name: 'Provisions', path: '/shops/provision', icon: provisionIcon },
  { name: 'Medical', path: '/shops/medical', icon: medicalIcon },
  { name: 'Bakery', path: '/shops/bakery', icon: bakeryIcon },
  { name: 'Cafe', path: '/shops/cafe', icon: cafeIcon },
];

const SecondaryNav = () => {
  return (
    <div className="mobile-category-bar custom-mobile-nav">
      {secondaryNavItems.map((item, index) => (
        <Link key={index} to={item.path} className="mobile-category-item">
          <img src={item.icon} alt={item.name} className="category-icon-img" />
          <span>{item.name}</span>
        </Link>
      ))}
    </div>
  );
};

export default SecondaryNav;