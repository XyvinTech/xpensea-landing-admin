const Ticket = require('../../models/ticket.model');
const { validationResult } = require('express-validator');

// Create a new ticket
exports.createTicket = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { subject, description, category, priority } = req.body;
        const ticket = new Ticket({
            subject,
            description,
            category,
            priority,
            tenant: req.tenant._id
        });

        await ticket.save();

        res.status(201).json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Error creating ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating ticket'
        });
    }
};

// Get all tickets with pagination and filters
exports.getTickets = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category, priority } = req.query;
        const query = { tenant: req.tenant._id };

        // Apply filters
        if (status) query.status = status;
        if (category) query.category = category;
        if (priority) query.priority = priority;

        const tickets = await Ticket.find(query)
            .populate('assigned_to', 'company_name')
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await Ticket.countDocuments(query);

        res.json({
            success: true,
            tickets,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        console.error('Error fetching tickets:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching tickets'
        });
    }
};

// Get a single ticket by number
exports.getTicketByNumber = async (req, res) => {
    try {
        const ticket = await Ticket.findOne({ 
            ticket_number: req.params.number,
            tenant: req.tenant._id 
        }).populate('assigned_to', 'company_name');

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Error fetching ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket'
        });
    }
};

// Update a ticket
exports.updateTicket = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const ticket = await Ticket.findOne({ 
            ticket_number: req.params.number,
            tenant: req.tenant._id 
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        const { status, priority, category } = req.body;
        
        // Update fields
        if (status) ticket.status = status;
        if (priority) ticket.priority = priority;
        if (category) ticket.category = category;

        await ticket.save();

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Error updating ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating ticket'
        });
    }
};

// Add message to ticket
exports.addMessage = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const ticket = await Ticket.findOne({ 
            ticket_number: req.params.number,
            tenant: req.tenant._id 
        });

        if (!ticket) {
            return res.status(404).json({
                success: false,
                message: 'Ticket not found'
            });
        }

        const { content, attachments } = req.body;
        
        ticket.messages.push({
            sender: req.tenant._id,
            content,
            attachments
        });

        // Update ticket status if it was waiting
        if (ticket.status === 'waiting') {
            ticket.status = 'in_progress';
        }

        await ticket.save();

        res.json({
            success: true,
            ticket
        });
    } catch (error) {
        console.error('Error adding message to ticket:', error);
        res.status(500).json({
            success: false,
            message: 'Error adding message to ticket'
        });
    }
};

// Get ticket statistics
exports.getStats = async (req, res) => {
    try {
        const stats = await Ticket.aggregate([
            {
                $match: { tenant: req.tenant._id }
            },
            {
                $group: {
                    _id: null,
                    totalTickets: { $sum: 1 },
                    openTickets: {
                        $sum: { $cond: [{ $eq: ['$status', 'open'] }, 1, 0] }
                    },
                    inProgressTickets: {
                        $sum: { $cond: [{ $eq: ['$status', 'in_progress'] }, 1, 0] }
                    },
                    resolvedTickets: {
                        $sum: { $cond: [{ $eq: ['$status', 'resolved'] }, 1, 0] }
                    },
                    avgResolutionTime: {
                        $avg: {
                            $cond: [
                                { $and: [
                                    { $eq: ['$status', 'resolved'] },
                                    { $ne: ['$resolved_at', null] }
                                ]},
                                { $subtract: ['$resolved_at', '$created_at'] },
                                null
                            ]
                        }
                    }
                }
            }
        ]);

        const categoryBreakdown = await Ticket.aggregate([
            {
                $match: { tenant: req.tenant._id }
            },
            {
                $group: {
                    _id: '$category',
                    count: { $sum: 1 }
                }
            }
        ]);

        const priorityBreakdown = await Ticket.aggregate([
            {
                $match: { tenant: req.tenant._id }
            },
            {
                $group: {
                    _id: '$priority',
                    count: { $sum: 1 }
                }
            }
        ]);

        res.json({
            success: true,
            stats: {
                ...stats[0],
                avgResolutionTime: stats[0]?.avgResolutionTime 
                    ? Math.round(stats[0].avgResolutionTime / (1000 * 60 * 60)) // Convert to hours
                    : 0
            },
            categoryBreakdown,
            priorityBreakdown
        });
    } catch (error) {
        console.error('Error fetching ticket statistics:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching ticket statistics'
        });
    }
}; 