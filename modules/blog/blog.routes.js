const express = require('express');
const router = express.Router();
const blogController = require('./blog.controller');
const validateRequest = require('../../middleware/validation.middleware');
const { blogPostSchema } = require('../../validations/schemas');
const { authenticate } = require('../../middleware/auth.middleware');

// Base blog routes
router
  .route('/')
  .post(
    authenticate,
    validateRequest(blogPostSchema),
    blogController.createPost
  )
  .get(
    blogController.getPosts
  );

// Stats route
router
  .route('/stats')
  .get(
    authenticate,
    blogController.getStats
  );

// Slug-based routes
router
  .route('/:slug')
  .get(
    blogController.getPostBySlug
  )
  .put(
    authenticate,
    validateRequest(blogPostSchema),
    blogController.updatePost
  )
  .delete(
    authenticate,
    blogController.deletePost
  );

module.exports = router; 