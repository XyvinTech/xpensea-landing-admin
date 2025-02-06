const express = require('express');
const router = express.Router();
const analyticsController = require('./analytics.controller');
const validateRequest = require('../../middleware/validation.middleware');
const { analyticsEventSchema, analyticsMetricsSchema } = require('../../validations/schemas');
const { authenticate } = require('../../middleware/auth.middleware');

// Events routes
router
  .route('/events')
  .post(
    authenticate,
    validateRequest(analyticsEventSchema),
    analyticsController.trackEvent
  )
  .get(
    authenticate,
    analyticsController.getEvents
  );

// Metrics route
router
  .route('/metrics')
  .get(
    authenticate,
    validateRequest(analyticsMetricsSchema),
    analyticsController.getMetrics
  );

module.exports = router; 