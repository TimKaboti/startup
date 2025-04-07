const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const app = express();
const { connectDB, client, getBlacklistedTokensCollection } = require('./database'); // Import MongoDB connection
const { getUsersCollection, getEventsCollection } = require('./database');
const path = require("path");
const http = require('http');
const { WebSocketServer } = require('ws');



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
        const usersCollection = getUsersCollection();
        const fullUser = await usersCollection.findOne({ email: req.user.email });

        if (!fullUser || !fullUser._id) {
            return res.status(400).json({ message: 'User not found in database' });
        }

        const user = {
            _id: fullUser._id,  // ✅ Add MongoDB ObjectId
            name: fullUser.name,
            email: fullUser.email,
        };


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

        // ✅ WebSocket Broadcast: Competitor Joined Event
        const message = JSON.stringify({
            type: "competitor:added",
            eventId: id,
            competitor: user
        });

        global.wss?.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });


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

    // ✅ WebSocket Broadcast: Ring Added
    const ringMessage = JSON.stringify({
        type: "ring:added",
        eventId,
        ring: newRing
    });

    global.wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(ringMessage);
        }
    });

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
app.post('/api/events/:eventId/rings/:ringId/matches', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId, ringId } = req.params;

        // 🔹 Validate eventId and ringId format
        if (!ObjectId.isValid(eventId) || isNaN(ringId)) {
            return res.status(400).json({ message: "Invalid event or ring ID format" });
        }

        const eventObjectId = new ObjectId(eventId);
        const ringNumber = parseInt(ringId);

        // 🔹 Fetch the event
        const event = await eventsCollection.findOne({ _id: eventObjectId });

        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }

        // 🔹 Ensure user is an admin or event creator
        if (req.user.role !== "admin" && event.createdBy !== req.user.email) {
            return res.status(403).json({ message: "Access denied. Only admins or event creators can add matches." });
        }

        // 🔹 Find the ring within the event
        const ringIndex = event.rings.findIndex(r => r.id === ringNumber);
        if (ringIndex === -1) {
            return res.status(404).json({ message: "Ring not found" });
        }

        // 🔹 Assign the next available match number in the ring
        const newMatchId = event.rings[ringIndex].matches.length + 1;

        // 🔹 Define new match
        const newMatch = { id: newMatchId, competitors: [], status: "upcoming" };

        // 🔹 Push new match into the specified ring
        await eventsCollection.updateOne(
            { _id: eventObjectId, "rings.id": ringNumber },
            { $push: { "rings.$.matches": newMatch } }
        );

        // ✅ WebSocket Broadcast: Match Added
        const message = JSON.stringify({
            type: "match:updated",
            eventId,
            ringId,
            match: newMatch
        });

        global.wss?.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });


        console.log(`✅ Match ${newMatchId} added to Ring ${ringId} in Event ${eventId}`);
        res.status(201).json(newMatch);

    } catch (error) {
        console.error("❌ Error adding match:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/mark-ongoing', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId, ringId, matchId } = req.params;

        // 🔹 Validate IDs
        if (!ObjectId.isValid(eventId) || isNaN(ringId) || isNaN(matchId)) {
            return res.status(400).json({ message: "Invalid event, ring, or match ID format" });
        }

        const eventObjectId = new ObjectId(eventId);
        const ringNumber = parseInt(ringId);
        const matchNumber = parseInt(matchId);

        // 🔹 Fetch the event from the database
        const event = await eventsCollection.findOne({ _id: eventObjectId });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // 🔹 Ensure user is an admin or event creator
        if (req.user.role !== "admin" && event.createdBy !== req.user.email) {
            return res.status(403).json({ message: "Access denied. Only admins or event creators can mark matches as ongoing." });
        }

        // 🔹 Find the correct ring
        const ringIndex = event.rings.findIndex(r => r.id === ringNumber);
        if (ringIndex === -1) {
            return res.status(404).json({ message: "Ring not found" });
        }

        // 🔹 Find the correct match
        const matchIndex = event.rings[ringIndex].matches.findIndex(m => m.id === matchNumber);
        if (matchIndex === -1) {
            return res.status(404).json({ message: "Match not found" });
        }

        // 🔹 Set all matches in the ring to "upcoming"
        event.rings[ringIndex].matches.forEach(m => {
            if (m.status !== "completed") {
                m.status = "upcoming";
            }
        });

        // 🔥 Mark the selected match as "ongoing"
        event.rings[ringIndex].matches[matchIndex].status = "ongoing";

        // 🔹 Update MongoDB
        await eventsCollection.updateOne(
            { _id: eventObjectId, "rings.id": ringNumber },
            { $set: { "rings.$.matches": event.rings[ringIndex].matches } }
        );

        // ✅ After saving the update to MongoDB
        const message = JSON.stringify({
            type: "match:updated",
            eventId,
            ringId,
            matchId
        });

        global.wss?.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

        console.log(`✅ Match ${matchId} in Ring ${ringId} marked as Ongoing.`);
        res.status(200).json(event.rings[ringIndex].matches[matchIndex]);

    } catch (error) {
        console.error("❌ Error marking match as ongoing:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// 🔹 PATCH: Mark a match as completed
app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/mark-completed', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId, ringId, matchId } = req.params;

        // 🔹 Validate IDs
        if (!ObjectId.isValid(eventId) || isNaN(ringId) || isNaN(matchId)) {
            return res.status(400).json({ message: "Invalid event, ring, or match ID format" });
        }

        const eventObjectId = new ObjectId(eventId);
        const ringNumber = parseInt(ringId);
        const matchNumber = parseInt(matchId);

        // 🔹 Fetch the event from MongoDB
        const event = await eventsCollection.findOne({ _id: eventObjectId });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // 🔹 Ensure user is an admin or event creator
        if (req.user.role !== "admin" && event.createdBy !== req.user.email) {
            return res.status(403).json({ message: "Access denied. Only admins or event creators can mark matches as completed." });
        }

        // 🔹 Find the ring
        const ringIndex = event.rings.findIndex(r => r.id === ringNumber);
        if (ringIndex === -1) {
            return res.status(404).json({ message: "Ring not found" });
        }

        // 🔹 Find the match
        const matchIndex = event.rings[ringIndex].matches.findIndex(m => m.id === matchNumber);
        if (matchIndex === -1) {
            return res.status(404).json({ message: "Match not found" });
        }

        // 🔥 Mark the match as "completed"
        event.rings[ringIndex].matches[matchIndex].status = "completed";

        // 🔹 Update MongoDB
        await eventsCollection.updateOne(
            { _id: eventObjectId, "rings.id": ringNumber },
            { $set: { "rings.$.matches": event.rings[ringIndex].matches } }
        );


        const message = JSON.stringify({
            type: "match:updated",
            eventId,
            ringId,
            matchId
        });

        global.wss?.clients.forEach(client => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });


        console.log(`✅ Match ${matchId} in Ring ${ringId} marked as COMPLETED!`);
        res.status(200).json({ message: "Match marked as completed", match: event.rings[ringIndex].matches[matchIndex] });

    } catch (error) {
        console.error("❌ Error marking match as completed:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// 🔹 PATCH: Add a competitor to a match
app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/add-competitor', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId, ringId, matchId } = req.params;
        const { competitor } = req.body;

        // 🔹 Validate eventId, ringId, and matchId
        if (!ObjectId.isValid(eventId) || isNaN(ringId) || isNaN(matchId)) {
            return res.status(400).json({ message: "Invalid event, ring, or match ID format" });
        }

        const eventObjectId = new ObjectId(eventId);
        const ringNumber = parseInt(ringId);
        const matchNumber = parseInt(matchId);

        // 🔹 Fetch the event
        const event = await eventsCollection.findOne({ _id: eventObjectId });

        if (!event) {
            console.log(`❌ Event ${eventId} NOT FOUND`);
            return res.status(404).json({ message: "Event not found" });
        }

        console.log(`✅ Found Event ${eventId}, Rings:`, event.rings);

        // 🔹 Ensure user is an admin or event creator
        if (req.user.role !== "admin" && event.createdBy !== req.user.email) {
            return res.status(403).json({ message: "Access denied. Only admins or event creators can add competitors." });
        }

        // 🔹 Find the ring
        const ringIndex = event.rings.findIndex(r => r.id === ringNumber);
        if (ringIndex === -1) {
            console.log(`❌ Ring ${ringId} NOT FOUND in Event ${eventId}`);
            return res.status(404).json({ message: "Ring not found" });
        }

        console.log(`✅ Found Ring ${ringId}, Matches:`, event.rings[ringIndex].matches);

        // 🔹 Find the match
        const matchIndex = event.rings[ringIndex].matches.findIndex(m => m.id === matchNumber);
        if (matchIndex === -1) {
            console.log(`❌ Match ${matchId} NOT FOUND in Ring ${ringId}`);
            return res.status(404).json({ message: "Match not found" });
        }

        console.log(`✅ Found Match ${matchId}, adding competitor...`, competitor);

        // ✅ Ensure competitor has a consistent `id` field
        if (!competitor.id && competitor._id) {
            competitor.id = competitor._id.toString();
        }

        // 🔹 Check if competitor is already in the match
        const existingCompetitor = event.rings[ringIndex].matches[matchIndex].competitors.find(c => c.email === competitor.email);
        if (existingCompetitor) {
            return res.status(400).json({ message: "Competitor is already in the match" });
        }

        // 🔹 Ensure competitor has an ID
        if (!competitor.id) {
            const participant = event.participants.find(p => p.email === competitor.email);
            if (participant && participant._id) {
                competitor.id = participant._id.toString(); // Ensure it's a string
            } else {
                return res.status(400).json({ message: "Competitor ID not found" });
            }
        }

        console.log("🧪 Adding to event:", eventId);
        console.log("🧪 Ring #:", ringNumber, "Match #:", matchNumber);
        console.log("🧪 Competitor:", competitor);
        console.log("🔎 Ring:", event.rings[ringIndex]);
        console.log("🔎 Match:", event.rings[ringIndex].matches[matchIndex]);


        // 🔹 Add competitor to the match
        // await eventsCollection.updateOne(
        //     { _id: eventObjectId, "rings.id": ringNumber },
        //     { $push: { "rings.$.matches.$[match].competitors": competitor } },
        //     { arrayFilters: [{ "match.id": matchNumber }] }
        // );

        // 🔄 Add competitor directly in memory
        event.rings[ringIndex].matches[matchIndex].competitors.push(competitor);

        // 💾 Save entire updated matches array
        await eventsCollection.updateOne(
            { _id: eventObjectId, "rings.id": ringNumber },
            {
                $set: {
                    "rings.$.matches": event.rings[ringIndex].matches
                }
            }
        );




        const updated = await eventsCollection.findOne({ _id: eventObjectId });
        console.log("🧩 Updated match:", updated.rings[ringIndex].matches[matchIndex]);


        // ✅ After saving the update to MongoDB
        const message = JSON.stringify({
            type: "competitor:added",
            eventId,
            ringId,
            matchId,
            competitor
        });

        global.wss?.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });

        console.log(`✅ Competitor added to Match ${matchId} in Ring ${ringId}`);
        res.status(200).json({ message: "Competitor added successfully" });
        res.status(200).json(event.rings[ringIndex].matches[matchIndex]);


    } catch (error) {
        console.error("❌ Error adding competitor to match:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});




// 🔹 PATCH: Update a competitor's score in a match
app.patch('/api/events/:eventId/rings/:ringId/matches/:matchId/update-score', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId, ringId, matchId } = req.params;
        const { competitorId, score } = req.body;

        console.log(`🔍 Updating score for Competitor ${competitorId} in Match ${matchId}, Ring ${ringId}`);

        // 🔹 Validate IDs
        if (!ObjectId.isValid(eventId) || isNaN(ringId) || isNaN(matchId)) {
            return res.status(400).json({ message: "Invalid event, ring, or match ID format" });
        }

        const eventObjectId = new ObjectId(eventId);
        const ringNumber = parseInt(ringId);
        const matchNumber = parseInt(matchId);

        // 🔹 Fetch event
        const event = await eventsCollection.findOne({ _id: eventObjectId });

        if (!event) {
            console.error("❌ Event not found:", eventId);
            return res.status(404).json({ message: "Event not found" });
        }

        // 🔹 Ensure user is an admin or the event creator
        if (req.user.role !== "admin" && event.createdBy !== req.user.email) {
            return res.status(403).json({ message: "Access denied. Only admins or event creators can update scores." });
        }

        // 🔹 Find the ring within the event
        const ringIndex = event.rings.findIndex(r => r.id === ringNumber);
        if (ringIndex === -1) {
            return res.status(404).json({ message: "Ring not found" });
        }

        // 🔹 Find the match within the ring
        const matchIndex = event.rings[ringIndex].matches.findIndex(m => m.id === matchNumber);
        if (matchIndex === -1) {
            return res.status(404).json({ message: "Match not found" });
        }

        // 🔹 Find the competitor within the match
        const competitorIndex = event.rings[ringIndex].matches[matchIndex].competitors.findIndex(c => c.id == competitorId);
        if (competitorIndex === -1) {
            return res.status(404).json({ message: "Competitor not found in this match" });
        }

        // 🔥 Update competitor's score
        const updateQuery = {
            $set: {
                [`rings.${ringIndex}.matches.${matchIndex}.competitors.${competitorIndex}.score`]: score
            }
        };

        await eventsCollection.updateOne({ _id: eventObjectId }, updateQuery);

        console.log(`✅ Score Updated: Competitor ${competitorId} now has score: ${score}`);

        res.status(200).json({ message: "Score updated successfully" });

    } catch (error) {
        console.error("❌ Error updating score:", error);
        res.status(500).json({ message: "Internal server error" });
    }

    // ✅ After saving the update to MongoDB
    const message = JSON.stringify({
        type: "score:updated",
        eventId,
        ringId,
        matchId,
        competitorId,
        score
    });

    global.wss?.clients.forEach((client) => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(message);
        }
    });

});




