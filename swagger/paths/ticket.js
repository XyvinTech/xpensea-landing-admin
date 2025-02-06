/**
 * @swagger
 * components:
 *   schemas:
 *     TicketMessage:
 *       type: object
 *       properties:
 *         sender:
 *           type: string
 *           format: objectId
 *           description: Reference to Tenant model
 *         content:
 *           type: string
 *           example: "Here's the solution to your issue..."
 *         attachments:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               filename:
 *                 type: string
 *               url:
 *                 type: string
 *               type:
 *                 type: string
 *         created_at:
 *           type: string
 *           format: date-time
 * 
 *     Ticket:
 *       type: object
 *       properties:
 *         ticket_number:
 *           type: string
 *           example: "TKT-2402-1234"
 *         subject:
 *           type: string
 *           example: "Need help with subscription"
 *         description:
 *           type: string
 *           example: "I'm having trouble upgrading my subscription..."
 *         tenant:
 *           type: string
 *           format: objectId
 *           description: Reference to Tenant model
 *         status:
 *           type: string
 *           enum: [open, in_progress, waiting, resolved, closed]
 *           example: "open"
 *         priority:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *           example: "medium"
 *         category:
 *           type: string
 *           enum: [technical, billing, feature_request, bug, other]
 *           example: "billing"
 *         assigned_to:
 *           type: string
 *           format: objectId
 *           description: Reference to Tenant model
 *         messages:
 *           type: array
 *           items:
 *             $ref: '#/components/schemas/TicketMessage'
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 *         resolved_at:
 *           type: string
 *           format: date-time
 *         closed_at:
 *           type: string
 *           format: date-time
 * 
 * /tickets:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Create a new support ticket
 *     description: Create a new support ticket with the provided details
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - subject
 *               - description
 *               - category
 *             properties:
 *               subject:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *                 enum: [technical, billing, feature_request, bug, other]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *     responses:
 *       201:
 *         description: Ticket created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get all tickets
 *     description: Retrieve tickets with pagination and filters
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [open, in_progress, waiting, resolved, closed]
 *         description: Filter by ticket status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [technical, billing, feature_request, bug, other]
 *         description: Filter by category
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *           enum: [low, medium, high, urgent]
 *         description: Filter by priority
 *     responses:
 *       200:
 *         description: List of tickets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tickets:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Ticket'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 total:
 *                   type: integer
 * 
 * /tickets/stats:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get ticket statistics
 *     description: Get statistics about tickets, categories, and priorities
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Ticket statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalTickets:
 *                       type: integer
 *                     openTickets:
 *                       type: integer
 *                     inProgressTickets:
 *                       type: integer
 *                     resolvedTickets:
 *                       type: integer
 *                     avgResolutionTime:
 *                       type: number
 *                       description: Average resolution time in hours
 *                 categoryBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 priorityBreakdown:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 * 
 * /tickets/{number}:
 *   get:
 *     tags:
 *       - Tickets
 *     summary: Get a ticket by number
 *     description: Retrieve a single ticket by its number
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket number
 *     responses:
 *       200:
 *         description: Ticket details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 *   put:
 *     tags:
 *       - Tickets
 *     summary: Update a ticket
 *     description: Update an existing ticket's status, priority, or category
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [open, in_progress, waiting, resolved, closed]
 *               priority:
 *                 type: string
 *                 enum: [low, medium, high, urgent]
 *               category:
 *                 type: string
 *                 enum: [technical, billing, feature_request, bug, other]
 *     responses:
 *       200:
 *         description: Ticket updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 * 
 * /tickets/{number}/messages:
 *   post:
 *     tags:
 *       - Tickets
 *     summary: Add a message to a ticket
 *     description: Add a new message to an existing ticket
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: number
 *         required: true
 *         schema:
 *           type: string
 *         description: Ticket number
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *             properties:
 *               content:
 *                 type: string
 *               attachments:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     filename:
 *                       type: string
 *                     url:
 *                       type: string
 *                     type:
 *                       type: string
 *     responses:
 *       200:
 *         description: Message added successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 ticket:
 *                   $ref: '#/components/schemas/Ticket'
 */ 