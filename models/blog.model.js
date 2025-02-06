const mongoose = require('mongoose');

const blogPostSchema = new mongoose.Schema({
    title: { type: String, required: true },
    slug: { type: String, required: true, unique: true },
    content: { type: String, required: true },
    excerpt: { type: String, required: true },
    featured_image: { type: String },
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Tenant',
        required: true
    },
    categories: [{ type: String }],
    tags: [{ type: String }],
    status: {
        type: String,
        enum: ['draft', 'published', 'archived'],
        default: 'draft'
    },
    meta: {
        title: String,
        description: String,
        keywords: [String]
    },
    views: { type: Number, default: 0 },
    published_at: Date,
    created_at: { type: Date, default: Date.now },
    updated_at: { type: Date, default: Date.now }
});

// Create slug from title
blogPostSchema.pre('save', function(next) {
    if (this.isModified('title')) {
        this.slug = this.title
            .toLowerCase()
            .replace(/[^a-zA-Z0-9]/g, '-')
            .replace(/-+/g, '-');
    }
    if (this.isModified()) {
        this.updated_at = new Date();
    }
    next();
});

const BlogPost = mongoose.model('BlogPost', blogPostSchema);

module.exports = BlogPost;