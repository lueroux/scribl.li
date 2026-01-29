# Blog Integration Guide for Scriblli Landing Page

This guide explains how to set up and manage the blog functionality that allows you to add posts from your Main App Admin.

## Overview

The blog integration consists of:
1. **API Endpoints** in your main application
2. **Frontend Integration** on the landing page
3. **Admin Interface** for content management

## Quick Setup

### 1. Configure Your Main App API

Update the `API_CONFIG.baseURL` in `api/blog.js`:
```javascript
const API_CONFIG = {
    baseURL: 'https://your-main-app.com', // Change this to your main app URL
    // ...
};
```

### 2. Implement API Endpoints

Follow the specification in `blog-api-spec.md` to implement these endpoints in your main app:
- `GET /api/blog/posts` - List all posts
- `GET /api/blog/featured` - Get featured post
- `GET /api/blog/categories` - List categories
- `POST /api/blog/posts` - Create new post (admin only)
- `PUT /api/blog/posts/{id}` - Update post (admin only)
- `DELETE /api/blog/posts/{id}` - Delete post (admin only)

### 3. Set Up CORS

In your main app, allow requests from your landing page:
```javascript
// Express.js example
app.use(cors({
    origin: ['https://scriblli.com', 'https://www.scriblli.com']
}));
```

### 4. Test the Integration

1. Open `blog.html` in your browser
2. Check the browser console for any errors
3. Verify that posts are loading from your API

## Admin Panel Integration

### Option 1: Simple HTML Form

Create a basic admin interface in your main app:

```html
<form id="blog-post-form">
    <input type="text" id="title" placeholder="Post Title" required>
    <input type="text" id="slug" placeholder="URL Slug">
    <textarea id="content" placeholder="Post Content" required></textarea>
    <input type="text" id="excerpt" placeholder="Brief excerpt">
    <select id="category">
        <option value="Security">Security</option>
        <option value="Efficiency">Efficiency</option>
        <option value="Integration">Integration</option>
        <option value="Legal">Legal</option>
    </select>
    <input type="text" id="author" placeholder="Author Name" required>
    <label>
        <input type="checkbox" id="featured"> Featured Post
    </label>
    <button type="submit">Publish Post</button>
</form>

<script src="admin-blog-integration.js"></script>
<script>
    const blogAdmin = new BlogAdmin({
        apiBase: '/api/blog',
        token: 'your-admin-token'
    });

    document.getElementById('blog-post-form').addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const postData = {
            title: document.getElementById('title').value,
            slug: document.getElementById('slug').value || blogAdmin.generateSlug(document.getElementById('title').value),
            content: document.getElementById('content').value,
            excerpt: document.getElementById('excerpt').value,
            category: document.getElementById('category').value,
            author: document.getElementById('author').value,
            featured: document.getElementById('featured').checked,
            publishedAt: new Date().toISOString()
        };

        try {
            const post = await blogAdmin.createPost(postData);
            alert('Post published successfully!');
            e.target.reset();
        } catch (error) {
            alert('Error: ' + error.message);
        }
    });
</script>
```

### Option 2: React Component

```jsx
import React, { useState } from 'react';
import BlogAdmin from './admin-blog-integration';

function BlogPostEditor() {
    const [post, setPost] = useState({
        title: '',
        slug: '',
        content: '',
        excerpt: '',
        category: 'Security',
        author: '',
        featured: false
    });

    const blogAdmin = new BlogAdmin({
        apiBase: '/api/blog',
        token: 'your-admin-token'
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            await blogAdmin.createPost({
                ...post,
                publishedAt: new Date().toISOString()
            });
            alert('Post published!');
            setPost({
                title: '',
                slug: '',
                content: '',
                excerpt: '',
                category: 'Security',
                author: '',
                featured: false
            });
        } catch (error) {
            alert('Error: ' + error.message);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            {/* Form fields here */}
        </form>
    );
}
```

## Database Setup

### PostgreSQL Schema

```sql
-- Create tables
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
    status VARCHAR(20) DEFAULT 'draft'
);

-- Insert default categories
INSERT INTO blog_categories (name, slug, description) VALUES
('Security', 'security', 'Posts about security and compliance'),
('Efficiency', 'efficiency', 'Posts about improving business efficiency'),
('Integration', 'integration', 'Posts about API and system integrations'),
('Legal', 'legal', 'Posts about legal aspects of e-signatures'),
('Remote Work', 'remote-work', 'Posts about remote document workflows'),
('Analytics', 'analytics', 'Posts about metrics and analytics'),
('Industry Trends', 'industry-trends', 'Posts about industry news and trends');
```

## Image Management

### Upload Endpoint Example (Node.js)

```javascript
const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: 'uploads/blog/',
    filename: (req, file, cb) => {
        const uniqueName = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, uniqueName + path.extname(file.originalname));
    }
});

const upload = multer({ 
    storage,
    fileFilter: (req, file, cb) => {
        if (file.mimetype.startsWith('image/')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files are allowed'));
        }
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

app.post('/api/blog/upload-image', authenticateToken, upload.single('image'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    
    const imageUrl = `https://cdn.yourapp.com/blog/${req.file.filename}`;
    
    res.json({
        url: imageUrl,
        filename: req.file.filename,
        size: req.file.size
    });
});
```

## SEO Considerations

1. **URL Structure**: Use clean URLs like `/blog/post-slug.html`
2. **Meta Tags**: Include title, description, and Open Graph tags
3. **Schema Markup**: Add Article schema to blog posts
4. **Sitemap**: Generate and update sitemap.xml with blog posts
5. **Internal Linking**: Link between related posts

## Performance Optimization

1. **Caching**: Implement server-side caching for blog posts
2. **CDN**: Use CDN for images and static assets
3. **Lazy Loading**: Implement lazy loading for images
4. **Pagination**: Add pagination for posts list
5. **Image Optimization**: Compress and resize images

## Security Best Practices

1. **Input Sanitization**: Sanitize all user inputs
2. **XSS Protection**: Escape HTML content properly
3. **Authentication**: Secure admin endpoints with JWT tokens
4. **Rate Limiting**: Implement rate limiting on API endpoints
5. **HTTPS**: Always use HTTPS for API calls

## Troubleshooting

### Common Issues

1. **CORS Errors**
   - Check CORS configuration in your main app
   - Verify the landing page domain is whitelisted

2. **404 Errors**
   - Ensure API endpoints are correctly configured
   - Check the `baseURL` in `api/blog.js`

3. **Posts Not Loading**
   - Check browser console for JavaScript errors
   - Verify API response format matches expected structure

4. **Authentication Issues**
   - Ensure admin token is valid
   - Check token expiration

### Debug Mode

Enable debug logging in `api/blog.js`:

```javascript
// Add at the top of api/blog.js
const DEBUG = true;

function debug(message, data) {
    if (DEBUG) {
        console.log('[Blog API]', message, data);
    }
}

// Add debug calls throughout the file
debug('Fetching blog posts');
debug('API response:', posts);
```

## Next Steps

1. Implement the API endpoints in your main application
2. Create the admin interface for managing posts
3. Set up the database and initial categories
4. Test the integration thoroughly
5. Set up monitoring and analytics for blog performance

## Support

If you need help with the integration:
1. Check the browser console for errors
2. Review the API specification in `blog-api-spec.md`
3. Ensure all endpoints are correctly implemented
4. Verify CORS and authentication settings
