const BlogPost = require('../../models/blog.model');
const { validationResult } = require('express-validator');
const responseHandler = require('../../helpers/responseHandler');

// Create a new blog post
exports.createPost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).errorMessage = `Invalid input: ${errors.array()[0].msg}`;
            return responseHandler(res, 400, res.errorMessage);
        }

        const { title, content, excerpt, categories, tags, meta, status } = req.body;
        
        const post = new BlogPost({
            title,
            content,
            excerpt,
            categories,
            tags,
            meta,
            status,
            author: req.tenant._id,
            featured_image: req.body.featured_image
        });

        if (status === 'published') {
            post.published_at = new Date();
        }

        await post.save();
        return responseHandler(res, 201, 'Blog post created successfully', post);
    } catch (error) {
        res.status(500).errorMessage = `Error creating blog post: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

// Get all blog posts with pagination and filters
exports.getPosts = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, category, tag, search } = req.query;
        const query = {};

        // Apply filters
        if (status) query.status = status;
        if (category) query.categories = category;
        if (tag) query.tags = tag;
        if (search) {
            query.$or = [
                { title: { $regex: search, $options: 'i' } },
                { content: { $regex: search, $options: 'i' } }
            ];
        }

        const posts = await BlogPost.find(query)
            .populate('author', 'company_name')
            .sort({ created_at: -1 })
            .skip((page - 1) * limit)
            .limit(parseInt(limit));

        const total = await BlogPost.countDocuments(query);

        return responseHandler(res, 200, 'Blog posts retrieved successfully', {
            posts,
            currentPage: parseInt(page),
            totalPages: Math.ceil(total / limit),
            total
        });
    } catch (error) {
        res.status(500).errorMessage = `Error fetching blog posts: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

// Get a single blog post by slug
exports.getPostBySlug = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug })
            .populate('author', 'company_name');

        if (!post) {
            res.status(404).errorMessage = 'Blog post not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        // Increment views
        post.views += 1;
        await post.save();

        return responseHandler(res, 200, 'Blog post retrieved successfully', post);
    } catch (error) {
        res.status(500).errorMessage = `Error fetching blog post: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

// Update a blog post
exports.updatePost = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).errorMessage = `Invalid input: ${errors.array()[0].msg}`;
            return responseHandler(res, 400, res.errorMessage);
        }

        const post = await BlogPost.findOne({ slug: req.params.slug });
        
        if (!post) {
            res.status(404).errorMessage = 'Blog post not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        // Check if user is the author
        if (post.author.toString() !== req.tenant._id.toString()) {
            res.status(403).errorMessage = 'Not authorized to update this post';
            return responseHandler(res, 403, res.errorMessage);
        }

        const { title, content, excerpt, categories, tags, meta, status } = req.body;
        
        // Update fields
        if (title) post.title = title;
        if (content) post.content = content;
        if (excerpt) post.excerpt = excerpt;
        if (categories) post.categories = categories;
        if (tags) post.tags = tags;
        if (meta) post.meta = meta;
        if (status) {
            post.status = status;
            if (status === 'published' && !post.published_at) {
                post.published_at = new Date();
            }
        }
        if (req.body.featured_image) post.featured_image = req.body.featured_image;

        await post.save();
        return responseHandler(res, 200, 'Blog post updated successfully', post);
    } catch (error) {
        res.status(500).errorMessage = `Error updating blog post: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

// Delete a blog post
exports.deletePost = async (req, res) => {
    try {
        const post = await BlogPost.findOne({ slug: req.params.slug });
        
        if (!post) {
            res.status(404).errorMessage = 'Blog post not found';
            return responseHandler(res, 404, res.errorMessage);
        }

        // Check if user is the author
        if (post.author.toString() !== req.tenant._id.toString()) {
            res.status(403).errorMessage = 'Not authorized to delete this post';
            return responseHandler(res, 403, res.errorMessage);
        }

        await post.remove();
        return responseHandler(res, 200, 'Blog post deleted successfully');
    } catch (error) {
        res.status(500).errorMessage = `Error deleting blog post: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
};

// Get blog statistics
exports.getStats = async (req, res) => {
    try {
        const stats = await BlogPost.aggregate([
            {
                $group: {
                    _id: null,
                    totalPosts: { $sum: 1 },
                    publishedPosts: {
                        $sum: { $cond: [{ $eq: ['$status', 'published'] }, 1, 0] }
                    },
                    draftPosts: {
                        $sum: { $cond: [{ $eq: ['$status', 'draft'] }, 1, 0] }
                    },
                    totalViews: { $sum: '$views' }
                }
            }
        ]);

        const categories = await BlogPost.aggregate([
            { $unwind: '$categories' },
            {
                $group: {
                    _id: '$categories',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        const tags = await BlogPost.aggregate([
            { $unwind: '$tags' },
            {
                $group: {
                    _id: '$tags',
                    count: { $sum: 1 }
                }
            },
            { $sort: { count: -1 } }
        ]);

        return responseHandler(res, 200, 'Blog statistics retrieved successfully', {
            stats: stats[0],
            categories,
            tags
        });
    } catch (error) {
        res.status(500).errorMessage = `Error fetching blog statistics: ${error.message}`;
        return responseHandler(res, 500, res.errorMessage);
    }
}; 