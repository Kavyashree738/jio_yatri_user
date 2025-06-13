import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FaMapMarkerAlt, FaArrowLeft } from 'react-icons/fa';
import '../styles/components.css';

function AddressAutocomplete({ onSelect, initialValue = '', onBackClick }) {
    const [query, setQuery] = useState(initialValue);
    const [suggestions, setSuggestions] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);

    useEffect(() => {
        setQuery(initialValue);
    }, [initialValue]);

    useEffect(() => {
        if (query.length > 2) {
            const timer = setTimeout(() => {
                axios.get('https://jio-yatri-user.onrender/api/address/autocomplete', {
                    params: {
                        input: query,
                        country: 'in'
                    }
                })
                    .then(res => {
                        setSuggestions(res.data.predictions || []);
                        setShowDropdown(true);
                    })
                    .catch(err => console.error('Autocomplete error:', err));
            }, 300);
            return () => clearTimeout(timer);
        } else {
            setSuggestions([]);
            setShowDropdown(false);
        }
    }, [query]);

    const handleSelect = async (suggestion) => {
        setQuery(suggestion.description);
        setShowDropdown(false);

        try {
            const response = await axios.get('https://jio-yatri-user.onrender/api/address/geocode', {
                params: { place_id: suggestion.place_id }
            });

            const location = response.data.result?.geometry?.location;
            if (location) {
                const addressData = {
                    address: suggestion.description,
                    coordinates: { lat: location.lat, lng: location.lng }
                };
                onSelect(addressData);
            }
        } catch (error) {
            console.error('Geocoding failed:', error);
        }
    };
    
    return (
        <div className="address-autocomplete-container">
            <div className="search-header">
                {/* <button className="back-button" onClick={onBackClick}>
                    <FaArrowLeft />
                </button> */}
                <div className="address-autocomplete">
                    <div className="input-with-icon">
                        <FaMapMarkerAlt className="location-icon" />
                        <input
                            type="text"
                            value={query}
                            onChange={(e) => setQuery(e.target.value)}
                            placeholder="Enter address..."
                            required
                        />
                    </div>

                    {showDropdown && suggestions.length > 0 && (
                        <div className="suggestions-dropdown-container">
                            <ul className="suggestions-dropdown">
                                {suggestions.map((suggestion, index) => (
                                    <li
                                        key={index}
                                        className="suggestion-item"
                                        onClick={() => handleSelect(suggestion)}
                                    >
                                        <FaMapMarkerAlt className="suggestion-icon" />
                                        <span>{suggestion.description}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default AddressAutocomplete;
