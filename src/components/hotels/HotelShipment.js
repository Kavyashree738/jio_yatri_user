import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import axios from 'axios';
import Header from '../pages/Header';
import Footer from '../pages/Footer';
import LocationMap from '../pages/LocationMap';
import AddressAutocomplete from '../AddressAutocomplete';
import { FaMapMarkerAlt, FaChevronRight, FaUser, FaPhone, FaExchangeAlt } from 'react-icons/fa';
import '../../styles/components.css';

const vehicleTypes = [
    {
        type: 'TwoWheeler',
        name: 'Bike',
        rate: 10,
        rateFor2Km: 20,
        emoji: '🛵',
        capacity: 'Up to 8kg',
        available: true,
        displayRate: "₹20 per 2 km"
    },
    {
        type: 'ThreeWheeler',
        name: 'Auto',
        rate: 20,
        rateFor2Km: 40,
        emoji: '🛺',
        capacity: 'Up to 500kg',
        available: true,
        displayRate: "₹40 per 2 km"
    },
    {
        type: 'Truck',
        name: 'Truck',
        rate: 40,
        rateFor2Km: 80,
        emoji: '🚚',
        capacity: 'Up to 1200kg',
        available: true,
        displayRate: "₹80 per 2 km"
    },
    {
        type: 'Pickup9ft',
        name: 'bulara',
        rate: 175,
        rateFor2Km: 350,
        emoji: '🛻',
        capacity: 'Up to 1700kg',
        available: true,
        displayRate: "₹350 per 2 km"
    },
    {
        type: 'Tata407',
        name: 'Tata 407',
        rate: 300,
        rateFor2Km: 600,
        emoji: '🚛',
        capacity: 'Up to 2500kg',
        available: true,
        displayRate: "₹600 per 2 km"
    },
    {
        type: 'ContainerTruck',
        name: 'Container Truck',
        rate: 80,
        rateFor2Km: 160,
        emoji: '🚒',
        capacity: 'Up to 5000kg',
        available: false,
        comingSoon: true,
        displayRate: "₹160 per 2 km"
    }
];

const paymentMethods = [
    { id: 'razorpay', name: 'Online', description: 'Secure payment with Razorpay', icon: '💳' },
    { id: 'pay_after', name: 'Cash', description: 'Pay online after delivery is completed', icon: '💸' }
];

