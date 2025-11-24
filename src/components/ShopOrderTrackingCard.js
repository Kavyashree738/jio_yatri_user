import React, { useState } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import LocationTracker from "../components/LocationTracker";
import defaultDriverImg from "../assets/images/profile.png";
import { FaPhone } from "react-icons/fa";
import "../styles/ShopOrderTrackingCard.css";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

const API_BASE = "https://jio-yatri-user.onrender.com";

/* ✅ Razorpay Script Loader */
const loadRazorpay = () => {
  return new Promise((resolve) => {
    if (window.Razorpay) {
      resolve(true);
      return;
    }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

function ShopOrderTrackingCard({ order }) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [paymentProcessing, setPaymentProcessing] = useState(false);
  const [error, setError] = useState("");

  const processRazorpayPayment = async (shipmentId) => {
    if (!shipmentId || !user) {
      alert(t("login_required"));
      return;
    }

    setPaymentProcessing(true);
    setError("");

    try {
      const token = await user.getIdToken();
      const orderResponse = await axios.post(
        `${API_BASE}/api/payment/${shipmentId}/initiate`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
          withCredentials: true,
        }
      );

      const paymentData = orderResponse.data.data;
      const scriptLoaded = await loadRazorpay();
      if (!scriptLoaded) throw new Error("Razorpay SDK failed to load");

      const options = {
        key: process.env.REACT_APP_RAZORPAY_KEY_ID,
        amount: paymentData.amount,
        currency: "INR",
        name: "AmbaniYatri Logistics",
        description: `Payment for Shipment #${order.trackingNumber}`,
        order_id: paymentData.id,

        handler: async function (response) {
          try {
            await axios.post(
              `${API_BASE}/api/payment/verify`,
              {
                razorpay_payment_id: response.razorpay_payment_id,
                razorpay_order_id: response.razorpay_order_id,
                razorpay_signature: response.razorpay_signature,
                shipmentId,
              },
              { headers: { Authorization: `Bearer ${token}` } }
            );

            navigate("/home");
          } catch (error) {
            console.error("Payment verification failed:", error);
            alert("❌ Payment verification failed.");
          } finally {
            setPaymentProcessing(false);
          }
        },

        prefill: {
          name: user.displayName || "Customer",
          email: user.email || "",
          contact: order?.sender?.phone || "",
        },

        theme: { color: "#3399cc" },
        modal: { ondismiss: () => setPaymentProcessing(false) },
      };

      const rzp = new window.Razorpay(options);
      rzp.on("payment.failed", (res) => {
        alert(`❌ Payment failed: ${res.error.description}`);
        setPaymentProcessing(false);
      });

      rzp.open();
    } catch (err) {
      console.error("Payment initiation failed:", err);
      setError(err.response?.data?.message || "Failed to process payment");
      setPaymentProcessing(false);
    }
  };

  const driver = order.assignedDriver;
  const otp = order.pickupOtp || "----";

  return (
    <div className="shoporder-tracking-card">

      {/* 🗺 MAP SECTION */}
      <div className="shoporder-map">
        <LocationTracker shipment={order} />
      </div>

      {/* 📦 INFO SECTION */}
      <div className="shoporder-info">
        <div className="shoporder-status">
          <h3>{t("receiver_otp")}</h3>
          <div className="price">₹{Number(order?.cost || 0).toFixed(2)}</div>
        </div>

        <div className="shoporder-otp">
          {otp.toString().split("").map((d, i) => (
            <span key={i} className="shoporder-otp-digit">
              {d}
            </span>
          ))}
        </div>

        {/* 🚗 DRIVER DETAILS */}
        {driver && (
          <div className="shoporder-driver">
            <div className="shoporder-driver-details">
              <img
                src={`${API_BASE}/api/upload/selfie/${driver.userId}?ts=${Date.now()}`}
                alt={t("driver")}
                className="shoporder-driver-photo"
                onError={(e) => (e.currentTarget.src = defaultDriverImg)}
              />
              <div>
                <h4 className="shoporder-driver-name">
                  {driver.name || t("driver")}
                </h4>
                <p className="shoporder-driver-vehicle">
                  {driver.vehicleNumber || t("vehicle_number")}
                </p>
              </div>
            </div>

            <div
              className="shoporder-call-btn"
              onClick={() => window.open(`tel:${driver.phone}`, "_self")}
            >
              <FaPhone />
            </div>
          </div>
        )}

        {/* 💳 PAYMENT BUTTON */}
        {order?.payment?.status !== "paid" && (
          <button
            className="shoporder-pay-btn"
            onClick={() => processRazorpayPayment(order._id)}
            disabled={paymentProcessing}
          >
            {paymentProcessing
              ? t("processing")
              : `${t("pay")} ₹${Number(order?.cost || 0).toFixed(2)}`}
          </button>
        )}

      </div>
    </div>
  );
}

export default ShopOrderTrackingCard;
