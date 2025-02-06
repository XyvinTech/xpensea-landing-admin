/**
 * @swagger
 * components:
 *   schemas:
 *     SubscriptionPlan:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           example: Basic
 *         price:
 *           type: number
 *           example: 29
 *         features:
 *           type: array
 *           items:
 *             type: string
 *           example: ["All Free features", "Priority support", "5 users"]
 * 
 * /subscriptions:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Create a new subscription
 *     description: Create a new subscription with selected plan and billing cycle
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - plan
 *               - billing_cycle
 *               - payment_method_id
 *             properties:
 *               plan:
 *                 type: string
 *                 enum: [basic, pro, enterprise]
 *                 example: basic
 *               billing_cycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 example: monthly
 *               payment_method_id:
 *                 type: string
 *                 example: pm_1234567890
 *     responses:
 *       201:
 *         description: Subscription created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         id:
 *                           type: string
 *                           example: sub_1234567890
 *                         status:
 *                           type: string
 *                           example: active
 *                         client_secret:
 *                           type: string
 *       400:
 *         description: Invalid input data
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 * 
 * /subscriptions/plans:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Get available subscription plans
 *     description: Retrieve list of all available subscription plans with features and pricing
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: List of subscription plans
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     free:
 *                       $ref: '#/components/schemas/SubscriptionPlan'
 *                     basic:
 *                       $ref: '#/components/schemas/SubscriptionPlan'
 *                     pro:
 *                       $ref: '#/components/schemas/SubscriptionPlan'
 *                     enterprise:
 *                       $ref: '#/components/schemas/SubscriptionPlan'
 *       401:
 *         description: Unauthorized
 *       500:
 *         description: Server error
 * 
 * /subscriptions/cancel:
 *   post:
 *     tags:
 *       - Subscriptions
 *     summary: Cancel subscription
 *     description: Cancel the current subscription (will be active until the end of billing period)
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription cancelled successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     cancelDate:
 *                       type: string
 *                       format: date-time
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active subscription found
 *       500:
 *         description: Server error
 * 
 * /subscriptions/update:
 *   put:
 *     tags:
 *       - Subscriptions
 *     summary: Update subscription
 *     description: Update subscription plan or billing cycle
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - new_plan
 *               - new_billing_cycle
 *             properties:
 *               new_plan:
 *                 type: string
 *                 enum: [basic, pro, enterprise]
 *                 example: pro
 *               new_billing_cycle:
 *                 type: string
 *                 enum: [monthly, yearly]
 *                 example: yearly
 *     responses:
 *       200:
 *         description: Subscription updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         plan:
 *                           type: string
 *                         billing_cycle:
 *                           type: string
 *                         status:
 *                           type: string
 *                         current_period_end:
 *                           type: string
 *                           format: date-time
 *       400:
 *         description: Invalid request or payment failed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No active subscription found
 *       500:
 *         description: Server error
 * 
 * /subscriptions/status:
 *   get:
 *     tags:
 *       - Subscriptions
 *     summary: Get subscription status
 *     description: Get current subscription status and details
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Subscription status retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 data:
 *                   type: object
 *                   properties:
 *                     subscription:
 *                       type: object
 *                       properties:
 *                         plan:
 *                           type: string
 *                           example: basic
 *                         status:
 *                           type: string
 *                           example: active
 *                         billing_cycle:
 *                           type: string
 *                           example: monthly
 *                         next_billing_date:
 *                           type: string
 *                           format: date-time
 *                         current_period_end:
 *                           type: string
 *                           format: date-time
 *                         cancel_at_period_end:
 *                           type: boolean
 *                           example: false
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: No subscription found
 *       500:
 *         description: Server error
 */ 