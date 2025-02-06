const express = require('express');
const webhookController = require('./webhook.controller');

const router = express.Router();

// Stripe webhook endpoint
router.post('/stripe',
    express.raw({type: 'application/json'}),
    webhookController.handleWebhook
);

module.exports = router; 