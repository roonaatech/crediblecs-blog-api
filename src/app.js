import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import path from 'path';
import { fileURLToPath } from 'url';
import env from './config/env.js';
import corsConfig from './config/cors.js';
import { apiLimiter } from './middleware/rateLimiter.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import routes from './routes/index.js';
import swaggerUi from 'swagger-ui-express';
import swaggerSpec from './config/swagger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// ============ SECURITY MIDDLEWARE ============

// HTTP security headers
app.use(helmet({
  contentSecurityPolicy: false, // Required for Swagger UI to work without extra config
  hsts: false, // Required for non-SSL/HTTP environments to prevent browser forcing HTTPS
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS
app.use(cors(corsConfig));

// Rate limiting
app.use(env.api.prefix, apiLimiter);

// ============ BODY PARSING ============

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// ============ STATIC FILES ============

// Serve uploaded files
const uploadsPath = path.resolve(process.cwd(), env.upload.dir);
console.log(`📂 Serving uploads from: ${uploadsPath}`);
app.use('/uploads', express.static(uploadsPath));

// ============ API ROUTES ============

// Serve API Documentation
app.use(`${env.api.prefix}/docs`, swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use(env.api.prefix, routes);

// ============ ERROR HANDLING ============

// 404 handler
app.use(notFoundHandler);

// Global error handler (must be last)
app.use(errorHandler);

export default app;
