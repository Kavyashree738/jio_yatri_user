import React, { useEffect, useState } from "react";
import { FaArrowLeft } from "react-icons/fa";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../../styles/wallet.css";
import { useAuth } from "../../context/AuthContext";

// 👉 Import Lottie animation
import Lottie from "lottie-react";
import referAnimation from "../../assets/animations/refer.json";

const WalletPage = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState([]);

  const uid = user?.uid;

  useEffect(() => {
    if (uid) {
      console.log("🔹 UID Available:", uid);
      fetchWalletData();
    } else {
      // console.log("❌ UID is NULL — user not logged in yet");
    }
  }, [uid]);

  const fetchWalletData = async () => {
    try {
      const apiUrl = `https://jio-yatri-user.onrender.com/api/users/${uid}/referral-stats`;
      // console.log("📡 Fetching Wallet From:", apiUrl);

      const res = await axios.get(apiUrl);

      // console.log("🟢 Referral Stats Response:", res.data);

      setBalance(res.data.totalEarnings);
      setHistory(res.data.rewards);

    } catch (err) {
      // console.log("🔴 Wallet fetch error:", err);
      if (err.response) {
        // console.log("❗ Backend Error:", err.response.data);
      }
    }
  };

  return (
    <div className="wallet-container">
      <div className="wallet-header">
        <FaArrowLeft size={22} onClick={() => navigate("/home")} />
        <h2>Wallet</h2>

        <span
          className="wallet-history"
          onClick={() => navigate("/wallet-history")}
        >
          History
        </span>
      </div>

      <div className="balance-card">
        <p className="balance-label">Balance</p>
        <h1 className="balance-amount">₹{balance.toFixed(2)}</h1>
      </div>

      {/* 🎉 LOTTIE ANIMATION BELOW BALANCE */}
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
