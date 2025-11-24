// src/components/layout/Header.js

import React, { useEffect, useState } from "react";
import {
  FaUserCircle,
  FaHome,
  FaBoxes,
  FaShoppingCart,
  FaBars,
  FaWallet,
  FaGift,
  FaQuestionCircle,
  FaChevronRight,
  FaSignOutAlt,
} from "react-icons/fa";
import { LuPackage2 } from "react-icons/lu";


import { Link, useNavigate, useLocation } from "react-router-dom";
import logo from "../../assets/images/logo.jpg";
import { useAuth } from "../../context/AuthContext";
import { signOut } from "firebase/auth";
import { auth } from "../../firebase";
import { useTranslation } from "react-i18next";

const Header = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);

  // Detect provider
  const provider = user?.providerData?.[0]?.providerId;
  const isGoogleLogin = provider === "google.com";

  // Save Google details
  useEffect(() => {
    if (user && isGoogleLogin) {
      if (user.photoURL) localStorage.setItem("googlePhoto", user.photoURL);
      if (user.displayName) localStorage.setItem("googleName", user.displayName);
      if (user.email) localStorage.setItem("googleEmail", user.email);
    }
  }, [user]);

  const googlePhoto = localStorage.getItem("googlePhoto");
  const googleName = localStorage.getItem("googleName");
  const googleEmail = localStorage.getItem("googleEmail");

  const dbPhoto = localStorage.getItem("dbPhoto");
  const dbName = localStorage.getItem("dbName");
  const dbEmail = localStorage.getItem("dbEmail");

  // Final profile priority
  const profilePhoto = dbPhoto || user?.photoURL || googlePhoto || null;
  const profileName = dbName || user?.displayName || googleName || user?.phoneNumber || "User";
  const profileEmail = dbEmail || user?.email || googleEmail || "";

  const handleProfileClick = () => navigate("/profile");

  // Mobile nav highlight
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

        {/* 🌍 Language Switch */}
        {/* <button onClick={() => {
          i18n.changeLanguage("en");
          document.documentElement.setAttribute("lang", "en");
        }}>EN</button>

        <button onClick={() => {
          i18n.changeLanguage("hi");
          document.documentElement.setAttribute("lang", "hi");
        }}>हिंदी</button>

        <button onClick={() => {
          i18n.changeLanguage("kn");
          document.documentElement.setAttribute("lang", "kn");
        }}>ಕನ್ನಡ</button>

        <button onClick={() => {
          i18n.changeLanguage("te");
          document.documentElement.setAttribute("lang", "te");
        }}>తెలుగు</button> */}


        {user && (
          <div className="hamburger-menu" onClick={() => setSidebarOpen(true)}>
            <FaBars size={23} />
          </div>
        )}

        <h1>{t("header_company_name")}</h1>
      </div>

      {/* 🟢 Desktop Header */}
      <header className="main-header">
        <div className="header-container">
          <div className="logo">
            <img src={logo} alt="Company Logo" />
          </div>

          <nav className="nav-links">
            <Link to="/home">{t("header_home")}</Link>
            <Link to="/orders">{t("header_orders")}</Link>
            <Link to="/shipment">{t("header_shipments")}</Link>

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

          <FaChevronRight className="arrow-icon" onClick={handleProfileClick} />
        </div>

        {/* Sidebar Links */}
        <div className="sidebar-links">
          <Link to="/my-shipments" onClick={() => setSidebarOpen(false)}>
            <LuPackage2 /> {t("header_parcel_orders")}
          </Link>

          <Link to="/my-orders" onClick={() => setSidebarOpen(false)}>
            <LuPackage2 /> {t("header_shop_orders")}
          </Link>

          <Link to="/wallet" onClick={() => setSidebarOpen(false)}>
            <FaWallet /> {t("header_wallet")}
          </Link>

          <Link to="/refferal" onClick={() => setSidebarOpen(false)}>
            <FaGift /> {t("header_refer")}
          </Link>

          <Link to="/help" onClick={() => setSidebarOpen(false)}>
            <FaQuestionCircle /> {t("header_help")}
          </Link>

          <button className="logout-btn" onClick={() => setShowLogoutPopup(true)}>
            <FaSignOutAlt /> {t("header_logout")}
          </button>
        </div>
      </div>

      {/* 🟣 Mobile Bottom Navigation (KEPT) */}
      <div className="mobile-bottom-nav">
        <Link
          to="/home"
          className={`mobile-nav-link ${location.pathname === "/home" ? "active" : ""}`}
        >
          <FaHome className="mobile-nav-icon" />
          <span>{t("header_home")}</span>
        </Link>

        <Link
          to="/orders"
          className={`mobile-nav-link ${location.pathname === "/orders" ? "active" : ""}`}
        >
          <FaShoppingCart className="mobile-nav-icon" />
          <span>{t("header_orders")}</span>
        </Link>

        <Link
          to="/shipment"
          className={`mobile-nav-link ${location.pathname === "/shipment" ? "active" : ""}`}
        >
          <FaBoxes className="mobile-nav-icon" />
          <span>{t("header_shipments")}</span>
        </Link>

        {user && (
          <button
            className={`mobile-nav-link ${location.pathname === "/profile" ? "active" : ""}`}
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
            <span>{t("header_profile")}</span>
          </button>
        )}
      </div>

      {/* 🔴 Logout Popup */}
      {showLogoutPopup && (
        <div className="logout-overlay">
          <div className="logout-modal">
            <h3>{t("header_logout_title")}</h3>
            <p>{t("header_logout_info")}</p>

            <div className="logout-actions">
              <button className="cancelButton" onClick={() => setShowLogoutPopup(false)}>
                {t("header_logout_cancel")}
              </button>

              <button
                className="confirmButton"
                onClick={async () => {
                  await signOut(auth);
                  localStorage.clear();
                  logout();
                  setShowLogoutPopup(false);
                  setSidebarOpen(false);
                  navigate("/home");
                }}
              >
                {t("header_logout_confirm")}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
