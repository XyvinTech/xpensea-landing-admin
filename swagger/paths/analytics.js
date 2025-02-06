/**
 * @swagger
 * components:
 *   schemas:
 *     AnalyticsEvent:
 *       type: object
 *       properties:
 *         tenant:
 *           type: string
 *           format: objectId
 *           description: Reference to Tenant model
 *         event_type:
 *           type: string
 *           enum: [page_view, feature_usage, error, subscription_change, payment]
 *         page_url:
 *           type: string
 *           example: "/dashboard"
 *         feature_name:
 *           type: string
 *           example: "export_report"
 *         error_message:
 *           type: string
 *           example: "Failed to process payment"
 *         subscription_details:
 *           type: object
 *           properties:
 *             old_plan:
 *               type: string
 *             new_plan:
 *               type: string
 *             reason:
 *               type: string
 *         payment_details:
 *           type: object
 *           properties:
 *             amount:
 *               type: number
 *             status:
 *               type: string
 *             method:
 *               type: string
 *         metadata:
 *           type: object
 *         user_agent:
 *           type: string
 *         ip_address:
 *           type: string
 *         timestamp:
 *           type: string
 *           format: date-time
 * 
 *     TenantMetrics:
 *       type: object
 *       properties:
 *         tenant:
 *           type: string
 *           format: objectId
 *           description: Reference to Tenant model
 *         date:
 *           type: string
 *           format: date
 *         metrics:
 *           type: object
 *           properties:
 *             page_views:
 *               type: integer
 *             feature_usage:
 *               type: integer
 *             errors:
 *               type: integer
 *             active_users:
 *               type: integer
 *             revenue:
 *               type: number
 *             subscription_changes:
 *               type: integer
 *         feature_breakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               usage_count:
 *                 type: integer
 *         error_breakdown:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *               count:
 *                 type: integer
 * 
 * /analytics/events:
 *   post:
 *     tags:
 *       - Analytics
 *     summary: Track an analytics event
 *     description: Track a new analytics event and update daily metrics
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - event_type
 *             properties:
 *               event_type:
 *                 type: string
 *                 enum: [page_view, feature_usage, error, subscription_change, payment]
 *               page_url:
 *                 type: string
 *               feature_name:
 *                 type: string
 *               error_message:
 *                 type: string
 *               subscription_details:
 *                 type: object
 *                 properties:
 *                   old_plan:
 *                     type: string
 *                   new_plan:
 *                     type: string
 *                   reason:
 *                     type: string
 *               payment_details:
 *                 type: object
 *                 properties:
 *                   amount:
 *                     type: number
 *                   status:
 *                     type: string
 *                   method:
 *                     type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Event tracked successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 event:
 *                   $ref: '#/components/schemas/AnalyticsEvent'
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get analytics events
 *     description: Retrieve analytics events with pagination and filtering
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
 *           default: 50
 *         description: Number of items per page
 *       - in: query
 *         name: event_type
 *         schema:
 *           type: string
 *           enum: [page_view, feature_usage, error, subscription_change, payment]
 *         description: Filter by event type
 *     responses:
 *       200:
 *         description: List of analytics events
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 events:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/AnalyticsEvent'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 total:
 *                   type: integer
 * 
 * /analytics/metrics:
 *   get:
 *     tags:
 *       - Analytics
 *     summary: Get analytics metrics
 *     description: Get aggregated metrics for a date range
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: query
 *         name: start_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for metrics (YYYY-MM-DD)
 *       - in: query
 *         name: end_date
 *         required: true
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for metrics (YYYY-MM-DD)
 *     responses:
 *       200:
 *         description: Aggregated metrics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 metrics:
 *                   type: object
 *                   properties:
 *                     total_page_views:
 *                       type: integer
 *                     total_feature_usage:
 *                       type: integer
 *                     total_errors:
 *                       type: integer
 *                     total_active_users:
 *                       type: integer
 *                     total_revenue:
 *                       type: number
 *                     total_subscription_changes:
 *                       type: integer
 *                     feature_breakdown:
 *                       type: object
 *                     error_breakdown:
 *                       type: object
 *                     daily_metrics:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           date:
 *                             type: string
 *                             format: date
 *                           metrics:
 *                             $ref: '#/components/schemas/TenantMetrics'
 */ 