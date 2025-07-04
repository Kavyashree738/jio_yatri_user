// import React, { useState } from 'react';
// import axios from 'axios';
// import { useAuth } from '../../context/AuthContext';
// import loadRazorpay from '../../utils/loadRazorpay';
// import '../../styles/payment.css'
// console.log('Component mounted - TEST');
// const PaymentModal = ({ shipment, onClose, refreshShipments }) => {
//     const [loading, setLoading] = useState(false);
//     const [error, setError] = useState('');
//     const { token } = useAuth();

//     const handleOnlinePayment = async () => {
//         console.log('[1] Starting online payment process');
//         setLoading(true);
//         setError('');

//         try {
//             // 1. Create Razorpay order
//             console.log('[2] Attempting to create order via API');
//             const response = await axios.post(
//                 `http://localhost:5000/api/payment/${shipment._id}/initiate`,
//                 {},
//                 {
//                     headers: { Authorization: `Bearer ${token}` },
//                     withCredentials: true
//                 }
//             );
//             console.log('[3] Order creation response:', response);

//             if (!response.data) {
//                 throw new Error('No data received from order creation');
//             }

//             const order = response.data;
//             console.log('[4] Order details:', order);

//             // 2. Load Razorpay script
//             console.log('[5] Loading Razorpay script');
//             const scriptLoaded = await loadRazorpay();
//             console.log('[6] Script load result:', scriptLoaded);

//             if (!scriptLoaded) {
//                 throw new Error('Razorpay SDK failed to load');
//             }

//             // 3. Verify Razorpay is available
//             if (!window.Razorpay) {
//                 throw new Error('Razorpay not available after script load');
//             }
//             console.log('[7] Razorpay SDK verified');

//             // 4. Prepare options
//             const options = {
//                 key: process.env.REACT_APP_RAZORPAY_KEY_ID,
//                 amount: order.amount,
//                 currency: 'INR',
//                 name: 'Your Company',
//                 description: `Payment for Shipment #${shipment.trackingNumber}`,
//                 order_id: order.id,
//                 handler: async function (response) {
//                     console.log('[8] Payment success handler triggered:', response);
//                     try {
//                         console.log('[9] Verifying payment with backend');
//                         const verifyRes = await axios.post(
//                             'http://localhost:5000/api/payment/verify',
//                             {
//                                 razorpay_payment_id: response.razorpay_payment_id,
//                                 razorpay_order_id: response.razorpay_order_id,
//                                 razorpay_signature: response.razorpay_signature,
//                                 shipmentId: shipment._id
//                             },
//                             {
//                                 headers: { Authorization: `Bearer ${token}` },
//                                 withCredentials: true
//                             }
//                         );
//                         console.log('[10] Verification response:', verifyRes.data);
//                         onClose();
//                         refreshShipments();
//                     } catch (verifyError) {
//                         console.error('[11] Verification error:', verifyError);
//                         setError('Payment verification failed. Please contact support.');
//                         setLoading(false);
//                     }
//                 },
//                 prefill: {
//                     name: shipment.sender.name,
//                     email: shipment.sender.email || '',
//                     contact: shipment.sender.phone
//                 },
//                 theme: { color: '#3399cc' }
//             };

//             console.log('[12] Creating Razorpay instance with options:', options);
//             const rzp = new window.Razorpay(options);

//             rzp.on('payment.failed', function (response) {
//                 console.error('[13] Payment failed callback:', response.error);
//                 setError(`Payment failed: ${response.error.description}`);
//                 setLoading(false);
//             });

//             console.log('[14] Opening Razorpay modal');
//             rzp.open();

//         } catch (err) {
//             console.error('[15] Main payment error:', err);
//             console.error('Error details:', {
//                 message: err.message,
//                 response: err.response,
//                 stack: err.stack
//             });
//             setError(err.response?.data?.message || 'Payment processing failed');
//             setLoading(false);
//         }
//     };

//     const handleCashPayment = async () => {
//         setLoading(true);
//         setError('');
//         console.log('Processing cash payment');

//         try {
//             const res = await axios.post(
//                 `http://localhost:5000/api/payment/${shipment._id}/cash`,
//                 {},
//                 { headers: { Authorization: `Bearer ${token}` } }
//             );
//             console.log('Cash payment processed:', res.data);

//             onClose();
//             refreshShipments();
//         } catch (err) {
//             console.error('Error during cash payment:', err);
//             setError(err.response?.data?.message || 'Failed to mark as paid');
//             setLoading(false);
//         }
//     };

//     return (
//         <div className="payment-modal">
//             <div className="payment-modal-content">
//                 <h3>Complete Payment</h3>
//                 <p>Shipment #{shipment.trackingNumber}</p>
//                 <p className="payment-amount">Amount: ₹{shipment.cost.toFixed(2)}</p>

//                 <div className="payment-options">
//                     <button
//                         onClick={handleOnlinePayment}
//                         className="payment-option online"
//                         disabled={loading}
//                     >
//                         Pay Online (Razorpay)
//                     </button>

