import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { io } from 'socket.io-client';

const AdminDashboard = () => {
    const { API_URL } = useAuth();
    const [data, setData] = useState({ users: [], listings: [], requests: [] });
    
    // Filter states
    const [userRoleFilter, setUserRoleFilter] = useState('all');
    const [listingStatusFilter, setListingStatusFilter] = useState('all');
    const [requestStatusFilter, setRequestStatusFilter] = useState('all');

    const fetchData = async () => {
        try {
            const res = await fetch(`${API_URL}/api/admin/all-data`);
            if (res.ok) {
                const allData = await res.json();
                setData(allData);
            }
        } catch (error) {
            console.error("Error fetching admin data", error);
        }
    };

    useEffect(() => {
        const socket = io(API_URL);
        fetchData();
        socket.on('dataUpdated', fetchData);
        socket.on('data_changed', fetchData);
        return () => {
            socket.off('dataUpdated', fetchData);
            socket.off('data_changed', fetchData);
            socket.disconnect();
        };
    }, [API_URL]);

    // Filter logic
    const filteredUsers = userRoleFilter === 'all' 
        ? data.users 
        : data.users.filter(user => user.role === userRoleFilter);

    const filteredListings = listingStatusFilter === 'all'
        ? data.listings
        : data.listings.filter(listing => listing.status === listingStatusFilter);

    const filteredRequests = requestStatusFilter === 'all'
        ? data.requests
        : data.requests.filter(request => request.status === requestStatusFilter);

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card">
                <div className="card-header-flex">
                    <h2>All Users ({filteredUsers.length})</h2>
                    <select 
                        value={userRoleFilter} 
                        onChange={(e) => setUserRoleFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Roles</option>
                        <option value="donor">Donor</option>
                        <option value="recipient">Recipient</option>
                        <option value="admin">Admin</option>
                        <option value="analyst">Analyst</option>
                    </select>
                </div>
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
                            {filteredUsers.map(u => (
                                <tr key={u._id}>
                                    <td>{u.organizationName}</td>
                                    <td>{u.email}</td>
                                    <td>
                                        <span className={`status-badge status-${u.role === 'admin' ? 'approved' : u.role === 'analyst' ? 'pending' : 'available'}`}>
                                            {u.role}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            <div className="dashboard-card">
                <div className="card-header-flex">
                    <h2>All Listings ({filteredListings.length})</h2>
                    <select 
                        value={listingStatusFilter} 
                        onChange={(e) => setListingStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Available">Available</option>
                        <option value="Claimed">Claimed</option>
                    </select>
                </div>
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
                            {filteredListings.map(l => (
                                <tr key={l._id}>
                                    <td>{l.itemName}</td>
                                    <td>{l.donorId?.organizationName}</td>
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
                <div className="card-header-flex">
                    <h2>All Requests ({filteredRequests.length})</h2>
                    <select 
                        value={requestStatusFilter} 
                        onChange={(e) => setRequestStatusFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">All Statuses</option>
                        <option value="Pending">Pending</option>
                        <option value="Approved">Approved</option>
                        <option value="Denied">Denied</option>
                        <option value="Accepted">Accepted</option>
                        <option value="Claimed">Claimed</option>
                    </select>
                </div>
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
                            {filteredRequests.map(r => (
                                <tr key={r._id}>
                                    <td>{r.listingId?.itemName}</td>
                                    <td>{r.recipientId?.organizationName}</td>
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