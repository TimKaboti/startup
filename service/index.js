const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();

const SECRET_KEY = "your_secret_key";

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

let users = [];
let events = [];

app.get('/', (req, res) => res.send('Hello, world!'));

// User management
app.post('/api/users', (req, res) => {
    const { name, age, rank, email, password } = req.body;
    if (!name || !age || !rank || !email || !password) {
        return res.status(400).json({ message: 'All fields are required' });
    }
    if (users.some(user => user.email === email)) {
        return res.status(400).json({ message: 'Email already registered' });
    }
    const newUser = { id: users.length + 1, name, age, rank, email, password, role: 'competitor' };
    users.push(newUser);
    res.status(201).json(newUser);
});

app.get('/api/users', (req, res) => res.status(200).json(users));

app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) {
        return res.status(401).json({ message: 'Invalid email or password' });
    }
    const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });
    res.status(200).json({ ...user, token });
});

app.post('/api/logout', (req, res) => res.status(200).json({ message: "Logged out successfully" }));

// Event management
app.post('/api/events', (req, res) => {
    const { name } = req.body;
    if (!name) return res.status(400).json({ message: 'Event name is required' });
    const newEvent = { id: events.length + 1, name, participants: [], rings: [] };
    events.push(newEvent);
    res.status(201).json(newEvent);
});

app.get('/api/events', (req, res) => res.status(200).json(events));

app.patch('/api/events/:id/join', (req, res) => {
    const { id } = req.params;
    const { user } = req.body;
    const event = events.find(e => e.id === parseInt(id));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    if (event.participants.some(p => p.email === user.email)) {
        return res.status(400).json({ message: 'User is already in this event' });
    }
    event.participants.push(user);
    res.status(200).json(event);
});

app.get('/api/events/:id/competitors', (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.id));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event.participants);
});

// Ring management
app.post('/api/events/:eventId/rings', (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const newRing = { id: event.rings.length + 1, matches: [] };
    event.rings.push(newRing);
    res.status(201).json(newRing);
});

app.get('/api/events/:eventId/rings', (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event.rings);
});

// Match management
app.post('/api/events/:eventId/rings/:ringId/matches', (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    const ring = event.rings.find(r => r.id === parseInt(req.params.ringId));
    if (!ring) return res.status(404).json({ message: 'Ring not found' });
    const newMatch = { id: ring.matches.length + 1, competitors: [], status: "upcoming" };
    ring.matches.push(newMatch);
    res.status(201).json(newMatch);
});

// 🔹 PATCH: Add a competitor to a match
app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/add-competitor', (req, res) => {
    const { eventId, ringId, matchId } = req.params;
    const { competitor } = req.body;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ring = event.rings.find(r => r.id === parseInt(ringId));
    if (!ring) return res.status(404).json({ message: 'Ring not found' });

    const match = ring.matches.find(m => m.id === parseInt(matchId));
    if (!match) return res.status(404).json({ message: 'Match not found' });

    // 🔥 Check if competitor is already in THIS SPECIFIC MATCH in THIS RING
    if (match.competitors.some(c => c.email === competitor.email)) {
        return res.status(400).json({ message: 'Competitor already in this match in this ring' });
    }

    console.log(`✅ Adding competitor ${competitor.name} to match ${matchId} in ring ${ringId}`);

    match.competitors.push(competitor);
    res.status(200).json(match);
});

const port = process.argv.length > 2 ? process.argv[2] : 4000;
app.listen(port, () => console.log(`Server running on port ${port}`));


// 🔹 GET /api/events/:eventId/competitor/:competitorId/matches - Fetch matches for a competitor
app.get('/api/events/:eventId/competitor/:competitorId/matches', (req, res) => {
    const { eventId, competitorId } = req.params;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }

    // 🔥 Find all matches where this competitor is assigned
    const competitorMatches = event.rings
        .flatMap(ring => ring.matches)
        .filter(match => match.competitors.some(c => c.id === parseInt(competitorId)));

    console.log(`✅ Returning matches for competitor ${competitorId}:`, competitorMatches);
    res.status(200).json(competitorMatches);
});

