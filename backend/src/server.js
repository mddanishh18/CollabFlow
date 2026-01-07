import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';

// Connect to MongoDB
await connectDB();

// Start server
const server = app.listen(env.PORT, () => {
    console.log(`\n🚀 Server running on port ${env.PORT}`);
    console.log(`📍 Environment: ${env.NODE_ENV}`);
    console.log(`🌐 API URL: http://localhost:${env.PORT}`);
    console.log(`❤️  Health check: http://localhost:${env.PORT}/health\n`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    console.error('❌ Unhandled Promise Rejection:', err);
    // Close server & exit process
    server.close(() => process.exit(1));
});

// Handle uncaught exceptions
process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught Exception:', err);
    process.exit(1);
});

export default server;
