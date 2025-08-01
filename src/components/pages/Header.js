// src/components/layout/Header.js

import React from 'react';
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

const Header = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleProfileClick = () => {
    navigate('/profile');
  };

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
          </nav>

          {user && (
            <button className="profile-icon" onClick={handleProfileClick}>
              <FaUserCircle size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Mobile Bottom Nav */}
      <div className="mobile-bottom-nav">
        <Link to="/home" className="mobile-nav-link">
          <FaHome className="mobile-nav-icon" />
          <span>Home</span>
        </Link>
        <Link to="/enterprise" className="mobile-nav-link">
          <FaBuilding className="mobile-nav-icon" />
          <span>Enterprise</span>
        </Link>
        <Link to="/partners" className="mobile-nav-link">
          <FaTruck className="mobile-nav-icon" />
          <span>Partners</span>
        </Link>
        <Link to="/shipment" className="mobile-nav-link">
          <FaBoxes className="mobile-nav-icon" />
          <span>Shipment</span>
        </Link>
        <Link to="/orders" className="mobile-nav-link">
          <FaShoppingCart className="mobile-nav-icon" />
          <span>Orders</span>
        </Link>
        {user && (
          <button className="mobile-nav-link" onClick={handleProfileClick}>
            <FaUserCircle className="mobile-nav-icon" />
            <span>Profile</span>
          </button>
        )}
      </div>
    </>
  );
};

export default Header;
