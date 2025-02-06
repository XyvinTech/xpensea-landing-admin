/**
 * @swagger
 * components:
 *   schemas:
 *     PaymentMethod:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: pm_1234567890
 *         brand:
 *           type: string
 *           example: visa
 *         last4:
 *           type: string
 *           example: "4242"
 *         exp_month:
 *           type: number
 *           example: 12
 *         exp_year:
 *           type: number
 *           example: 2025
 *         is_default:
 *           type: boolean
 *           example: true
 * 
 *     Invoice:
 *       type: object
 *       properties:
 *         id:
 *           type: string
 *           example: in_1234567890
 *         amount_paid:
 *           type: number
 *           example: 29.00
 *         status:
 *           type: string
 *           example: paid
 *         created:
 *           type: string
 *           format: date-time
 *         invoice_pdf:
 *           type: string
 *           example: https://stripe.com/invoice.pdf
 *         period_start:
 *           type: string
 *           format: date-time
 *         period_end:
 *           type: string
 *           format: date-time
 * 
 * /payments/setup-intent:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Create setup intent
 *     description: Create a setup intent for adding a new payment method
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Setup intent created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 client_secret:
 *                   type: string
 *                   example: seti_1234567890_secret_1234567890
 *       401:
 *         description: Unauthorized
 * 
 * /payments/update-payment-method:
 *   post:
 *     tags:
 *       - Payments
 *     summary: Update payment method
 *     description: Update or add a new payment method
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - payment_method_id
 *             properties:
 *               payment_method_id:
 *                 type: string
 *                 example: pm_1234567890
 *     responses:
 *       200:
 *         description: Payment method updated successfully
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
 *                   example: Payment method updated successfully
 *       404:
 *         description: Tenant not found or no Stripe customer
 * 
 * /payments/invoices:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get invoices
 *     description: Get list of invoices for the tenant
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Invoices retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 invoices:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/Invoice'
 *       404:
 *         description: Tenant not found or no Stripe customer
 * 
 * /payments/payment-methods:
 *   get:
 *     tags:
 *       - Payments
 *     summary: Get payment methods
 *     description: Get list of saved payment methods
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Payment methods retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 payment_methods:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/PaymentMethod'
 *       404:
 *         description: Tenant not found or no Stripe customer
 * 
 * /payments/payment-methods/{payment_method_id}:
 *   delete:
 *     tags:
 *       - Payments
 *     summary: Delete payment method
 *     description: Delete a saved payment method
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: payment_method_id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payment method to delete
 *     responses:
 *       200:
 *         description: Payment method deleted successfully
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
 *                   example: Payment method deleted successfully
 *       404:
 *         description: Tenant not found or no Stripe customer
 */ 