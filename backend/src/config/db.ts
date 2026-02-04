import mongoose from 'mongoose';
import env from './env.js';

/**
 * Connect to MongoDB database
 */
const connectDB = async (): Promise<void> => {
    try {
        const conn = await mongoose.connect(env.MONGODB_URI, {
            // Mongoose 7+ no longer needs these options:
            // useNewUrlParser, useUnifiedTopology, etc.
        });

        console.log(`✅ MongoDB Connected: ${conn.connection.host}`);

        // Handle connection events
        mongoose.connection.on('error', (err: Error) => {
            console.error('❌ MongoDB connection error:', err);
        });

        mongoose.connection.on('disconnected', () => {
            console.log('⚠️  MongoDB disconnected');
        });

        // Graceful shutdown
        process.on('SIGINT', async () => {
            await mongoose.connection.close();
            console.log('MongoDB connection closed through app termination');
            process.exit(0);
        });

    } catch (error) {
        const err = error as Error;
        console.error('❌ Error connecting to MongoDB:', err.message);
        process.exit(1);
    }
};

export default connectDB;
