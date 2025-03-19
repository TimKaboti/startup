const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { connectDB, client } = require('./database'); // Import MongoDB connection
const { getUsersCollection, getEventsCollection } = require('./database');
const path = require("path");


const SECRET_KEY = "your_secret_key";

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// let users = [];
// let events = [];

app.get('/', (req, res) => res.send('Hello, world!'));

// User management
const bcrypt = require('bcrypt');

app.post('/api/users', async (req, res) => {
    try {
        const usersCollection = getUsersCollection();
        const { name, age, rank, email, password } = req.body;

        if (!name || !age || !rank || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUser = await usersCollection.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'Email already registered' });
        }

        // 🔹 Ensure password hashing is correctly applied
        const hashedPassword = await bcrypt.hash(password, 10);
        console.log("✅ Hashed Password:", hashedPassword); // Debugging: Check if hashing works

        const newUser = { name, age, rank, email, password: hashedPassword, role: 'competitor' };
        const result = await usersCollection.insertOne(newUser);

        res.status(201).json({ id: result.insertedId, ...newUser });
    } catch (error) {
        console.error("❌ Error creating user:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.get('/api/users', async (req, res) => {
    try {
        const usersCollection = getUsersCollection();
        const users = await usersCollection.find({}).toArray(); // 🔹 Fetch all users

        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



app.post('/api/login', async (req, res) => {
    try {
        const usersCollection = getUsersCollection();
        const { email, password } = req.body;

        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 🔹 Compare provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        const token = jwt.sign({ email: user.email, role: user.role }, SECRET_KEY, { expiresIn: '1h' });

        res.status(200).json({ ...user, token });
    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
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

    const event = events.find(event => event.id === parseInt(id));
    if (!event) return res.status(404).json({ message: 'Event not found' });

    // 🔥 Check if the user is already in the event
    const existingParticipant = event.participants.find(p => p.email === user.email);

    if (existingParticipant) {
        console.log(`🔹 ${user.name} is already in event ${id}, allowing rejoin.`);
        return res.status(200).json({ message: 'User already in event', eventId: id });
    }

    // 🔹 Add user if they are not already in the event
    event.participants.push(user);
    console.log(`✅ ${user.name} joined event ${id}`);

    res.status(200).json({ message: 'User joined successfully', eventId: id });
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

    if (!event.rings) {
        event.rings = [];  // ✅ Initialize rings if missing
    }

    const newRing = { id: event.rings.length + 1, matches: [] };
    event.rings.push(newRing);
    res.status(201).json(newRing);
});


app.get('/api/events/:eventId/rings', (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });
    res.status(200).json(event.rings);
});


// 🔹 GET Matches in a Specific Ring
app.get('/api/events/:eventId/rings/:ringId/matches', (req, res) => {
    const { eventId, ringId } = req.params;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ring = event.rings.find(r => r.id === parseInt(ringId));
    if (!ring) return res.status(404).json({ message: 'Ring not found' });

    res.status(200).json(ring.matches);
});


// Match management
app.post('/api/events/:eventId/rings/:ringId/matches', (req, res) => {
    const event = events.find(e => e.id === parseInt(req.params.eventId));
    if (!event) {
        console.log(`❌ Event ${req.params.eventId} NOT FOUND`);
        return res.status(404).json({ message: 'Event not found' });
    }

    const ring = event.rings.find(r => r.id === parseInt(req.params.ringId));
    if (!ring) {
        console.log(`❌ Ring ${req.params.ringId} NOT FOUND in Event ${req.params.eventId}`);
        return res.status(404).json({ message: 'Ring not found' });
    }

    console.log(`✅ Found Ring ${req.params.ringId}, adding a new match...`);

    const newMatch = { id: ring.matches.length + 1, competitors: [], status: "upcoming" };
    ring.matches.push(newMatch);

    console.log(`✅ Match ${newMatch.id} successfully added to Ring ${req.params.ringId}`);
    res.status(201).json(newMatch);
});



app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/mark-ongoing', (req, res) => {
    const { eventId, ringId, matchId } = req.params;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ring = event.rings.find(ring => ring.id === parseInt(ringId));
    if (!ring) return res.status(404).json({ message: 'Ring not found' });

    const match = ring.matches.find(match => match.id === parseInt(matchId));
    if (!match) return res.status(404).json({ message: 'Match not found' });

    // 🔹 Mark all other matches as upcoming
    ring.matches.forEach(m => m.status = "upcoming");

    // 🔥 Mark the selected match as "ongoing"
    match.status = "ongoing";
    console.log(`✅ Match ${matchId} in Ring ${ringId} marked as Ongoing.`);

    res.status(200).json(match);
});


