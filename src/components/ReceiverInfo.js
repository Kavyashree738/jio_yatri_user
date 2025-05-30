import React, { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import '../styles/components.css';

function ReceiverInfo({ data, updateData, onNext, onBack }) {
  const [receiver, setReceiver] = useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setReceiver(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (address) => {
    setReceiver(prev => ({
      ...prev,
      address: {
        addressLine1: address.address || '',
        city: address.context?.find(c => c.id.includes('place'))?.text || '',
        state: address.context?.find(c => c.id.includes('region'))?.text || '',
        postalCode: address.context?.find(c => c.id.includes('postcode'))?.text || '',
        country: address.context?.find(c => c.id.includes('country'))?.text || '',
        coordinates: address.coordinates || { lat: null, lng: null }
      }
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    updateData(receiver);
    onNext();
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Receiver Information</h2>

      <div className="form-group">
        <div className="form-row">
          <div className="form-col">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={receiver.name || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-col">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={receiver.phone || ''}
              onChange={handleChange}
              required
              pattern="[0-9]{10}"
              title="Please enter a 10-digit phone number"
            />
          </div>
        </div>

        <div className="form-row">
          <label>Email (Optional)</label>
          <input
            type="email"
            name="email"
            value={receiver.email || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Receiver Address</label>
          <AddressAutocomplete onSelect={handleAddressSelect} />
        </div>
      </div>

      <div className="form-actions">
        <button
          type="button"
          className="btn-secondary"
          onClick={onBack}
        >
          Back
        </button>
        <button
          type="submit"
          className="btn-primary"
          disabled={!receiver.name || !receiver.phone || !receiver.address}
        >
          Next
        </button>
      </div>
    </form>
  );
}

export default ReceiverInfo;