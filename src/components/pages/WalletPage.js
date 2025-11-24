import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/wallet.css";
import { useAuth } from "../../context/AuthContext";

// Lottie Animation
import Lottie from "lottie-react";
import referAnimation from "../../assets/animations/refer.json";

// 🔥 Multi-language support
import { useTranslation } from "react-i18next";

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  const uid = user?.uid;

  useEffect(() => {
    if (uid) fetchWalletData();
  }, [uid]);

  const fetchWalletData = async () => {
    try {
      const apiUrl = `https://jio-yatri-user.onrender.com/api/users/${uid}/referral-stats`;
      const res = await axios.get(apiUrl);

      setBalance(res.data.totalEarnings);
      setHistory(res.data.rewards);

    } catch (err) {
      console.log("Wallet Error:", err);
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <FaArrowLeft size={22} onClick={() => navigate("/home")} />
        <h2>{t("wallet_title")}</h2>

        <span
          className="wallet-history"
          onClick={() => navigate("/wallet-history")}
        >
          {t("wallet_history")}
        </span>
      </div>

      <div className="balance-card">
        <p className="balance-label">{t("wallet_balance")}</p>
        <h1 className="balance-amount">₹{balance.toFixed(2)}</h1>
      </div>

      {/* Lottie Animation */}
      <div className="wallet-lottie-wrapper">
        <Lottie
          animationData={referAnimation}
          loop={true}
          autoPlay={true}
          className="wallet-lottie"
        />
      </div>

    </div>
  );
};

export default WalletPage;
