// src/components/layout/Header.js

import React from 'react';
import { useEffect } from 'react';
import {
  FaUserCircle,
  FaHome,
  FaBuilding,
  FaTruck,
  FaBoxes,
  FaShoppingCart
} from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

import logo from '../../assets/images/logo.jpg';
import { useAuth } from '../../context/AuthContext';
import { useLocation } from 'react-router-dom';
const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const handleProfileClick = () => {
    navigate('/profile');
  };
useEffect(() => {
  const activeLink = document.querySelector(".mobile-nav-link.active");
  if (activeLink) {
    const navBar = document.querySelector(".mobile-bottom-nav");
    const activePos = activeLink.offsetLeft + activeLink.offsetWidth / 2 - 35; // center bubble
    navBar.style.setProperty("--active-position", `${activePos}px`);
  }
}, [location.pathname]);
  return (
    <>
      {/* Top Strip */}
      <div className="top-strip">
        <h1>Mokshambani Tech Services PVT LTD</h1>
      </div>

      {/* Secondary Navigation Component */}


      {/* Desktop Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="Company Logo" />
          </div>

          <nav className="nav-links">
            <Link to="/home">Home</Link>
            <Link to="/enterprise">Enterprise</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/shipment">Shipment</Link>
            <Link to="/orders">Orders</Link>
            {user && (
              <button className="profile-icon" onClick={handleProfileClick}>
                <FaUserCircle size={24} />
              </button>
            )}
          </nav>


        </div>
      </header>

      {/* Mobile Bottom Nav */}
      {/* Mobile Bottom Nav */}
      {/* Mobile Bottom Nav */}
      <div className="mobile-bottom-nav">
        <Link
          to="/home"
          className={`mobile-nav-link ${location.pathname === '/home' ? 'active' : ''}`}
        >
          <FaHome className="mobile-nav-icon" />
          <span>Home</span>
        </Link>
        <Link
          to="/enterprise"
          className={`mobile-nav-link ${location.pathname === '/enterprise' ? 'active' : ''}`}
        >
          <FaBuilding className="mobile-nav-icon" />
          <span>Enterprise</span>
        </Link>
        <Link
          to="/partners"
          className={`mobile-nav-link ${location.pathname === '/partners' ? 'active' : ''}`}
        >
          <FaTruck className="mobile-nav-icon" />
          <span>Partners</span>
        </Link>
        <Link
          to="/shipment"
          className={`mobile-nav-link ${location.pathname === '/shipment' ? 'active' : ''}`}
        >
          <FaBoxes className="mobile-nav-icon" />
          <span>Shipment</span>
        </Link>
        <Link
          to="/orders"
          className={`mobile-nav-link ${location.pathname === '/orders' ? 'active' : ''}`}
        >
          <FaShoppingCart className="mobile-nav-icon" />
          <span>Orders</span>
        </Link>
        {user && (
          <button
            className={`mobile-nav-link ${location.pathname === '/profile' ? 'active' : ''}`}
            onClick={handleProfileClick}
          >
            <FaUserCircle className="mobile-nav-icon" />
            <span>Profile</span>
          </button>
        )}
      </div>
    </>
  );
};

export default Header;
