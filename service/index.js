const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { connectDB, client, getBlacklistedTokensCollection } = require('./database'); // Import MongoDB connection
const { getUsersCollection, getEventsCollection } = require('./database');
const path = require("path");



const SECRET_KEY = "your_secret_key";

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// let users = [];
// let events = [];

app.get('/', (req, res) => res.send('Hello, world!'));

const { ObjectId } = require('mongodb');


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


app.get('/api/users', authenticateToken, async (req, res) => {
    try {
        const usersCollection = getUsersCollection();
        const users = await usersCollection.find({}).toArray();
        res.status(200).json(users);
    } catch (error) {
        console.error("❌ Error fetching users:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



async function authenticateToken(req, res, next) {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ message: "Access denied. No token provided." });
    }

    const blacklistedTokensCollection = getBlacklistedTokensCollection();
    const blacklistedToken = await blacklistedTokensCollection.findOne({ token });

    if (blacklistedToken) {
        return res.status(403).json({ message: "Token is blacklisted. Please log in again." });
    }

    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) return res.status(403).json({ message: "Invalid token" });
        req.user = user;
        next();
    });
}


app.post('/api/login', async (req, res) => {
    try {
        const usersCollection = getUsersCollection();
        const { email, password, role } = req.body;  // 🔹 Accept role input

        const user = await usersCollection.findOne({ email });

        if (!user) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 🔹 Compare provided password with the hashed password in the database
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ message: 'Invalid email or password' });
        }

        // 🔥 Validate role selection
        const validRoles = ["competitor", "admin"];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: "Invalid role selection" });
        }

        // 🔹 Generate a JWT token with the selected role
        const token = jwt.sign(
            { email: user.email, name: user.name, role: role },  // Role now dynamic
            SECRET_KEY,
            { expiresIn: '12h' }
        );

        res.status(200).json({ ...user, role, token });

    } catch (error) {
        console.error("❌ Error during login:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.post('/api/logout', async (req, res) => {
    try {
        const blacklistedTokensCollection = getBlacklistedTokensCollection();
        const token = req.headers.authorization?.split(" ")[1];

        if (!token) {
            return res.status(400).json({ message: "No token provided" });
        }

        // Get expiration time from the token
        const decodedToken = jwt.decode(token);
        const expiration = new Date(decodedToken.exp * 1000); // Convert to milliseconds

        // Store the token with an expiration field
        await blacklistedTokensCollection.insertOne({ token, createdAt: new Date(), expiresAt: expiration });

        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.error("❌ Error logging out:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Event management
app.post('/api/events', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: 'Event name is required' });
        }

        // ✅ Get user details from the token
        const createdBy = req.user.email; // Store the event creator

        // ✅ Insert event into MongoDB with creator info
        const newEvent = { name, createdBy, participants: [], rings: [] };
        const result = await eventsCollection.insertOne(newEvent);

        res.status(201).json({ id: result.insertedId, ...newEvent });
    } catch (error) {
        console.error("❌ Error creating event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.get('/api/events', async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const events = await eventsCollection.find({}, { projection: { _id: 1, name: 1 } }).toArray();
        res.status(200).json(events);
    } catch (error) {
        console.error("❌ Error fetching events:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.patch('/api/events/:id/join', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { id } = req.params;

        // 🔹 Validate ObjectId Format
        if (!ObjectId.isValid(id)) {
            console.error(`❌ Invalid ObjectId: ${id}`);
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        const eventId = new ObjectId(id); // Convert to ObjectId safely

        // 🔹 Get user info from the authenticated request
        const user = { name: req.user.name, email: req.user.email };

        if (!user.email || !user.name) {
            console.error("❌ User details missing:", user);
            return res.status(400).json({ message: 'User details are required' });
        }

        // 🔹 Find event by ID
        const event = await eventsCollection.findOne({ _id: eventId });

        if (!event) {
            console.error("❌ Event not found:", id);
            return res.status(404).json({ message: 'Event not found' });
        }

        // 🔥 Check if user is already in the event
        const existingParticipant = event.participants?.find(p => p.email === user.email);

        if (existingParticipant) {
            console.log(`🔹 ${user.name} is already in event ${id}, allowing rejoin.`);
            return res.status(200).json({ message: 'User already in event', eventId: id });
        }

        // 🔹 Add user to participants array
        await eventsCollection.updateOne(
            { _id: eventId },
            { $push: { participants: user } }
        );

        console.log(`✅ ${user.name} joined event ${id}`);
        res.status(200).json({ message: 'User joined successfully', eventId: id });

    } catch (error) {
        console.error("❌ Error joining event:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.get('/api/events/:id/competitors', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { id } = req.params;

        // 🔹 Validate ObjectId Format
        if (!ObjectId.isValid(id)) {
            console.error(`❌ Invalid ObjectId: ${id}`);
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        const eventId = new ObjectId(id);

        // 🔹 Find event by ID and return only the participants field
        const event = await eventsCollection.findOne({ _id: eventId }, { projection: { participants: 1 } });

        if (!event) {
            console.error("❌ Event not found:", id);
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(event.participants || []); // Return empty array if no participants

    } catch (error) {
        console.error("❌ Error fetching competitors:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// Ring management
app.post('/api/events/:eventId/rings', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId } = req.params;
        const userEmail = req.user.email;
        const userRole = req.user.role; // 🔥 Ensure this is correct

        console.log(`🔍 DEBUG: User Email: ${userEmail}, Role: ${userRole}`); // 🔥 Add this

        const event = await eventsCollection.findOne({ _id: new ObjectId(eventId) });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // 🔹 Ensure ONLY Admins or Event Creators can add rings
        if (userRole !== "admin" && event.createdBy !== userEmail) {
            console.error(`❌ Unauthorized: ${userEmail} is not an admin or the event creator.`);
            return res.status(403).json({ message: "Access denied. Only admins or event creators can add rings." });
        }

        // ✅ Create a new ring
        const newRing = { id: event.rings.length + 1, matches: [] };

        // ✅ Push the new ring into the event
        await eventsCollection.updateOne(
            { _id: new ObjectId(eventId) },
            { $push: { rings: newRing } }
        );

        res.status(201).json(newRing);
    } catch (error) {
        console.error("❌ Error adding ring:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.get('/api/events/:eventId/rings', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId } = req.params;

        // 🔹 Validate ObjectId Format
        if (!ObjectId.isValid(eventId)) {
            console.error(`❌ Invalid ObjectId: ${eventId}`);
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        const event = await eventsCollection.findOne(
            { _id: new ObjectId(eventId) },
            { projection: { rings: 1, _id: 0 } } // 🔹 Only return rings
        );

        if (!event) {
            console.error(`❌ Event not found: ${eventId}`);
            return res.status(404).json({ message: 'Event not found' });
        }

        res.status(200).json(event.rings || []); // 🔹 Ensure an empty array if no rings exist
    } catch (error) {
        console.error("❌ Error fetching rings:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// 🔹 GET Matches in a Specific Ring
app.get('/api/events/:eventId/rings/:ringId/matches', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId, ringId } = req.params;

        // 🔹 Validate ObjectId format
        if (!ObjectId.isValid(eventId)) {
            console.error(`❌ Invalid Event ID: ${eventId}`);
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        // 🔹 Convert eventId to ObjectId
        const eventObjectId = new ObjectId(eventId);

        // 🔹 Find the event in MongoDB
        const event = await eventsCollection.findOne({ _id: eventObjectId });

        if (!event) {
            console.error("❌ Event not found:", eventId);
            return res.status(404).json({ message: 'Event not found' });
        }

        // 🔹 Find the ring in the event
        const ring = event.rings.find(r => r.id === parseInt(ringId));

        if (!ring) {
            console.error("❌ Ring not found:", ringId);
            return res.status(404).json({ message: 'Ring not found' });
        }

        res.status(200).json(ring.matches);
    } catch (error) {
        console.error("❌ Error fetching matches:", error);
        res.status(500).json({ message: "Internal server error" });
    }
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

