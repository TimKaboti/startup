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


app.get('/api/events/:id/competitors', (req, res) => {
    const { id } = req.params;
    const event = events.find(event => event.id === parseInt(id));

    if (!event) {
        console.log(`❌ Event ${id} not found`);
        return res.status(404).json({ message: 'Event not found' });
    }

    console.log(`🔍 Event ${id} found:`, event); // Debugging log
    console.log(`👥 Participants in Event ${id}:`, event.participants); // Check participants

    res.status(200).json(event.participants); // Return competitors
});



app.patch('/api/events/:eventId/matches/:matchId/add-competitor', (req, res) => {
    const { eventId, matchId } = req.params;
    const { competitor } = req.body; // Competitor to add

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    const match = event.matches?.find(match => match.id === parseInt(matchId));
    if (!match) {
        return res.status(404).json({ message: 'Match not found' });
    }

    // Check if competitor is already in the match
    if (match.competitors.some(c => c.email === competitor.email)) {
        return res.status(400).json({ message: 'Competitor already in this match' });
    }

    // Add competitor to match
    match.competitors.push(competitor);
    res.status(200).json(match);
});


app.patch('/api/events/:eventId/matches/:matchId/update-score', (req, res) => {
    const { eventId, matchId } = req.params;
    const { competitorId, score } = req.body; // ✅ Score can now be text

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) {
        return res.status(404).json({ message: 'Event not found' });
    }

    const match = event.matches?.find(match => match.id === parseInt(matchId));
    if (!match) {
        return res.status(404).json({ message: 'Match not found' });
    }

    // Find competitor and update score
    const competitor = match.competitors.find(c => c.id === competitorId);
    if (!competitor) {
        return res.status(404).json({ message: 'Competitor not found' });
    }

    competitor.score = score; // ✅ Store text instead of a number

    res.status(200).json(match);
});


app.get('/api/events/:eventId/competitor/:competitorId/matches', (req, res) => {
    const { eventId, competitorId } = req.params;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }

    // Find matches where this competitor is listed
    const competitorMatches = event.matches?.filter(match =>
        match.competitors.some(c => c.id === parseInt(competitorId))
    ) || [];

    res.status(200).json(competitorMatches);
});

app.get('/api/events/:eventId/rings/:ringId/current-match', (req, res) => {
    const { eventId, ringId } = req.params;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }

    const ring = event.rings.find(r => r.id === parseInt(ringId));
    if (!ring) {
        return res.status(404).json({ message: "Ring not found" });
    }

    const currentMatch = ring.matches.find(m => m.status === "ongoing") || null;

    res.status(200).json({ currentMatch });
});


app.patch('/api/events/:eventId/rings/:ringId/advance-match', (req, res) => {
    const { eventId, ringId } = req.params;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }

    const ring = event.rings.find(r => r.id === parseInt(ringId));
    if (!ring) {
        return res.status(404).json({ message: "Ring not found" });
    }

    const currentMatchIndex = ring.matches.findIndex(m => m.status === "ongoing");

    if (currentMatchIndex === -1) {
        return res.status(400).json({ message: "No ongoing match found." });
    }

    // 🔹 Mark current match as completed
    ring.matches[currentMatchIndex].status = "completed";

    // 🔹 Start the next match (if available)
    const nextMatch = ring.matches[currentMatchIndex + 1];
    if (nextMatch) {
        nextMatch.status = "ongoing";
    }

    res.status(200).json({
        message: nextMatch ? "Moved to next match." : "All matches completed in this ring.",
        nextMatch: nextMatch || null
    });
});
