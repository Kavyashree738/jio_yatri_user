import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import '../styles/RatingReminder.css';
import { auth } from '../firebase'; // ✅ make sure this path is correct

const RatingReminder = ({ pendingRatings = [], token, refreshShipments }) => {
  const [visible, setVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedRating, setSelectedRating] = useState(0); // ⭐ for visual stars

  // 🧪 Test mode for faster popup (10 sec instead of 5 hrs)
  const TEST_MODE = false;

  useEffect(() => {
    if (!pendingRatings.length) return;

    const lastShown = localStorage.getItem('lastRatingPopupTime');
    const now = Date.now();

    const interval = TEST_MODE ? 10 * 1000 : 5 * 60 * 60 * 1000;

    if (!lastShown || now - Number(lastShown) > interval) {
      setVisible(true);
      localStorage.setItem('lastRatingPopupTime', now);
    }
  }, [pendingRatings]);

  // ⭐ Submit rating instantly
  const handleRating = async (shipmentId, value) => {
    if (submitting) return;
    setSubmitting(true);
    setSelectedRating(value);

    try {
      // ✅ Always get a fresh Firebase token safely
      if (!auth.currentUser) {
        toast.error('Please sign in again to rate.');
        setSubmitting(false);
        return;
      }

      const freshToken = await auth.currentUser.getIdToken(true);

      await axios.post(
        'https://jio-yatri-user.onrender.com/api/ratings',
        { shipmentId, rating: value },
        {
          headers: { Authorization: `Bearer ${freshToken}` },
        }
      );

      toast.success(`Rated ${value}★ successfully!`);
      refreshShipments();

      // ⏳ Keep popup open for 1 sec after rating
      setTimeout(() => setVisible(false), 1000);
    } catch (err) {
      console.error('❌ Rating error:', err);
      toast.error('Failed to submit rating.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!visible || !pendingRatings.length) return null;

  const shipment = pendingRatings[0];

  return (
    <div className="rating-reminder-overlay">
      <div className="rating-reminder-card">
        <h3>⭐ Rate Your Driver</h3>
        <p>
          Please rate your recent delivery for <br />
          <strong>{shipment.assignedDriver?.name || 'Driver'}</strong>
        </p>

        <div className="rating-stars">
          {[1, 2, 3, 4, 5].map((star) => (
            <span
              key={star}
              className={`star ${star <= selectedRating ? 'filled' : ''}`}
              onClick={() => handleRating(shipment._id, star)}
              style={{ opacity: submitting ? 0.5 : 1 }}
            >
              ★
            </span>
          ))}
        </div>

        <button className="close-popup-btn" onClick={() => setVisible(false)}>
          ✕
        </button>
      </div>
    </div>
  );
};

export default RatingReminder;
