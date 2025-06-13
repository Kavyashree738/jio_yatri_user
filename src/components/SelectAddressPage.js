import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import AddressAutocomplete from '../components/AddressAutocomplete';
import { FaArrowLeft } from 'react-icons/fa';
import '../styles/SelectAddressPage.css';

function SelectAddressPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const { type, currentAddress, shipmentData } = location.state || {};

    const handleAddressSelect = (address) => {
        navigate('/shipment', {
            state: {
                type,
                selectedAddress: {
                    address: address.address,
                    coordinates: address.coordinates
                },
                shipmentData: shipmentData
            },
            replace: true
        });
    };

    if (!type) {
        return (
            <div className="address-page-container">
                <div className="address-header">
                    <button className="back-button" onClick={() => navigate(-1)}>
                        <FaArrowLeft /> Back
                    </button>
                </div>
                <div>Invalid address selection</div>
            </div>
        );
    }

    return (
        <div className="address-page-container">
            <div className="address-header">
                <button className="back-button" onClick={() => navigate(-1)}>
                    <FaArrowLeft />
                </button>
                <AddressAutocomplete 
                    onSelect={handleAddressSelect}
                    initialValue={currentAddress?.addressLine1 || ''}
                    onBackClick={() => navigate(-1)}
                />
            </div>
        </div>
    );
}
export default SelectAddressPage;