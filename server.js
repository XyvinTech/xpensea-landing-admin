require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const volleyball = require('volleyball');
const clc = require('cli-color');
const { swaggerUi, swaggerSpec, swaggerOptions } = require('./swagger/config');

// Import routes from modules
const authRoutes = require('./modules/auth/auth.routes');
const subscriptionRoutes = require('./modules/subscription/subscription.routes');
const paymentRoutes = require('./modules/payment/payment.routes');
const webhookRoutes = require('./modules/webhook/webhook.routes');
const blogRoutes = require('./modules/blog/blog.routes');
const ticketRoutes = require('./modules/ticket/ticket.routes');
const analyticsRoutes = require('./modules/analytics/analytics.routes');

const app = express();
const BASE_PATH = '/api';

// Middleware
app.use(helmet());
app.use(cors());
app.use(volleyball);

// Routes that need raw body (must be before body parser)
app.use(`${BASE_PATH}/webhooks`, webhookRoutes);

// Body parser for other routes
app.use(express.json());

// API Documentation
app.use('/api-docs', swaggerUi.serve);
app.get('/api-docs', swaggerUi.setup(swaggerSpec, swaggerOptions));

// Routes
app.use(`${BASE_PATH}/auth`, authRoutes);
app.use(`${BASE_PATH}/subscriptions`, subscriptionRoutes);
app.use(`${BASE_PATH}/payments`, paymentRoutes);
app.use(`${BASE_PATH}/blog`, blogRoutes);
app.use(`${BASE_PATH}/tickets`, ticketRoutes);
app.use(`${BASE_PATH}/analytics`, analyticsRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(clc.red('Error:'), err.stack);
    res.status(err.status || 500).json({
        success: false,
        message: err.message || 'Internal Server Error'
    });
});

// Database connection
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log(clc.green('✓ Connected to MongoDB')))
    .catch(err => console.error(clc.red('✗ MongoDB connection error:'), err));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(clc.cyan('✓ Server is running on port ') + clc.yellow(PORT));
    console.log(clc.red('✓ API Documentation available at ') + clc.yellow(`http://localhost:${PORT}/api-docs`));
}); 