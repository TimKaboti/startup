const { MongoClient } = require('mongodb');
const config = require('./dbConfig.json');

const url = `mongodb+srv://${config.userName}:${config.password}@${config.hostname}`;
const client = new MongoClient(url);

let db;
let usersCollection;
let eventsCollection;

async function connectDB() {
    try {
        await client.connect();
        db = client.db('tournamentDB'); // Change 'tournamentDB' to your database name
        usersCollection = db.collection('users');
        eventsCollection = db.collection('events');
        console.log("✅ Successfully connected to MongoDB!");
    } catch (error) {
        console.error("❌ Database connection failed:", error.message);
        process.exit(1);
    }
}

module.exports = {
    client,
    connectDB,
    getUsersCollection: () => usersCollection,
    getEventsCollection: () => eventsCollection
};
