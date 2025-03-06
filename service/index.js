const express = require('express');
const cors = require('cors');
const app = express();  // Initialize app here

// Use CORS middleware before defining routes
app.use(cors());  // Enable CORS for all routes

// Middleware to parse incoming JSON requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static('public'));

// Mock in-memory data for users
let users = [];

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

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

const port = process.argv.length > 2 ? process.argv[2] : 4000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
