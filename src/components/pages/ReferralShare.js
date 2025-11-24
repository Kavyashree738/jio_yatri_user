import React, { useState, useEffect } from 'react';
import { FaCopy, FaShareAlt, FaGift } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import '../../styles/ReferralShare.css';
import gift from '../../assets/images/gift-box.png';
import axios from 'axios';
import confetti from 'canvas-confetti';
import { useTranslation } from "react-i18next";

const ReferralShare = () => {
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [referralData, setReferralData] = useState(null);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useTranslation();

  useEffect(() => {
    const fetchReferralCode = async () => {
      if (user) {
        try {
          setLoading(true);
          const response = await axios.get(
            `https://jio-yatri-user.onrender.com/api/users/${user.uid}/referral-code`
          );

          setReferralData(response.data);
          setLoading(false);
        } catch (err) {
          console.error('Error fetching referral code:', err);
          setError(err.message);
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };

    fetchReferralCode();
  }, [user]);

  const fireConfetti = () => {
    confetti({ particleCount: 100, spread: 70, origin: { y: 0.6 } });

    setTimeout(() => {
      confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 } });
    }, 250);

    setTimeout(() => {
      confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 } });
    }, 400);
  };

  const copyToClipboard = () => {
    if (referralData) {
      navigator.clipboard.writeText(referralData.shareLink);
      setCopied(true);
      fireConfetti();
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const shareViaOther = () => {
    if (!referralData) return;

    const message = `${referralData.shareLink}|${referralData.referralCode}`;

    if (window.NativeShare?.postMessage) {
      window.NativeShare.postMessage(message);
    } else if (window.Android?.share) {
      window.Android.share(referralData.shareLink, referralData.referralCode);
    } else if (window.webkit?.messageHandlers?.NativeShare) {
      window.webkit.messageHandlers.NativeShare.postMessage(message);
    } else if (navigator.share) {
      navigator.share({
        title: t("ref_share_title"),
        text: t("ref_share_text", { code: referralData.referralCode }),
        url: referralData.shareLink,
      }).catch(() => fallback());
    } else {
      fallback();
    }

    function fallback() {
      navigator.clipboard.writeText(
        `${referralData.shareLink} (Code: ${referralData.referralCode})`
      );
      alert(t("ref_link_copied"));
    }
  };

  if (loading) {
    return (
      <div className="referral-share-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="referral-share-container">
        <div className="error-message">
          <p>{t("ref_error")}</p>
          <button onClick={() => window.location.reload()}>
            {t("retry")}
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="referral-share-container">
        <div className="referral-share-header">
          <button className="back-button" onClick={() => navigate(-1)}>X</button>
          <h2>{t("ref_title")}</h2>
        </div>

        <div className="referral-share-content auth-required">
          <div className="gift-icon">
            <FaGift />
          </div>

          <h3>{t("ref_login_title")}</h3>
          <p>{t("ref_login_sub")}</p>

          <button className="login-button" onClick={() => navigate('/home')}>
            {t("login")}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="referral-share-container">
      <div className="referral-share-content">

        <div className="referral-hero-section">
          <div className="referral-share-header">
            <button className="back-button" onClick={() => navigate(-1)}>x</button>
            <h2>{t("ref_title")}</h2>
          </div>

          <div className="gift-icon">
            <img src={gift} alt="Gift" />
          </div>

          <h3>{t("ref_invite_title")}</h3>
          <p className="subtext">
            {t("ref_invite_sub")}
          </p>
        </div>

        {referralData && (
          <>
            <div className="referral-card">
              <div className="card-header">
                <span className="card-title">{t("ref_your_code")}</span>
                <div className="card-badge">{t("active")}</div>
              </div>

              <div className="code-display">
                <span className="code-text">{referralData.referralCode}</span>

                <button className={`copy-button ${copied ? 'copied' : ''}`} onClick={copyToClipboard}>
                  <FaCopy /> {copied ? t("copied") : t("copy")}
                </button>
              </div>
            </div>

            <div className="share-section">
              <div className="share-buttons">
                <button className="share-button other" onClick={shareViaOther}>
                  <FaShareAlt className="button-icon" />
                  {t("share")}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default ReferralShare;
