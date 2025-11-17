// src/components/layout/Header.js

import React, { useEffect, useState, useMemo } from "react";
import {
  FaUserCircle,
  FaHome,
  FaBuilding,
  FaTruck,
  FaBoxes,
  FaShoppingCart,
  FaBars,
  FaWallet,
  FaGift,
  FaQuestionCircle,
  FaCog,
  FaChevronRight,
  FaSignOutAlt,
  FaFileAlt,
  FaShieldAlt
} from "react-icons/fa";

import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import { useAuth } from "../../context/AuthContext";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // 🔥 Detect login type
  const provider = user?.providerData?.[0]?.providerId;

  const isPhoneLogin = provider === "phone";       // OTP login
  const isGoogleLogin = provider === "google.com"; // Google login

  // ⬇️ Save Google data ONLY for Google login
  useEffect(() => {
    if (user) {
      if (isGoogleLogin) {
        if (user.photoURL) localStorage.setItem("googlePhoto", user.photoURL);
        if (user.displayName) localStorage.setItem("googleName", user.displayName);
        if (user.email) localStorage.setItem("googleEmail", user.email);
      }
    }
  }, [user, isGoogleLogin]);

  // Read saved Google details (optional)
// Read saved Google details
const googlePhoto = localStorage.getItem("googlePhoto");
const googleName = localStorage.getItem("googleName");
const googleEmail = localStorage.getItem("googleEmail");

// ⭐ Read DB details
const dbPhoto = localStorage.getItem("dbPhoto");
const dbName = localStorage.getItem("dbName");
const dbEmail = localStorage.getItem("dbEmail");

// ⭐ Updated profile photo priority
const profilePhoto =
  dbPhoto ||            // always show DB updated photo first
  user?.photoURL ||     // firebase/google
  googlePhoto ||        // stored google
  null;

// ⭐ Updated name + email priority
const profileName =
  dbName ||
  user?.displayName ||
  googleName ||
  user?.phoneNumber ||
  "User";

