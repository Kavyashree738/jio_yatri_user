import React from "react";
import '../../styles/enterprise/IndustriesSection.css';
import industry1 from '../../assets/images/enterprise/industry1.png'
import industry2 from '../../assets/images/enterprise/industry2.png'
import industry3 from '../../assets/images/enterprise/industry4.png'
import industry4 from '../../assets/images/enterprise/industry3.png'
const images = [
    industry1,
    industry2,
    industry3,
    industry4

];

const industries = [
    "ELECTRONICS & APPLIANCES",
    "CONSTRUCTION MATERIALS",
    "CHEMICALS & PHARMACEUTICALS",
    "E-COMMERCE",
    "F&Vs & PROCESSED FOODS",
    "EFFICIENT LOGISTICS",
    "FURNITURES",
    "FMCG"
];

export default function IndustriesSection() {
    return (
        <section className="industries-section">
            <div className="image-collage">
                {images.map((src, idx) => (
                    <img key={idx} src={src} alt={industries[idx]} />
                ))}
            </div>

            <div className="text-content">
                <h2>INDUSTRIES WE SUPPORT</h2>
                <p>
                    Leveraging extensive know-how and experience in managing a wide range of cargo and shipments, we stand as the reliable logistics partner for companies of all scales. Whether you run a startup or an established enterprise, we ensure your goods are transported swiftly and safely. Our expertise covers multiple sectors to deliver seamless logistics solutions tailored to your business needs.
                </p>

                <section className="industries-section">
                    <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>INDUSTRIES WE SERVE</h2>
                    <div className="industries-wrapper">
                        <div className="left-container">
                            <ul className="industry-list">
                                {industries.slice(0, 4).map((industry, idx) => (
                                    <li key={idx}>{industry}</li>
                                ))}
                            </ul>
                        </div>
                        <div className="right-container">
                            <ul className="industry-list">
                                {industries.slice(4).map((industry, idx) => (
                                    <li key={idx + 4}>{industry}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>




            </div>
        </section>
    );
}
