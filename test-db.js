require('dotenv').config(); // Load environment variables

const { MongoClient } = require('mongodb');

const url = process.env.MONGO_URI; // Load MongoDB URI from .env
const client = new MongoClient(url);

async function testConnection() {
    try {
        await client.connect();
        console.log("✅ Successfully connected to MongoDB!");
        await client.close();
    } catch (error) {
        console.error("❌ MongoDB Connection Failed:", error);
    }
}

testConnection();