//                     <button
//                         onClick={handleCashPayment}
//                         className="payment-option cash"
//                         disabled={loading}
//                     >
//                         Pay Cash to Driver
//                     </button>
//                 </div>

//                 {error && <p className="payment-error">{error}</p>}

//                 <button onClick={onClose} className="payment-cancel" disabled={loading}>
//                     Cancel
//                 </button>
//             </div>
//         </div>
//     );
// };

// export default PaymentModal;

import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import loadRazorpay from '../../utils/loadRazorpay';
import '../../styles/payment.css';

const PaymentModal = ({ shipment, onClose, refreshShipments }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { token } = useAuth();
    const [activeOption, setActiveOption] = useState(null);

    const handleOnlinePayment = async () => {
        setActiveOption('online');
        setLoading(true);
        setError('');

        try {
            const { data: { data: order } } = await axios.post(
                `https://jio-yatri-user.onrender.com/api/payment/${shipment._id}/initiate`,
                {},
                { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
            );

            const scriptLoaded = await loadRazorpay();
            if (!scriptLoaded || !window.Razorpay) {
                throw new Error('Payment service unavailable');
            }

            const options = {
                key: process.env.REACT_APP_RAZORPAY_KEY_ID,
                amount: order.amount,
                currency: 'INR',
                name: 'MOKSHAAMBANI TECH SERVICE',
                description: `Payment for Shipment #${shipment.trackingNumber}`,
                order_id: order.id,
                handler: async (response) => {
                    try {
                        await axios.post(
                            'https://jio-yatri-user.onrender.com/api/payment/verify',
                            {
                                razorpay_payment_id: response.razorpay_payment_id,
                                razorpay_order_id: response.razorpay_order_id,
                                razorpay_signature: response.razorpay_signature,
                                shipmentId: shipment._id
                            },
                            { headers: { Authorization: `Bearer ${token}` }, withCredentials: true }
                        );
                        onClose();
                        refreshShipments();
                    } catch (err) {
                        setError('Payment verification failed. Please check your email for confirmation.');
                        setLoading(false);
                    }
                },
                prefill: {
                    name: shipment.sender.name,
                    email: shipment.sender.email || '',
                    contact: shipment.sender.phone
                },
                theme: { color: '#6C63FF' },
                modal: { ondismiss: () => setLoading(false) }
            };

            const rzp = new window.Razorpay(options);
            rzp.on('payment.failed', (response) => {
                setError(`Payment failed: ${response.error.description}`);
                setLoading(false);
            });
            rzp.open();

        } catch (err) {
            setError(err.response?.data?.message || 'Payment processing failed');
            setLoading(false);
        }
    };

    const handleCashPayment = async () => {
        setActiveOption('cash');
        setLoading(true);
        setError('');

        try {
            await axios.post(
                `https://jio-yatri-user.onrender.com/api/payment/${shipment._id}/cash`,
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            onClose();
            refreshShipments();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to process cash payment');
            setLoading(false);
        }
    };

    return (
        <div className="payment-modal">
            <div className="payment-modal-content">
                <div className="payment-header">
                    <h3>Complete Your Payment</h3>
                    <p className="payment-subtitle">Shipment #{shipment.trackingNumber}</p>
                </div>

                <div className="payment-amount-container">
                    <span className="payment-currency">₹</span>
                    <span className="payment-amount">{shipment.cost.toFixed(2)}</span>
                </div>

                <div className="payment-options">
                    <button
                        onClick={handleOnlinePayment}
                        className={`payment-option online ${activeOption === 'online' ? 'active' : ''}`}
                        disabled={loading && activeOption !== 'online'}
                    >
                        <span className="payment-option-icon">💳</span>
                        <span className="payment-option-text">
                            <strong>Pay Online Securely</strong>
                            <small>Credit/Debit, UPI, Netbanking</small>
                        </span>
                        {activeOption === 'online' && loading ? (
                            <span className="payment-option-loader"></span>
                        ) : (
                            <span className="payment-option-arrow">→</span>
                        )}
                    </button>

                    <button
                        onClick={handleCashPayment}
                        className={`payment-option cash ${activeOption === 'cash' ? 'active' : ''}`}
                        disabled={loading && activeOption !== 'cash'}
                    >
                        <span className="payment-option-icon">💰</span>
                        <span className="payment-option-text">
                            <strong>Pay Cash to Driver</strong>
                            <small>When your shipment arrives</small>
                        </span>
                        {activeOption === 'cash' && loading ? (
                            <span className="payment-option-loader"></span>
                        ) : (
                            <span className="payment-option-arrow">→</span>
                        )}
                    </button>
                </div>

                {error && (
                    <div className="payment-error">
                        ⚠️ {error}
                    </div>
                )}

                <button 
                    onClick={onClose} 
                    className="payment-cancel" 
                    disabled={loading}
                >
                    {loading ? 'Processing...' : 'Cancel Payment'}
                </button>
            </div>
        </div>
    );
};

export default PaymentModal;
