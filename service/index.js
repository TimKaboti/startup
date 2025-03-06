const express = require('express');
const cors = require('cors');
const app = express();

// Use CORS middleware before defining routes
app.use(cors()); // Enable CORS for all routes

// Middleware to parse incoming JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Mock in-memory data for users
let users = [];

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// POST /api/users: Create a new user
app.post('/api/users', (req, res) => {
    const { name, age, rank, email, password } = req.body;

    // Basic validation (ensure all fields are provided)
    if (!name || !age || !rank || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Create a new user object
    const newUser = {
        id: users.length + 1, // Simple ID generation
        name,
        age,
        rank,
        email,
        password, // In a real-world app, password should be hashed
    };

    // Add the user to the mock database (the users array)
    users.push(newUser);

    // Respond with the created user
    res.status(201).json(newUser); // 201 status indicates resource creation
});

// GET /api/users: Fetch all users
app.get('/api/users', (req, res) => {
    res.status(200).json(users); // Respond with the list of users
});

// POST /api/login: Handle user login
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    // Basic validation (ensure both email and password are provided)
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    // Search for the user with the given email
    const user = users.find((u) => u.email === email);

    // If no user found or password doesn't match, return an error
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Respond with the user details (excluding password)
    const { password: _, ...userDetails } = user;
    res.status(200).json(userDetails); // 200 status indicates successful login
});

const port = process.argv.length > 2 ? process.argv[2] : 4000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
