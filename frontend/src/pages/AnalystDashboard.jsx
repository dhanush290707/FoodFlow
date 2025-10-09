import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const AnalystDashboard = () => {
    const { API_URL } = useAuth();
    const [summary, setSummary] = useState(null);

    const fetchSummary = async () => {
        try {
            const res = await fetch(`${API_URL}/api/analytics/summary`);
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            } else {
                console.error("Failed to fetch analytics summary");
            }
        } catch (error) {
            console.error("Error fetching analytics summary:", error);
        }
    };
    
    useEffect(() => {
        const socket = io(API_URL);
        fetchSummary();
        socket.on('dataUpdated', fetchSummary);
        return () => {
            socket.off('dataUpdated', fetchSummary);
            socket.disconnect();
        }
    }, [API_URL]);

    if (!summary) {
        return <p>Loading analytics...</p>;
    }

    return (
        <div className="analytics-grid">
            <div className="stat-card">
                <h3>Total Users</h3>
                <p>{summary.totalUsers}</p>
            </div>
            <div className="stat-card">
                <h3>Total Food Listings</h3>
                <p>{summary.totalListings}</p>
            </div>
            <div className="stat-card">
                <h3>Total Donations Made</h3>
                <p>{summary.claimedListings}</p>
            </div>
            <div className="stat-card">
                <h3>Total Requests</h3>
                <p>{summary.totalRequests}</p>
            </div>
        </div>
    );
};

export default AnalystDashboard;

