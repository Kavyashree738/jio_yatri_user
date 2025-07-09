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
                            <span className="service-capacity">Upto 8 kg</span>
                        </div>
                        <span className="service-rate">₹20/km</span>
                    </div>
                    
                    <div className="service-item">
                        <span className="service-emoji">🛺</span>
                        <div className="service-details">
                            <span className="service-name">Three Wheeler</span>
                            <span className="service-capacity">Upto 500 kg</span>
                        </div>
                        <span className="service-rate">₹30/km</span>
                    </div>
                    
                    <div className="service-item">
                        <span className="service-emoji">🚚</span>
                        <div className="service-details">
                            <span className="service-name">Truck</span>
                            <span className="service-capacity">Upto 1,200 kg</span>
                        </div>
                        <span className="service-rate">₹40/km</span>
                    </div>
                    
                    <div className="service-item">
                        <span className="service-emoji">🛻</span>
                        <div className="service-details">
                            <span className="service-name">Pickup9ft</span>
                            <span className="service-capacity">Upto 1700 kg</span>
                        </div>
                        <span className="service-rate">₹50/km</span>
                    </div>
                    <div className="service-item">
                        <span className="service-emoji">🚛</span>
                        <div className="service-details">
                            <span className="service-name">Pickup9ft</span>
                            <span className="service-capacity">Up to 2500kg</span>
                        </div>
                        <span className="service-rate">₹60/km</span>
                    </div>
                    {/* <div className="service-item">
                        <span className="service-emoji">🚒</span>
                        <div className="service-details">
                            <span className="service-name">Container Truck</span>
                            <span className="service-capacity">Upto 5000 kg</span>
                        </div>
                        <span className="service-rate">₹80/km</span>
                    </div> */}
                </div>
            </div>
        </section>
    )
}

export default ServiceSection
