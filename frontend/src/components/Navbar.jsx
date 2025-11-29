import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsCrossed, LogOutIcon } from './Icons';

const Navbar = () => {
    const { loggedInUser, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <nav className="navbar">
            <div className="navbar-container">
                <Link to="/" className="navbar-logo">
                    <UtensilsCrossed className="navbar-icon" />
                    <span>FoodShare Connect</span>
                </Link>
                <div className="navbar-links">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/about" className="nav-link">About Us</Link>
                    <Link to="/contact" className="nav-link">Contact</Link>
                    
                    {loggedInUser ? (
                        <>
                            <Link to="/dashboard" className="nav-link dashboard-link">Dashboard</Link>
                            <button onClick={handleLogout} className="nav-link logout-btn">
                                <LogOutIcon className="btn-icon"/> Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="nav-link login-btn">Login / Sign Up</Link>
                    )}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;