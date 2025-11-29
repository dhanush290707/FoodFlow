const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const bcrypt = require('bcryptjs');
require('dotenv').config();
const http = require('http');
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST", "PUT"]
    }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

const mongoURI = process.env.MONGO_URI;
if (!mongoURI) {
    console.error("FATAL ERROR: MONGO_URI is not defined in the .env file.");
    process.exit(1);
}
mongoose.connect(mongoURI)
    .then(() => console.log('Successfully connected to MongoDB Atlas!'))
    .catch(err => console.error('MongoDB connection error:', err));

// --- Schemas ---
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true },
    role: { type: String, required: true, enum: ['donor', 'recipient', 'admin', 'analyst'] },
    organizationName: { type: String, required: true }
}, { timestamps: true });
const User = mongoose.model('User', userSchema);

const foodListingSchema = new mongoose.Schema({
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    itemName: { type: String, required: true },
    quantity: { type: String, required: true },
    expiryDate: { type: Date, required: true },
    status: { type: String, required: true, enum: ['Available', 'Claimed'], default: 'Available' },
    location: {
        lat: Number,
        lng: Number,
        address: String
    }
}, { timestamps: true });
const FoodListing = mongoose.model('FoodListing', foodListingSchema);

const donationRequestSchema = new mongoose.Schema({
    listingId: { type: mongoose.Schema.Types.ObjectId, ref: 'FoodListing', required: true },
    recipientId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    donorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    contactName: { type: String, required: true },
    contactPhone: { type: String, required: true },
    notes: { type: String },
    status: { type: String, required: true, enum: ['Pending', 'Approved', 'Denied', 'Accepted', 'Claimed'], default: 'Pending' },
}, { timestamps: true });
const DonationRequest = mongoose.model('DonationRequest', donationRequestSchema);

// --- Helper: Middleware for Role Checking ---
const checkRole = (allowedRoles) => {
    return async (req, res, next) => {
        const userId = req.body.userId || req.body.donorId || req.body.recipientId || req.query.userId;
        if (!userId) return next();

        try {
            const user = await User.findById(userId);
            if (user && allowedRoles.includes(user.role)) {
                next();
            } else {
                return res.status(403).json({ message: "Access denied: Insufficient permissions." });
            }
        } catch (err) {
            return res.status(500).json({ message: "Error verifying user role." });
        }
    };
};

// --- API Routes ---

// AUTH
app.post('/api/auth/register', async (req, res) => {
    try {
        const { email, password, role, organizationName } = req.body;
        if (!email || !password || !role || !organizationName) return res.status(400).json({ message: 'Please provide all required fields.' });
        const existingUser = await User.findOne({ email });
        if (existingUser) return res.status(400).json({ message: 'An account with this email already exists.' });
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const newUser = new User({ email, password: hashedPassword, role, organizationName });
        await newUser.save();
        io.emit('data_changed');
        res.status(201).json({ message: 'User registered successfully!' });
    } catch (err) { res.status(500).json({ message: 'Server error during registration.', error: err.message }); }
});

app.post('/api/auth/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) return res.status(400).json({ message: 'Please provide email and password.' });
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials.' });
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials.' });
        res.status(200).json({ message: 'Login successful!', user: { id: user._id, role: user.role, organizationName: user.organizationName, email: user.email }});
    } catch (err) { res.status(500).json({ message: 'Server error during login.', error: err.message }); }
});

// DATA ROUTES
app.get('/api/listings', async (req, res) => {
    try {
        const listings = await FoodListing.find({ status: 'Available' }).populate('donorId', 'organizationName').sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) { res.status(500).json({ message: 'Error fetching listings', error: err.message }); }
});

app.get('/api/listings/donor/:donorId', async (req, res) => {
    try {
        const listings = await FoodListing.find({ donorId: req.params.donorId }).sort({ createdAt: -1 });
        res.json(listings);
    } catch (err) { res.status(500).json({ message: 'Error fetching donor listings', error: err.message }); }
});

app.post('/api/listings', checkRole(['donor']), async (req, res) => {
    try {
        const { donorId, itemName, quantity, expiryDate, location } = req.body;
        const newListing = new FoodListing({ donorId, itemName, quantity, expiryDate, location });
        await newListing.save();
        io.emit('data_changed');
        res.status(201).json(newListing);
    } catch (err) { res.status(500).json({ message: 'Error creating listing', error: err.message }); }
});

app.get('/api/requests/donor/:donorId', async (req, res) => {
    try {
        const requests = await DonationRequest.find({ donorId: req.params.donorId }).populate('listingId', 'itemName').populate('recipientId', 'organizationName').sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: 'Error fetching donor requests', error: err.message }); }
});

app.get('/api/requests/recipient/:recipientId', async (req, res) => {
    try {
        const requests = await DonationRequest.find({ recipientId: req.params.recipientId }).populate('listingId', 'itemName').populate('donorId', 'organizationName').sort({ createdAt: -1 });
        res.json(requests);
    } catch (err) { res.status(500).json({ message: 'Error fetching recipient requests', error: err.message }); }
});

app.post('/api/requests', checkRole(['recipient']), async (req, res) => {
    try {
        const { listingId, recipientId, contactName, contactPhone, notes } = req.body;
        const listing = await FoodListing.findById(listingId);
        if (!listing) return res.status(404).json({ message: "Listing not found" });
        const newRequest = new DonationRequest({ listingId, recipientId, donorId: listing.donorId, contactName, contactPhone, notes });
        await newRequest.save();
        io.emit('data_changed');
        res.status(201).json(newRequest);
    } catch (err) { res.status(500).json({ message: 'Error creating request', error: err.message }); }
});

app.put('/api/requests/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const request = await DonationRequest.findByIdAndUpdate(req.params.id, { status }, { new: true });
        if (status === 'Claimed') {
            await FoodListing.findByIdAndUpdate(request.listingId, { status: 'Claimed' });
        }
        io.emit('data_changed');
        res.json(request);
    } catch (err) { res.status(500).json({ message: 'Error updating request', error: err.message }); }
});

app.get('/api/admin/all-data', async (req, res) => {
    try {
        const [users, listings, requests] = await Promise.all([
            User.find().select('-password'),
            FoodListing.find().populate('donorId', 'organizationName'),
            DonationRequest.find().populate('listingId', 'itemName').populate('recipientId', 'organizationName')
        ]);
        res.json({ users, listings, requests });
    } catch (err) { res.status(500).json({ message: 'Error fetching admin data', error: err.message }); }
});

app.get('/api/analytics/summary', async (req, res) => {
    try {
        const [totalUsers, totalListings, claimedListings, totalRequests] = await Promise.all([
            User.countDocuments(),
            FoodListing.countDocuments(),
            FoodListing.countDocuments({ status: 'Claimed' }),
            DonationRequest.countDocuments()
        ]);
        res.json({ totalUsers, totalListings, claimedListings, totalRequests });
    } catch (err) { res.status(500).json({ message: 'Error fetching summary', error: err.message }); }
});

io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

server.listen(PORT, () => {
    console.log(`Backend server is running on http://localhost:${PORT}`);
});