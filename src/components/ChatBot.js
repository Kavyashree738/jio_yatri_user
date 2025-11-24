// src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/HelpCenter.css";
import { useNavigate, useParams } from "react-router-dom";
import { helpTopics } from "./helpData";
import { useTranslation } from "react-i18next";

const ChatBot = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { t } = useTranslation();

  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const topic = helpTopics.find((tpc) => tpc.id === parseInt(id, 10));

  const [messages, setMessages] = useState([
    { from: "system", title: "hello_bot", subtitle: "help_greet" },
  ]);
  const [asked, setAsked] = useState(false);

  const ask = (qKey, aKey) => {
    setAsked(true);
    setMessages((m) => [
      ...m,
      { from: "user", text: t(qKey) },
      { from: "bot", text: t(aKey) },
    ]);
  };

  // Scroll to bottom when messages update
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="cbp-page">
      {/* 🔹 Header */}
      <div className="cbp-header">
        <div className="cbp-brand">
          <div className="cbp-logo">JY</div>
          <div>
            <div className="cbp-hello">{t("hello_bot")}</div>
            <div className="cbp-sub">{t("help_greet")}</div>
          </div>
        </div>

        <button
          className="cbp-close"
          onClick={() => navigate("/help")}
        >
          ✕
        </button>
      </div>

      {/* 🔹 Chat */}
      <div className="cbp-thread" ref={scrollRef}>
        
        {/* USER BUBBLE */}
        {asked && (
          <div className="cbp-row cbp-right">
            <div className="cbp-bubble cbp-user">
              {messages.filter((x) => x.from === "user").slice(-1)[0]?.text}
            </div>
          </div>
        )}

        {/* BOT OPTION CARDS */}
        <div className="cbp-row">
          <div className="cbp-card">
            {(topic?.related || []).map((item, i) => (
              <button
                key={i}
                className="cbp-option"
                onClick={() => ask(item.q, item.a)}
              >
                {t(item.q)}
              </button>
            ))}

            <button className="cbp-option ghost" onClick={() => navigate("/help")}>
              {t("help_other")}
            </button>

            <button className="cbp-option ghost" onClick={() => navigate("/help")}>
              {t("help_end_chat")}
            </button>
          </div>
        </div>

        {/* BOT RESPONSE */}
        {asked && (
          <div className="cbp-row">
            <div className="cbp-avatar">JY</div>
            <div className="cbp-bubble cbp-bot">
              {messages.filter((x) => x.from === "bot").slice(-1)[0]?.text}
            </div>
          </div>
        )}

        {/* Scroll anchor */}
        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
};

export default ChatBot;
