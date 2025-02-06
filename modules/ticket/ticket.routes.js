const express = require('express');
const router = express.Router();
const ticketController = require('./ticket.controller');
const validateRequest = require('../../middleware/validation.middleware');
const { ticketSchema, ticketUpdateSchema, ticketMessageSchema } = require('../../validations/schemas');
const { authenticate } = require('../../middleware/auth.middleware');

// Base ticket routes
router
  .route('/')
  .post(
    authenticate,
    validateRequest(ticketSchema),
    ticketController.createTicket
  )
  .get(
    authenticate,
    ticketController.getTickets
  );

// Stats route
router
  .route('/stats')
  .get(
    authenticate,
    ticketController.getStats
  );

// Ticket number routes
router
  .route('/:number')
  .get(
    authenticate,
    ticketController.getTicketByNumber
  )
  .put(
    authenticate,
    validateRequest(ticketUpdateSchema),
    ticketController.updateTicket
  );

// Ticket messages route
router
  .route('/:number/messages')
  .post(
    authenticate,
    validateRequest(ticketMessageSchema),
    ticketController.addMessage
  );

module.exports = router; 