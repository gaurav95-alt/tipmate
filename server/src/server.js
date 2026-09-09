const http = require('http');
const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');
const setupSocket = require('./socket');

const startServer = async () => {
  try {
    await connectDB();

    const httpServer = http.createServer(app);
    setupSocket(httpServer, env.clientOrigin);

    const server = httpServer.listen(env.port, () => {
      console.log(`JustSPAI API listening on port ${env.port}`);
      console.log('Socket.io real-time chat is enabled');
    });

    const shutdown = (signal) => {
      console.log(`${signal} received. Shutting down gracefully...`);
      server.close(() => process.exit(0));
    };

    process.on('SIGTERM', () => shutdown('SIGTERM'));
    process.on('SIGINT', () => shutdown('SIGINT'));
  } catch (error) {
    console.error(`Server startup failed: ${error.message}`);
    process.exit(1);
  }
};

startServer();
