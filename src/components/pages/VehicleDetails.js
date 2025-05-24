import React, { useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FaMotorcycle, FaShuttleVan, FaTruckMoving } from 'react-icons/fa';
import '../../styles/VehicleDetails.css'
import Header from './Header';
import Footer from './Footer';
const vehicleData = {
    bike: {
        name: 'Two-Wheelers',
        type: '2 Wheeler',
        capacity: '20 kg',
        baseFare: '₹45',
        description: `The base fare covers the initial travel and waiting period to ensure prompt service. Please note that the final fare may vary depending on the total distance traveled, the duration of the trip, and any additional local charges such as tolls, parking fees, or peak-time surcharges. We strive to maintain transparent pricing, and any extra costs will be clearly communicated before the delivery begins. This ensures you receive reliable and fair service tailored to your specific needs.`,
        icon: '🏍️'
    },
    van: {
        name: 'Van',
        type: 'Mid-size Vehicle',
        capacity: '500 kg',
        baseFare: '₹140',
        description: `Ideal for transporting mid-size items such as boxes, furniture, retail stock, and household appliances. Whether you're moving inventory for your business or relocating personal belongings, this vehicle offers ample space and secure handling to ensure your goods arrive safely and on time. Its versatility makes it perfect for a variety of everyday delivery and moving needs, combining efficiency with affordability.`,
        icon: '🚗'
    },
    truck: {
        name: 'Truck',
        type: 'Heavy Vehicle',
        capacity: '2000 kg',
        baseFare: '₹330',
        description: `Designed to handle heavy-duty and bulk transport needs with ease. Whether you’re moving large furniture, construction materials, or substantial business cargo, this truck provides the strength, space, and durability necessary to get the job done efficiently. Equipped to carry loads up to 2000 kg, it ensures your heavy items are transported safely over long or short distances, making it the ideal choice for demanding logistics and large-scale deliveries.`,
        icon: '🚒'
    }
};
const faqs = {
    bike: [
        { question: "What can I send using a bike?", answer: "Small parcels, documents, and items under 20 kg." },
        { question: "Is there a time limit?", answer: "Base fare includes 25 minutes. Additional time is charged extra." },
        { question: "Can I track my delivery?", answer: "Yes, real-time tracking is available in the app." }
    ],
    van: [
        { question: "What items fit in a van?", answer: "Boxes, appliances, or store inventory up to 500 kg." },
        { question: "How is pricing calculated?", answer: "Based on distance, duration, and extra charges like tolls." },
        { question: "Can I schedule in advance?", answer: "Yes, you can schedule a van pickup in advance." }
    ],
    truck: [
        { question: "What can I transport in a truck?", answer: "Bulky items like furniture or business cargo." },
        { question: "Is loading/unloading help provided?", answer: "Yes, optional helpers are available while booking." },
        { question: "Are long-distance deliveries possible?", answer: "Yes, trucks can be booked for inter-city logistics." }
    ]
};

const VehicleDetails = () => {
    const { type } = useParams();
    const vehicle = vehicleData[type];
    const [activeIndex, setActiveIndex] = useState(null);
    const currentFaqs = faqs[type];

    if (!vehicle) {
        return (
            <div style={{ padding: 20 }}>
                <h2>Vehicle Not Found</h2>
                <Link to="/">Go back to booking</Link>
            </div>
        );
    }

    return (
        <>
        <Header/>
        <div className="vehicle-details-container">
            <h2>{vehicle.name} from Porter</h2>
            <div className="vehicle-summary">
                <div class="vehicle-icon-container">
                    <h1 class="vehicle-icon">{vehicle.icon}</h1>
                    <div class="vehicle-icon-track"></div>
                </div>
                <div>
                    <p><strong>{vehicle.type}</strong></p>
                    <p><strong>Vehicle Capacity:</strong> {vehicle.capacity}</p>
                    <p><strong>Starting from:</strong> {vehicle.baseFare}</p>
                </div>
            </div>
            <p className="vehicle-description">{vehicle.description}</p>

            <div className="vehicle-faq">
                <h3>Frequently Asked Questions</h3>
                {currentFaqs.map((faq, index) => (
                    <div key={index} className="faq-item">
                        <div
                            className="faq-question"
                            onClick={() => setActiveIndex(index === activeIndex ? null : index)}
                        >
                            {faq.question}
                            <span>{activeIndex === index ? '-' : '+'}</span>
                        </div>
                        {activeIndex === index && <div className="faq-answer">{faq.answer}</div>}
                    </div>
                ))}
            </div>

            <Link to="/" className="back-link">
                ← Back to booking
            </Link>
        </div>
        <Footer/>
        </>
    );

};

export default VehicleDetails;
