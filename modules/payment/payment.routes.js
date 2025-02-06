const express = require('express');
const router = express.Router();
const paymentController = require('./payment.controller');
const validateRequest = require('../../middleware/validation.middleware');
const { paymentMethodSchema } = require('../../validations/schemas');
const { authenticate } = require('../../middleware/auth.middleware');

// Setup intent route
router
  .route('/setup-intent')
  .post(
    authenticate,
    paymentController.createSetupIntent
  );

// Payment method routes
router
  .route('/method')
  .post(
    authenticate,
    validateRequest(paymentMethodSchema),
    paymentController.updatePaymentMethod
  );

router
  .route('/method/:payment_method_id')
  .delete(
    authenticate,
    paymentController.deletePaymentMethod
  );

// Payment methods list route
router
  .route('/methods')
  .get(
    authenticate,
    paymentController.getPaymentMethods
  );

// Invoices route
router
  .route('/invoices')
  .get(
    authenticate,
    paymentController.getInvoices
  );

module.exports = router; 