const loadRazorpay = () => {
    return new Promise((resolve) => {
        if (window.Razorpay) {
            resolve(true);
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://checkout.razorpay.com/v1/checkout.js';
        script.onload = () => resolve(true);
        script.onerror = () => resolve(false);
        document.body.appendChild(script);
    });
};

const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

function HotelShipment() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user } = useAuth();

    const [hotel, setHotel] = useState(null);
    const [currentStep, setCurrentStep] = useState(1);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [trackingNumber, setTrackingNumber] = useState('');
    const [calculatedCosts, setCalculatedCosts] = useState({});
    const [distance, setDistance] = useState(0);
    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('pay_after');
    const [paymentProcessing, setPaymentProcessing] = useState(false);
    const [isPaymentDropdownOpen, setIsPaymentDropdownOpen] = useState(false);
    const [currentLocation, setCurrentLocation] = useState(null);
    const [locationError, setLocationError] = useState(null);
    const debounceTimer = useRef(null);
    const [userClickedBack, setUserClickedBack] = useState(false);
    const [shouldAutoProgress, setShouldAutoProgress] = useState(true);
    const [phoneError, setPhoneError] = useState(null);
    const [shipmentData, setShipmentData] = useState({
        receiver: {
            name: '',
            phone: '',
            email: '',
            address: {
                addressLine1: '',
                coordinates: null
            }
        },
        vehicleType: 'TwoWheeler',
        distance: 0,
        cost: 0,
        paymentMethod: 'pay_after'
    });

    useEffect(() => {
        scrollToTop();
    }, [success, currentStep]);

    useEffect(() => {
        if (location.state?.hotel) {
            const hotelData = {
                ...location.state.hotel,
                address: location.state.hotel.address || {
                    address: location.state.hotel.address || 'Address not specified',
                    coordinates: location.state.hotel.coordinates || null
                }
            };
            setHotel(hotelData);
        } else {
            navigate('/hotels');
        }
    }, [location, navigate]);

    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setCurrentLocation({ lat: latitude, lng: longitude });
                },
                (error) => {
                    setLocationError(error.message);
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            setLocationError('Geolocation is not supported by this browser.');
        }
    }, []);

    useEffect(() => {
        if (hotel?.address?.coordinates && shipmentData.receiver.address?.coordinates) {
            clearTimeout(debounceTimer.current);
            debounceTimer.current = setTimeout(() => {
                calculateDistance(true);
            }, 500);
        }
        return () => {
            clearTimeout(debounceTimer.current);
        };
    }, [hotel?.address?.coordinates, shipmentData.receiver.address?.coordinates]);

    useEffect(() => {
        if (currentStep === 1 && validateStep1() && shouldAutoProgress) {
            const timer = setTimeout(() => {
                calculateDistance().then(valid => {
                    if (valid) {
                        setCurrentStep(2);
                    }
                });
            }, 500);
            return () => {
                clearTimeout(timer);
            };
        }
    }, [shipmentData, currentStep, shouldAutoProgress]);

    const validateStep1 = () => {
        return (
            shipmentData.receiver.name.trim() &&
            shipmentData.receiver.phone.trim() &&
            validatePhoneNumber(shipmentData.receiver.phone) &&
            shipmentData.receiver.address.addressLine1.trim()
        );
    };

    const handleReceiverChange = (e) => {
        const { name, value } = e.target;


        if (name === 'phone') {
         
            const cleanedValue = value.replace(/\D/g, '');

            const formattedValue = cleanedValue.slice(0, 10);

            setShipmentData(prev => ({
                ...prev,
                receiver: {
                    ...prev.receiver,
                    [name]: formattedValue
                }
            }));
            return;
        }

        setShouldAutoProgress(true);
        setShipmentData(prev => ({
            ...prev,
            receiver: {
                ...prev.receiver,
                [name]: value
            }
        }));
    };

    const handleVehicleSelect = (type) => {
        const cost = calculatedCosts[type] || 0;
        setShipmentData(prev => ({
            ...prev,
            vehicleType: type,
            cost: cost
        }));
    };

    const handlePaymentMethodSelect = (method) => {
        setSelectedPaymentMethod(method);
        setShipmentData(prev => ({
            ...prev,
            paymentMethod: method
        }));
    };

    const calculateDistance = async (isAutomatic = false) => {
        if (!hotel?.address?.coordinates || !shipmentData.receiver.address?.coordinates) {
            if (!isAutomatic) {
                setError('Please select valid delivery address');
            }
            return false;
        }

        if (!isAutomatic) {
            setIsSubmitting(true);
        }
        setError(null);

        try {
            const response = await axios.post('https://jio-yatri-user.onrender.com/api/hotel-shipments/calculate-distance', {
                origin: hotel.address.coordinates,
                destination: shipmentData.receiver.address.coordinates
            });

            const calculatedDistance = response.data.distance;
            setDistance(calculatedDistance);

            const costs = {};
            vehicleTypes.forEach(vehicle => {
                costs[vehicle.type] = calculatedDistance * vehicle.rate;
            });
            setCalculatedCosts(costs);

            setShipmentData(prev => ({
                ...prev,
                distance: calculatedDistance,
                cost: costs[prev.vehicleType] || 0
            }));

            return true;
        } catch (error) {
            if (!isAutomatic) {
                const errorMsg = error.response?.data?.message || 'Failed to calculate distance';
                setError(errorMsg);
            }
            return false;
        } finally {
            if (!isAutomatic) {
                setIsSubmitting(false);
            }
        }
    };

    const processRazorpayPayment = async (shipmentId) => {
        if (!shipmentId) {
            setError('Invalid shipment ID');
            return;
        }

        setPaymentProcessing(true);
        setError(null);

        try {
            const token = await user.getIdToken();

            const orderResponse = await axios.post(
                `https://jio-yatri-user.onrender.com/api/payment/${shipmentId}/initiate`,
                {},
                {
                    headers: { Authorization: `Bearer ${token}` },
                    withCredentials: true
                }
            );

            const order = orderResponse.data.data;

            const scriptLoaded = await loadRazorpay();
            if (!scriptLoaded) {
                throw new Error('Razorpay SDK failed to load');
            }

            if (!window.Razorpay) {
                throw new Error('Razorpay not available after script load');
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: 'INR',
                name: 'MokshaAmbani Logistics',
                description: `Payment for Hotel Shipment #${trackingNumber}`,
                order_id: order.id,
                handler: async function (response) {
                    try {
                        await axios.post(
                            'https://jio-yatri-user.onrender.com/api/payment/verify',
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                shipmentId: shipmentId
                            },
                            {
                                headers: { Authorization: `Bearer ${token}` },
                                withCredentials: true
                            }
                        );
                        setSuccess(true);
                        setCurrentStep(3);
                    } catch (error) {
                        setError('Payment verification failed. Please contact support.');
                    } finally {
                        setPaymentProcessing(false);
                    }
                },
                prefill: {
                    name: hotel.name,
                    email: '',
                    contact: hotel.phone
                },
                theme: { color: '#3399cc' },
                modal: {
                    ondismiss: () => {
                        setPaymentProcessing(false);
                    }
                }
            };

            const rzp = new window.Razorpay(options);

            rzp.on('payment.failed', function (response) {
                setError(`Payment failed: ${response.error.description}`);
                setPaymentProcessing(false);
            });

            rzp.open();

        } catch (error) {
            setError(error.response?.data?.message || 'Payment processing failed');
            setPaymentProcessing(false);
        }
    };

    const handleBackToDetails = () => {
        setShouldAutoProgress(false);
        setCurrentStep(1);
    };

    const validatePhoneNumber = (phone) => {
        // Indian mobile numbers: 10 digits starting with 6-9
        const indianRegex = /^[6-9]\d{9}$/;

        // International format (optional): + followed by country code and number
        // const internationalRegex = /^\+\d{1,3}\d{6,14}$/;

        return indianRegex.test(phone);
    };

    const handleNextStep = () => {
        if (!shipmentData.receiver.name || !shipmentData.receiver.phone) {
            setError('Please fill all receiver details');
            return;
        }
        if (!validatePhoneNumber(shipmentData.receiver.phone)) {
            setPhoneError('Please enter a valid 10-digit mobile number');
            return;
        }
        if (!shipmentData.receiver.address.addressLine1) {
            setError('Please select delivery location');
            return;
        }

        calculateDistance().then(valid => {
            if (valid) {
                setCurrentStep(2);
            }
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!user) {
            setError('Please login to create shipments');
            return;
        }

        if (!shipmentData.vehicleType) {
            setError('Please select a vehicle type');
            return;
        }

        setIsSubmitting(true);
        setError(null);

        try {
            const token = await user.getIdToken();

            const payload = {
                hotelId: hotel._id,
                receiver: {
                    name: shipmentData.receiver.name,
                    phone: shipmentData.receiver.phone,
                    email: shipmentData.receiver.email || '',
                    address: {
                        addressLine1: shipmentData.receiver.address.addressLine1,
                        coordinates: shipmentData.receiver.address.coordinates
                    }
                },
                vehicleType: shipmentData.vehicleType,
                distance: shipmentData.distance,
                cost: shipmentData.cost,
                paymentMethod: shipmentData.paymentMethod
            };

            const response = await axios.post('https://jio-yatri-user.onrender.com/api/hotel-shipments', payload, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            const shipmentId = response.data.shipment?._id;
            setTrackingNumber(response.data.trackingNumber);

            if (shipmentData.paymentMethod === 'pay_after') {
                setSuccess(true);
                setCurrentStep(3);
                return;
            }

            await processRazorpayPayment(shipmentId);

        } catch (error) {
            setError(
                error.response?.data?.message ||
                error.response?.data?.error ||
                'Failed to submit shipment. Please try again.'
            );
        } finally {
            setIsSubmitting(false);
        }
    };

    if (paymentProcessing) {
        return (
            <div className="payment-processing-overlay">
                <div className="payment-processing-content">
                    <div className="payment-processing-spinner"></div>
                    <h3>Processing Payment...</h3>
                    <p>Please wait while we process your payment</p>
                </div>
            </div>
        );
    }

    if (!hotel || !hotel.address) {
        return (
            <div className="loading-container">
                <div className="spinner"></div>
                <p>Loading hotel details...</p>
            </div>
        );
    }

    if (currentStep === 3) {
        return (
            <div className="confirmation-page">
                <Header />
                <div className="content-wrap">
                    <div className="confirmation-container">
                        <div className="success-icon">
                            <div className="checkmark-circle">
                                <svg className="checkmark-icon" viewBox="0 0 52 52">
                                    <circle className="checkmark-circle-bg" cx="26" cy="26" r="25" fill="none" />
                                    <path className="checkmark-check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
                                </svg>
                            </div>
                        </div>
                        <h1 className="success-title">Order Confirmed!</h1>
                        <p className="success-subtitle">Your hotel shipment has been successfully created</p>
                        <div className="order-id">
                            <span>Tracking Number: {trackingNumber}</span>
                        </div>
                        <div className="payment-method-display">
                            <span>Payment Method: </span>
                            <strong>
                                {shipmentData.paymentMethod === 'razorpay'
                                    ? 'Online Payment'
                                    : 'Pay After Delivery'}
                            </strong>
                        </div>
                        <div className="total-summary">
                            <div className="total-label">Total Amount</div>
                            <div className="total-amount">₹{shipmentData.cost.toFixed(2)}</div>
                        </div>
                        <div className="action-buttons">
                            <button
                                className="btn-secondary"
                                onClick={() => {
                                    navigate('/home');
                                    scrollToTop();
                                }}
                            >
                                Back to Home
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (currentStep === 1) {
        return (
            <div className="shipment-page rapido-style">
                <Header />
                <div className="shipment-container">
                    <h2 className="step-title">Hotel Parcel Delivery</h2>

                    <div className="sender-sections">
                        <h3>Pickup From:</h3>
                        <div className="hotel-info">
                            <p className="hotel-name">{hotel.name}</p>
                            <p className="hotel-address">
                                <FaMapMarkerAlt className="icon" /> {hotel.address?.address || 'Address not available'}
                            </p>
                            <p className="hotel-phone">
                                <FaPhone className="icon" /> {hotel.phone}
                            </p>
                        </div>
                    </div>

                    <div className="map-preview">
                        <LocationMap
                            senderCoordinates={hotel.address?.coordinates}
                            receiverCoordinates={shipmentData.receiver.address?.coordinates}
                            currentLocation={currentLocation}
                        />
                    </div>

                    <div className="receiver-section">
                        <h3>Deliver To:</h3>
                        <div className="input-group">
                            <input
                                type="text"
                                name="name"
                                value={shipmentData.receiver.name}
                                onChange={handleReceiverChange}
                                placeholder="Receiver Name"
                                className="form-input"
                            />
                        </div>
                        <div className="input-group">
                            <input
                                type="tel"
                                name="phone"
                                value={shipmentData.receiver.phone}
                                onChange={handleReceiverChange}
                                onBlur={() => {
                                    if (shipmentData.receiver.phone && !validatePhoneNumber(shipmentData.receiver.phone)) {
                                        setPhoneError('Please enter a valid 10-digit mobile number');
                                    } else {
                                        setPhoneError(null);
                                    }
                                }}
                                placeholder="Receiver Phone"
                                className={`form-input ${phoneError ? 'input-error' : ''}`}
                                maxLength="10" // Limits to 10 digits for Indian numbers
                            />
                            {phoneError && <div className="input-error-message">{phoneError}</div>}
                        </div>
                        <div className="address-autocomplete-wrapper">
                            <AddressAutocomplete
                                initialValue={shipmentData.receiver.address.addressLine1}
                                onSelect={(addressData) => {
                                    setShipmentData(prev => ({
                                        ...prev,
                                        receiver: {
                                            ...prev.receiver,
                                            address: {
                                                addressLine1: addressData.address,
                                                coordinates: addressData.coordinates
                                            }
                                        }
                                    }));

                                    if (hotel?.address?.coordinates) {
                                        calculateDistance(true);
                                    }
                                }}
                            />
                        </div>
                    </div>


                    <h6 className='services'>Services</h6>
                    <div className="vehicle-options-container">
                        {vehicleTypes.map((vehicle) => (
                            <div
                                key={vehicle.type}
                                className={`vehicle-option ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''} ${!vehicle.available ? 'unavailable' : ''}`}
                                onClick={() => vehicle.available && handleVehicleSelect(vehicle.type)}
                            >
                                <div className="vehicle-icons">{vehicle.emoji}</div>
                                <div className="vehicle-info">
                                    <div className="vehicle-name">{vehicle.name}</div>
                                    <div className="vehicle-capacity">{vehicle.capacity}</div>

                                </div>
                                <div className="vehicle-rate">{vehicle.displayRate}</div>
                                {shipmentData.distance > 0 && (
                                    <div className="vehicle-price">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</div>
                                )}
                                {vehicle.comingSoon && <div className="coming-soon">Coming Soon</div>}
                            </div>
                        ))}
                    </div>

                    {error && <div className="error-message">{error}</div>}

                    <button
                        className="next-button"
                        onClick={handleNextStep}
                        disabled={isSubmitting || !validateStep1()}
                    >
                        {isSubmitting ? 'Calculating...' : 'Continue'}
                    </button>
                </div>
            </div>
        );
    }

    if (currentStep === 2) {
        return (
            <div className="shipment-page rapido-style">
                <Header />
                <div className="map-preview">
                    <LocationMap
                        senderCoordinates={hotel.address?.coordinates}
                        receiverCoordinates={shipmentData.receiver.address?.coordinates}
                        currentLocation={currentLocation}
                    />

                    <div className="button-group">
                        <button className="back-buttons" onClick={handleBackToDetails}>
                            ←
                        </button>
                    </div>
                </div>
                <div className="shipment-container">
                    <h2 className="step-title">Confirm Hotel Shipment</h2>


                    <div className="vehicle-selection-section">
                        <h3 className="section-vehicle-title">Select Vehicle</h3>
                        <div className="vehicle-options-container">
                            {vehicleTypes.map((vehicle) => (
                                <div
                                    key={vehicle.type}
                                    className={`vehicle-option ${shipmentData.vehicleType === vehicle.type ? 'selected' : ''} ${!vehicle.available ? 'unavailable' : ''}`}
                                    onClick={() => vehicle.available && handleVehicleSelect(vehicle.type)}
                                >
                                    <div className="vehicle-icons">{vehicle.emoji}</div>
                                    <div className="vehicle-info">
                                        <div className="vehicle-name">{vehicle.name}</div>
                                        <div className="vehicle-capacity">{vehicle.capacity}</div>
                                    </div>
                                    <div className="vehicle-rate">{vehicle.displayRate}</div>
                                    {shipmentData.distance > 0 && (
                                        <div className="vehicle-price">₹{(shipmentData.distance * vehicle.rate).toFixed(2)}</div>
                                    )}
                                    {vehicle.comingSoon && <div className="coming-soon">Coming Soon</div>}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="summary-section">
                        <div className="summary-item">
                            <span className="summary-label">Pickup:</span>
                            <span className="summary-value">{hotel.name}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Delivery:</span>
                            <span className="summary-value">{shipmentData.receiver.address.addressLine1}</span>
                        </div>
                        <div className="summary-item">
                            <span className="summary-label">Distance:</span>
                            <span className="summary-value">{shipmentData.distance.toFixed(2)} km</span>
                        </div>
                        <div className="summary-item total">
                            <span className="summary-label">Total Cost:</span>
                            <span className="summary-value">₹{shipmentData.cost.toFixed(2)}</span>
                        </div>
                    </div>

                    <div className="payment-section">
                        <h3 className="section-vehicle-title">Payment Method</h3>

                        <div className="dropdown-payment-selector">
                            <div
                                className="selected-payment"
                                onClick={() => setIsPaymentDropdownOpen(!isPaymentDropdownOpen)}
                            >
                                <span className="payment-icon">
                                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.icon}
                                </span>
                                <span className="payment-name">
                                    {paymentMethods.find(m => m.id === selectedPaymentMethod)?.name}
                                </span>
                                <span className={`dropdown-arrow ${isPaymentDropdownOpen ? 'open' : ''}`}>
                                    <svg width="12" height="8" viewBox="0 0 12 8" fill="none" xmlns="http://www.w3.org/2000/svg">
                                        <path d="M1 1L6 6L11 1" stroke="#4A5568" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                            </div>

                            {isPaymentDropdownOpen && (
                                <div className="payment-options-dropdown">
                                    {paymentMethods.map(method => (
                                        <div
                                            key={method.id}
                                            className={`payment-option ${selectedPaymentMethod === method.id ? 'selected' : ''}`}
                                            onClick={() => {
                                                handlePaymentMethodSelect(method.id);
                                                setIsPaymentDropdownOpen(false);
                                            }}
                                        >
                                            <span className="payment-icon">{method.icon}</span>
                                            <span className="payment-name">{method.name}</span>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <button
                                className="confirm-button"
                                onClick={handleSubmit}
                                disabled={isSubmitting}
                            >
                                {isSubmitting ? 'Processing...' : 'Confirm Booking'}
                            </button>
                        </div>

                        {error && <div className="error-message">{error}</div>}
                    </div>
                </div>
            </div>
        );
    }

    return null;
}

export default HotelShipment;
