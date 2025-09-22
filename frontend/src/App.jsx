import React, { useState, useEffect } from 'react';
import './App.css';
import { io } from "socket.io-client"; // Import socket.io-client

// --- Helper Components for Icons ---
const UtensilsCrossed = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m16 2-2.3 2.3a3 3 0 0 0 0 4.2l1.8 1.8a3 3 0 0 0 4.2 0L22 8" /><path d="M15 15 3.3 3.3a4.2 4.2 0 0 0 0 6l7.3 7.3c.7.7 2 .7 2.8 0L15 15Z" /><path d="m2.1 2.1 6.4 6.4" /><path d="m19 5-7 7" /></svg>);
const UserIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>);
const LockIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>);
const BuildingIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="4" y="2" width="16" height="20" rx="2" ry="2"/><path d="M9 22v-4h6v4"/><path d="M8 6h.01"/><path d="M16 6h.01"/><path d="M12 6h.01"/><path d="M12 10h.01"/><path d="M12 14h.01"/><path d="M16 10h.01"/><path d="M16 14h.01"/><path d="M8 10h.01"/><path d="M8 14h.01"/></svg>);
const LogOutIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>);
const BriefcaseIcon = (props) => ( <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>);
const InfoIcon = (props) => (<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>);

const API_URL = 'http://localhost:5000';
const socket = io(API_URL); // Establish socket connection

// --- Modal Component (Unchanged) ---
const Modal = ({ show, onClose, title, children }) => {
    if (!show) return null;
    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <div className="modal-header"><h2>{title}</h2><button onClick={onClose} className="modal-close-button">&times;</button></div>
                <div className="modal-body">{children}</div>
            </div>
        </div>
    );
};

// --- Individual Dashboard Components (Updated with Socket.IO listeners) ---

