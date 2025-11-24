// src/components/Shoporderdelivery.jsx

import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../pages/Header";
import Footer from "../pages/Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../redux/ordersSlice";
import img from "../../assets/images/login-message.png";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "../../styles/ShopOrderStyles.css";
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/animations/empty.json";
import { useTranslation } from "react-i18next";

const API_BASE =
 "https://jio-yatri-user.onrender.com";

const Shoporderdelivery = () => {
  const dispatch = useDispatch();
  const { user, token } = useAuth();
  const { t } = useTranslation();

  const { list: orders, loading, error } = useSelector(
    (state) => state.orders
  );

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);

  // Confirmation Modal State
  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    id: null,
  });

  const loadOrders = () => dispatch(fetchUserOrders());

  const highlightText = (text) => {
    if (!searchTerm || !text) return text;
    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text.toString().split(regex).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={i} className="highlight">{part}</span>
      ) : (
        part
      )
    );
  };

  const formatCurrency = (n) => `₹${(Number(n) || 0).toFixed(2)}`;
  const formatDateTime = (d) =>
    new Date(d).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [orders]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) return setFilteredOrders(orders);

    const text = term.toLowerCase();
    const result = orders.filter((o) =>
      [
        o.orderCode,
        o.status,
        o.shop?.name,
        o.shop?.category,
        o.sender?.name,
        o.receiver?.name,
      ].some((x) => x?.toLowerCase().includes(text))
    );

    setFilteredOrders(result);
  };

  // ===== Cancel Order Request =====
  const confirmCancelOrder = async () => {
    if (!confirmModal.id) return;

    try {
      await axios.patch(
        `${API_BASE}/api/orders/${confirmModal.id}/status`,
        { status: "cancelled" },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

     toast.success(t("order_cancel_success"));

      loadOrders();
    } catch (err) {
      toast.error(err?.response?.data?.error || t("order_cancel_fail"));
    }

    // close modal
    setConfirmModal({ visible: false, id: null });
  };

  if (!user)
    return (
      <>
        <Header />
        <div className="no-orders-wrapper">
          <img src={img} className="no-orders-img" />
          <p>{t("login_to_view")}</p>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      <div className="shop-orders-page">
        <h3 className="title">{t("header_shop_orders")}</h3>

        <input
          className="search-box"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder={t("search_placeholder")}
        />

        {filteredOrders.length === 0 ? (
          <div className="no-orders-animation">
            <Lottie animationData={emptyAnimation} loop style={{ width: 250 }} />
            <p>{t("orders_none")}</p>
          </div>
        ) : (
          <div className="order-list">
            {filteredOrders.map((o) => (
              <div key={o._id} className="order-card-ui">

                <div className="card-header">
                  <div className="order-id">
                    {t("order_label")}: {highlightText(o.orderCode)}
                  </div>
                  <div className="order-date">{formatDateTime(o.createdAt)}</div>
                </div>

                <div className="shop-info">
                  <p><strong>{t("shop_label")}:</strong> {o.shop?.name} ({o.shop?.category})</p>

                  {o.sender?.name && (
                    <p><strong>{t("sender")}:</strong> {o.sender.name}</p>
                  )}
                  {o.receiver?.name && (
                    <p><strong>{t("receiver")}:</strong> {o.receiver.name}</p>
                  )}

                  {o.shop?.phone && (
                    <p><strong>{t("shop_phone")}:</strong> {o.shop.phone}</p>
                  )}

                  <p><strong>{t("vehicle_type")}:</strong> {o.vehicleType}</p>
                </div>

                <div className="items-container">
                  <h4>{t("services")}</h4>
                  {o.items.map((it, idx) => (
                    <div key={idx} className="item-row">
                      <div className="item-name">{highlightText(it.name)}</div>
                      <div className="item-qty">x{it.quantity}</div>
                      <div className="item-price">{formatCurrency(it.price)}</div>
                      <div className="item-total">
                        {formatCurrency(it.price * it.quantity)}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="order-total-row">
                  <strong>{t("total_cost")}</strong>
                  <span>{formatCurrency(o.pricing?.total)}</span>
                </div>

                <div className="status-row">
                  <p><strong>{t("status")}:</strong> {highlightText(o.status)}</p>
                  <p><strong>{t("payment_online")}:</strong> {highlightText(o.payment?.status)}</p>
                </div>

                {o.status.toLowerCase() === "pending" && (
                  <button
                    className="cancel-btn"
                    onClick={() => setConfirmModal({ visible: true, id: o._id })}
                  >
                    {t("cancel_booking")}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ===== Confirm Cancel Popup ===== */}
      {confirmModal.visible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t("confirm_cancel_title") || "Cancel Order?"}</h3>
            <p>{t("confirm_cancel_order_message") || "Are you sure you want to cancel this order?"}</p>

            <div className="modal-buttons">
              <button className="confirming-btn" onClick={confirmCancelOrder}>
                {t("yes_cancel")}
              </button>
              <button
                className="cancelling-btn"
                onClick={() => setConfirmModal({ visible: false, id: null })}
              >
                {t("no_go_back")}
              </button>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
      <Footer />
    </>
  );
};

export default Shoporderdelivery;
