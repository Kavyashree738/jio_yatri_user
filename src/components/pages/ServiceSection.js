import React from 'react'
import '../../styles/ServiceSection.css'

const ServiceSection = () => {
    return (
        <section className="services-section" id="service">
            <h2 className="section-title">Delivery Services</h2>
            
            <div className="services-container">
                <div className="service-row">
                    <div className="service-item">
                        <span className="service-emoji">🛵</span>
                        <div className="service-details">
                            <span className="service-name">Two Wheeler</span>
                            <span className="service-capacity">Upto 20 kg</span>
                        </div>
                        <span className="service-rate">₹50/km</span>
                    </div>
                    
                    <div className="service-item">
                        <span className="service-emoji">🚚</span>
                        <div className="service-details">
                            <span className="service-name">Three Wheeler</span>
                            <span className="service-capacity">Upto 200 kg</span>
                        </div>
                        <span className="service-rate">₹80/km</span>
                    </div>
                    
                    <div className="service-item">
                        <span className="service-emoji">🛻</span>
                        <div className="service-details">
                            <span className="service-name">Pickup Truck</span>
                            <span className="service-capacity">Upto 1,000 kg</span>
                        </div>
                        <span className="service-rate">₹100/km</span>
                    </div>
                    
                    <div className="service-item">
                        <span className="service-emoji">🚛</span>
                        <div className="service-details">
                            <span className="service-name">Truck (Tata 407)</span>
                            <span className="service-capacity">Upto 4,000 kg</span>
                        </div>
                        <span className="service-rate">₹120/km</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

export default ServiceSection
