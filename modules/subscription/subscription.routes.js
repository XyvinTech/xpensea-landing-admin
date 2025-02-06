const express = require('express');
const router = express.Router();
const subscriptionController = require('./subscription.controller');
const validateRequest = require('../../middleware/validation.middleware');
const { subscriptionCreateSchema, subscriptionUpdateSchema } = require('../../validations/schemas');
const { authenticate } = require('../../middleware/auth.middleware');

// Base route for subscriptions
router
  .route('/')
  .post(
    authenticate,
    validateRequest(subscriptionCreateSchema),
    subscriptionController.createSubscription
  );

// Plans route
router
  .route('/plans')
  .get(
    authenticate,
    subscriptionController.getSubscriptionPlans
  );

// Cancel route
router
  .route('/cancel')
  .post(
    authenticate,
    subscriptionController.cancelSubscription
  );

// Update route
router
  .route('/update')
  .put(
    authenticate,
    validateRequest(subscriptionUpdateSchema),
    subscriptionController.updateSubscription
  );

// Status route
router
  .route('/status')
  .get(
    authenticate,
    subscriptionController.getSubscriptionStatus
  );

module.exports = router; 