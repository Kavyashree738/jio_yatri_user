import React, { useState, useEffect, useRef } from "react";
import axios from "axios";
import { useAuth } from "../context/AuthContext";
import Header from "./pages/Header";
import Footer from "./pages/Footer";
import LocationTracker from "../components/LocationTracker";
import PaymentModal from "./pages/PaymentModal";
import { ToastContainer, toast } from "react-toastify";
import { useDispatch, useSelector } from "react-redux";
import { fetchShipments } from "../redux/shipmentsSlice";
import "../styles/UserShipments.css";
import img from "../assets/images/login-message.png";
import { FaPhone } from "react-icons/fa";
import Lottie from "lottie-react";
import emptyAnimation from "../assets/animations/empty.json"; 


const ShipmentsDetails = () => {
  const { user, token } = useAuth();
  const dispatch = useDispatch();
  const pollingRef = useRef(null);

  const { list: shipments, loading, error } = useSelector(
    (state) => state.shipments
  );

  const [filteredShipments, setFilteredShipments] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [confirmModal, setConfirmModal] = useState({
      visible: false,
      type: null, // "shipment" or "order"
      id: null,
    });
    const handleOpenRatingModal = (shipment) => {
    setCurrentShipmentForRating(shipment);
    setRatingModalOpen(true);
  };

  const [initialLoad, setInitialLoad] = useState(true);
  const [trackingShipment, setTrackingShipment] = useState(null);
  const [paymentModalOpen, setPaymentModalOpen] = useState(false);
  const [selectedShipment, setSelectedShipment] = useState(null);

  // Rating
  const [ratingModalOpen, setRatingModalOpen] = useState(false);
  const [currentShipmentForRating, setCurrentShipmentForRating] = useState(null);
  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const loadShipments = () => dispatch(fetchShipments());

  useEffect(() => {
    if (!user) return;

    if (shipments.length === 0) {
      loadShipments().finally(() => setInitialLoad(false));
    } else {
      setInitialLoad(false);
    }

    if (pollingRef.current) clearInterval(pollingRef.current);
    pollingRef.current = setInterval(() => {
      loadShipments();
    }, trackingShipment ? 5000 : 10000);

    return () => clearInterval(pollingRef.current);
  }, [user, trackingShipment]);

  useEffect(() => {
    handleSearch(searchTerm);
  }, [shipments]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    if (!term) {
      setFilteredShipments(shipments);
      return;
    }

    const t = term.toLowerCase();

    const filtered = shipments.filter((s) =>
      [
        s.trackingNumber,
        s.status,
        s.assignedDriver?.name,
        s.sender?.name,
        s.receiver?.name,
        s.vehicleType,
      ].some((v) => v?.toLowerCase().includes(t))
    );

    setFilteredShipments(filtered);
  };

  const highlightText = (text) => {
    if (!searchTerm || !text) return text;

    const regex = new RegExp(`(${searchTerm})`, "gi");
    return text
      .toString()
      .split(regex)
      .map((part, i) =>
        part.toLowerCase() === searchTerm.toLowerCase() ? (
          <span key={i} className="highlight">
            {part}
          </span>
        ) : (
          part
        )
      );
  };

  const handleTrackShipment = (shipment) => setTrackingShipment(shipment);
  const handleStopTracking = () => setTrackingShipment(null);

  const openPaymentModal = (shipment) => {
    setSelectedShipment(shipment);
    setPaymentModalOpen(true);
  };

  const handleCancelShipment = async (id) => {
    try {
      await axios.put(
        `https://jio-yatri-user.onrender.com/api/shipments/${id}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Shipment cancelled");
      loadShipments();
    } catch (err) {
      toast.error("Failed to cancel shipment");
    }
  };

  const handleOpenRating = (shipment) => {
    setCurrentShipmentForRating(shipment);
    setRatingModalOpen(true);
  };

  const handleSubmitRating = async () => {
    try {
      setIsSubmittingRating(true);

      await axios.post(
        `https://jio-yatri-user.onrender.com/api/ratings`,
        {
          shipmentId: currentShipmentForRating._id,
          rating,
          feedback,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      toast.success("Rating submitted!");
      setRatingModalOpen(false);
      loadShipments();
    } catch (err) {
      toast.error("Failed to submit rating");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (!user) {
    return (
      <>
        <Header />
        <div className="shipments-container-login">
          <div className="no-shipments">
            <img src={img} className="img" />
            <p>Please login to view shipments</p>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <div className="shipments-container">
        <h4>Your Shipments</h4>

        <div className="search-container">
          <input
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
            placeholder="Search shipments..."
          />
        </div>

        {filteredShipments.length === 0 && (
  <div className="no-shipments-animation">
    <Lottie
      animationData={emptyAnimation}
      loop
      style={{ width: 250, margin: "0 auto" }}
    />
   
  </div>
)}


        {trackingShipment ? (
          <div className="tracking-view">
            <button onClick={handleStopTracking} className="stop-tracking-btn">
              Back
            </button>
            <LocationTracker shipment={trackingShipment} />
          </div>
        ) : (
          

              <div className="shipments-list">
                {filteredShipments.map((shipment) => (
                  <div key={shipment._id} className="shipment-card">
                    <div className="shipment-header">
                      <h3>Tracking #: {highlightText(shipment.trackingNumber)}</h3>
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
                        <h4>Sender</h4>
                        <p><strong>Name:</strong> {highlightText(shipment.sender.name)}</p>
                        <p><strong>Phone:</strong> {shipment.sender.phone}</p>
                        {shipment.sender.email && <p><strong>Email:</strong> {shipment.sender.email}</p>}
                        <p><strong>Address:</strong> {shipment.sender.address?.addressLine1 || 'N/A'}</p>
                      </div>

                      <div className="receiver-details">
                        <h4>Receiver</h4>
                        <p><strong>Name:</strong> {highlightText(shipment.receiver.name)}</p>
                        <p><strong>Phone:</strong> {shipment.receiver.phone}</p>
                        {shipment.receiver.email && <p><strong>Email:</strong> {shipment.receiver.email}</p>}
                        <p><strong>Address:</strong> {shipment.receiver.address?.addressLine1 || 'N/A'}</p>
                      </div>

                      <div className="shipment-meta">
                        <h4>Shipment Details</h4>
                        <p><strong>Vehicle Type:</strong> {highlightText(shipment.vehicleType)}</p>
                        <p><strong>Distance:</strong> {shipment.distance} km</p>
                        <p><strong>Cost:</strong> ₹{shipment.cost?.toFixed(2) || '0.00'}</p>
                        <p><strong>Status:</strong> {highlightText(shipment.status)}</p>
                        {shipment.isShopOrder && shipment.recreatedFrom && shipment.status !== 'delivered' && shipment.status !== 'picked_up' && (
                          <p className="shipment-recreated-info">
                            The driver cancelled your previous delivery. Don’t worry — another driver will deliver your parcel shortly.
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
                              <strong>To know where your parcel is, give call</strong>{' '}
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
                            className="cancel-btnnn"
                          >
                            Cancel Shipment
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
                              Rate This Driver
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
        )}

        {paymentModalOpen && (
          <PaymentModal
            shipment={selectedShipment}
            onClose={() => setPaymentModalOpen(false)}
            refreshShipments={loadShipments}
          />
        )}

        {ratingModalOpen && (
          <div className="rating-modal-overlay">
            <div className="rating-modal">
              <h3>Rate Driver</h3>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map((star) => (
                  <span
                    key={star}
                    className={star <= rating ? "star-filled" : "star-empty"}
                    onClick={() => setRating(star)}
                  >
                    ★
                  </span>
                ))}
              </div>

              <textarea
                placeholder="Feedback"
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
              />

              <button onClick={handleSubmitRating} disabled={isSubmittingRating}>
                Submit
              </button>
            </div>
          </div>
        )}
      </div>

      <ToastContainer />
      <Footer />
    </>
  );
};

export default ShipmentsDetails;
