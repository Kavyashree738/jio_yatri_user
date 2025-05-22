import React from 'react'
import '../../styles/ServiceSection.css'
// import bike from '../../assets/images/bike.png'
// import truck from '../../assets/images/truck.png'
// import van from '../../assets/images/van.png'
const ServiceSection = () => {
    return (
            <section class="services-section" id="service">
                <h2 class="section-title">Our Delivery Services</h2>
                <div class="services-container ">
                    <div class="service-card  animate-up">
                        <h1>🏍️</h1>
                        {/* <img src={bike} alt="Bike Delivery" /> */}
                        <h3>Bike Deliveries</h3>
                        <p>Fast and efficient delivery for small packages across the city.</p>
                    </div>
                    <div class="service-card  animate-up">
                         <h1>🚘</h1>
                        {/* <img src={van} alt="Van Shipments" /> */}
                        <h3>Van Shipments</h3>
                        <p>Ideal for medium-sized shipments with safety and speed.</p>
                    </div>
                    <div class="service-card animate-up">
                         <h1>🚒</h1>
                        {/* <img src={truck} alt="Truck Loads" /> */}
                        <h3>Truck Loads</h3>
                        <p>Bulk delivery services with reliable and timely transport.</p>
                    </div>
                </div>
            </section>
    )
}

export default ServiceSection
