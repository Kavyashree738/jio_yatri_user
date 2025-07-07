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
      {/* Top Strip - Visible on all screens */}
      <div className="top-strip">
        <h1>Mokshambani Tech Services PVT LTD</h1>
      </div>

      {/* Desktop Header - Hidden on mobile */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="Company Logo" />
          </div>

          <nav className="nav-links">
            <Link to="/">Home</Link>
            <Link to="/enterprise">Enterprise</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/shipment">Shipment</Link>
            <Link to="/orders">Orders</Link>
          </nav>

          {/* Profile Icon - Desktop Only */}
          {user && (
            <button className="profile-icon" onClick={handleProfileClick}>
              <FaUserCircle size={24} />
            </button>
          )}
        </div>
      </header>

      {/* Bottom Nav for Mobile - Only visible on mobile */}
      <div className="mobile-bottom-nav">
        <Link to="/" className="mobile-nav-link">
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