const DonorDashboard = ({ user }) => {
    const [listings, setListings] = useState([]);
    const [requests, setRequests] = useState([]);
    const [formData, setFormData] = useState({ itemName: '', quantity: '', expiryDate: '' });

    const fetchData = async () => {
        const listingsRes = await fetch(`${API_URL}/api/listings/donor/${user.id}`);
        const listingsData = await listingsRes.json();
        setListings(listingsData);
        const requestsRes = await fetch(`${API_URL}/api/requests/donor/${user.id}`);
        const requestsData = await requestsRes.json();
        setRequests(requestsData);
    };

    useEffect(() => {
        fetchData(); // Fetch initial data
        
        // Listen for real-time updates
        socket.on('data_changed', fetchData);

        // Cleanup listener on component unmount
        return () => {
            socket.off('data_changed', fetchData);
        };
    }, [user.id]);

    const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

    const handleCreateListing = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/api/listings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ ...formData, donorId: user.id }),
        });
        setFormData({ itemName: '', quantity: '', expiryDate: '' });
        // No need to call fetchData(), socket event will handle it
    };

    const handleRequestUpdate = async (requestId, status) => {
        await fetch(`${API_URL}/api/requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
        // No need to call fetchData(), socket event will handle it
    };

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card form-card">
                <h2>Create New Food Listing</h2>
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
                        <thead><tr><th>Item</th><th>Quantity</th><th>Expires</th><th>Status</th></tr></thead>
                        <tbody>
                            {listings.map(l => <tr key={l._id}><td>{l.itemName}</td><td>{l.quantity}</td><td>{new Date(l.expiryDate).toLocaleDateString()}</td><td><span className={`status-badge status-${l.status.toLowerCase()}`}>{l.status}</span></td></tr>)}
                        </tbody>
                    </table>
                </div>
            </div>
            <div className="dashboard-card span-3">
                <h2>Incoming Donation Requests</h2>
                 <div className="data-table">
                    <table>
                        <thead><tr><th>Item</th><th>Requested By</th><th>Contact Info</th><th>Status</th><th>Actions</th></tr></thead>
                        <tbody>
                            {requests.map(r => (
                                <tr key={r._id}>
                                    <td>{r.listingId?.itemName || 'N/A'}</td>
                                    <td>{r.recipientId?.organizationName || 'N/A'}</td>
                                    <td>
                                        <div className="contact-info">
                                            <span>{r.contactName}</span>
                                            <span>{r.contactPhone}</span>
                                            {r.notes && <p title={r.notes}><InfoIcon /> Notes</p>}
                                        </div>
                                    </td>
                                    <td><span className={`status-badge status-${r.status.toLowerCase()}`}>{r.status}</span></td>
                                    <td className="actions-cell">
                                        {r.status === 'Pending' && <>
                                            <button className="action-button approve" onClick={() => handleRequestUpdate(r._id, 'Approved')}>Approve</button>
                                            <button className="action-button deny" onClick={() => handleRequestUpdate(r._id, 'Denied')}>Deny</button>
                                        </>}
                                        {r.status === 'Approved' && <button className="action-button claim" onClick={() => handleRequestUpdate(r._id, 'Claimed')}>Mark as Claimed</button>}
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

const RecipientDashboard = ({ user }) => {
    const [availableListings, setAvailableListings] = useState([]);
    const [myRequests, setMyRequests] = useState([]);
    const [showModal, setShowModal] = useState(false);
    const [selectedListing, setSelectedListing] = useState(null);
    const [requestFormData, setRequestFormData] = useState({ contactName: '', contactPhone: '', notes: '' });

    const fetchData = async () => {
        const listingsRes = await fetch(`${API_URL}/api/listings`);
        const listingsData = await listingsRes.json();
        setAvailableListings(listingsData);
        const requestsRes = await fetch(`${API_URL}/api/requests/recipient/${user.id}`);
        const requestsData = await requestsRes.json();
        setMyRequests(requestsData);
    };
    
    useEffect(() => {
        fetchData();
        socket.on('data_changed', fetchData);
        return () => { socket.off('data_changed', fetchData); };
    }, [user.id]);
    
    const handleRequestUpdate = async (requestId, status) => {
        await fetch(`${API_URL}/api/requests/${requestId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ status }),
        });
    };

    const openRequestModal = (listing) => {
        setSelectedListing(listing);
        setShowModal(true);
    };

    const handleRequestInputChange = (e) => setRequestFormData({ ...requestFormData, [e.target.name]: e.target.value });

    const handleRequestSubmit = async (e) => {
        e.preventDefault();
        await fetch(`${API_URL}/api/requests`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ listingId: selectedListing._id, recipientId: user.id, ...requestFormData }),
        });
        setShowModal(false);
        setRequestFormData({ contactName: '', contactPhone: '', notes: '' });
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
                                {availableListings.map(l => (
                                    <tr key={l._id}>
                                        <td>{l.itemName}</td>
                                        <td>{l.quantity}</td>
                                        <td>{l.donorId?.organizationName || 'N/A'}</td>
                                        <td>{new Date(l.expiryDate).toLocaleDateString()}</td>
                                        <td><button className="action-button" onClick={() => openRequestModal(l)}>Request</button></td>
                                    </tr>
                                ))}
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

const AdminDashboard = () => {
    const [data, setData] = useState({ users: [], listings: [], requests: [] });
    const fetchData = async () => {
        const res = await fetch(`${API_URL}/api/admin/all-data`);
        const allData = await res.json();
        setData(allData);
    };

    useEffect(() => {
        fetchData();
        socket.on('data_changed', fetchData);
        return () => { socket.off('data_changed', fetchData); };
    }, []);

    return (
        <div className="dashboard-grid">
            <div className="dashboard-card"><h2>All Users ({data.users.length})</h2><div className="data-table"><table><thead><tr><th>Org Name</th><th>Email</th><th>Role</th></tr></thead><tbody>{data.users.map(u => <tr key={u._id}><td>{u.organizationName}</td><td>{u.email}</td><td>{u.role}</td></tr>)}</tbody></table></div></div>
            <div className="dashboard-card"><h2>All Listings ({data.listings.length})</h2><div className="data-table"><table><thead><tr><th>Item</th><th>Donor</th><th>Status</th></tr></thead><tbody>{data.listings.map(l => <tr key={l._id}><td>{l.itemName}</td><td>{l.donorId?.organizationName}</td><td>{l.status}</td></tr>)}</tbody></table></div></div>
            <div className="dashboard-card"><h2>All Requests ({data.requests.length})</h2><div className="data-table"><table><thead><tr><th>Item</th><th>Recipient</th><th>Status</th></tr></thead><tbody>{data.requests.map(r => <tr key={r._id}><td>{r.listingId?.itemName}</td><td>{r.recipientId?.organizationName}</td><td>{r.status}</td></tr>)}</tbody></table></div></div>
        </div>
    );
};

