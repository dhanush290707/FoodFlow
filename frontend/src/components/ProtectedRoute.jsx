import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext'; // Fixed: changed 'context' to 'contexts'

const ProtectedRoute = ({ children }) => {
    const { loggedInUser } = useAuth();

    if (!loggedInUser) {
        return <Navigate to="/login" />;
    }

    return children;
};

export default ProtectedRoute;