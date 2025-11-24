import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import Header from './pages/Header';
import Footer from './pages/Footer';
import LocationTracker from './LocationTracker';
import PaymentModal from './pages/PaymentModal';
import { useNavigate } from 'react-router-dom';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../styles/UserShipments.css';
import { useDispatch, useSelector } from 'react-redux';
import { fetchShipments } from '../redux/shipmentsSlice';
import { fetchUserOrders } from '../redux/ordersSlice';
import { FaPhone } from 'react-icons/fa';
import img from '../assets/images/login-message.png'
import { useTranslation } from "react-i18next";



const UserShipments = () => {
  // const [shipments, setShipments] = useState([]);
  const [filteredShipments, setFilteredShipments] = useState([]);
  // const [error, setError] = useState('');
  // const [loading, setLoading] = useState(true);
  const [trackingShipment, setTrackingShipment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);
  const pollingRef = useRef(null);
  const [searchTerm, setSearchTerm] = useState('');
  const navigate = useNavigate();
  // Rating related state
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [currentShipmentForRating, setCurrentShipmentForRating] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const { user, token, refreshToken } = useAuth();

  // const [userOrders, setUserOrders] = useState([]);
  const [filteredUserOrders, setFilteredUserOrders] = useState([]);
  const [ownerOrders, setOwnerOrders] = useState([]);
  const [filteredOwnerOrders, setFilteredOwnerOrders] = useState([]);
  // const [ordersLoading, setOrdersLoading] = useState(true);
  // const [ordersError, setOrdersError] = useState('');

  const [initialLoad, setInitialLoad] = useState(true);

  const [activeTab, setActiveTab] = useState('all');


  const { t } = useTranslation();




  const dispatch = useDispatch();
  const { list: shipments, loading, error } = useSelector((state) => state.shipments);
  const { list: userOrders, loading: ordersLoading, error: ordersError } = useSelector((state) => state.orders);

  const [confirmModal, setConfirmModal] = useState({
    visible: false,
    type: null, // "shipment" or "order"
    id: null,
  });



  //   const fetchShipments = async (attempt = 1) => {
  //     try {
  //       setLoading(true);
  //       setError('');

  //       const response = await axios.get(
  //         `https://jio-yatri-user.onrender.com/api/shipments/my-shipments`,
  //         {
  //           headers: {
  //             Authorization: `Bearer ${token}`,
  //           },
  //           timeout: 10000
  //         }
  //       );

  //       setShipments(response.data);
  //       setFilteredShipments(response.data);
  //      } catch (err) {
  //   const isExpired =
  //     err.response?.status === 403 &&
  //     (err.response?.data?.error?.includes('expired') ||
  //      err.response?.data?.message?.includes('expired'));

  //   if ((err.response?.status === 401 || isExpired) && attempt < 2) {
  //     console.warn('🔄 Token expired — refreshing...');
  //     const freshToken = await refreshToken();
  //     if (freshToken) return fetchShipments(attempt + 1);
  //   }

  //   if (err.code === 'ECONNREFUSED') {
  //     setError('Backend server is not responding. Please try again later.');
  //   } else {
  //     setError(
  //       err.response?.data?.message ||
  //       'Failed to fetch shipments. Please try again.'
  //     );
  //   }
  // }
  //  finally {
  //       setLoading(false);
  //     }
  //   };


  const formatCurrency = (n) => `₹${(Number(n) || 0).toFixed(2)}`;

  const formatDateTime = (d) =>
    new Date(d).toLocaleDateString('en-US', {
      year: 'numeric', month: 'short', day: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredShipments(shipments);
      setFilteredUserOrders(userOrders);
      return;
    }

    const searchLower = term.toLowerCase();

    const filtered = shipments.filter((s) =>
      [s.trackingNumber, s.status, s.assignedDriver?.name,
      s.sender?.name, s.receiver?.name, s.vehicleType, s.payment?.method]
        .some((f) => f?.toLowerCase().includes(searchLower))
    );

    setFilteredShipments(filtered);
    setFilteredUserOrders(filterOrders(userOrders, term));
  };



  const filterOrders = (orders, term) => {
    if (!term) return orders;
    const t = term.toLowerCase();
    return orders.filter((o) => {
      const itemNames = (o.items || []).map(i => i.name).join(' ').toLowerCase();
      return (
        (o.orderCode || '').toLowerCase().includes(t) ||
        (o.status || '').toLowerCase().includes(t) ||
        (o.payment?.status || '').toLowerCase().includes(t) ||
        (o.payment?.method || '').toLowerCase().includes(t) ||
        (o.vehicleType || '').toLowerCase().includes(t) ||
        (o.shop?.name || '').toLowerCase().includes(t) ||
        (o.shop?.category || '').toLowerCase().includes(t) ||
        itemNames.includes(t)
      );
    });
  };

  //   const fetchUserOrders = async (attempt = 1) => {
  //     try {
  //       setOrdersError('');
  //       setOrdersLoading(true);
  //       const res = await axios.get(`https://jio-yatri-user.onrender.com/api/orders/user`, {
  //         headers: { Authorization: `Bearer ${token}` },
  //       });
  //       setUserOrders(res.data.data);

  //       const data = res.data?.data || [];
  //       setUserOrders(data);
  //       // apply current search
  //       setFilteredUserOrders(filterOrders(data, searchTerm));
  //     } catch (err) {
  //   const isExpired =
  //     err.response?.status === 403 &&
  //     (err.response?.data?.error?.includes('expired') ||
  //      err.response?.data?.message?.includes('expired'));

  //   if ((err.response?.status === 401 || isExpired) && attempt < 2) {
  //     console.warn('🔄 Token expired — refreshing for orders...');
  //     const fresh = await refreshToken();
  //     if (fresh) return fetchUserOrders(attempt + 1);
  //   }

  //   setOrdersError(err.response?.data?.error || err.message || 'Failed to fetch your orders');
  // }
  //  finally {
  //       setOrdersLoading(false);
  //     }
  //   };

  const loadShipments = () => dispatch(fetchShipments());
  const loadUserOrders = () => dispatch(fetchUserOrders());


  useEffect(() => {
    if (!user) return;

    // Only fetch if there’s no data yet
    if (shipments.length === 0) {
      loadShipments().finally(() => setInitialLoad(false));
    } else {
      setInitialLoad(false);
    }

    if (userOrders.length === 0) {
      loadUserOrders();
    }

    if (pollingRef.current) clearInterval(pollingRef.current);

    pollingRef.current = setInterval(() => {
      loadShipments();
      loadUserOrders();
    }, trackingShipment ? 5000 : 10000);

    return () => clearInterval(pollingRef.current);
  }, [user, trackingShipment]);



  useEffect(() => {
    if (user) {
      handleSearch(searchTerm);
    }
  }, [shipments, user, userOrders]);

  const handleTrackShipment = (shipment) => {
    setTrackingShipment(shipment);
  };

  const handleStopTracking = () => {
    setTrackingShipment(null);
  };


  const openPaymentModal = (shipment) => {
    setSelectedShipment(shipment);
    setPaymentModalOpen(true);
  };

  const handleCancelShipment = async (shipmentId) => {
    try {
      await axios.put(
        `https://jio-yatri-user.onrender.com/api/shipments/${shipmentId}/cancel`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(t("toast_shipment_cancelled"), { autoClose: 5000 });
      loadShipments();
    } catch (err) {
      console.error('Cancel error:', err);
      toast.error(
        err.response?.data?.error || t("toast_shipment_cancel_failed"),
        { autoClose: 5000 }
      );
    }
  };

  const handleOpenRatingModal = (shipment) => {
    setCurrentShipmentForRating(shipment);
    setRatingModalOpen(true);
  };

  const handleCloseRatingModal = () => {
    setRatingModalOpen(false);
    setRating(5);
    setFeedback('');
  };

  const handleSubmitRating = async () => {
    if (!currentShipmentForRating) {
      toast.error('No shipment selected', { autoClose: 5000 });
      return;
    }

    if (rating < 1 || rating > 5) {
      toast.error('Please select a rating between 1 and 5 stars', { autoClose: 5000 });
      return;
    }

    setIsSubmittingRating(true);
    try {
      await axios.post(
        `https://jio-yatri-user.onrender.com/api/ratings`,
        {
          shipmentId: currentShipmentForRating._id,
          rating,
          feedback: feedback.trim()
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(t("toast_rating_submitted"), { autoClose: 5000 });

      handleCloseRatingModal();
      loadShipments();
    } catch (err) {
      console.error('Rating error:', err);
      toast.error(
        err.response?.data?.error || t("toast_rating_failed"),
        { autoClose: 5000 }
      );

    } finally {
      setIsSubmittingRating(false);
    }
  };

  const highlightText = (text) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, 'gi');
    return text.toString().split(regex).map((part, i) =>
      part.toLowerCase() === searchTerm.toLowerCase() ? (
        <span key={i} className="highlights">{part}</span>
      ) : (
        part
      )
    );
  };

  const handleCancelOrder = async (orderId) => {
    try {
      await axios.patch(
        `https://jio-yatri-user.onrender.com/api/orders/${orderId}/status`,
        { status: 'cancelled' },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(t("order_cancel_success"), { autoClose: 5000 });
      loadUserOrders();
    } catch (err) {
      console.error('Cancel order error:', err);
      toast.error(
        err.response?.data?.error ||
        'Failed to cancel order. Please try again.',
        { autoClose: 5000 }
      );
    }
  };

  // Early return if user is not logged in
  if (!user) {
    return (
      <>
        <Header />
        <div className="shipments-container-login">
          <div className="no-shipments">
            {/* <h4>Your Shipments</h4> */}
            <img src={img} className='img'></img>
            <p> {t("us_not_logged_in")}.</p>
            <button
              onClick={() => navigate('/home')}
              className="sign-in-button"
            >
              {t("login")}
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  if (initialLoad) {
    return (
      <div className="shipments-loading">
        <div className="loader">
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
          <div className="loader-circle"></div>
        </div>
        <div className="loading-text">{t("loading")}</div>
      </div>
    );
  }


  if (error) {
    return (
      <div className="shipments-error">
        <p>{error}</p>
        <button onClick={() => loadShipments()}>Retry</button>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="shipments-container">
        <h4>{t("shipments_title")}</h4>

        <div className="tabs-container">
          <button
            className={`tab-btn ${activeTab === 'all' ? 'active' : ''}`}
            onClick={() => setActiveTab('all')}
          >

            {t("tab_all")}
          </button>
          <button
            className={`tab-btn ${activeTab === 'shipments' ? 'active' : ''}`}
            onClick={() => setActiveTab('shipments')}
          >
            {t("tab_shipments")}
          </button>
          <button
            className={`tab-btn ${activeTab === 'orders' ? 'active' : ''}`}
            onClick={() => setActiveTab('orders')}
          >
            {t("tab_shop_orders")}
          </button>
        </div>

        <div className="search-container">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            placeholder={t("search_shipments")}
          />
          <button className="search-button">
            <i className="search-icon">🔍</i>
          </button>
          {searchTerm && (
            <button
              className="clear-search-button"
              onClick={() => handleSearch('')}
            >
              ✕
            </button>
          )}
        </div>

        {(activeTab === 'all' || activeTab === 'shipments') && (
          <>
            {trackingShipment ? (
              <div className="tracking-view">
                <div className="tracking-header">
                  <h3>Tracking Shipment: {trackingShipment.trackingNumber}</h3>
                  <button onClick={handleStopTracking} className="stop-tracking-btn">
                    Back to Shipments
                  </button>
                </div>
                <LocationTracker shipment={trackingShipment} />
              </div>
            ) : filteredShipments.length === 0 ? (
              <div className="no-shipments">
                {searchTerm ? (
                  <p>{t("no_shipments_search")}</p>
                ) : (
                  <>
                    <img src={img} className='img' />
                    <p>{t("no_shipments_yet")}</p>
                  </>
                )}
                {/* <button
                  onClick={() => navigate('/shipment')}
                  className="sign-in-button"
                >
                  Create Shipment
                </button> */}
              </div>
            ) : (
              <div className="shipments-list">
                {filteredShipments.map((shipment) => (
                  <div key={shipment._id} className="shipment-card">
                    <div className="shipment-header">
                      <h3>{t("tracking_number")}: {highlightText(shipment.trackingNumber)}</h3>
                      <span className="created-date">
                        {new Date(shipment.createdAt).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>

                    <div className="shipment-details-grid">
                      <div className="sender-details">
                        <h4>{t("sender")}</h4>
                        <p><strong>{t("field_name")}:</strong> {highlightText(shipment.sender.name)}</p>
                        <p><strong>{t("field_phone")}:</strong> {shipment.sender.phone}</p>
                        {shipment.sender.email && <p><strong>{t("field_email")}:</strong> {shipment.sender.email}</p>}
                        <p><strong>{t("contact_address")}:</strong> {shipment.sender.address?.addressLine1 || 'N/A'}</p>
                      </div>

                      <div className="receiver-details">
                        <h4>{t("receiver")}</h4>
                        <p><strong>{t("field_name")}:</strong> {highlightText(shipment.receiver.name)}</p>
                        <p><strong>{t("field_phone")}:</strong> {shipment.receiver.phone}</p>
                        {shipment.receiver.email && <p><strong>{t("field_email")}:</strong> {shipment.receiver.email}</p>}
                        <p><strong>{t("contact_address")}:</strong> {shipment.receiver.address?.addressLine1 || 'N/A'}</p>
                      </div>

                      <div className="shipment-meta">
                        <h4>{t("shipment_details")}</h4>
                        <p><strong>{t("vehicle_type")}:</strong> {highlightText(shipment.vehicleType)}</p>
                        <p><strong>{t("distance")}:</strong> {shipment.distance} km</p>
                        <p><strong>{t("cost")}</strong> ₹{shipment.cost?.toFixed(2) || '0.00'}</p>
                        <p><strong>{t("status")}</strong> {highlightText(shipment.status)}</p>
                        {shipment.isShopOrder && shipment.recreatedFrom && shipment.status !== 'delivered' && shipment.status !== 'picked_up' && (
                          <p className="shipment-recreated-info">
                            t("delivery_cancelled_info")
                          </p>
                        )}



                        {shipment.status === 'cancelled' && shipment.cancellationReason && (
                          <p><strong>Cancellation Reason:</strong> {shipment.cancellationReason}</p>
                        )}
                        {shipment.assignedDriver && (
                          <p><strong>Driver:</strong> {highlightText(shipment.assignedDriver.name)} ({shipment.assignedDriver.vehicleNumber})</p>
                        )}
                        {shipment.status !== 'delivered' &&
                          shipment.status !== 'cancelled' &&
                          shipment.assignedDriver?.phone && (   // ✅ this extra check prevents undefined error
                            <p>
                              <strong>t("label_call_driver")</strong>{' '}
                              {shipment.assignedDriver.phone.replace(/^\+91/, '')}
                              <a
                                href={`tel:${shipment.assignedDriver.phone.replace(/^\+?91/, '')}`}
                                onClick={(e) => e.stopPropagation()}
                                style={{
                                  marginLeft: '8px',
                                  color: '#ffffff',
                                  backgroundColor: '#09d670',
                                  padding: '0.5rem',
                                  borderRadius: '50%',
                                  textDecoration: 'none',
                                  display: 'inline-flex',
                                  alignItems: 'center',
                                }}
                              >
                                <FaPhone style={{ marginRight: '4px' }} />
                              </a>
                            </p>
                          )}




                        {shipment.status === 'assigned' && shipment.pickupOtp && (
                          <div className="otp-box">
                            <h4>Your Pickup OTP</h4>
                            <div className="otp-digits">
                              {shipment.pickupOtp.split('').map((digit, index) => (
                                <div key={index} className="otp-digit">{digit}</div>
                              ))}
                            </div>
                            <p>Share this code with the driver to confirm pickup.</p>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="shipment-actions">
                      {(
                        // ✅ Regular shipment: show when pending or assigned
                        (!shipment.isShopOrder && (shipment.status === 'pending' || shipment.status === 'assigned')) ||

                        // ✅ Shop shipment: show only when pending (hide after assigned)
                        (shipment.isShopOrder && shipment.status === 'pending')
                      ) && (
                          <button
                            onClick={() =>
                              setConfirmModal({ visible: true, type: "shipment", id: shipment._id })
                            }
                            className="cancel-btn"
                          >
                            {t("cancel_shipment")}
                          </button>
                        )}



                      {shipment.status === 'assigned' && (
                        <button onClick={() => handleTrackShipment(shipment)} className="track-shipment-btn">
                          Track Shipment
                        </button>
                      )}

                      {shipment.status === 'picked_up' && shipment.payment?.status === 'pending' && (
                        <button onClick={() => openPaymentModal(shipment)} className="pay-now-btn">
                          Complete Payment
                        </button>
                      )}

                      {shipment.status === 'delivered' && shipment.payment?.status === 'paid' && (
                        <div className="shipment-rating-section">
                          {shipment.rating ? (
                            <div className="rating-submitted">
                              <span>Your rating: {shipment.rating.value} ★</span>
                              {shipment.rating.feedback && (
                                <p className="rating-feedback-text">"{shipment.rating.feedback}"</p>
                              )}
                            </div>
                          ) : (
                            <button
                              className="rate-driver-btn"
                              onClick={() => handleOpenRatingModal(shipment)}
                            >
                              t("rate_driver")
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </div>

      {paymentModalOpen && selectedShipment && (
        <PaymentModal
          shipment={selectedShipment}
          onClose={() => setPaymentModalOpen(false)}
          refreshShipments={loadShipments}
        />
      )}

      {ratingModalOpen && (
        <div className="rating-modal-overlay">
          <div className="rating-modal">
            <h3>{t("rate_driver")}</h3>
            <p>{t("rating_experience_with")} {currentShipmentForRating?.assignedDriver?.name}?</p>

            <div className="rating-stars">
              {[1, 2, 3, 4, 5].map((star) => (
                <span
                  key={star}
                  className={star <= rating ? 'star-filled' : 'star-empty'}
                  onClick={() => setRating(star)}
                >
                  ★
                </span>
              ))}
            </div>

            <textarea
              placeholder={t("rating_optional_feedback")}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              className="rating-feedback"
              maxLength={500}
            />
            <div className="feedback-counter">{feedback.length}/500</div>

            <div className="rating-modal-actions">
              <button
                className="cancel-rating"
                onClick={handleCloseRatingModal}
                disabled={isSubmittingRating}
              >
                {t("cancel")}
              </button>
              <button
                className="submit-rating"
                onClick={handleSubmitRating}
                disabled={isSubmittingRating}
              >
                {isSubmittingRating ? 'Submitting...' : 'Submit Rating'}
              </button>
            </div>
          </div>
        </div>
      )}
      {(activeTab === 'all' || activeTab === 'orders') && (
        <div className="orders-section">
          {/* <h4>Your Shop Orders</h4> */}
          {initialLoad ? (
            <div className="orders-loading">{t("loading")}</div>
          ) : ordersError ? (
            <div className="orders-error">
              <p>{ordersError}</p>
              <button onClick={() => loadUserOrders()}>Retry</button>
            </div>
          ) : filteredUserOrders.length === 0 ? (
            <div className="no-orders">
              {searchTerm ? (
                <p>{t("orders_search_no_results")}</p>
              ) : (
                <>
                  <img src={img} className="img" />
                  <p>{t("orders_none")}</p>
                </>
              )}

            </div>
          ) : (
            <div className="orders-list">
              {filteredUserOrders.map((o) => (
                <div key={o._id} className="order-card">
                  <div className="order-header">
                    <h3>{t("order_label")}: {highlightText(o.orderCode)}</h3>
                    <span className="created-date">{formatDateTime(o.createdAt)}</span>
                  </div>

                  <div className="order-shop-meta">
                    <p><strong>{t("shop_label")}</strong> {highlightText(o.shop?.name)} ({o.shop?.category})</p>
                    {o.shop?.phone && <p><strong>{t("shop_phone")}:</strong> {o.shop.phone}</p>}
                    <p><strong>{t("vehicle_type")}</strong> {highlightText(o.vehicleType)}</p>
                  </div>

                  <div className="order-items">
                    <table>
                      <thead>
                        <tr>
                          <th>{t("item")}</th><th>{t("qty")}</th><th>{t("price")}</th><th>{t("line_total")}</th>
                        </tr>
                      </thead>
                      <tbody>
                        {(o.items || []).map((it, idx) => (
                          <tr key={idx}>
                            <td>{highlightText(it.name)}</td>
                            <td>{it.quantity}</td>
                            <td>{formatCurrency(it.price)}</td>
                            <td>{formatCurrency((Number(it.price) || 0) * (Number(it.quantity) || 1))}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="order-pricing">
                    {/* <div><strong>Subtotal:</strong> {formatCurrency(o.pricing?.subtotal)}</div>
                  <div><strong>Delivery Fee:</strong> {formatCurrency(o.pricing?.deliveryFee)}</div>
                  <div><strong>Discount:</strong> {formatCurrency(o.pricing?.discount)}</div> */}
                    <div className="order-total"><strong>{t("order_total_label")}:</strong> {formatCurrency(o.pricing?.total)}</div>
                  </div>

                  <div className="order-status">
                    <div><strong>{t("order_status_label")}:</strong> {highlightText(o.status)}</div>
                    <div><strong>{t("order_payment_label")}:</strong> {highlightText(o.payment?.status)}</div>
                  </div>

                  {/* <div className="order-actions">
                  {o.shipmentId ? (
                    <button
                      className="track-shipment-btn"
                      onClick={() => {
                        // if we already have this shipment in memory, track it; otherwise fall back to shipments tab
                        const s = shipments.find(s => s._id === o.shipmentId);
                        if (s) {
                          handleTrackShipment(s);
                        } else {
                          toast.info('Shipment created. Scroll up to find and track it.');
                          // optionally: navigate(`/shipment/${o.shipmentId}`)
                        }
                      }}
                    >
                      Track Shipment
                    </button>
                  ) : (
                    <span className="hint">Shipment will be created after payment / shop confirmation.</span>
                  )}
                </div> */}


                  <div className="order-actions">
                    {String(o.status).toLowerCase() === 'pending' && (
                      <button
                        onClick={() =>
                          setConfirmModal({ visible: true, type: "order", id: o._id })
                        }
                        className="cancel-order-btn"
                      >
                        {t("shop_orders_cancel")}
                      </button>

                    )}
                  </div>
                </div>

              ))}
            </div>
          )}
        </div>
      )}



      {confirmModal.visible && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>{t("confirm_cancel_title")}</h3>
            <p>
              {confirmModal.type === 'shipment'
                ? t("confirm_cancel_message")
                : t("confirm_cancel_order_message")}

            </p>
            <div className="modal-buttons">
              <button
                className="confirming-btn"
                onClick={async () => {
                  if (confirmModal.type === 'shipment') {
                    await handleCancelShipment(confirmModal.id);
                  } else {
                    await handleCancelOrder(confirmModal.id);
                  }
                  setConfirmModal({ visible: false, type: null, id: null });
                }}
              >
                {t("yes_cancel")}
              </button>
              <button
                className="cancelling-btn"
                onClick={() => setConfirmModal({ visible: false, type: null, id: null })}
              >
                {t("no_go_back")}
              </button>
            </div>
          </div>
        </div>
      )}


      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Footer />
    </>
  );
};

export default UserShipments;