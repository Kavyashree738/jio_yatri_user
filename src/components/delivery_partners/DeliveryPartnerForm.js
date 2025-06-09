import React, { useState } from "react";
import { FaUser, FaPhone, FaCity, FaTruck, FaMapMarkerAlt } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/delivery_partners/DeliveryPartnerForm.css';

export default function DeliveryPartnerForm() {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        city: 'Bangalore',
        vehicle: 'Bike',
        source: 'App'
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const res = await axios.post('https://jio-yatri-user.onrender.com/api/partners', formData);
            toast.success('Form submitted successfully!');
            setFormData({
                name: '',
                mobile: '',
                city: 'Bangalore',
                vehicle: 'Bike',
                source: 'App'
            });
        } catch (err) {
            console.error(err);

           if (err.response) {
            if (err.response.status === 409) {
                toast.error('User already exists with this mobile number.', { position: 'bottom-center' });
            } else if (err.response.status === 400) {
                toast.error('Validation error: Please fill all fields correctly.', { position: 'bottom-center' });
            } else {
                toast.error('Failed to submit form. Please try again.', { position: 'bottom-center' });
            }
        } else {
            toast.error('Network error. Please try again.', { position: 'bottom-center' });
        }
        }
    };

    return (
        <section className="delivery-section">
            <div className="text-container">
                <h3>DELIVERY PARTNER</h3>
                <h4>Have a mini truck or bike? Join Us!</h4>
                <div>
                    <h5>Earn by completing delivery orders</h5>
                    <h5>Flexible schedule, great rewards</h5>
                    <h5>Quick onboarding, fast payouts</h5>
                </div>
            </div>

            <div className="form-container">
                <h2>Attach Vehicle Now</h2>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <FaUser className="input-icon" />
                        <input
                            type="text"
                            name="name"
                            placeholder="Enter your name"
                            value={formData.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaPhone className="input-icon" />
                        <input
                            type="tel"
                            name="mobile"
                            placeholder="Enter mobile number"
                            value={formData.mobile}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaCity className="input-icon" />
                           <select
                            name="city"
                            value={formData.city}
                            onChange={handleChange}
                            required
                        >
                            <option value="Bagalkot">Bagalkot</option>
                            <option value="Ballari">Ballari</option>
                            <option value="Belagavi">Belagavi</option>
                            <option value="Bengaluru Rural">Bengaluru Rural</option>
                            <option value="Bengaluru Urban">Bengaluru Urban</option>
                            <option value="Bidar">Bidar</option>
                            <option value="Chamarajanagar">Chamarajanagar</option>
                            <option value="Chikkaballapur">Chikkaballapur</option>
                            <option value="Chikkamagaluru">Chikkamagaluru</option>
                            <option value="Chitradurga">Chitradurga</option>
                            <option value="Dakshina Kannada">Dakshina Kannada</option>
                            <option value="Davangere">Davangere</option>
                            <option value="Dharwad">Dharwad</option>
                            <option value="Gadag">Gadag</option>
                            <option value="Hassan">Hassan</option>
                            <option value="Haveri">Haveri</option>
                            <option value="Kalaburagi">Kalaburagi</option>
                            <option value="Kodagu">Kodagu</option>
                            <option value="Kolar">Kolar</option>
                            <option value="Koppal">Koppal</option>
                            <option value="Mandya">Mandya</option>
                            <option value="Mysuru">Mysuru</option>
                            <option value="Raichur">Raichur</option>
                            <option value="Ramanagara">Ramanagara</option>
                            <option value="Shivamogga">Shivamogga</option>
                            <option value="Tumakuru">Tumakuru</option>
                            <option value="Udupi">Udupi</option>
                            <option value="Uttara Kannada">Uttara Kannada</option>
                            <option value="Vijayapura">Vijayapura</option>
                            <option value="Yadgir">Yadgir</option>

                        </select>
                    </div>

                    <div className="input-group">
                        <FaTruck className="input-icon" />
                        <select
                            name="vehicle"
                            value={formData.vehicle}
                            onChange={handleChange}
                            required
                        >
                            <option value="Bike">Bike</option>
                            <option value="Mini Truck">Mini Truck</option>
                            <option value="Van">Van</option>
                        </select>
                    </div>

                    <div className="input-group">
                        <FaMapMarkerAlt className="input-icon" />
                        <select
                            name="source"
                            value={formData.source}
                            onChange={handleChange}
                            required
                        >
                            <option value="App">App</option>
                            <option value="Website">Website</option>
                            <option value="Referral">Referral</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <button type="submit">REGISTER</button>
                </form>
            </div>

            {/* Toast Container */}
            <ToastContainer position="top-center" autoClose={3000} />
        </section>
    );
}
