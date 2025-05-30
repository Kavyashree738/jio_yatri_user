import React, { useState } from 'react';
import AddressAutocomplete from './AddressAutocomplete';
import '../styles/components.css';

function SenderInfo({ data, updateData, onNext }) {
  const [sender, setSender] = useState(data);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSender(prev => ({ ...prev, [name]: value }));
  };

  const handleAddressSelect = (address) => {
    setSender(prev => ({
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
    updateData(sender);
    onNext();
  };

  return (
    <form className="form" onSubmit={handleSubmit}>
      <h2>Sender Information</h2>

      <div className="form-group">
        <div className="form-row">
          <div className="form-col">
            <label>Full Name</label>
            <input
              type="text"
              name="name"
              value={sender.name || ''}
              onChange={handleChange}
              required
            />
          </div>
          <div className="form-col">
            <label>Phone Number</label>
            <input
              type="tel"
              name="phone"
              value={sender.phone || ''}
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
            value={sender.email || ''}
            onChange={handleChange}
          />
        </div>

        <div className="form-row">
          <label>Sender Address</label>
          <AddressAutocomplete onSelect={handleAddressSelect} />
        </div>
      </div>

      <button
        type="submit"
        className="btn-primary"
        disabled={!sender.name || !sender.phone || !sender.address}
      >
        Next
      </button>
    </form>
  );
}

export default SenderInfo;