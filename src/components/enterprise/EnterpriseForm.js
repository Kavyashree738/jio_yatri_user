import React, { useState } from "react";
import { FaUser, FaPhone, FaBuilding, FaEnvelope } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css';
import '../../styles/enterprise/EnterpriseForm.css';

export default function EnterpriseForm() {
    const [formData, setFormData] = useState({
        name: '',
        mobile: '',
        company: '',
        email: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };

    const handleSubmit = async (e) => {
    e.preventDefault();

    try {
        const res = await axios.post('https://jio-yatri-user.onrender.com/api/enterprise', formData);
        toast.success('Form submitted successfully!', { position: 'bottom-center' });

        setFormData({
            name: '',
            mobile: '',
            company: '',
            email: ''
        });
    } catch (err) {
        console.error(err);

        if (err.response) {
            if (err.response.status === 409) {
                // User already exists (based on mobile number)
                toast.error('User already exists with this mobile number.', { position: 'bottom-center' });
            } else if (err.response.status === 400) {
                toast.error('Please fill in all required fields.', { position: 'bottom-center' });
            } else {
                toast.error('Failed to submit form. Please try again.', { position: 'bottom-center' });
            }
        } else {
            toast.error('Network error. Please check your connection.', { position: 'bottom-center' });
        }
    }
};

    return (
        <section className="enterprise-section">
            <div className="text-container">
                <h3>JIOYATRI DELIVERY ENTERPRISE</h3>
                <h4>Secure & Consistent Goods Movement with Full Control</h4>
                <div>
                    <h5>Stress-Free Business Logistics</h5>
                    <h5>All-in-One Control Hub</h5>
                    <h5>Clear Insights with End-to-End Control</h5>
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
                        <FaBuilding className="input-icon" />
                        <input
                            type="text"
                            name="company"
                            placeholder="Enter your Company Name"
                            value={formData.company}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="input-group">
                        <FaEnvelope className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your Email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <button type="submit">Get in Touch</button>
                </form>

                <ToastContainer />
            </div>
        </section>
    );
}
