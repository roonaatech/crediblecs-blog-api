import app from './src/app.js';
import env from './src/config/env.js';
import { testConnection } from './src/config/database.js';
import { startPostScheduler } from './src/scheduler/postScheduler.js';

import https from 'https';
import fs from 'fs';

/**
 * CredibleCS Blog API Server
 * Entry point for the application.
 */
async function startServer() {
  try {
    // Test database connection
    await testConnection();
    startPostScheduler();

    const certPath = '/apps/crediblecs-api/src/certs';
    const isDevelopment = env.nodeEnv === 'development';
    const isTesting = env.nodeEnv === 'testing';
    const isProduction = env.nodeEnv === 'production';

    // Check if certificates exist (only for non-local dev)
    let httpsOptions = null;
    if (!isDevelopment && fs.existsSync(`${certPath}/server.key`) && fs.existsSync(`${certPath}/server.crt`)) {
      httpsOptions = {
        key: fs.readFileSync(`${certPath}/server.key`),
        cert: fs.readFileSync(`${certPath}/server.crt`),
      };
      // Add CA if it exists
      if (fs.existsSync(`${certPath}/server-ca.crt`)) {
        httpsOptions.ca = fs.readFileSync(`${certPath}/server-ca.crt`);
      }
      console.log('🛡️  SSL Certificates loaded. Starting in HTTPS mode.');
    }

    const server = httpsOptions
      ? https.createServer(httpsOptions, app)
      : app;

    server.listen(env.port, () => {
      const protocol = httpsOptions ? 'https' : 'http';
      const host = isProduction
        ? 'ccs-api.crediblecs.com'
        : isTesting
          ? 'ccs-api-dev.crediblecs.com'
          : 'localhost';

      console.log(`
╔═══════════════════════════════════════════════╗
║                                               ║
║   🚀 CredibleCS Blog API Server              ║
║                                               ║
║   Environment : ${env.nodeEnv.padEnd(28)}║
║   Protocol    : ${protocol.padEnd(28)}║
║   Port        : ${String(env.port).padEnd(28)}║
║   API Prefix  : ${env.api.prefix.padEnd(28)}║
║                                               ║
║   Docs: ${protocol}://${host}:${env.port}${env.api.prefix}/docs  ║
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
