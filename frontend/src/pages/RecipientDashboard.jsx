import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Modal } from '../components/Modal';
import { io } from 'socket.io-client';

const RecipientDashboard = () => {
    const { user, API_URL } = useAuth();
    const [availableListings, setAvailableListings] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [requestFormData, setRequestFormData] = useState({ contactName: '', contactPhone: '', notes: '' });

    const fetchData = async () => {
        if (!user) return;
        try {
            const listingsRes = await fetch(`${API_URL}/api/listings`);
            const listingsData = await listingsRes.json();
            setAvailableListings(listingsData);

            const requestsRes = await fetch(`${API_URL}/api/requests/recipient/${user.id}`);
            const requestsData = await requestsRes.json();
            setMyRequests(requestsData);
        } catch (error) {
            console.error("Failed to fetch recipient data:", error);
        }
    };
    
    const handleRequestUpdate = async (requestId, status) => {
        try {
            await fetch(`${API_URL}/api/requests/${requestId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ status }),
            });
            fetchData(); // Immediately refresh data
        } catch (error) {
            console.error("Failed to update request:", error);
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
    }, [user, API_URL]);

    const openRequestModal = (listing) => {
        setSelectedListing(listing);
        setShowModal(true);
    };

    const handleRequestInputChange = (e) => setRequestFormData({ ...requestFormData, [e.target.name]: e.target.value });

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        try {
            await fetch(`${API_URL}/api/requests`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    listingId: selectedListing._id,
                    recipientId: user.id,
                    ...requestFormData
                }),
            });
            setShowModal(false);
            setRequestFormData({ contactName: '', contactPhone: '', notes: '' });
            fetchData(); // Immediately refresh data
        } catch (error) {
            console.error("Failed to submit request:", error);
        }
    };

    return (
        <>
            <Modal show={showModal} onClose={() => setShowModal(false)} title={`Request: ${selectedListing?.itemName}`}>
                <form onSubmit={handleRequestSubmit} className="dashboard-form">
                    <input name="contactName" value={requestFormData.contactName} onChange={handleRequestInputChange} placeholder="Your Name" required/>
                    <input name="contactPhone" value={requestFormData.contactPhone} onChange={handleRequestInputChange} placeholder="Phone Number" required/>
                    <textarea name="notes" value={requestFormData.notes} onChange={handleRequestInputChange} placeholder="Optional notes (e.g., pickup times)"></textarea>
                    <button type="submit" className="submit-button">Submit Request</button>
                </form>
            </Modal>
            <div className="dashboard-grid">
                <div className="dashboard-card span-2">
                    <h2>Available Food Donations</h2>
                    <div className="data-table">
                         <table>
                            <thead><tr><th>Item</th><th>Quantity</th><th>Donor</th><th>Expires</th><th>Action</th></tr></thead>
                            <tbody>
                                {availableListings.map(l => {
                                    const isRequested = myRequests.some(r => r.listingId?._id === l._id);
                                    return (
                                        <tr key={l._id}>
                                            <td>{l.itemName}</td>
                                            <td>{l.quantity}</td>
                                            <td>{l.donorId?.organizationName || 'N/A'}</td>
                                            <td>{new Date(l.expiryDate).toLocaleDateString()}</td>
                                            <td>
                                                {isRequested ? (
                                                    <span className="status-badge status-pending">Requested</span>
                                                ) : (
                                                    <button className="action-button" onClick={() => openRequestModal(l)}>Request</button>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
                 <div className="dashboard-card">
                    <h2>My Requests</h2>
                    <div className="data-table">
                         <table>
                            <thead><tr><th>Item</th><th>Status</th><th>Action</th></tr></thead>
                            <tbody>
                                {myRequests.map(r => (
                                    <tr key={r._id}>
                                        <td>{r.listingId?.itemName || 'N/A'}</td>
                                        <td><span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                                        <td className="actions-cell">
                                            {r.status === 'Approved' && <button className="action-button approve" onClick={() => handleRequestUpdate(r._id, 'Accepted')}>Accept Pickup</button>}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </>
    );
};

export default RecipientDashboard;

