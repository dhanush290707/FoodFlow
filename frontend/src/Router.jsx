import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import AuthPage from './pages/AuthPage';
import DonorDashboard from './pages/DonorDashboard';
import RecipientDashboard from './pages/RecipientDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AnalystDashboard from './pages/AnalystDashboard';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

const AppRouter = () => {
    const { user } = useAuth();

    const getDashboardForRole = () => {
        switch (user?.role) {
            case 'donor':
                return <DonorDashboard />;
            case 'recipient':
                return <RecipientDashboard />;
            case 'admin':
                return <AdminDashboard />;
            case 'analyst':
                return <AnalystDashboard />;
            default:
                // If role is unknown or user is null, redirect to login
                return <Navigate to="/login" />;
        }
    };

    return (
        <BrowserRouter basename="/FoodFlow">
            <Routes>
                <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Navigate to="/login" />} />
                <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <AuthPage />} />
                
                <Route 
                    path="/dashboard" 
                    element={
                        <ProtectedRoute>
                            <Layout>
                                {getDashboardForRole()}
                            </Layout>
                        </ProtectedRoute>
                    } 
                />

                {/* Optional: Add more specific routes if needed in the future */}
                {/* <Route path="/profile" element={<ProtectedRoute><Layout><ProfilePage /></Layout></ProtectedRoute>} /> */}

                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRouter;

