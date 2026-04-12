import app from './src/app.js';
import env from './src/config/env.js';
import { testConnection } from './src/config/database.js';

/**
 * CredibleCS Blog API Server
 * Entry point for the application.
 */
async function startServer() {
  try {
    // Test database connection
    await testConnection();

    // Start HTTP server
    app.listen(env.port, () => {
      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 CredibleCS Blog API Server              ║
║                                               ║
║   Environment : ${env.nodeEnv.padEnd(28)}║
║   Port        : ${String(env.port).padEnd(28)}║
║   API Prefix  : ${env.api.prefix.padEnd(28)}║
║   Database    : ${env.db.name.padEnd(28)}║
║                                               ║
║   Health: http://localhost:${env.port}${env.api.prefix}/health  ║
║                                               ║
╚═══════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error.message);
    process.exit(1);
  }
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

startServer();
