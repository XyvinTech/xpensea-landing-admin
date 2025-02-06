const swaggerJSDoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");
const { PORT } = process.env;

const swaggerDefinition = {
  openapi: "3.0.0",
  info: {
    title: "Xpensea SaaS API Documentation",
    version: "1.0.0",
    description: "API documentation for Xpensea SaaS application",
    contact: {
      name: "Support",
      email: "support@xpensea.com"
    }
  },
  servers: [
    {
      url: `http://localhost:${PORT}/api`,
      description: "Development server"
    }
  ],
  components: {
    securitySchemes: {
      BearerAuth: {
        type: "http",
        scheme: "bearer",
        bearerFormat: "JWT"
      }
    }
  },
  security: [
    {
      BearerAuth: []
    }
  ]
};

const options = {
  swaggerDefinition,
  apis: ["./swagger/paths/*.js"]
};

const swaggerOptions = {
  swaggerOptions: {
    docExpansion: "none",
    filter: true,
    tagsSorter: "alpha",
    operationsSorter: "alpha"
  }
};

const swaggerSpec = swaggerJSDoc(options);

module.exports = { swaggerUi, swaggerSpec, swaggerOptions }; 