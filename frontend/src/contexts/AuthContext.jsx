import React, { createContext, useState, useContext, useEffect } from 'react';

// Create the context
export const AuthContext = createContext(null);

// Define the API URL here so it's available globally via context if needed
export const API_URL = 'http://localhost:5000'; 

export const AuthProvider = ({ children }) => {
    const [loggedInUser, setLoggedInUser] = useState(null);
    // 'user' is an alias for 'loggedInUser' for backward compatibility with some components
    const user = loggedInUser;

    // Check for an existing user session in localStorage when the app loads
    useEffect(() => {
        try {
            const storedUser = localStorage.getItem('foodShareUser');
            if (storedUser) {
                setLoggedInUser(JSON.parse(storedUser));
            }
        } catch (error) {
            console.error("Failed to parse user data from localStorage", error);
            localStorage.removeItem('foodShareUser');
        }
    }, []);

    // Function to log in a user
    const login = (userData) => {
        localStorage.setItem('foodShareUser', JSON.stringify(userData));
        setLoggedInUser(userData);
    };

    // Function to log out a user
    const logout = () => {
        localStorage.removeItem('foodShareUser');
        setLoggedInUser(null);
    };

    return (
        <AuthContext.Provider value={{ loggedInUser, user, login, logout, API_URL }}>
            {children}
        </AuthContext.Provider>
    );
};

// Custom hook to use the auth context easily
export const useAuth = () => {
    return useContext(AuthContext);
};