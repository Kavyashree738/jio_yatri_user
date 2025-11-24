import React from "react";
import { helpTopics } from "./helpData";
import ChatBot from "./ChatBot";
import "../styles/HelpCenter.css";
import { useNavigate } from "react-router-dom";
import helperImg from "../assets/images/helperImg.png";
import { useTranslation } from "react-i18next";

const HelpCenter = () => {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <div className="help-center">
      {/* 🔹 Header with Back Button */}
      <div className="help-topbar">
        <button className="help-back-btn" onClick={() => navigate('/home')}>
          ←
        </button>
        <h3>{t("help_center_title")}</h3>
      </div>

      <div className="help-header">
        <div className="help-header-text">
          <h1>{t("help_center_heading")}</h1>
          <p>{t("help_center_subtext")}</p>
        </div>
        <img src={helperImg} alt="Helper" />
      </div>

      <div className="help-buttons">
        {helpTopics.map((topic) => (
          <div
            key={topic.id}
            className="help-card"
            onClick={() => navigate(`/chat/${topic.id}`)}
          >
            <div className="help-card-left">
              <div className="help-icon">💬</div>
              <div className="help-text">
                <h3>{t(topic.main)}</h3>
              </div>
            </div>
            <div className="help-arrow">›</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HelpCenter;
