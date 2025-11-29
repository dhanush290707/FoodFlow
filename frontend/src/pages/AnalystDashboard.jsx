import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';
import { DonationsBarChart, ActivityLineChart } from '../components/Charts';
import { BriefcaseIcon, UserIcon, BuildingIcon } from '../components/Icons';

const AnalystDashboard = () => {
    const { API_URL } = useAuth();
    const [summary, setSummary] = useState(null);

    const fetchSummary = async () => {
        try {
            const res = await fetch(`${API_URL}/api/analytics/summary`);
            if (res.ok) {
                const data = await res.json();
                setSummary(data);
            }
        } catch (error) {
             console.error("Error fetching analytics", error);
        }
    };
    
    useEffect(() => {
        const socket = io(API_URL);
        fetchSummary();
        socket.on('dataUpdated', fetchSummary);
        socket.on('data_changed', fetchSummary);
        return () => {
            socket.off('dataUpdated', fetchSummary);
            socket.off('data_changed', fetchSummary);
            socket.disconnect();
        };
    }, [API_URL]);

    if (!summary) return (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#64748b' }}>
            <p>Loading analytics...</p>
        </div>
    );

    return (
        <div className="analyst-container">
            <h2 className="page-title">Analytics Overview</h2>
            
            {/* Top Row: Summary Cards */}
            <div className="analytics-grid">
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <h3>Total Users</h3>
                        <div style={{ padding: '8px', backgroundColor: '#e0f2fe', borderRadius: '8px', color: '#0284c7' }}>
                            <UserIcon width="20" height="20" />
                        </div>
                    </div>
                    <p>{summary.totalUsers}</p>
                    <span className="stat-change positive">↑ 12% this week</span>
                </div>
                
                <div className="stat-card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <h3>Active Listings</h3>
                         <div style={{ padding: '8px', backgroundColor: '#f0fdf4', borderRadius: '8px', color: '#16a34a' }}>
                            <BriefcaseIcon width="20" height="20" />
                        </div>
                    </div>
                    <p>{summary.totalListings}</p>
                    <span className="stat-change neutral">Just updated</span>
                </div>

                <div className="stat-card">
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <h3>Total Donations</h3>
                         <div style={{ padding: '8px', backgroundColor: '#fef3c7', borderRadius: '8px', color: '#d97706' }}>
                            <BuildingIcon width="20" height="20" />
                        </div>
                    </div>
                    <p>{summary.claimedListings}</p>
                    <span className="stat-change positive">↑ 5% this month</span>
                </div>

                <div className="stat-card">
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', marginBottom: '10px' }}>
                        <h3>Pending Requests</h3>
                         <div style={{ padding: '8px', backgroundColor: '#fee2e2', borderRadius: '8px', color: '#dc2626' }}>
                            <BuildingIcon width="20" height="20" />
                        </div>
                    </div>
                    <p>{summary.totalRequests}</p>
                    <span className="stat-change negative">Requires attention</span>
                </div>
            </div>

            {/* Bottom Row: Charts */}
            <div className="charts-grid">
                <div className="chart-card">
                    <DonationsBarChart />
                </div>
                <div className="chart-card">
                    <ActivityLineChart />
                </div>
            </div>
        </div>
    );
};

export default AnalystDashboard;