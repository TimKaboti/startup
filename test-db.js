const { MongoClient } = require('mongodb');

const url = "mongodb+srv://tyjtanner:Ryin5lGGUGxadk20@cluster0.sh2cp.mongodb.net/admin?retryWrites=true&w=majority";
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
