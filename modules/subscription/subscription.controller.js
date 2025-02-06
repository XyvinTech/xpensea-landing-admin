const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tenant = require('../../models/tenant.model');
const { validationResult } = require('express-validator');
const responseHandler = require('../../helpers/responseHandler');
const { subscriptionUpdateSchema } = require('../../validations/schemas');

exports.getSubscriptionPlans = async (req, res) => {
    try {
        const plans = {
            free: {
                name: 'Free',
                price: 0,
                features: ['Basic features', 'Limited usage', '1 user']
            },
            basic: {
                name: 'Basic',
                price: 29,
                features: ['All Free features', 'Priority support', '5 users']
            },
            pro: {
                name: 'Professional',
                price: 99,
                features: ['All Basic features', 'Advanced analytics', '20 users']
            },
            enterprise: {
                name: 'Enterprise',
                price: 299,
                features: ['All Pro features', 'Custom solutions', 'Unlimited users']
            }
        };

        return responseHandler(res, 200, 'Subscription plans retrieved successfully', plans);
    } catch (error) {
        res.status(500).errorMessage = `Error fetching subscription plans: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.createSubscription = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).errorMessage = `Invalid input: ${errors.array()[0].msg}`;
            return responseHandler(res, 400, res.errorMessage);
        }

        const { plan, payment_method_id, billing_cycle } = req.body;
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });

        if (!tenant) {
            res.status(404).errorMessage = 'Tenant not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        // Get or create Stripe customer
        let customer;
        if (tenant.stripe_customer_id) {
            customer = await stripe.customers.retrieve(tenant.stripe_customer_id);
        } else {
            customer = await stripe.customers.create({
                email: tenant.email,
                payment_method: payment_method_id,
                invoice_settings: {
                    default_payment_method: payment_method_id,
                },
            });
            tenant.stripe_customer_id = customer.id;
        }

        // Create subscription
        const subscription = await stripe.subscriptions.create({
            customer: customer.id,
            items: [{ price: process.env[`STRIPE_${plan.toUpperCase()}_${billing_cycle.toUpperCase()}_PRICE_ID`] }],
            payment_behavior: 'default_incomplete',
            expand: ['latest_invoice.payment_intent'],
        });

        // Update tenant record
        tenant.subscription_plan = plan;
        tenant.billing_cycle = billing_cycle;
        tenant.subscription_status = 'active';
        tenant.stripe_subscription_id = subscription.id;
        tenant.next_billing_date = new Date(subscription.current_period_end * 1000);
        await tenant.save();

        return responseHandler(res, 200, 'Subscription created successfully', {
            subscription: {
                id: subscription.id,
                status: subscription.status,
                client_secret: subscription.latest_invoice.payment_intent.client_secret,
            }
        });
    } catch (error) {
        res.status(500).errorMessage = `Error creating subscription: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.cancelSubscription = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });

        if (!tenant || !tenant.stripe_subscription_id) {
            res.status(404).errorMessage = 'No active subscription found';
            return responseHandler(res, 404, res.errorMessage);
        }

        // Cancel the subscription at period end
        const subscription = await stripe.subscriptions.update(tenant.stripe_subscription_id, {
            cancel_at_period_end: true
        });

        tenant.subscription_status = 'canceled';
        await tenant.save();

        return responseHandler(res, 200, 'Subscription will be canceled at the end of the billing period', {
            cancelDate: new Date(subscription.cancel_at * 1000)
        });
    } catch (error) {
        res.status(500).errorMessage = `Error canceling subscription: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.updateSubscription = async (req, res) => {
    try {
        // Validate request body
        const { error, value } = subscriptionUpdateSchema.validate(req.body, { abortEarly: true });
        if (error) {
            res.status(400).errorMessage = error.details[0].message;
            return responseHandler(res, 400, res.errorMessage);
        }

        const { new_plan, new_billing_cycle } = value;

        // Find tenant and check subscription
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });
        if (!tenant) {
            res.status(404).errorMessage = 'Tenant not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        if (!tenant.stripe_customer_id || !tenant.stripe_subscription_id) {
            res.status(404).errorMessage = 'No active subscription found';
            return responseHandler(res, 404, res.errorMessage);
        }

        // Get price ID for new plan and billing cycle
        const priceId = process.env[`STRIPE_${new_plan.toUpperCase()}_${new_billing_cycle.toUpperCase()}_PRICE_ID`];
        if (!priceId) {
            res.status(400).errorMessage = 'Invalid plan or billing cycle combination';
            return responseHandler(res, 400, res.errorMessage);
        }

        try {
            // Retrieve current subscription
            const subscription = await stripe.subscriptions.retrieve(tenant.stripe_subscription_id);
            
            // Update the subscription
            const updatedSubscription = await stripe.subscriptions.update(tenant.stripe_subscription_id, {
                items: [{
                    id: subscription.items.data[0].id,
                    price: priceId
                }],
                proration_behavior: 'always_invoice',
                payment_behavior: 'error_if_incomplete'
            });

            // Update tenant record
            tenant.subscription_plan = new_plan;
            tenant.billing_cycle = new_billing_cycle;
            tenant.subscription_status = updatedSubscription.status;
            tenant.next_billing_date = new Date(updatedSubscription.current_period_end * 1000);
            await tenant.save();

            return responseHandler(res, 200, 'Subscription updated successfully', {
                subscription: {
                    plan: new_plan,
                    billing_cycle: new_billing_cycle,
                    status: updatedSubscription.status,
                    current_period_end: new Date(updatedSubscription.current_period_end * 1000)
                }
            });
        } catch (stripeError) {
            // Handle specific Stripe errors
            if (stripeError.type === 'StripeCardError') {
                res.status(400).errorMessage = 'Payment failed. Please check your payment method.';
                return responseHandler(res, 400, res.errorMessage);
            }
            if (stripeError.type === 'StripeInvalidRequestError') {
                res.status(400).errorMessage = 'Invalid subscription update request';
                return responseHandler(res, 400, res.errorMessage);
            }
            throw stripeError; // Re-throw other errors to be caught by outer catch
        }
    } catch (error) {
        res.status(500).errorMessage = `Error updating subscription: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

exports.getSubscriptionStatus = async (req, res) => {
    try {
        const tenant = await Tenant.findOne({ tenant_id: req.tenant.tenant_id });

        if (!tenant) {
            res.status(404).errorMessage = 'Tenant not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        let subscriptionDetails = {
            plan: tenant.subscription_plan,
            status: tenant.subscription_status,
            billing_cycle: tenant.billing_cycle,
            next_billing_date: tenant.next_billing_date
        };

        if (tenant.stripe_subscription_id) {
            const subscription = await stripe.subscriptions.retrieve(tenant.stripe_subscription_id);
            subscriptionDetails = {
                ...subscriptionDetails,
                current_period_end: new Date(subscription.current_period_end * 1000),
                cancel_at_period_end: subscription.cancel_at_period_end
            };
        }

        return responseHandler(res, 200, 'Subscription status retrieved successfully', {
            subscription: subscriptionDetails
        });
    } catch (error) {
        res.status(500).errorMessage = `Error fetching subscription status: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
}; 