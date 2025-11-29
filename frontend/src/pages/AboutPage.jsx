import React from 'react';
import Navbar from '../components/Navbar.jsx'; // Added .jsx extension for clarity

const AboutPage = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <div className="app-main" style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
                <h1>About FoodShare Connect</h1>
                <p style={{ fontSize: '1.2rem', lineHeight: '1.6', color: '#4b5563', marginBottom: '2rem' }}>
                    FoodShare Connect is dedicated to solving two major problems: food waste and hunger. 
                    Every day, tons of edible food are discarded while millions of people go hungry. 
                    Our platform bridges this gap by connecting food donors directly with recipient organizations.
                </p>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', textAlign: 'left', marginTop: '3rem' }}>
                    <div className="feature-card">
                        <h3>Our Mission</h3>
                        <p>To create a world where no good food goes to waste and everyone has access to nutritious meals.</p>
                    </div>
                    <div className="feature-card">
                        <h3>Our Vision</h3>
                        <p>A sustainable, community-driven network that empowers local businesses to support their neighbors.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AboutPage;