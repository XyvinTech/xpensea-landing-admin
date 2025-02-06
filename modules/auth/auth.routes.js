const express = require('express');
const router = express.Router();
const authController = require('./auth.controller');
const validateRequest = require('../../middleware/validation.middleware');
const { registerSchema, loginSchema, updateProfileSchema } = require('../../validations/schemas');
const { authenticate } = require('../../middleware/auth.middleware');

// Register and Login routes
router
  .route('/register')
  .post(
    validateRequest(registerSchema),
    authController.register
  );

router
  .route('/login')
  .post(
    validateRequest(loginSchema),
    authController.login
  );

// Profile routes
router
  .route('/profile')
  .get(
    authenticate,
    authController.getProfile
  )
  .put(
    authenticate,
    validateRequest(updateProfileSchema),
    authController.updateProfile
  );

module.exports = router; 