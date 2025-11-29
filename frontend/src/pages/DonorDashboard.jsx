import React, { useState, useEffect, useContext } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { BriefcaseIcon, InfoIcon } from '../components/Icons';
import Modal from '../components/Modal';
import MapComponent from '../components/MapComponent';
import { io } from 'socket.io-client';

const DonorDashboard = () => {
    const { loggedInUser, API_URL } = useContext(AuthContext);
    // Use 'user' alias for compatibility
    const user = loggedInUser;

    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({ itemName: '', quantity: '', expiryDate: '', address: '', lat: null, lng: null });
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [locationStatus, setLocationStatus] = useState('');

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

    // Geolocation Logic
    const handleGetLocation = () => {
        if (!navigator.geolocation) {
            setLocationStatus('Geolocation is not supported by your browser');
        } else {
            setLocationStatus('Locating...');
            navigator.geolocation.getCurrentPosition((position) => {
                setLocationStatus('Location found!');
                setFormData(prev => ({
                    ...prev,
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                    address: 'Current Location (Device GPS)' 
                }));
            }, () => {
                setLocationStatus('Unable to retrieve your location');
            });
        }
    };

    // Handle click on map to set location
    const handleMapClick = (e) => {
        const lat = e.latLng.lat();
        const lng = e.latLng.lng();
        setFormData(prev => ({
            ...prev,
            lat: lat,
            lng: lng,
            address: `Pinned Location (${lat.toFixed(4)}, ${lng.toFixed(4)})` 
        }));
        setLocationStatus('Location pinned on map!');
    };

    const handleCreateListing = async (e) => {
        e.preventDefault();
        const payload = {
            ...formData,
            donorId: user.id,
            location: {
                address: formData.address,
                lat: formData.lat || 40.7128, // Default fallback
                lng: formData.lng || -74.0060
            }
        };

        await fetch(`${API_URL}/api/listings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload),
        });
        setFormData({ itemName: '', quantity: '', expiryDate: '', address: '', lat: null, lng: null });
        setLocationStatus('');
        // Data refresh handled by socket
    };

    const handleRequestUpdate = async (requestId, status) => {
        await fetch(`${API_URL}/api/requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        
        if(selectedRequest?._id === requestId) {
            setShowDetailsModal(false);
        }
        // Data refresh handled by socket
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
                             {(selectedRequest.status === 'Denied' || selectedRequest.status === 'Claimed') && (
                                 <span className={`status-badge status-${selectedRequest.status.toLowerCase()}`}>{selectedRequest.status}</span>
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
                        
                        <div style={{display: 'flex', gap: '10px', alignItems: 'center'}}>
                            <input name="address" value={formData.address} onChange={handleInputChange} placeholder="Address (or click on Map)" style={{flexGrow: 1}} />
                            <button type="button" onClick={handleGetLocation} className="action-button" style={{whiteSpace: 'nowrap'}}>📍 Locate Me</button>
                        </div>
                        {locationStatus && <p style={{fontSize: '0.8rem', color: '#16a34a', margin: 0}}>{locationStatus}</p>}
                        
                        <p style={{fontSize: '0.8rem', color: '#64748b', marginTop: '-5px', marginBottom: '5px'}}>
                            * Click on the map to set exact location
                        </p>

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

                 {/* Map Section - Spans Full Width */}
                 <div className="dashboard-card span-3">
                    <h2 style={{ marginBottom: '1rem' }}>Set Donation Location</h2>
                    <div style={{ height: '400px', width: '100%' }}>
                         <MapComponent 
                            listings={listings} 
                            onMapClick={handleMapClick} 
                            newListingLocation={formData.lat ? { lat: formData.lat, lng: formData.lng } : null}
                         />
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