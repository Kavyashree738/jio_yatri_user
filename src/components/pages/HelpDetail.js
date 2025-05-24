import React from 'react';
import '../../styles/HelpDetail.css';
import Footer from './Footer';
import Header from './Header';
const HelpDetails = () => {
    return (
        <>
            <Header />
            <section className="help-details-section">
                <h2>Help Center - Full Details</h2>
                <div className="support-grid">
                    <div className="support-card">
                        <h3>Customer Support</h3>
                        <p>Need help with your bookings or questions? Our dedicated customer support team is here to assist you 24/7.</p>
                        <p>Whether it's a last-minute change, cancellation, or special request, just reach out to us and we'll handle it promptly.</p>
                        <p>You can also find quick answers in our FAQs to resolve common queries instantly.</p>
                        <p><strong>📧</strong> help@jioyatri.com</p>
                        <p><strong>📞</strong> 9844559599</p>
                    </div>

                    <div className="support-card">
                        <h3>Packers & Movers</h3>
                        <p>Having trouble with your shifting booking? Our Packers & Movers support team is specialized in handling your relocation issues smoothly.</p>
                        <p>From scheduling your move to managing logistics and ensuring safe transit, we're here to support you every step of the way.</p>
                        <p>If your belongings are delayed or you face any packing-related concerns, don't hesitate to contact us.</p>
                        <p><strong>📧</strong> packermover@jioyatri.com</p>
                        <p><strong>📞</strong> 9844559599</p>
                    </div>

                    <div className="support-card">
                        <h3>Enterprise Services</h3>
                        <p>Are you a business looking for customized logistics solutions? Our enterprise team offers tailored services to streamline your operations.</p>
                        <p>We handle bulk shipments, corporate accounts, and provide dedicated support for all your enterprise needs.</p>
                        <p>Partner with us to get priority service, flexible billing, and real-time tracking for your shipments.</p>
                        <p><strong>📧</strong> help@jioyatri.com</p>
                    </div>

                    <div className="support-card">
                        <h3>Drive with Us</h3>
                        <p>Own a mini truck or bike? Join our growing network of drivers and earn by delivering with JioYatri.</p>
                        <p>We offer flexible schedules, fair payouts, and a supportive community to help you succeed.</p>
                        <p>Sign up today and start your journey as a delivery partner with us.</p>
                        <p><strong>📞</strong> 9844559599</p>
                    </div>
                </div>

            </section>
            <Footer></Footer>
        </>
    );
};

export default HelpDetails;
