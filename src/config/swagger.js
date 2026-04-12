import swaggerJsdoc from 'swagger-jsdoc';
import env from './env.js';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'CredibleCS Blog API',
      version: '1.0.0',
      description: 'API documentation for the CredibleCS Blog backend',
      contact: {
        name: 'CredibleCS Support',
        url: 'https://crediblecs.com',
      },
    },
    servers: [
      {
        url: `http://localhost:${env.port}${env.api.prefix}`,
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
  },
  apis: ['./src/routes/*.js', './src/controllers/*.js'], // Path to the API docs
};

const swaggerSpec = swaggerJsdoc(options);

export default swaggerSpec;
