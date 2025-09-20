const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// --- Express App Initialization ---
const app = express();
const PORT = process.env.PORT || 5000;

// --- Middleware ---
app.use(cors());
app.use(express.json());

// --- MongoDB Connection ---
const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in the .env file.");
    process.exit(1);
}
mongoose.connect(mongoURI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(err => console.error('MongoDB connection error:', err));


// --- Mongoose Schemas (Data Models) ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: {
        type: String,
        required: true,
        enum: ['donor', 'recipient', 'admin', 'analyst']
    },
    organizationName: { type: String, required: true }
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

const foodListingSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true },
    quantity: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    status: {
        type: String,
        required: true,
        enum: ['Available', 'Claimed'],
        default: 'Available'
    },
}, { timestamps: true });

const FoodListing = mongoose.model('FoodListing', foodListingSchema);

const donationRequestSchema = new mongoose.Schema({
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    notes: { type: String },
    status: {
        type: String,
        required: true,
        enum: ['Pending', 'Approved', 'Denied', 'Accepted', 'Claimed'],
        default: 'Pending'
    },
}, { timestamps: true });

const DonationRequest = mongoose.model('DonationRequest', donationRequestSchema);


// --- API Routes ---

// ====== AUTH ROUTES ======

app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, role, organizationName } = req.body;
        if (!email || !password || !role || !organizationName) {
            return res.status(400).json({ message: 'Please provide all required fields.' });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'An account with this email already exists.' });
        }
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ email, password: hashedPassword, role, organizationName });
        await newUser.save();
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) {
        res.status(500).json({ message: 'Server error during registration.', error: err.message });
    }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide email and password.' });
        }
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials.' });
        }
        res.status(200).json({ 
            message: 'Login successful!',
            user: { id: user._id, role: user.role, organizationName: user.organizationName, email: user.email }
        });
    } catch (err) {
        res.status(500).json({ message: 'Server error during login.', error: err.message });
    }
});

// POST /api/auth/forgot-password - Simulate sending a reset link
app.post('/api/auth/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "No user found with that email address." });
        }
        // In a real app, you would generate a token, save it to the user record,
        // and send an email with a link like /reset-password?token=YOUR_TOKEN
        console.log(`Password reset requested for ${email}. In a real app, an email would be sent.`);
        res.status(200).json({ message: "If an account with that email exists, a password reset link has been sent." });
    } catch (error) {
        res.status(500).json({ message: 'Server error.', error: error.message });
    }
});

// POST /api/auth/reset-password - Reset the user's password
app.post('/api/auth/reset-password', async (req, res) => {
    try {
        const { email, newPassword } = req.body;
        if (!email || !newPassword) {
            return res.status(400).json({ message: "Email and new password are required." });
        }
        
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        const updatedUser = await User.findOneAndUpdate(
            { email: email },
            { $set: { password: hashedPassword } },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(404).json({ message: "User not found." });
        }
        
        res.status(200).json({ message: "Password has been successfully reset. You can now log in." });

    } catch (error) {
        res.status(500).json({ message: 'Server error during password reset.', error: error.message });
    }
});


// ====== DATA ROUTES ======

// GET /api/listings - Fetch all available food listings
app.get('/api/listings', async (req, res) => {
    try {
        const listings = await FoodListing.find({ status: 'Available' }).populate('donorId', 'organizationName').sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) { res.status(500).json({ message: 'Error fetching listings', error: err.message }); }
});

// GET /api/listings/donor/:donorId - Fetch listings for a specific donor
app.get('/api/listings/donor/:donorId', async (req, res) => {
    try {
        const listings = await FoodListing.find({ donorId: req.params.donorId }).sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) { res.status(500).json({ message: 'Error fetching donor listings', error: err.message }); }
});


// POST /api/listings - Create a new food listing
app.post('/api/listings', async (req, res) => {
    try {
        const { donorId, itemName, quantity, expiryDate } = req.body;
        const newListing = new FoodListing({ donorId, itemName, quantity, expiryDate });
        await newListing.save();
        res.status(201).json(newListing);
    } catch (err) { res.status(500).json({ message: 'Error creating listing', error: err.message }); }
});


// GET /api/requests/donor/:donorId - Get all requests for a donor's items
app.get('/api/requests/donor/:donorId', async (req, res) => {
    try {
        const requests = await DonationRequest.find({ donorId: req.params.donorId })
            .populate('listingId', 'itemName')
            .populate('recipientId', 'organizationName')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: 'Error fetching requests for donor', error: err.message }); }
});

// GET /api/requests/recipient/:recipientId - Get all requests made by a recipient
app.get('/api/requests/recipient/:recipientId', async (req, res) => {
    try {
        const requests = await DonationRequest.find({ recipientId: req.params.recipientId })
            .populate('listingId', 'itemName')
            .populate('donorId', 'organizationName')
            .sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: 'Error fetching requests by recipient', error: err.message }); }
});


// POST /api/requests - Create a new donation request
app.post('/api/requests', async (req, res) => {
    try {
        const { listingId, recipientId, contactName, contactPhone, notes } = req.body;
        const listing = await FoodListing.findById(listingId);
        if (!listing) return res.status(404).json({ message: 'Listing not found.' });

        const newRequest = new DonationRequest({
            listingId,
            recipientId,
            donorId: listing.donorId,
            contactName,
            contactPhone,
            notes
        });
        await newRequest.save();
        res.status(201).json(newRequest);
    } catch (err) {
        res.status(500).json({ message: 'Error creating request', error: err.message });
    }
});


// PUT /api/requests/:id - Update a request's status
app.put('/api/requests/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const request = await DonationRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        
        // If an item is claimed, update the master food listing
        if (status === 'Claimed') {
            await FoodListing.findByIdAndUpdate(request.listingId, { status: 'Claimed' });
        }
        
        res.json(request);
    } catch (err) { res.status(500).json({ message: 'Error updating request', error: err.message }); }
});

// ====== ADMIN & ANALYTICS ROUTES ======

// GET /api/admin/all-data
app.get('/api/admin/all-data', async (req, res) => {
    try {
        const users = await User.find().select('-password');
        const listings = await FoodListing.find().populate('donorId', 'organizationName');
        const requests = await DonationRequest.find().populate('listingId', 'itemName').populate('recipientId', 'organizationName');
        res.json({ users, listings, requests });
    } catch (err) { res.status(500).json({ message: 'Error fetching admin data', error: err.message }); }
});

// GET /api/analytics/summary
app.get('/api/analytics/summary', async (req, res) => {
    try {
        const totalUsers = await User.countDocuments();
        const totalListings = await FoodListing.countDocuments();
        const claimedListings = await FoodListing.countDocuments({ status: 'Claimed' });
        const totalRequests = await DonationRequest.countDocuments();
        res.json({ totalUsers, totalListings, claimedListings, totalRequests });
    } catch (err) { res.status(500).json({ message: 'Error fetching analytics', error: err.message }); }
});


// --- Server Listener ---
app.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});

