const { AnalyticsEvent, TenantMetrics } = require('../../models/analytics.model');
const { validationResult } = require('express-validator');

// Track an analytics event
exports.trackEvent = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const {
            event_type,
            page_url,
            feature_name,
            error_message,
            subscription_details,
            payment_details,
            metadata
        } = req.body;

        const event = new AnalyticsEvent({
            tenant: req.tenant._id,
            event_type,
            page_url,
            feature_name,
            error_message,
            subscription_details,
            payment_details,
            metadata,
            user_agent: req.headers['user-agent'],
            ip_address: req.ip
        });

        await event.save();

        // Update daily metrics
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        let metrics = await TenantMetrics.findOne({
            tenant: req.tenant._id,
            date: today
        });

        if (!metrics) {
            metrics = new TenantMetrics({
                tenant: req.tenant._id,
                date: today
            });
        }

        // Update metrics based on event type
        switch (event_type) {
            case 'page_view':
                metrics.metrics.page_views += 1;
                break;
            case 'feature_usage':
                metrics.metrics.feature_usage += 1;
                // Update feature breakdown
                const featureIndex = metrics.feature_breakdown.findIndex(f => f.name === feature_name);
                if (featureIndex >= 0) {
                    metrics.feature_breakdown[featureIndex].usage_count += 1;
                } else {
                    metrics.feature_breakdown.push({ name: feature_name, usage_count: 1 });
                }
                break;
            case 'error':
                metrics.metrics.errors += 1;
                // Update error breakdown
                const errorType = error_message.split(':')[0];
                const errorIndex = metrics.error_breakdown.findIndex(e => e.type === errorType);
                if (errorIndex >= 0) {
                    metrics.error_breakdown[errorIndex].count += 1;
                } else {
                    metrics.error_breakdown.push({ type: errorType, count: 1 });
                }
                break;
            case 'subscription_change':
                metrics.metrics.subscription_changes += 1;
                break;
            case 'payment':
                if (payment_details?.status === 'succeeded') {
                    metrics.metrics.revenue += payment_details.amount;
                }
                break;
        }

        await metrics.save();

        res.status(201).json({
            success: true,
            event
        });
    } catch (error) {
        console.error('Error tracking analytics event:', error);
        res.status(500).json({
            success: false,
            message: 'Error tracking analytics event'
        });
    }
};

// Get analytics metrics for a date range
exports.getMetrics = async (req, res) => {
    try {
        const { start_date, end_date } = req.query;
        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        startDate.setHours(0, 0, 0, 0);
        endDate.setHours(23, 59, 59, 999);

        const metrics = await TenantMetrics.find({
            tenant: req.tenant._id,
            date: {
                $gte: startDate,
                $lte: endDate
            }
        }).sort({ date: 1 });

        // Aggregate metrics
        const aggregatedMetrics = {
            total_page_views: 0,
            total_feature_usage: 0,
            total_errors: 0,
            total_active_users: 0,
            total_revenue: 0,
            total_subscription_changes: 0,
            feature_breakdown: {},
            error_breakdown: {},
            daily_metrics: metrics.map(m => ({
                date: m.date,
                metrics: m.metrics
            }))
        };

        metrics.forEach(metric => {
            aggregatedMetrics.total_page_views += metric.metrics.page_views;
            aggregatedMetrics.total_feature_usage += metric.metrics.feature_usage;
            aggregatedMetrics.total_errors += metric.metrics.errors;
            aggregatedMetrics.total_active_users += metric.metrics.active_users;
            aggregatedMetrics.total_revenue += metric.metrics.revenue;
            aggregatedMetrics.total_subscription_changes += metric.metrics.subscription_changes;

            // Aggregate feature breakdown
            metric.feature_breakdown.forEach(f => {
                aggregatedMetrics.feature_breakdown[f.name] = 
                    (aggregatedMetrics.feature_breakdown[f.name] || 0) + f.usage_count;
            });

            // Aggregate error breakdown
            metric.error_breakdown.forEach(e => {
                aggregatedMetrics.error_breakdown[e.type] = 
                    (aggregatedMetrics.error_breakdown[e.type] || 0) + e.count;
            });
        });

        res.json({
            success: true,
            metrics: aggregatedMetrics
        });
    } catch (error) {
        console.error('Error fetching analytics metrics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics metrics'
        });
    }
};

// Get recent events
exports.getEvents = async (req, res) => {
    try {
        const { page = 1, limit = 50, event_type } = req.query;
        const query = { tenant: req.tenant._id };

        if (event_type) {
            query.event_type = event_type;
        }

        const events = await AnalyticsEvent.find(query)
            .sort({ timestamp: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await AnalyticsEvent.countDocuments(query);

        res.json({
            success: true,
            events,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Error fetching analytics events:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching analytics events'
        });
    }
}; 