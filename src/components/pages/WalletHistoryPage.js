import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/wallet-history.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";
import { useTranslation } from "react-i18next";

const WalletHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();  // 🔥 FIXED
  const { t } = useTranslation();

  const [history, setHistory] = useState([]);
  const uid = user?.uid;

  useEffect(() => {
    if (uid) fetchReferralHistory();
  }, [uid]);

  const fetchReferralHistory = async () => {
    try {
      const apiUrl = `https://jio-yatri-user.onrender.com/api/users/${uid}/referral-stats`;
      const res = await axios.get(apiUrl);
      setHistory(res.data.rewards);
    } catch (err) {
      console.log("❌ Error:", err.response?.data);
    }
  };

  return (
    <div className="wallet-history-container">
      
      {/* 🔹 Header */}
      <div className="wallet-header">
        <FaArrowLeft size={22} onClick={() => navigate(-1)} />
        <h2>{t("wallet_history")}</h2> {/* 🔥 MULTI-LANGUAGE */}
      </div>

      {/* 🔹 Empty State */}
      {history.length === 0 ? (
        <p className="empty-text">{t("wallet_no_data")}</p>
      ) : (
        history.map((item, i) => (
          <div className="history-item" key={i}>
            <div>
              <p className="history-title">{item.description}</p>
              <p className="history-date">
                {new Date(item.createdAt).toLocaleString()}
              </p>
            </div>

            <p className="history-amount">+₹{item.amount}</p>
          </div>
        ))
      )}
    </div>
  );
};

export default WalletHistoryPage;
