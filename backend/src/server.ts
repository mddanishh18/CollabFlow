import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import env from './config/env.js';
import { initializeSocket } from './sockets/index.js';
import { logger } from './utils/logger.js';

const startServer = async () => {
    try {
        await connectDB();

        const httpServer = http.createServer(app);

        const io = await initializeSocket(httpServer);

        // Store io instance in app so controllers can emit events
        app.set('io', io);

        httpServer.listen(env.PORT, () => {
            logger.log(`\n🚀 Server running on port ${env.PORT}`);
            logger.log(`📍 Environment: ${env.NODE_ENV}`);
            logger.log(`🌐 API URL: http://localhost:${env.PORT}`);
            logger.log(`❤️  Health check: http://localhost:${env.PORT}/health`);
            logger.log(`🔌 WebSocket ready for connections\n`);
        });

        process.on('unhandledRejection', (err: Error) => {
            logger.error('❌ Unhandled Promise Rejection:', err);
            httpServer.close(() => process.exit(1));
        });

        process.on('uncaughtException', (err: Error) => {
            logger.error('❌ Uncaught Exception:', err);
            process.exit(1);
        });

    } catch (error) {
        logger.error('❌ Server startup error:', error);
        process.exit(1);
    }
};

startServer();

