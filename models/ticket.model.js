const mongoose = require('mongoose');

const ticketMessageSchema = new mongoose.Schema({
    sender: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    content: { type: String, required: true },
    attachments: [{
        filename: String,
        url: String,
        type: String
    }],
    created_at: { type: Date, default: Date.now }
});

const ticketSchema = new mongoose.Schema({
    ticket_number: { type: String, unique: true, required: true },
    subject: { type: String, required: true },
    description: { type: String, required: true },
    tenant: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    status: {
        type: String,
        enum: ['open', 'in_progress', 'waiting', 'resolved', 'closed'],
        default: 'open'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high', 'urgent'],
        default: 'medium'
    },
    category: {
        type: String,
        enum: ['technical', 'billing', 'feature_request', 'bug', 'other'],
        required: true
    },
    assigned_to: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant'
    },
    messages: [ticketMessageSchema],
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now },
    resolved_at: Date,
    closed_at: Date
});

// Generate ticket number
ticketSchema.pre('save', function(next) {
    if (this.isNew) {
        const date = new Date();
        const year = date.getFullYear().toString().substr(-2);
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const random = Math.floor(Math.random() * 10000).toString().padStart(4, '0');
        this.ticket_number = `TKT-${year}${month}-${random}`;
    }
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    if (this.isModified('status')) {
        if (this.status === 'resolved') {
            this.resolved_at = new Date();
        } else if (this.status === 'closed') {
            this.closed_at = new Date();
        }
    }
    next();
});

const Ticket = mongoose.model('Ticket', ticketSchema);

module.exports = Ticket;