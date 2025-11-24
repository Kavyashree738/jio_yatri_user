import React, { useState, useRef, useEffect } from "react";
import { FaPhone } from "react-icons/fa";
import "../../styles/HelplineButton.css";
import { useTranslation } from "react-i18next";

const HelplineButton = () => {
  const [showPopup, setShowPopup] = useState(false);
  const { t } = useTranslation();
  const helplineNumber = "+919844559599";

  const [position, setPosition] = useState({
    x: 20,
    y: window.innerHeight - 100,
  });

  const [isDragging, setIsDragging] = useState(false);
  const offset = useRef({ x: 0, y: 0 });

  // 🖱 Mouse Events
  const handleMouseDown = (e) => {
    e.preventDefault();
    setIsDragging(true);
    offset.current = {
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    };
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();

    const newX = e.clientX - offset.current.x;
    const newY = e.clientY - offset.current.y;

    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // 📱 Touch Events (for mobile)
  const handleTouchStart = (e) => {
    const touch = e.touches[0];
    setIsDragging(true);
    offset.current = {
      x: touch.clientX - position.x,
      y: touch.clientY - position.y,
    };
  };

  const handleTouchMove = (e) => {
    if (!isDragging) return;
    const touch = e.touches[0];
    const newX = touch.clientX - offset.current.x;
    const newY = touch.clientY - offset.current.y;

    const maxX = window.innerWidth - 60;
    const maxY = window.innerHeight - 60;

    setPosition({
      x: Math.max(0, Math.min(newX, maxX)),
      y: Math.max(0, Math.min(newY, maxY)),
    });
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
  };

  // ✅ Attach global listeners once
  useEffect(() => {
    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseup", handleMouseUp);
    window.addEventListener("touchmove", handleTouchMove);
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
    };
  });

  return (
    <>
      {/* Floating Call Button */}
      <div
        className="helpline-floating-btn"
        style={{
          position: "fixed",
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 3000,
          cursor: isDragging ? "grabbing" : "grab",
          touchAction: "none", // ✅ prevent scroll interference
        }}
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onClick={() => !isDragging && setShowPopup(true)} // only open popup if not dragging
      >
        <FaPhone className="helpline-icon" />
      </div>

      {/* Popup */}
      {showPopup && (
        <div
          className="helpline-popup-overlay"
          onClick={() => setShowPopup(false)}
        >
          <div
            className="helpline-popup-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              className="helpline-close-btn"
              onClick={() => setShowPopup(false)}
            >
              ✕
            </button>

            <div className="call-icon-button">
              <FaPhone className="call-icon" />
            </div>

            <h3>{t("header_company_name")}</h3>
            <p>{t("help_need_assistance")}</p>
            <a href={`tel:${helplineNumber}`} className="helpline-callnow-btn">
              {t("help_call_now")}
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default HelplineButton;
