const mongoose = require('mongoose');

const analyticsEventSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    event_type: {
        type: String,
        enum: ['page_view', 'feature_usage', 'error', 'subscription_change', 'payment'],
        required: true
    },
    page_url: String,
    feature_name: String,
    error_message: String,
    subscription_details: {
        old_plan: String,
        new_plan: String,
        reason: String
    },
    payment_details: {
        amount: Number,
        status: String,
        method: String
    },
    metadata: mongoose.Schema.Types.Mixed,
    user_agent: String,
    ip_address: String,
    timestamp: { type: Date, default: Date.now }
});

const tenantMetricsSchema = new mongoose.Schema({
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    date: { type: Date, required: true },
    metrics: {
        page_views: { type: Number, default: 0 },
        feature_usage: { type: Number, default: 0 },
        errors: { type: Number, default: 0 },
        active_users: { type: Number, default: 0 },
        revenue: { type: Number, default: 0 },
        subscription_changes: { type: Number, default: 0 }
    },
    feature_breakdown: [{
        name: String,
        usage_count: Number
    }],
    error_breakdown: [{
        type: String,
        count: Number
    }]
});

// Compound index for efficient querying
analyticsEventSchema.index({ tenant: 1, timestamp: -1 });
tenantMetricsSchema.index({ tenant: 1, date: -1 });

// Ensure unique tenant-date combination
tenantMetricsSchema.index({ tenant: 1, date: 1 }, { unique: true });

const AnalyticsEvent = mongoose.model('AnalyticsEvent', analyticsEventSchema);
const TenantMetrics = mongoose.model('TenantMetrics', tenantMetricsSchema);

module.exports = {
    AnalyticsEvent,
    TenantMetrics
};