// 🔹 GET /api/events/:eventId/competitor/:competitorId/matches - Fetch matches for a competitor
app.get('/api/events/:eventId/competitor/:competitorId/matches', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { eventId, competitorId } = req.params;

        // 🔹 Validate ObjectId
        if (!ObjectId.isValid(eventId) || !ObjectId.isValid(competitorId)) {
            return res.status(400).json({ message: "Invalid event or competitor ID format" });
        }

        const eventObjectId = new ObjectId(eventId);

        // 🔹 Fetch the event from MongoDB
        const event = await eventsCollection.findOne({ _id: eventObjectId });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // 🔹 Find all matches where this competitor is assigned
        const competitorMatches = event.rings
            .flatMap(ring =>
                ring.matches.map(match => ({
                    id: match.id,  // Include match number
                    ringId: ring.id,    // Include ring number
                    competitors: match.competitors,
                    status: match.status
                }))
            )
            .filter(match => match.competitors.some(c => c.id === competitorId));

        res.status(200).json(competitorMatches);

    } catch (error) {
        console.error("❌ Error fetching matches for competitor:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// 🔹 Get details of a single event (for fetching event name by ID)
app.get('/api/events/:id', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { id } = req.params;

        // Validate ObjectId
        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        const eventId = new ObjectId(id);
        const event = await eventsCollection.findOne({ _id: eventId }, { projection: { name: 1 } });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        res.status(200).json({ name: event.name });
    } catch (error) {
        console.error("❌ Error fetching event name:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});





// ⚠️ DANGER: Clears competitors from all matches in an event
app.patch('/api/events/:eventId/clear-all-competitors', async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "Invalid event ID" });
        }

        const eventsCollection = getEventsCollection();
        const eventObjectId = new ObjectId(eventId);

        const event = await eventsCollection.findOne({ _id: eventObjectId });
        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        // Clear competitors from all matches
        for (const ring of event.rings) {
            for (const match of ring.matches) {
                match.competitors = [];
            }
        }

        // Save changes
        await eventsCollection.updateOne(
            { _id: eventObjectId },
            { $set: { rings: event.rings } }
        );

        res.status(200).json({ message: "All competitors cleared from matches." });
    } catch (error) {
        console.error("❌ Error clearing competitors:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});



// 🔧 PATCH: Repair missing _id fields in event participants
app.patch('/api/events/:id/repair-participants', authenticateToken, async (req, res) => {
    try {
        const eventsCollection = getEventsCollection();
        const { id } = req.params;

        if (!ObjectId.isValid(id)) {
            return res.status(400).json({ message: "Invalid event ID format" });
        }

        const eventObjectId = new ObjectId(id);
        const event = await eventsCollection.findOne({ _id: eventObjectId });

        if (!event) {
            return res.status(404).json({ message: "Event not found" });
        }

        let updated = false;
        const updatedParticipants = event.participants.map(p => {
            if (!p._id) {
                p._id = new ObjectId();
                updated = true;
            }
            return p;
        });

        if (updated) {
            await eventsCollection.updateOne(
                { _id: eventObjectId },
                { $set: { participants: updatedParticipants } }
            );
            return res.status(200).json({ message: "Participants repaired", updatedCount: updatedParticipants.length });
        } else {
            return res.status(200).json({ message: "No repairs needed" });
        }

    } catch (error) {
        console.error("❌ Error repairing participants:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});


// const path = require("path");

// Serve frontend static files
app.use(express.static(path.join(__dirname, "public")));

// Handle React routes for production
app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});


// ✅ Ensure MongoDB is connected BEFORE starting the server and 
// allow websocket to hook into HTTP server.
// const http = require('http');
// const { WebSocketServer } = require('ws');

// ✅ Create the HTTP server manually
const server = http.createServer(app);

// ✅ Create the WebSocket server
const wss = new WebSocketServer({ server });
global.wss = wss;


wss.on('connection', (ws, req) => {
    console.log('🌐 New WebSocket client connected');

    ws.on('message', (message) => {
        console.log(`📨 Received message: ${message}`);
        ws.send(`🔁 Echo: ${message}`);
    });

    ws.on('close', () => {
        console.log('❌ Client disconnected');
    });
});

// ✅ Start HTTP + WebSocket server
(async () => {
    await connectDB();
    const port = process.argv.length > 2 ? process.argv[2] : 4000;
    server.listen(port, () => console.log(`🚀 Server running (HTTP + WS) on port ${port}`));
})();



// ✅ Graceful Shutdown: Close DB connection on exit
process.on('SIGINT', async () => {
    console.log("🛑 Closing MongoDB connection...");
    await client.close();
    process.exit(0);
});

module.exports = { app, server, wss };