// 🔹 PATCH: Mark a match as completed
app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/mark-completed', (req, res) => {
    const { eventId, ringId, matchId } = req.params;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ring = event.rings.find(ring => ring.id === parseInt(ringId));
    if (!ring) return res.status(404).json({ message: 'Ring not found' });

    const match = ring.matches.find(match => match.id === parseInt(matchId));
    if (!match) return res.status(404).json({ message: 'Match not found' });

    match.status = "completed";

    console.log(`✅ Match ${matchId} in Ring ${ringId} marked as COMPLETED!`);
    res.status(200).json({ message: "Match marked as completed", match });
});


// 🔹 PATCH: Add a competitor to a match
app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/add-competitor', (req, res) => {
    const { eventId, ringId, matchId } = req.params;
    const { competitor } = req.body;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) {
        console.log(`❌ Event ${eventId} NOT FOUND`);
        return res.status(404).json({ message: 'Event not found' });
    }

    console.log(`✅ Found Event ${eventId}, Rings:`, event.rings);

    const ring = event.rings.find(r => r.id === parseInt(ringId));
    if (!ring) {
        console.log(`❌ Ring ${ringId} NOT FOUND in event ${eventId}`);
        return res.status(404).json({ message: 'Ring not found' });
    }

    console.log(`✅ Found Ring ${ringId}, Matches:`, ring.matches);

    const match = ring.matches.find(m => m.id === parseInt(matchId));
    if (!match) {
        console.log(`❌ Match ${matchId} NOT FOUND in Ring ${ringId}`);
        return res.status(404).json({ message: 'Match not found' });
    }

    console.log(`✅ Found Match ${matchId}, adding competitor...`, competitor);

    match.competitors.push(competitor);
    res.status(200).json(match);
});



// 🔹 PATCH: Update a competitor's score in a match
app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/update-score', (req, res) => {
    const { eventId, ringId, matchId } = req.params;
    const { competitorId, score } = req.body;

    console.log(`🔍 Updating score for Competitor ${competitorId} in Match ${matchId}, Ring ${ringId}`);

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) return res.status(404).json({ message: 'Event not found' });

    const ring = event.rings.find(ring => ring.id === parseInt(ringId));
    if (!ring) return res.status(404).json({ message: 'Ring not found' });

    const match = ring.matches.find(match => match.id === parseInt(matchId));
    if (!match) return res.status(404).json({ message: 'Match not found' });

    const competitor = match.competitors.find(c => c.id === parseInt(competitorId));
    if (!competitor) return res.status(404).json({ message: 'Competitor not found in this match' });

    // 🔥 Update the score
    competitor.score = score;
    console.log(`✅ Score Updated: Competitor ${competitorId} now has score: ${score}`);

    res.status(200).json({ message: "Score updated successfully", match });
});



// 🔹 GET /api/events/:eventId/competitor/:competitorId/matches - Fetch matches for a competitor
app.get('/api/events/:eventId/competitor/:competitorId/matches', (req, res) => {
    const { eventId, competitorId } = req.params;

    const event = events.find(event => event.id === parseInt(eventId));
    if (!event) {
        return res.status(404).json({ message: "Event not found" });
    }

    // Find all matches where this competitor is assigned
    const competitorMatches = event.rings
        .flatMap(ring => ring.matches.map(match => ({ ...match, ringId: ring.id }))) // 🔥 Add ringId
        .filter(match => match.competitors.some(c => c.id === parseInt(competitorId)));

    res.status(200).json(competitorMatches);
});


// const path = require("path");

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// Handle React routes for production
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ✅ Ensure MongoDB is connected BEFORE starting the server
(async () => {
    await connectDB(); // 🛠 Ensures database is connected

    // ✅ Place `app.listen()` here, AFTER successful connection
    const port = process.argv.length > 2 ? process.argv[2] : 4000;
    app.listen(port, () => console.log(`🚀 Server running on port ${port}`));
})();

// ✅ Graceful Shutdown: Close DB connection on exit
process.on('SIGINT', async () => {
    console.log("🛑 Closing MongoDB connection...");
    await client.close();
    process.exit(0);
});

