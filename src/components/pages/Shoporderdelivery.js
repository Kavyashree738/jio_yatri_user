import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import Header from "../pages/Header";
import Footer from "../pages/Footer";
import { useDispatch, useSelector } from "react-redux";
import { fetchUserOrders } from "../../redux/ordersSlice";
import img from "../../assets/images/login-message.png";
import { ToastContainer, toast } from "react-toastify";
import axios from "axios";
import "../../styles/ShopOrderStyles.css"; // <-- IMPORTANT
import Lottie from "lottie-react";
import emptyAnimation from "../../assets/animations/empty.json"; 

const Shoporderdelivery = () => {
  const dispatch = useDispatch();
  const { user, token } = useAuth();

  const { list: orders } = useSelector((state) => state.orders);

  const [searchTerm, setSearchTerm] = useState("");
  const [filteredOrders, setFilteredOrders] = useState([]);

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
      ].some((x) => x?.toLowerCase().includes(text))
    );

    setFilteredOrders(result);
  };

  if (!user)
    return (
      <>
        <Header />
        <div className="no-orders-wrapper">
          <img src={img} className="no-orders-img" />
          <p>Please login to see your orders</p>
        </div>
        <Footer />
      </>
    );

  return (
    <>
      <Header />

      <div className="shop-orders-page">
        <h3 className="title">Your Shop Orders</h3>

        {/* Search Box */}
        <input
          className="search-box"
          value={searchTerm}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Search by shop, code, category..."
        />

        {filteredOrders.length === 0 ? (
  <div className="no-orders-animation">
    <Lottie 
      animationData={emptyAnimation} 
      loop 
      style={{ width: 250, margin: "0 auto" }}
    />
  </div>
): (
          <div className="order-list">
            {filteredOrders.map((o) => (
              <div key={o._id} className="order-card-ui">

                {/* Header */}
                <div className="card-header">
                  <div className="order-id">
                    Order: {highlightText(o.orderCode)}
                  </div>
                  <div className="order-date">{formatDateTime(o.createdAt)}</div>
                </div>

                {/* Shop Section */}
                <div className="shop-info">
                  <p><strong>Shop:</strong> {highlightText(o.shop?.name)}</p>
                  <p><strong>Category:</strong> {o.shop?.category}</p>
                  {o.shop?.phone && <p><strong>Phone:</strong> {o.shop.phone}</p>}
                  <p><strong>Vehicle:</strong> {o.vehicleType}</p>
                </div>

                {/* Items */}
                <div className="items-container">
                  <h4>Items</h4>
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

                {/* Total */}
                <div className="order-total-row">
                  <strong>Total</strong>
                  <span>{formatCurrency(o.pricing?.total)}</span>
                </div>

                {/* Status */}
                <div className="status-row">
                  <p><strong>Status:</strong> {highlightText(o.status)}</p>
                  <p><strong>Payment:</strong> {highlightText(o.payment?.status)}</p>
                </div>

                {/* Action */}
                {o.status.toLowerCase() === "pending" && (
                  <button className="cancel-btn">Cancel Order</button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      <ToastContainer />
      <Footer />
    </>
  );
};

export default Shoporderdelivery;
