import React from "react";
import { helpTopics } from "./helpData";
import ChatBot from "./ChatBot";
import "../styles/HelpCenter.css";
import { useNavigate } from "react-router-dom";
import helperImg from "../assets/images/helperImg.png";

const HelpCenter = () => {
  const navigate = useNavigate();

  return (
    <div className="help-center">
      {/* 🔹 Header with Back Button */}
      <div className="help-topbar">
        <button className="help-back-btn" onClick={() => navigate('/home')}>
          ←
        </button>
        <h3>Help Center</h3>
      </div>

      <div className="help-header">
        <div className="help-header-text">
          <h1>How can we help you?</h1>
          <p>Please get in touch and we will be happy to help you.</p>
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
                <h3>{topic.main}</h3>
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