const AnalystDashboard = () => {
    const [summary, setSummary] = useState(null);
    const fetchSummary = async () => {
        const res = await fetch(`${API_URL}/api/analytics/summary`);
        const data = await res.json();
        setSummary(data);
    };

    useEffect(() => {
        fetchSummary();
        socket.on('data_changed', fetchSummary);
        return () => { socket.off('data_changed', fetchSummary); };
    }, []);

    if (!summary) return <p>Loading analytics...</p>;

    return (
        <div className="analytics-grid">
            <div className="stat-card"><h3>Total Users</h3><p>{summary.totalUsers}</p></div>
            <div className="stat-card"><h3>Total Food Listings</h3><p>{summary.totalListings}</p></div>
            <div className="stat-card"><h3>Total Donations Made</h3><p>{summary.claimedListings}</p></div>
            <div className="stat-card"><h3>Total Requests</h3><p>{summary.totalRequests}</p></div>
        </div>
    );
};


const AuthPage = ({ formData, setFormData, handleInputChange, handleLogin, handleSignup, errorMessage, successMessage, setSuccessMessage, setErrorMessage }) => {
    const [authView, setAuthView] = useState('login'); // 'login', 'signup', 'forgot', 'reset'
    const [resetEmail, setResetEmail] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const clearMessages = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleViewChange = (view) => {
        clearMessages();
        setAuthView(view);
    };

    const handleForgotPassword = async (e) => {
        e.preventDefault();
        clearMessages();
        try {
            const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ email: formData.email }),
            });
            const data = await res.json();
            setSuccessMessage(data.message);
            if(res.ok) {
              setResetEmail(formData.email);
              setAuthView('reset');
            } else {
              setErrorMessage(data.message);
            }
        } catch (err) {
            setErrorMessage("Could not connect to the server.");
        }
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        clearMessages();
        if (resetPassword !== confirmPassword) {
            setErrorMessage("Passwords do not match.");
            return;
        }
        try {
            const res = await fetch(`${API_URL}/api/auth/reset-password`, {
                 method: 'POST',
                 headers: { 'Content-Type': 'application/json' },
                 body: JSON.stringify({ email: resetEmail, newPassword: resetPassword }),
            });
            const data = await res.json();
            if(res.ok) {
                setSuccessMessage(data.message);
                setFormData({ ...formData, email: resetEmail, password: '' });
                setAuthView('login');
            } else {
                setErrorMessage(data.message);
            }
        } catch (err) {
            setErrorMessage("Could not connect to the server.");
        }
    };

    const renderAuthForm = () => {
        switch(authView) {
            case 'signup':
                return (
                     <form onSubmit={handleSignup} className="auth-form">
                        <div className="input-group"><BuildingIcon className="input-icon" /><input type="text" name="organizationName" placeholder="Organization Name" value={formData.organizationName} onChange={handleInputChange} required /></div>
                        <div className="input-group"><BriefcaseIcon className="input-icon" /><select name="role" value={formData.role} onChange={handleInputChange} required><option value="donor">Food Donor</option><option value="recipient">Recipient Organization</option><option value="admin">Admin</option><option value="analyst">Data Analyst</option></select></div>
                        <div className="input-group"><UserIcon className="input-icon" /><input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required /></div>
                        <div className="input-group"><LockIcon className="input-icon" /><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required /></div>
                        <button type="submit" className="submit-button">Create Account</button>
                    </form>
                );
            case 'forgot':
                 return (
                    <form onSubmit={handleForgotPassword} className="auth-form">
                        <p className="form-description">Enter your email and we'll send you instructions to reset your password.</p>
                        <div className="input-group"><UserIcon className="input-icon" /><input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required /></div>
                        <button type="submit" className="submit-button">Send Instructions</button>
                    </form>
                );
            case 'reset':
                return (
                     <form onSubmit={handleResetPassword} className="auth-form">
                        <p className="form-description">Enter a new password for {resetEmail}.</p>
                        <div className="input-group"><LockIcon className="input-icon" /><input type="password" placeholder="New Password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} required /></div>
                        <div className="input-group"><LockIcon className="input-icon" /><input type="password" placeholder="Confirm New Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required /></div>
                        <button type="submit" className="submit-button">Reset Password</button>
                    </form>
                );
            case 'login':
            default:
                return (
                    <form onSubmit={handleLogin} className="auth-form">
                        <div className="input-group"><UserIcon className="input-icon" /><input type="email" name="email" placeholder="Email Address" value={formData.email} onChange={handleInputChange} required /></div>
                        <div className="input-group"><LockIcon className="input-icon" /><input type="password" name="password" placeholder="Password" value={formData.password} onChange={handleInputChange} required /></div>
                        <div className="forgot-password-link"><button type="button" onClick={() => handleViewChange('forgot')}>Forgot Password?</button></div>
                        <button type="submit" className="submit-button">Sign In</button>
                    </form>
                );
        }
    }

    const getTitle = () => {
        switch(authView) {
            case 'signup': return 'Create an account to get started.';
            case 'forgot': return 'Reset Your Password';
            case 'reset': return 'Create a New Password';
            case 'login':
            default: return 'Welcome back! Sign in to continue.';
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-container">
                <div className="auth-header">
                    <UtensilsCrossed className="icon" />
                    <h1>FoodShare Connect</h1>
                    <p>{getTitle()}</p>
                </div>

                {errorMessage && <p className="error-message">{errorMessage}</p>}
                {successMessage && <p className="success-message">{successMessage}</p>}
                
                {renderAuthForm()}

                <div className="auth-toggle">
                    {authView === 'login' && <>Don't have an account? <button onClick={() => handleViewChange('signup')}>Sign up</button></>}
                    {authView === 'signup' && <>Already have an account? <button onClick={() => handleViewChange('login')}>Sign in</button></>}
                    {(authView === 'forgot' || authView === 'reset') && <>Remember your password? <button onClick={() => handleViewChange('login')}>Sign in</button></>}
                </div>
            </div>
        </div>
    )
};

const Dashboard = ({ loggedInUser, handleLogout }) => {
    const renderDashboardContent = () => {
        switch (loggedInUser.role) {
            case 'donor': return <DonorDashboard user={loggedInUser} />;
            case 'recipient': return <RecipientDashboard user={loggedInUser} />;
            case 'admin': return <AdminDashboard />;
            case 'analyst': return <AnalystDashboard />;
            default: return <p>No dashboard available for this role.</p>;
        }
    };
    return (
        <div className="app-container">
            <header className="app-header">
                <div className="header-title"><UtensilsCrossed /><h1>FoodShare Connect</h1></div>
                <div className="header-user">
                    <span>Welcome, {loggedInUser.organizationName}!</span>
                    <button onClick={handleLogout} className="logout-button"><LogOutIcon />Logout</button>
                </div>
            </header>
            <main className="app-main">{renderDashboardContent()}</main>
        </div>
    );
};

function App() {
  const [loggedInUser, setLoggedInUser] = useState(null);
  const [formData, setFormData] = useState({ email: '', password: '', role: 'donor', organizationName: '' });
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('foodShareUser');
      if (storedUser) {
        setLoggedInUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Failed to parse user data from localStorage", error);
      localStorage.removeItem('foodShareUser');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };
  
  const clearMessages = () => {
      setErrorMessage('');
      setSuccessMessage('');
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const response = await fetch(`${API_URL}/api/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setSuccessMessage('Registration successful! Please log in.');
        setFormData({ email: formData.email, password: '', organizationName: '', role: 'donor' });
      } else {
        setErrorMessage(data.message || 'Registration failed.');
      }
    } catch (error) {
      setErrorMessage('Could not connect to the server.');
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    clearMessages();
    try {
      const { email, password } = formData;
      const response = await fetch(`${API_URL}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (response.ok) {
        setLoggedInUser(data.user);
        localStorage.setItem('foodShareUser', JSON.stringify(data.user));
      } else {
        setErrorMessage(data.message || 'Login failed.');
      }
    } catch (error) {
      setErrorMessage('Could not connect to the server.');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('foodShareUser');
    setLoggedInUser(null);
    setFormData({ email: '', password: '', role: 'donor', organizationName: '' });
    clearMessages();
  };
  
  return loggedInUser 
    ? <Dashboard loggedInUser={loggedInUser} handleLogout={handleLogout} /> 
    : <AuthPage 
        formData={formData}
        setFormData={setFormData}
        handleInputChange={handleInputChange}
        handleLogin={handleLogin}
        handleSignup={handleSignup}
        errorMessage={errorMessage}
        successMessage={successMessage}
        setErrorMessage={setErrorMessage}
        setSuccessMessage={setSuccessMessage}
      />;
}

export default App;

