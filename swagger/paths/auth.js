/**
 * @swagger
 * components:
 *   schemas:
 *     Tenant:
 *       type: object
 *       properties:
 *         tenant_id:
 *           type: string
 *           example: TEN1234567890
 *         company_name:
 *           type: string
 *           example: Acme Corp
 *         email:
 *           type: string
 *           format: email
 *           example: admin@acmecorp.com
 *         subscription_plan:
 *           type: string
 *           enum: [free, basic, pro, enterprise]
 *           example: basic
 * 
 * /auth/register:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Register a new tenant
 *     description: Create a new tenant account with company and admin details
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - company_name
 *               - admin_name
 *               - email
 *               - password
 *               - gdpr_consent
 *             properties:
 *               company_name:
 *                 type: string
 *                 example: Acme Corp
 *               admin_name:
 *                 type: string
 *                 example: John Doe
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@acmecorp.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securepassword123
 *               phone:
 *                 type: string
 *                 example: "+1234567890"
 *               industry:
 *                 type: string
 *                 example: Technology
 *               company_size:
 *                 type: string
 *                 example: "10-50"
 *               gdpr_consent:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Successfully registered
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 tenant:
 *                   $ref: '#/components/schemas/Tenant'
 *       400:
 *         description: Invalid input
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: Email already registered
 * 
 * /auth/login:
 *   post:
 *     tags:
 *       - Authentication
 *     summary: Login to tenant account
 *     description: Authenticate tenant and get access token
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: admin@acmecorp.com
 *               password:
 *                 type: string
 *                 format: password
 *                 example: securepassword123
 *     responses:
 *       200:
 *         description: Successfully logged in
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 token:
 *                   type: string
 *                 tenant:
 *                   $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Invalid credentials
 * 
 * /auth/profile:
 *   get:
 *     tags:
 *       - Authentication
 *     summary: Get tenant profile
 *     description: Get detailed profile information for the authenticated tenant
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 tenant:
 *                   type: object
 *                   properties:
 *                     tenant_id:
 *                       type: string
 *                     company_name:
 *                       type: string
 *                     admin_name:
 *                       type: string
 *                     email:
 *                       type: string
 *                     subscription_plan:
 *                       type: string
 *                     billing_cycle:
 *                       type: string
 *                     subscription_status:
 *                       type: string
 *       401:
 *         description: Unauthorized
 *   put:
 *     tags:
 *       - Authentication
 *     summary: Update tenant profile
 *     description: Update profile information for the authenticated tenant
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               company_name:
 *                 type: string
 *               admin_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               industry:
 *                 type: string
 *               company_size:
 *                 type: string
 *               billing_address:
 *                 type: string
 *               tax_id:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Profile updated successfully
 *                 tenant:
 *                   $ref: '#/components/schemas/Tenant'
 *       401:
 *         description: Unauthorized
 */ 