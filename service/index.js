const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken'); // 🔥 Install this using: npm install jsonwebtoken
const app = express();

const SECRET_KEY = "your_secret_key"; // ⚠️ Store this securely in an environment variable!

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let users = [];
let events = [];

// Basic route
app.get('/', (req, res) => {
    res.send('Hello, world!');
});

// 🔹 POST /api/users: Create a new user
app.post('/api/users', (req, res) => {
    const { name, age, rank, email, password } = req.body;

    if (!name || !age || !rank || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    // Check if user already exists
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
    }

    const newUser = {
        id: users.length + 1,
        name,
        age,
        rank,
        email,
        password, // 🔥 In production, store hashed passwords!
        role: 'competitor' // 🔥 Default role is competitor unless modified later
    };

    users.push(newUser);
    res.status(201).json(newUser);
});

// 🔹 GET /api/users: Fetch all users
app.get('/api/users', (req, res) => {
    res.status(200).json(users);
});

// 🔹 POST /api/login: Handle user login (Now with JWT)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required' });
    }

    const user = users.find((u) => u.email === email);
    if (!user || user.password !== password) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }

    // ✅ Generate a token
    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

    console.log("🔑 Generated Token:", token); // 🔥 Debugging log

    // ✅ Ensure token is included in the response
    res.status(200).json({
        id: user.id,
        name: user.name,
        age: user.age,
        rank: user.rank,
        email: user.email,
        role: user.role,
        token // ✅ This must be sent to the frontend
    });
});


// 🔹 POST /api/logout: Handle logout
app.post('/api/logout', (req, res) => {
    console.log("User logged out:", req.body.email);
    res.status(200).json({ message: "Logged out successfully" });
});

// 🔹 POST /api/events: Create a new event
app.post('/api/events', (req, res) => {
    const { name } = req.body;

    if (!name) {
        return res.status(400).json({ message: 'Event name is required' });
    }

    const newEvent = {
        id: events.length + 1,
        name,
        participants: []
    };

    events.push(newEvent);
    res.status(201).json(newEvent);
});

// 🔹 GET /api/events: Fetch all events
app.get('/api/events', (req, res) => {
    res.status(200).json(events);
});

// 🔹 PATCH /api/events/:id/join: Join an event
app.patch('/api/events/:id/join', (req, res) => {
    const { id } = req.params;
    const { user } = req.body;

    const event = events.find(event => event.id === parseInt(id));
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    if (event.participants.some(participant => participant.email === user.email)) {
        return res.status(400).json({ message: 'User is already in this event' });
    }

    event.participants.push(user);
    res.status(200).json(event);
});

const port = process.argv.length > 2 ? process.argv[2] : 4000;
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
