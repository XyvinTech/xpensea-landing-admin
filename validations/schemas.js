const Joi = require('joi');

// Auth Schemas
exports.registerSchema = Joi.object({
    company_name: Joi.string(),
    admin_name: Joi.string(),
    email: Joi.string(),
    password: Joi.string(),
    phone: Joi.string(),
    industry: Joi.string(),
    company_size: Joi.string(),
    gdpr_consent: Joi.boolean()
});

exports.loginSchema = Joi.object({
    email: Joi.string(),
    password: Joi.string()
});

exports.updateProfileSchema = Joi.object({
    company_name: Joi.string(),
    admin_name: Joi.string(),
    phone: Joi.string(),
    industry: Joi.string(),
    company_size: Joi.string(),
    billing_address: Joi.string(),
    tax_id: Joi.string()
});

// Blog Schemas
exports.blogPostSchema = Joi.object({
    title: Joi.string(),
    content: Joi.string(),
    excerpt: Joi.string(),
    featured_image: Joi.string(),
    categories: Joi.array().items(Joi.string()),
    tags: Joi.array().items(Joi.string()),
    status: Joi.string(),
    meta: Joi.object({
        title: Joi.string(),
        description: Joi.string(),
        keywords: Joi.array().items(Joi.string())
    })
});

// Ticket Schemas
exports.ticketSchema = Joi.object({
    subject: Joi.string(),
    description: Joi.string(),
    category: Joi.string(),
    priority: Joi.string()
});

exports.ticketUpdateSchema = Joi.object({
    status: Joi.string(),
    priority: Joi.string(),
    category: Joi.string()
});

exports.ticketMessageSchema = Joi.object({
    content: Joi.string(),
    attachments: Joi.array().items(Joi.object({
        filename: Joi.string(),
        url: Joi.string(),
        type: Joi.string()
    }))
});

// Subscription Schemas
exports.subscriptionCreateSchema = Joi.object({
    plan: Joi.string(),
    billing_cycle: Joi.string(),
    payment_method_id: Joi.string()
});

exports.subscriptionUpdateSchema = Joi.object({
    new_plan: Joi.string(),
    new_billing_cycle: Joi.string()
});

// Payment Schemas
exports.paymentMethodSchema = Joi.object({
    payment_method_id: Joi.string()
});

// Analytics Schemas
exports.analyticsEventSchema = Joi.object({
    event_type: Joi.string(),
    page_url: Joi.string(),
    feature_name: Joi.string(),
    error_message: Joi.string(),
    subscription_details: Joi.object({
        old_plan: Joi.string(),
        new_plan: Joi.string(),
        reason: Joi.string()
    }),
    payment_details: Joi.object({
        amount: Joi.number(),
        status: Joi.string(),
        method: Joi.string()
    }),
    metadata: Joi.object()
});

exports.analyticsMetricsSchema = Joi.object({
    start_date: Joi.date(),
    end_date: Joi.date()
}); 