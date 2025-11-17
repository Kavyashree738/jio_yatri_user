import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import "../../styles/wallet-history.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../../context/AuthContext";

const WalletHistoryPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth(); // 🔥 Get Firebase user
  const [history, setHistory] = useState([]);

  const uid = user?.uid;

  useEffect(() => {
    if (uid) {
      fetchReferralHistory();
    }
  }, [uid]);

  const fetchReferralHistory = async () => {
    try {
      const apiUrl = `https://jio-yatri-user.onrender.com/api/users/${uid}/referral-stats`;
      // console.log("📡 Fetching Referral History From:", apiUrl);

      const res = await axios.get(apiUrl);

      // console.log("🟢 Referral History API Response:", res.data);

      setHistory(res.data.rewards); // REAL backend referral rewards

    } catch (err) {
      // console.log("🔴 Referral history fetch error:", err);
      if (err.response) console.log("❗ Backend Error:", err.response.data);
    }
  };

  return (
    <div className="wallet-history-container">
      
      <div className="wallet-header">
        <FaArrowLeft size={22} onClick={() => navigate(-1)} />
        <h2>History</h2>
      </div>

      {history.length === 0 ? (
        <p className="empty-text">No referral transactions yet.</p>
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
