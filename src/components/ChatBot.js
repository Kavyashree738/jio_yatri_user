// src/components/ChatBot.jsx
import React, { useState, useRef, useEffect } from "react";
import "../styles/HelpCenter.css";
import { useNavigate, useParams } from "react-router-dom";
import { helpTopics } from "./helpData";

const ChatBot = () => {
  const navigate = useNavigate();
  const { id } = useParams();

  const scrollRef = useRef(null);
  const messagesEndRef = useRef(null);

  const topic = helpTopics.find((t) => t.id === parseInt(id, 10));

  const [messages, setMessages] = useState([
    { from: "system", title: "Hello", subtitle: "How can I help you?" },
  ]);
  const [asked, setAsked] = useState(false);

  const ask = (q, a) => {
    setAsked(true);
    setMessages((m) => [
      ...m,
      { from: "user", text: q },
      { from: "bot", text: a },
    ]);
  };

  // Smooth scroll to bottom whenever messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  return (
    <div className="cbp-page">
      {/* Header */}
      <div className="cbp-header">
        <div className="cbp-brand">
          <div className="cbp-logo">JY</div>
          <div>
            <div className="cbp-hello">Hello</div>
            <div className="cbp-sub">How can I help you?</div>
          </div>
        </div>
        <button
          className="cbp-close"
          onClick={() => navigate("/help")}
          aria-label="Close"
        >
          ✕
        </button>
      </div>

      {/* Chat area */}
      <div className="cbp-thread" ref={scrollRef}>
        {/* User bubble (after user clicks something) */}
        {asked && (
          <div className="cbp-row cbp-right">
            <div className="cbp-bubble cbp-user">
              {messages
                .filter((x) => x.from === "user")
                .slice(-1)[0]?.text}
            </div>
          </div>
        )}

        {/* Bot options card */}
        <div className="cbp-row">
          <div className="cbp-card">
            {(topic?.related || []).map((item, i) => (
              <button
                key={i}
                className="cbp-option"
                onClick={() => ask(item.q, item.a)}
              >
                {item.q}
              </button>
            ))}

            <button
              className="cbp-option ghost"
              onClick={() => navigate("/help")}
            >
              Need help with something else?
            </button>

            <button
              className="cbp-option ghost"
              onClick={() => navigate("/help")}
            >
              End Chat
            </button>
          </div>
        </div>

        {/* Bot answer bubble */}
        {asked && (
          <div className="cbp-row">
            <div className="cbp-avatar">JY</div>
            <div className="cbp-bubble cbp-bot">
              {messages
                .filter((x) => x.from === "bot")
                .slice(-1)[0]?.text}
            </div>
          </div>
        )}

        {/* Smooth scroll anchor */}
        <div ref={messagesEndRef}></div>
      </div>
    </div>
  );
};

export default ChatBot;
