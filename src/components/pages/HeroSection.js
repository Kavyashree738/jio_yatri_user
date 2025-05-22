import React, { useEffect } from 'react';
import { motion, useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import '../../styles/HeroSection.css';

const HeroSection = () => {
    const controls = useAnimation();
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
            <div className="hero-content-wrapper" ref={ref}>
                <motion.div
                    className="hero-text"
                    initial="hidden"
                    animate={controls}
                    variants={variants}
                    transition={{ duration: 0.8 }}
                >
                    <h1>JIO YATRI</h1>
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
                    <form className="registration-form" onSubmit={(e) => e.preventDefault()}>
                        <h3>Register Now</h3>
                        <input type="tel" placeholder="Enter your phone number" required />
                        <button type="submit">Continue</button>
                        <div className="divider">or continue with</div>
                        <div className="social-buttons">
                            <button type="button" className="google-btn" aria-label="Continue with Google">
                                {/* You can replace with Google icon svg or img */}
                                <span>Google</span>
                            </button>
                            <button type="button" className="facebook-btn" aria-label="Continue with Facebook">
                                {/* Replace with Facebook icon */}
                                <span>Facebook</span>
                            </button>
                        </div>
                    </form>
                </motion.div>
            </div>
        </section>
    );
};

export default HeroSection;
