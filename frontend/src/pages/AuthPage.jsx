import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { UtensilsCrossed, UserIcon, LockIcon, BuildingIcon, BriefcaseIcon } from '../components/Icons';

const AuthPage = () => {
    const { login, API_URL } = useAuth();
    const navigate = useNavigate();
    
    // Local state for form data and UI
    const [authView, setAuthView] = useState('login'); // 'login', 'signup', 'forgot', 'reset'
    const [formData, setFormData] = useState({ email: '', password: '', role: 'donor', organizationName: '' });
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    
    // State for password reset flow
    const [resetEmail, setResetEmail] = useState('');
    const [resetPassword, setResetPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
    };
    
    const clearMessages = () => {
        setErrorMessage('');
        setSuccessMessage('');
    };

    const handleViewChange = (view) => {
        clearMessages();
        setAuthView(view);
    };

    const handleSignup = async (e) => {
        e.preventDefault();
        clearMessages();
        const signupEmail = formData.email;
        try {
            const response = await fetch(`${API_URL}/api/auth/register`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            const data = await response.json();
            if (response.ok) {
                setSuccessMessage('Registration successful! Please log in.');
                // Pre-populate email for login and clear other fields
                setFormData({ email: signupEmail, password: '', organizationName: '', role: 'donor' });
                handleViewChange('login');
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
                login(data.user);
                navigate('/dashboard'); // Redirect to dashboard after login
            } else {
                setErrorMessage(data.message || 'Login failed.');
            }
        } catch (error) {
            setErrorMessage('Could not connect to the server.');
        }
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
            if(res.ok) {
              setSuccessMessage(data.message);
              setResetEmail(formData.email);
              handleViewChange('reset');
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
                handleViewChange('login');
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
                {/* Back to Home Button */}
                <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
                    <button 
                        onClick={() => navigate('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#64748b',
                            textDecoration: 'none',
                            cursor: 'pointer',
                            fontSize: '0.9rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            width: '100%',
                            gap: '0.5rem'
                        }}
                    >
                        ← Back to Home
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AuthPage;