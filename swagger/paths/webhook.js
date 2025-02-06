/**
 * @swagger
 * /webhooks/stripe:
 *   post:
 *     tags:
 *       - Webhooks
 *     summary: Handle Stripe webhook events
 *     description: Process various Stripe webhook events (payments, subscriptions, etc.)
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 example: invoice.payment_succeeded
 *               data:
 *                 type: object
 *                 properties:
 *                   object:
 *                     type: object
 *                     description: Event specific data
 *     parameters:
 *       - in: header
 *         name: stripe-signature
 *         required: true
 *         schema:
 *           type: string
 *         description: Stripe webhook signature for verification
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 *       500:
 *         description: Error processing webhook
 */ 