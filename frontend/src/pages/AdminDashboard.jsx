import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const { API_URL } = useAuth();
    const [data, setData] = useState({ users: [], listings: [], requests: [] });
    
    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/all-data`);
            if (res.ok) {
                const allData = await res.json();
                setData(allData);
            } else {
                console.error("Failed to fetch admin data");
            }
        } catch (error) {
            console.error("Error fetching admin data:", error);
        }
    };

    useEffect(() => {
        const socket = io(API_URL);
        fetchData();
        socket.on('dataUpdated', fetchData);
        return () => {
            socket.off('dataUpdated', fetchData);
            socket.disconnect();
        };
    }, [API_URL]);

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <h2>All Users ({data.users.length})</h2>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Org Name</th>
                                <th>Email</th>
                                <th>Role</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.users.map(u => (
                                <tr key={u._id}>
                                    <td>{u.organizationName}</td>
                                    <td>{u.email}</td>
                                    <td>{u.role}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="dashboard-card">
                <h2>All Listings ({data.listings.length})</h2>
                <div className="data-table">
                    <table>
                        <thead>
                            <tr>
                                <th>Item</th>
                                <th>Donor</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.listings.map(l => (
                                <tr key={l._id}>
                                    <td>{l.itemName}</td>
                                    <td>{l.donorId?.organizationName || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${l.status.toLowerCase()}`}>{l.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="dashboard-card">
                <h2>All Requests ({data.requests.length})</h2>
                <div className="data-table">
                    <table>
                         <thead>
                            <tr>
                                <th>Item</th>
                                <th>Recipient</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {data.requests.map(r => (
                                <tr key={r._id}>
                                    <td>{r.listingId?.itemName || 'N/A'}</td>
                                    <td>{r.recipientId?.organizationName || 'N/A'}</td>
                                    <td>
                                        <span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;

