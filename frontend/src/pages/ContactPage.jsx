import React from 'react';
import Navbar from '../components/Navbar.jsx'; // Added .jsx extension

const ContactPage = () => {
    return (
        <div className="landing-page">
            <Navbar />
            <div className="app-main" style={{ maxWidth: '600px', margin: '0 auto' }}>
                <h1 style={{ textAlign: 'center', marginBottom: '2rem' }}>Contact Us</h1>
                
                <div className="auth-container" style={{ margin: '0 auto' }}>
                    <form className="auth-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Name</label>
                            <input type="text" placeholder="Your Name" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Email</label>
                            <input type="email" placeholder="Your Email" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem' }} />
                        </div>
                        <div className="input-group">
                            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: '500' }}>Message</label>
                            <textarea rows="5" placeholder="How can we help you?" required style={{ width: '100%', padding: '0.75rem', border: '1px solid #e2e8f0', borderRadius: '0.5rem', fontFamily: 'inherit' }}></textarea>
                        </div>
                        <button className="submit-button" style={{ marginTop: '1rem' }}>Send Message</button>
                    </form>
                </div>

                <div style={{ textAlign: 'center', marginTop: '3rem', color: '#64748b' }}>
                    <p>Email: support@foodshareconnect.com</p>
                    <p>Phone: +1 (555) 123-4567</p>
                    <p>Address: 123 Green Street, Sustainability City, Earth</p>
                </div>
            </div>
        </div>
    );
};

export default ContactPage;