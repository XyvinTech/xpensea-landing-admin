/**
 * @swagger
 * components:
 *   schemas:
 *     BlogPost:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *           example: "Getting Started with Our SaaS Platform"
 *         slug:
 *           type: string
 *           example: "getting-started-with-our-saas-platform"
 *         content:
 *           type: string
 *           example: "Detailed blog post content here..."
 *         excerpt:
 *           type: string
 *           example: "A quick guide to get started with our platform"
 *         featured_image:
 *           type: string
 *           example: "https://example.com/images/blog/getting-started.jpg"
 *         author:
 *           type: string
 *           format: objectId
 *           description: Reference to Tenant model
 *         categories:
 *           type: array
 *           items:
 *             type: string
 *           example: ["Tutorial", "Getting Started"]
 *         tags:
 *           type: array
 *           items:
 *             type: string
 *           example: ["beginner", "tutorial", "guide"]
 *         status:
 *           type: string
 *           enum: [draft, published, archived]
 *           example: "published"
 *         meta:
 *           type: object
 *           properties:
 *             title:
 *               type: string
 *             description:
 *               type: string
 *             keywords:
 *               type: array
 *               items:
 *                 type: string
 *         views:
 *           type: number
 *           example: 150
 *         published_at:
 *           type: string
 *           format: date-time
 *         created_at:
 *           type: string
 *           format: date-time
 *         updated_at:
 *           type: string
 *           format: date-time
 * 
 * /blog:
 *   post:
 *     tags:
 *       - Blog
 *     summary: Create a new blog post
 *     description: Create a new blog post with the provided details
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - content
 *               - excerpt
 *               - status
 *             properties:
 *               title:
 *                 type: string
 *               content:
 *                 type: string
 *               excerpt:
 *                 type: string
 *               featured_image:
 *                 type: string
 *               categories:
 *                 type: array
 *                 items:
 *                   type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               status:
 *                 type: string
 *                 enum: [draft, published, archived]
 *               meta:
 *                 type: object
 *                 properties:
 *                   title:
 *                     type: string
 *                   description:
 *                     type: string
 *                   keywords:
 *                     type: array
 *                     items:
 *                       type: string
 *     responses:
 *       201:
 *         description: Blog post created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 post:
 *                   $ref: '#/components/schemas/BlogPost'
 *   get:
 *     tags:
 *       - Blog
 *     summary: Get all blog posts
 *     description: Retrieve blog posts with pagination and filters
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [draft, published, archived]
 *         description: Filter by post status
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter by category
 *       - in: query
 *         name: tag
 *         schema:
 *           type: string
 *         description: Filter by tag
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search in title and content
 *     responses:
 *       200:
 *         description: List of blog posts
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 posts:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/BlogPost'
 *                 currentPage:
 *                   type: integer
 *                 totalPages:
 *                   type: integer
 *                 total:
 *                   type: integer
 * 
 * /blog/stats:
 *   get:
 *     tags:
 *       - Blog
 *     summary: Get blog statistics
 *     description: Get statistics about blog posts, categories, and tags
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Blog statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 stats:
 *                   type: object
 *                   properties:
 *                     totalPosts:
 *                       type: integer
 *                     publishedPosts:
 *                       type: integer
 *                     draftPosts:
 *                       type: integer
 *                     totalViews:
 *                       type: integer
 *                 categories:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 *                 tags:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                       count:
 *                         type: integer
 * 
 * /blog/{slug}:
 *   get:
 *     tags:
 *       - Blog
 *     summary: Get a blog post by slug
 *     description: Retrieve a single blog post by its slug
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post slug
 *     responses:
 *       200:
 *         description: Blog post details
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 post:
 *                   $ref: '#/components/schemas/BlogPost'
 *   put:
 *     tags:
 *       - Blog
 *     summary: Update a blog post
 *     description: Update an existing blog post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post slug
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/BlogPost'
 *     responses:
 *       200:
 *         description: Blog post updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 post:
 *                   $ref: '#/components/schemas/BlogPost'
 *   delete:
 *     tags:
 *       - Blog
 *     summary: Delete a blog post
 *     description: Delete an existing blog post
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: slug
 *         required: true
 *         schema:
 *           type: string
 *         description: Blog post slug
 *     responses:
 *       200:
 *         description: Blog post deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Blog post deleted successfully
 */ 