import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsCrossed, LogOutIcon } from './Icons';

const Layout = ({ children }) => {
    const { loggedInUser, logout } = useAuth();

    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-title"><UtensilsCrossed /><h1>FoodShare Connect</h1></div>
                <div className="header-user">
                    <span>Welcome, {loggedInUser?.organizationName}!</span>
                    <button onClick={logout} className="logout-button"><LogOutIcon />Logout</button>
                </div>
            </header>
            <main className="app-main">
                {children}
            </main>
        </div>
    );
};

export default Layout;