import React from 'react';
import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { UtensilsCrossed, UserIcon, BuildingIcon } from '../components/Icons';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <Navbar />
            
            {/* Hero Section */}
            <header className="hero-section">
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <h1>Connecting Surplus to Needs</h1>
                    <p className="hero-subtitle">
                        Join our mission to reduce food waste and fight hunger. 
                        We bridge the gap between food donors and community organizations.
                    </p>
                    <div className="hero-buttons">
                        <Link to="/login" className="cta-button primary">Get Started</Link>
                        <Link to="/about" className="cta-button secondary">Learn More</Link>
                    </div>
                </div>
            </header>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2>Why Choose FoodShare Connect?</h2>
                    <p>We make food donation simple, transparent, and impactful.</p>
                </div>
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon">🍎</div>
                        <h3>For Donors</h3>
                        <p>Easily list surplus food inventory and track your social impact in real-time. Reduce waste while helping your community.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">🤝</div>
                        <h3>For Recipients</h3>
                        <p>Browse available donations and schedule pickups to support your community. Get fresh food to those who need it most.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Data Driven</h3>
                        <p>Advanced analytics to track waste reduction and optimize distribution. See the tangible impact of your contributions.</p>
                    </div>
                </div>
            </section>

            {/* How It Works Section */}
            <section className="how-it-works-section">
                <div className="section-header">
                    <h2>How It Works</h2>
                    <p>Three simple steps to start making a difference.</p>
                </div>
                <div className="steps-container">
                    <div className="step">
                        <div className="step-number">1</div>
                        <h3>Sign Up</h3>
                        <p>Create an account as a Donor (Restaurant, Grocery) or a Recipient (Shelter, Food Bank).</p>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step">
                        <div className="step-number">2</div>
                        <h3>Connect</h3>
                        <p>Donors post surplus food. Recipients view listings and request items they need.</p>
                    </div>
                    <div className="step-connector"></div>
                    <div className="step">
                        <div className="step-number">3</div>
                        <h3>Distribute</h3>
                        <p>Coordinate pickup and delivery. Food is saved, and communities are fed.</p>
                    </div>
                </div>
            </section>

            {/* Impact Stats Section */}
            <section className="impact-section">
                <div className="impact-grid">
                    <div className="impact-item">
                        <h2>10k+</h2>
                        <p>Meals Saved</p>
                    </div>
                    <div className="impact-item">
                        <h2>500+</h2>
                        <p>Active Donors</p>
                    </div>
                    <div className="impact-item">
                        <h2>300+</h2>
                        <p>Organizations Helped</p>
                    </div>
                </div>
            </section>

            {/* Testimonials Section */}
            <section className="testimonials-section">
                <div className="section-header">
                    <h2>Community Stories</h2>
                </div>
                <div className="testimonials-grid">
                    <div className="testimonial-card">
                        <p>"FoodShare Connect has revolutionized how we handle surplus. It's effortless to donate, and we know exactly where our food is going."</p>
                        <h4>- Sarah J., Bakery Owner</h4>
                    </div>
                    <div className="testimonial-card">
                        <p>"This platform is a lifeline. We can secure fresh produce for our shelter much faster and more reliably than ever before."</p>
                        <h4>- Mark T., Shelter Director</h4>
                    </div>
                </div>
            </section>

            {/* CTA Footer */}
            <section className="cta-footer">
                <h2>Ready to Join the Movement?</h2>
                <p>Start reducing waste and feeding your community today.</p>
                <Link to="/login" className="cta-button primary large">Join FoodShare Connect</Link>
            </section>

            {/* Simple Footer */}
            <footer className="main-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <UtensilsCrossed /> FoodShare Connect
                    </div>
                    <div className="footer-links">
                        <Link to="/about">About</Link>
                        <Link to="/contact">Contact</Link>
                        <Link to="/privacy">Privacy Policy</Link>
                    </div>
                    <p className="copyright">© 2024 FoodShare Connect. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;