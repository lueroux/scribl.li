# Blog API Specification

This document outlines the API endpoints that your main application should implement to support the blog functionality on the Scriblli landing page.

## Base URL
```
https://your-main-app.com/api/blog
```

## Authentication
All endpoints should be accessible without authentication for public read operations. Admin operations (create, update, delete) should require authentication.

## Endpoints

### 1. Get All Blog Posts
```
GET /api/blog/posts
```

**Query Parameters:**
- `limit` (optional): Number of posts to return (default: 10)
- `offset` (optional): Number of posts to skip (default: 0)
- `category` (optional): Filter by category slug
- `featured` (optional): Filter for featured posts only (true/false)

**Response:**
```json
{
  "posts": [
    {
      "id": 1,
      "title": "The Future of Digital Signatures",
      "slug": "future-digital-signatures-2026",
      "excerpt": "Explore the latest trends...",
      "content": "Full article content here...",
      "category": "Industry Trends",
      "author": "Scrib.li Team",
      "authorEmail": "team@scriblli.com",
      "publishedAt": "2026-01-29T00:00:00Z",
      "updatedAt": "2026-01-29T00:00:00Z",
      "readTime": 5,
      "featured": true,
      "image": "https://cdn.example.com/images/post-1.jpg",
      "metaTitle": "The Future of Digital Signatures | Scrib.li Blog",
      "metaDescription": "Explore the latest trends shaping the e-signature industry..."
    }
  ],
  "total": 25,
  "limit": 10,
  "offset": 0
}
```

### 2. Get Featured Post
```
GET /api/blog/featured
```

**Response:**
```json
{
  "id": 1,
  "title": "The Future of Digital Signatures",
  "slug": "future-digital-signatures-2026",
  "excerpt": "Explore the latest trends...",
  "content": "Full article content here...",
  "category": "Industry Trends",
  "author": "Scrib.li Team",
  "publishedAt": "2026-01-29T00:00:00Z",
  "readTime": 5,
  "featured": true,
  "image": "https://cdn.example.com/images/post-1.jpg"
}
```

### 3. Get Categories
```
GET /api/blog/categories
```

**Response:**
```json
{
  "categories": [
    {
      "name": "Security",
      "slug": "security",
      "description": "Posts about security and compliance",
      "count": 12
    },
    {
      "name": "Efficiency",
      "slug": "efficiency",
      "description": "Posts about improving business efficiency",
      "count": 8
    }
  ]
}
```

### 4. Get Single Post
```
GET /api/blog/posts/{slug}
```

**Response:**
```json
{
  "id": 1,
  "title": "The Future of Digital Signatures",
  "slug": "future-digital-signatures-2026",
  "content": "Full article content here...",
  "category": "Industry Trends",
  "author": "Scrib.li Team",
  "publishedAt": "2026-01-29T00:00:00Z",
  "readTime": 5,
  "featured": true,
  "image": "https://cdn.example.com/images/post-1.jpg",
  "relatedPosts": [
    {
      "id": 2,
      "title": "Related Post Title",
      "slug": "related-post-slug"
    }
  ]
}
```

## Admin Endpoints (Protected)

### 5. Create Blog Post
```
POST /api/blog/posts
Authorization: Bearer {admin-token}
```

**Request Body:**
```json
{
  "title": "New Blog Post",
  "slug": "new-blog-post",
  "content": "Full article content...",
  "excerpt": "Brief description...",
  "category": "Security",
  "author": "Author Name",
  "featured": false,
  "image": "https://cdn.example.com/image.jpg",
  "metaTitle": "SEO Title",
  "metaDescription": "SEO Description",
  "publishedAt": "2026-01-29T00:00:00Z"
}
```

### 6. Update Blog Post
```
PUT /api/blog/posts/{id}
Authorization: Bearer {admin-token}
```

### 7. Delete Blog Post
```
DELETE /api/blog/posts/{id}
Authorization: Bearer {admin-token}
```

### 8. Upload Image
```
POST /api/blog/upload-image
Authorization: Bearer {admin-token}
Content-Type: multipart/form-data
```

**Request:**
- `image`: Image file (JPG, PNG, WebP)
- `alt`: Alt text for image

**Response:**
```json
{
  "url": "https://cdn.example.com/images/uploaded-image.jpg",
  "filename": "uploaded-image.jpg",
  "size": 123456
}
```

## Database Schema (PostgreSQL Example)

```sql
CREATE TABLE blog_categories (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    category VARCHAR(100) REFERENCES blog_categories(name),
    author VARCHAR(100) NOT NULL,
    author_email VARCHAR(255),
    published_at TIMESTAMP,
    updated_at TIMESTAMP DEFAULT NOW(),
    read_time INTEGER DEFAULT 5,
    featured BOOLEAN DEFAULT FALSE,
    image_url VARCHAR(500),
    meta_title VARCHAR(255),
    meta_description TEXT,
    status VARCHAR(20) DEFAULT 'draft' -- draft, published
);

CREATE INDEX idx_blog_posts_published ON blog_posts(published_at) WHERE status = 'published';
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_posts_featured ON blog_posts(featured) WHERE featured = TRUE;
```

## Integration Steps

### 1. Update blog.html
Add the blog API script to the blog page:

```html
<script src="api/blog.js"></script>
```

Add the blog-page class to the body:
```html
<body class="bg-white blog-page">
```

Update the posts container:
```html
<div id="featured-post" class="max-w-6xl mx-auto mb-12">
    <!-- Featured post will be rendered here -->
</div>

<div id="blog-posts" class="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
    <!-- Posts will be rendered here -->
</div>

<div id="blog-categories" class="grid grid-cols-2 md:grid-cols-4 gap-4">
    <!-- Categories will be rendered here -->
</div>
```

### 2. CORS Configuration
Ensure your main app allows requests from the landing page domain:

```javascript
// Express.js example
app.use(cors({
    origin: ['https://scriblli.com', 'https://www.scriblli.com']
}));
```

### 3. Caching Strategy
- Implement server-side caching for blog posts (e.g., Redis)
- Set appropriate Cache-Control headers
- Consider using a CDN for static assets

### 4. Webhook for Updates (Optional)
Implement a webhook to notify the landing page when content updates:

```
POST /api/blog/webhook/notify-update
```

This can trigger cache invalidation on the landing page.

## Security Considerations

1. **Input Validation**: Sanitize all inputs, especially content
2. **XSS Protection**: Escape HTML content properly
3. **Rate Limiting**: Implement rate limiting on API endpoints
4. **Image Uploads**: Validate file types and sizes
5. **Authentication**: Use secure token-based authentication for admin operations

## Deployment Notes

1. Set up the API endpoints in your main application
2. Update the `API_CONFIG.baseURL` in `api/blog.js` to point to your main app
3. Test the endpoints with the landing page
4. Set up monitoring for API performance and errors
