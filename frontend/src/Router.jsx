import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';
import AuthPage from './pages/AuthPage';
import LandingPage from './pages/LandingPage';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const AppRouter = () => {
    const { loggedInUser } = useAuth();

    const getDashboard = () => {
        switch (loggedInUser?.role) {
            case 'donor': return <DonorDashboard />;
            case 'recipient': return <RecipientDashboard />;
            case 'admin': return <AdminDashboard />;
            case 'analyst': return <AnalystDashboard />;
            default: return <Navigate to="/login" />;
        }
    };

    return (
        <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            
            {/* Auth Route */}
            <Route path="/login" element={loggedInUser ? <Navigate to="/dashboard" /> : <AuthPage />} />
            
            {/* Protected Route */}
            <Route 
                path="/dashboard" 
                element={
                    <ProtectedRoute>
                        <Layout>
                            {getDashboard()}
                        </Layout>
                    </ProtectedRoute>
                } 
            />

            {/* Catch-all */}
            <Route path="*" element={<Navigate to="/" />} />
        </Routes>
    );
};

export default AppRouter;