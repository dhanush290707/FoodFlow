import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { UtensilsCrossed, BriefcaseIcon, InfoIcon } from '../components/Icons';
import Modal from '../components/Modal';
import { io } from 'socket.io-client';

const DonorDashboard = () => {
    const { loggedInUser, API_URL } = useContext(AuthContext);
    const user = loggedInUser;
    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({ itemName: '', quantity: '', expiryDate: '' });
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);

    const fetchData = async () => {
        if (!user) return;
        try {
            const listingsRes = await fetch(`${API_URL}/api/listings/donor/${user.id}`);
            const listingsData = await listingsRes.json();
            setListings(listingsData);

            const requestsRes = await fetch(`${API_URL}/api/requests/donor/${user.id}`);
            const requestsData = await requestsRes.json();
            setRequests(requestsData);
        } catch (error) {
            console.error("Error fetching data:", error);
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
    }, [user, API_URL]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCreateListing = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/api/listings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, donorId: user.id }),
        });
        setFormData({ itemName: '', quantity: '', expiryDate: '' });
        fetchData(); // Refresh data
    };

    const handleRequestUpdate = async (requestId, status) => {
        await fetch(`${API_URL}/api/requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        fetchData(); // Refresh data
        if(selectedRequest?._id === requestId) {
            setShowDetailsModal(false);
        }
    };

    const openDetailsModal = (request) => {
        setSelectedRequest(request);
        setShowDetailsModal(true);
    };

    return (
        <>
            <Modal show={showDetailsModal} onClose={() => setShowDetailsModal(false)} title="Request Details">
                {selectedRequest && (
                    <div className="request-details-modal">
                        <h4>Item</h4>
                        <p>{selectedRequest.listingId?.itemName || 'N/A'}</p>
                        
                        <h4>Requested By</h4>
                        <p>{selectedRequest.recipientId?.organizationName || 'N/A'}</p>
                        
                        <h4>Contact</h4>
                        <p>{selectedRequest.contactName} ({selectedRequest.contactPhone})</p>

                        {selectedRequest.notes && (
                            <>
                                <h4>Notes</h4>
                                <div className="notes-box">
                                    {selectedRequest.notes}
                                </div>
                            </>
                        )}
                        <hr />
                        <div className="modal-actions">
                            {selectedRequest.status === 'Pending' && (
                                <>
                                    <button className="action-button deny" onClick={() => handleRequestUpdate(selectedRequest._id, 'Denied')}>Deny</button>
                                    <button className="action-button approve" onClick={() => handleRequestUpdate(selectedRequest._id, 'Approved')}>Approve</button>
                                </>
                            )}
                             {selectedRequest.status === 'Approved' && (
                                <button className="action-button claim" onClick={() => handleRequestUpdate(selectedRequest._id, 'Claimed')}>Mark as Claimed</button>
                            )}
                        </div>
                    </div>
                )}
            </Modal>

            <div className="dashboard-grid">
                <div className="dashboard-card form-card">
                    <h2><BriefcaseIcon /> Create New Food Listing</h2>
                    <form onSubmit={handleCreateListing} className="dashboard-form">
                        <input name="itemName" value={formData.itemName} onChange={handleInputChange} placeholder="Item Name (e.g., Bread Loaves)" required />
                        <input name="quantity" value={formData.quantity} onChange={handleInputChange} placeholder="Quantity (e.g., 20)" required />
                        <input name="expiryDate" value={formData.expiryDate} onChange={handleInputChange} type="date" required />
                        <button type="submit" className="submit-button">Add Listing</button>
                    </form>
                </div>

                <div className="dashboard-card span-2">
                    <h2>My Listings</h2>
                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Quantity</th>
                                    <th>Expires</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {listings.map(l => (
                                    <tr key={l._id}>
                                        <td>{l.itemName}</td>
                                        <td>{l.quantity}</td>
                                        <td>{new Date(l.expiryDate).toLocaleDateString()}</td>
                                        <td><span className={`status-badge status-${l.status.toLowerCase()}`}>{l.status}</span></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <div className="dashboard-card span-3">
                    <h2>Incoming Donation Requests</h2>
                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>Item</th>
                                    <th>Requested By</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {requests.map(r => (
                                    <tr key={r._id}>
                                        <td>{r.listingId?.itemName || 'N/A'}</td>
                                        <td>{r.recipientId?.organizationName || 'N/A'}</td>
                                        <td><span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                                        <td className="actions-cell">
                                            <button className="action-button details" onClick={() => openDetailsModal(r)}>View Details</button>
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

export default DonorDashboard;