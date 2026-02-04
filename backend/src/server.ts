import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import { initializeSocket } from './sockets/index.js';

const startServer = async () => {
    try {
        await connectDB();

        const httpServer = http.createServer(app);

        const io = await initializeSocket(httpServer);

        // Store io instance in app so controllers can emit events
        app.set('io', io);

        httpServer.listen(env.PORT, () => {
            console.log(`\n🚀 Server running on port ${env.PORT}`);
            console.log(`📍 Environment: ${env.NODE_ENV}`);
            console.log(`🌐 API URL: http://localhost:${env.PORT}`);
            console.log(`❤️  Health check: http://localhost:${env.PORT}/health`);
            console.log(`🔌 WebSocket ready for connections\n`);
        });

        process.on('unhandledRejection', (err: Error) => {
            console.error('❌ Unhandled Promise Rejection:', err);
            httpServer.close(() => process.exit(1));
        });

        process.on('uncaughtException', (err: Error) => {
            console.error('❌ Uncaught Exception:', err);
            process.exit(1);
        });

    } catch (error) {
        console.error('❌ Server startup error:', error);
        process.exit(1);
    }
};

startServer();
