const mongoose = require('mongoose');

// Global cache for serverless environments (Vercel)
let cached = global.mongoose;

if (!cached) {
    cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
    // If a connection already exists from a previous serverless invocation, reuse it
    if (cached.conn) {
        console.log('✅ Reusing existing MongoDB connection (Serverless Cache)');
        return cached.conn;
    }

    if (!cached.promise) {
        const mongoUri = process.env.MONGO_URI || process.env.MONGODB_URI;

        if (!mongoUri) {
            console.error('❌ MONGODB_URI is totally missing from environment variables!');
            if (!process.env.VERCEL) process.exit(1);
            return null;
        }

        console.log('🔄 Creating new MongoDB connection...');

        cached.promise = mongoose.connect(mongoUri, {
            // Options to prevent serverless timeout issues
            bufferCommands: false,
            serverSelectionTimeoutMS: 5000,
        }).then((mongoose) => {
            console.log(`✅ MongoDB Connected: ${mongoose.connection.host}`);
            return mongoose;
        }).catch((error) => {
            console.error(`❌ Error connecting to MongoDB: ${error.message}`);
            cached.promise = null; // Reset promise so next request can retry
            if (!process.env.VERCEL) process.exit(1);
            throw error;
        });
    }

    try {
        cached.conn = await cached.promise;
    } catch (e) {
        cached.promise = null;
        throw e;
    }

    return cached.conn;
};

module.exports = connectDB;