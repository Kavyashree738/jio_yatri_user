import React, { useEffect, useState } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { FcGoogle } from 'react-icons/fc';
import { FaApple } from 'react-icons/fa';
import { MdEmail } from 'react-icons/md';
import { FaUserLock } from "react-icons/fa6";
import PhoneInput from 'react-phone-input-2';
import 'react-phone-input-2/lib/style.css';
import '../../styles/HeroSection.css';



const HeroSection = () => {
    const controls = useAnimation();
    const [phone, setPhone] = useState('');
    const { ref, inView: isInView } = useInView({ triggerOnce: true });

    useEffect(() => {
        if (isInView) {
            controls.start("visible");
        }
    }, [isInView, controls]);

    const variants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <section className="hero-section" id="hero">
            <div className="hero-bg-blur" />
            <div className="hero-content-wrapper" ref={ref}>
                <motion.div
                    className="hero-text"
                    initial="hidden"
                    animate={controls}
                    variants={variants}
                    transition={{ duration: 0.8 }}
                >
                    <div className='text'>
                        <h1>JIO YATRI</h1>
                        <h2>Delivery</h2>
                    </div>
                    <h2>Door-to-Door Intercity Courier from Bangalore</h2>
                    <p>
                        Connect with 19,000+ destinations across India through our smooth and affordable courier service.
                    </p>
                </motion.div>

                <motion.div
                    className="hero-image"
                    initial="hidden"
                    animate={controls}
                    variants={variants}
                    transition={{ duration: 0.8, delay: 0.3 }}
                >
                    <form className="registration-form hero-form" onSubmit={(e) => e.preventDefault()}>
                        <h3>Register Now</h3>

                        <div className="phone-input-group">
                            <PhoneInput
                                country={'in'}
                                value={phone}
                                onChange={setPhone}
                            />

                        </div>

                        <button type="submit">Continue</button>

                        <div className="divider">or</div>

                        <div className="social-buttons">
                            <button type="button" className="google-btn">
                                <FcGoogle className="social-icon" />
                                <span>Continue with Google</span>
                            </button>
                            <button type="button" className="apple-btn">
                                <FaApple className="social-icon" size={20} />
                                <span>Continue with Apple</span>
                            </button>
                            <button type="button" className="email-btn">
                                <MdEmail className="social-icon" size={20} />
                                <span>Continue with Email</span>
                            </button>
                        </div>
                    </form>

                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