const profileEmail =
  dbEmail ||
  user?.email ||
  googleEmail ||
  "";


  const handleProfileClick = () => navigate("/profile");

  // Mobile nav active highlight
  useEffect(() => {
    const activeLink = document.querySelector(".mobile-nav-link.active");
    if (activeLink) {
      const navBar = document.querySelector(".mobile-bottom-nav");
      const activePos =
        activeLink.offsetLeft + activeLink.offsetWidth / 2 - 35;
      navBar.style.setProperty("--active-position", `${activePos}px`);
    }
  }, [location.pathname]);

  return (
    <>
      {/* 🔵 Top Strip */}
      <div className="top-strip">
        <div className="hamburger-menu" onClick={() => setSidebarOpen(true)}>
          <FaBars size={23} />
        </div>
        <h1>Mokshambani Tech Services PVT LTD</h1>
      </div>

      {/* 🟢 Desktop Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="Company Logo" />
          </div>

          <nav className="nav-links">
            <Link to="/home">Home</Link>
            {/* <Link to="/enterprise">Enterprise</Link>
            <Link to="/partners">Partners</Link>
            <Link to="/shipment">Shipment</Link>
            <Link to="/orders">Orders</Link> */}

            {user && (
              <button className="profile-icon" onClick={handleProfileClick}>
                {profilePhoto ? (
                  <img
                    src={profilePhoto}
                    alt="Profile"
                    referrerPolicy="no-referrer"
                    className="profile-photo-small"
                  />
                ) : (
                  <FaUserCircle size={24} />
                )}
              </button>
            )}
          </nav>
        </div>
      </header>

      {/* 🔥 Sidebar Overlay */}
      <div
        className={`sidebar-overlay ${sidebarOpen ? "show" : ""}`}
        onClick={() => setSidebarOpen(false)}
      ></div>

      {/* 🔥 Sidebar Drawer */}
      <div className={`sidebar-drawer ${sidebarOpen ? "open" : ""}`}>
        {/* Sidebar Header */}
        <div className="sidebar-header">
          {profilePhoto ? (
            <img
              src={profilePhoto}
              referrerPolicy="no-referrer"
              className="sidebar-profile-photo"
              alt="User"
            />
          ) : (
            <FaUserCircle size={40} />
          )}

          <div className="sidebar-user-details">
            <span className="user-name">{profileName}</span>
            <span className="user-email">{profileEmail}</span>
          </div>

          <FaChevronRight
            className="arrow-icon"
            onClick={() => navigate("/profile")}
            style={{ cursor: "pointer" }}
          />
        </div>

        {/* Sidebar Links */}
        <div className="sidebar-links">
          <Link to="/my-shipments" onClick={() => setSidebarOpen(false)}>
            <FaBoxes /> Parcel-Orders
          </Link>

          <Link to="/my-orders" onClick={() => setSidebarOpen(false)}>
            <FaBoxes /> Shops-Orders
          </Link>

          <Link to="/wallet" onClick={() => setSidebarOpen(false)}>
            <FaWallet /> Wallet
          </Link>

          <Link to="/refferal" onClick={() => setSidebarOpen(false)}>
            <FaGift /> Refer a Friend
          </Link>

          <Link to="/help" onClick={() => setSidebarOpen(false)}>
            <FaQuestionCircle /> Help Center
          </Link>

          {/* <Link to="/terms-and-condition" onClick={() => setSidebarOpen(false)}>
            <FaFileAlt /> Terms & Conditions
          </Link>

          <Link to="/privacy-policy" onClick={() => setSidebarOpen(false)}>
            <FaShieldAlt /> Privacy Policy
          </Link> */}



          {/* 🔴 Logout */}
          <button className="logout-btn" onClick={() => setShowLogoutPopup(true)}>
            <FaSignOutAlt /> Logout
          </button>
        </div>
      </div>

      {/* 🟣 Mobile Bottom Navigation */}
      <div className="mobile-bottom-nav">
        <Link
          to="/home"
          className={`mobile-nav-link ${location.pathname === "/home" ? "active" : ""}`}
        >
          <FaHome className="mobile-nav-icon" />
          <span>Home</span>
        </Link>

        {/* <Link
          to="/enterprise"
          className={`mobile-nav-link ${location.pathname === "/enterprise" ? "active" : ""
            }`}
        >
          <FaBuilding className="mobile-nav-icon" />
          <span>Enterprise</span>
        </Link> */}

        {/* <Link
          to="/partners"
          className={`mobile-nav-link ${location.pathname === "/partners" ? "active" : ""
            }`}
        >
          <FaTruck className="mobile-nav-icon" />
          <span>Partners</span>
        </Link> */}

       

        <Link
          to="/orders"
          className={`mobile-nav-link ${location.pathname === "/orders" ? "active" : ""
            }`}
        >
          <FaShoppingCart className="mobile-nav-icon" />
          <span>Orders</span>
        </Link>

         <Link
          to="/shipment"
          className={`mobile-nav-link ${location.pathname === "/shipment" ? "active" : ""
            }`}
        >
          <FaBoxes className="mobile-nav-icon" />
          <span>Shipment</span>
        </Link>

        {user && (
          <button
            className={`mobile-nav-link ${location.pathname === "/profile" ? "active" : ""
              }`}
            onClick={handleProfileClick}
          >
            {profilePhoto ? (
              <img
                src={profilePhoto}
                referrerPolicy="no-referrer"
                className="profile-photo-small"
                alt="User"
              />
            ) : (
              <FaUserCircle className="mobile-nav-icon" />
            )}
            <span>Profile</span>
          </button>
        )}
      </div>

      {/* 🔴 Logout Popup Modal */}
      {showLogoutPopup && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <h3>Logout?</h3>
            <p>Your details will not be deleted. You can log in anytime.</p>

            <div className="logout-actions">
              <button
                className="cancelButton"
                onClick={() => setShowLogoutPopup(false)}
              >
                Cancel
              </button>

              <button
                className="confirmButton"
               onClick={async () => {
  localStorage.clear();
  await logout();        // ⬅️ wait for auth to update
  setShowLogoutPopup(false);
  setSidebarOpen(false); // ⬅️ close sidebar manually
  navigate("/home");
}}

              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
