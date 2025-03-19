const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);

let db;
let usersCollection;
let eventsCollection;
let blacklistedTokensCollection; // ✅ Added this line

async function connectDB() {
    try {
        await client.connect();
        db = client.db('tournamentDB'); // ✅ Replace with your actual database name
        usersCollection = db.collection('users');
        eventsCollection = db.collection('events');
        blacklistedTokensCollection = db.collection('blacklistedTokens'); // ✅ Initialize the blacklist collection

        // ✅ Create a TTL index to auto-delete expired tokens
        await blacklistedTokensCollection.createIndex({ "expiresAt": 1 }, { expireAfterSeconds: 0 });

        console.log("✅ Successfully connected to MongoDB!");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
}

// ✅ Correct function to get blacklisted tokens collection
function getBlacklistedTokensCollection() {
    return blacklistedTokensCollection;
}

// ✅ Single `module.exports` to avoid overwriting exports
module.exports = {
    client,
    connectDB,
    getUsersCollection: () => usersCollection,
    getEventsCollection: () => eventsCollection,
    getBlacklistedTokensCollection // ✅ Now correctly included in the exports
};
