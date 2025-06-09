// CheckPriceForm.jsx
import React, { useState } from 'react';
import axios from 'axios';
import GooglePlacesAutocomplete from 'react-google-places-autocomplete';
import './CheckPriceForm.css';

const CheckPriceForm = () => {
  const [pickup, setPickup] = useState(null);
  const [drop, setDrop] = useState(null);
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [price, setPrice] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPrice(null);

    if (!pickup || !drop || !phone || !date) {
      setError('All fields are required.');
      return;
    }

    try {
      const res = await axios.post('https://jio-yatri-user.onrender.com/api/check-price', {
        pickup: pickup.label,
        drop: drop.label,
        phone,
        date,
      });
      setPrice(res.data.price);
    } catch (err) {
      setError(err.response?.data?.error || 'Something went wrong.');
    }
  };

  return (
    <div className="check-price-container">
      <h2>Check Shifting Price</h2>
      <form onSubmit={handleSubmit}>
        <label>
          Pickup Location
          <GooglePlacesAutocomplete
            apiKey="YOUR_GOOGLE_API_KEY"
            selectProps={{
              value: pickup,
              onChange: setPickup,
              placeholder: 'Sending from',
            }}
          />
        </label>
        <label>
          Drop Location
          <GooglePlacesAutocomplete
            apiKey="YOUR_GOOGLE_API_KEY"
            selectProps={{
              value: drop,
              onChange: setDrop,
              placeholder: 'Sending to',
            }}
          />
        </label>
        <label>
          Phone Number
          <input
            type="text"
            name="phone"
            placeholder="Enter contact number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </label>
        <label>
          Shifting Date
          <input
            type="date"
            name="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>
        <button type="submit">Check Price</button>
      </form>
      {price && <div className="result">Estimated Price: ₹{price}</div>}
      {error && <div className="error">{error}</div>}
    </div>
  );
};

export default CheckPriceForm;
