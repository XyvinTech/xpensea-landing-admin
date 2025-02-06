const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const Tenant = require('../../models/tenant.model');

exports.handleWebhook = async (req, res) => {
    const sig = req.headers['stripe-signature'];
    
    if (!sig) {
        return res.status(400).send('Webhook Error: No signature found in headers');
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            req.body,
            sig,
            process.env.STRIPE_WEBHOOK_SECRET
        );
    } catch (err) {
        console.error('Webhook signature verification failed:', err.message);
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    try {
        switch (event.type) {
            case 'invoice.payment_succeeded':
                await handleInvoicePaymentSucceeded(event.data.object);
                break;

            case 'invoice.payment_failed':
                await handleInvoicePaymentFailed(event.data.object);
                break;

            case 'customer.subscription.deleted':
                await handleSubscriptionDeleted(event.data.object);
                break;

            case 'customer.subscription.updated':
                await handleSubscriptionUpdated(event.data.object);
                break;

            default:
                console.log(`Unhandled event type ${event.type}`);
        }

        res.json({ received: true });
    } catch (error) {
        console.error('Error processing webhook:', error);
        res.status(500).json({ error: 'Webhook processing failed' });
    }
};

async function handleInvoicePaymentSucceeded(invoice) {
    try {
        const tenant = await Tenant.findOne({
            stripe_customer_id: invoice.customer
        });

        if (!tenant) {
            console.error('Tenant not found for invoice:', invoice.id);
            return;
        }

        // Add to invoice history
        tenant.invoice_history.push({
            invoice_id: invoice.id,
            amount: invoice.amount_paid / 100,
            status: 'paid',
            date: new Date(invoice.created * 1000)
        });

        // Update subscription status and next billing date if this was a subscription payment
        if (invoice.subscription) {
            tenant.subscription_status = 'active';
            tenant.next_billing_date = new Date(invoice.lines.data[0].period.end * 1000);
        }

        await tenant.save();
    } catch (error) {
        console.error('Error handling invoice payment succeeded:', error);
        throw error;
    }
}

async function handleInvoicePaymentFailed(invoice) {
    try {
        const tenant = await Tenant.findOne({
            stripe_customer_id: invoice.customer
        });

        if (!tenant) {
            console.error('Tenant not found for invoice:', invoice.id);
            return;
        }

        // Add to invoice history
        tenant.invoice_history.push({
            invoice_id: invoice.id,
            amount: invoice.amount_due / 100,
            status: 'failed',
            date: new Date(invoice.created * 1000)
        });

        // Update subscription status if this was a subscription payment
        if (invoice.subscription) {
            tenant.subscription_status = 'expired';
        }

        await tenant.save();

        // TODO: Send email notification about failed payment
    } catch (error) {
        console.error('Error handling invoice payment failed:', error);
        throw error;
    }
}

async function handleSubscriptionDeleted(subscription) {
    try {
        const tenant = await Tenant.findOne({
            stripe_subscription_id: subscription.id
        });

        if (!tenant) {
            console.error('Tenant not found for subscription:', subscription.id);
            return;
        }

        tenant.subscription_status = 'expired';
        tenant.subscription_plan = 'free';
        tenant.stripe_subscription_id = null;
        tenant.next_billing_date = null;

        await tenant.save();

        // TODO: Send email notification about subscription cancellation
    } catch (error) {
        console.error('Error handling subscription deleted:', error);
        throw error;
    }
}

async function handleSubscriptionUpdated(subscription) {
    try {
        const tenant = await Tenant.findOne({
            stripe_subscription_id: subscription.id
        });

        if (!tenant) {
            console.error('Tenant not found for subscription:', subscription.id);
            return;
        }

        tenant.subscription_status = subscription.status;
        tenant.next_billing_date = new Date(subscription.current_period_end * 1000);

        await tenant.save();
    } catch (error) {
        console.error('Error handling subscription updated:', error);
        throw error;
    }
} 