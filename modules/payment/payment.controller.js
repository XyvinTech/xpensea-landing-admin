const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tenant = require('../../models/tenant.model');
const { validationResult } = require('express-validator');
const responseHandler = require('../../helpers/responseHandler');

exports.createSetupIntent = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });

        if (!tenant) {
            res.status(404).errorMessage = 'Tenant not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        const setupIntent = await stripe.setupIntents.create({
            customer: tenant.stripe_customer_id,
            payment_method_types: ['card'],
        });

        return responseHandler(res, 200, 'Setup intent created successfully', {
            client_secret: setupIntent.client_secret
        });
    } catch (error) {
        res.status(500).errorMessage = `Error creating setup intent: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.updatePaymentMethod = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).errorMessage = `Invalid input: ${errors.array()[0].msg}`;
            return responseHandler(res, 400, res.errorMessage);
        }

        const { payment_method_id } = req.body;
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });

        if (!tenant || !tenant.stripe_customer_id) {
            res.status(404).errorMessage = 'Tenant not found or no Stripe customer';
            return responseHandler(res, 404, res.errorMessage);
        }

        // Attach payment method to customer
        await stripe.paymentMethods.attach(payment_method_id, {
            customer: tenant.stripe_customer_id,
        });

        // Set as default payment method
        await stripe.customers.update(tenant.stripe_customer_id, {
            invoice_settings: {
                default_payment_method: payment_method_id,
            },
        });

        tenant.payment_method = 'credit_card';
        await tenant.save();

        return responseHandler(res, 200, 'Payment method updated successfully');
    } catch (error) {
        res.status(500).errorMessage = `Error updating payment method: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.getInvoices = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });

        if (!tenant || !tenant.stripe_customer_id) {
            res.status(404).errorMessage = 'Tenant not found or no Stripe customer';
            return responseHandler(res, 404, res.errorMessage);
        }

        const invoices = await stripe.invoices.list({
            customer: tenant.stripe_customer_id,
            limit: 10,
        });

        const formattedInvoices = invoices.data.map(invoice => ({
            id: invoice.id,
            amount_paid: invoice.amount_paid / 100,
            status: invoice.status,
            created: new Date(invoice.created * 1000),
            invoice_pdf: invoice.invoice_pdf,
            period_start: new Date(invoice.period_start * 1000),
            period_end: new Date(invoice.period_end * 1000)
        }));

        return responseHandler(res, 200, 'Invoices retrieved successfully', formattedInvoices);
    } catch (error) {
        res.status(500).errorMessage = `Error fetching invoices: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.getPaymentMethods = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });

        if (!tenant || !tenant.stripe_customer_id) {
            res.status(404).errorMessage = 'Tenant not found or no Stripe customer';
            return responseHandler(res, 404, res.errorMessage);
        }

        const paymentMethods = await stripe.paymentMethods.list({
            customer: tenant.stripe_customer_id,
            type: 'card',
        });

        const formattedPaymentMethods = paymentMethods.data.map(pm => ({
            id: pm.id,
            brand: pm.card.brand,
            last4: pm.card.last4,
            exp_month: pm.card.exp_month,
            exp_year: pm.card.exp_year,
            is_default: pm.id === tenant.default_payment_method
        }));

        return responseHandler(res, 200, 'Payment methods retrieved successfully', formattedPaymentMethods);
    } catch (error) {
        res.status(500).errorMessage = `Error fetching payment methods: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.deletePaymentMethod = async (req, res) => {
    try {
        const { payment_method_id } = req.params;
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });

        if (!tenant || !tenant.stripe_customer_id) {
            res.status(404).errorMessage = 'Tenant not found or no Stripe customer';
            return responseHandler(res, 404, res.errorMessage);
        }

        await stripe.paymentMethods.detach(payment_method_id);
        return responseHandler(res, 200, 'Payment method deleted successfully');
    } catch (error) {
        res.status(500).errorMessage = `Error deleting payment method: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
}; 