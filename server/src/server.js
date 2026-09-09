const app = require('./app');
const env = require('./config/env');
const connectDB = require('./config/db');

const startServer = async () => {
  try {
    await connectDB();

    const server = app.listen(env.port, () => {
      console.log(`JustSPAI API listening on port ${env.port}`);
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
