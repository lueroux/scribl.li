// Admin Blog Integration Helper
// This script can be included in your main app's admin panel to simplify blog management

class BlogAdmin {
  constructor(config = {}) {
    this.apiBase = config.apiBase || '/api/blog';
    this.token = config.token || null;
  }

  // Set authentication token
  setToken(token) {
    this.token = token;
  }

  // Create a new blog post
  async createPost(postData) {
    const response = await fetch(`${this.apiBase}/posts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Failed to create post: ${response.statusText}`);
    }

    return response.json();
  }

  // Update an existing blog post
  async updatePost(id, postData) {
    const response = await fetch(`${this.apiBase}/posts/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${this.token}`,
      },
      body: JSON.stringify(postData),
    });

    if (!response.ok) {
      throw new Error(`Failed to update post: ${response.statusText}`);
    }

    return response.json();
  }

  // Delete a blog post
  async deletePost(id) {
    const response = await fetch(`${this.apiBase}/posts/${id}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to delete post: ${response.statusText}`);
    }

    return response.json();
  }

  // Upload an image
  async uploadImage(file, altText = '') {
    const formData = new FormData();
    formData.append('image', file);
    formData.append('alt', altText);

    const response = await fetch(`${this.apiBase}/upload-image`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${this.token}`,
      },
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to upload image: ${response.statusText}`);
    }

    return response.json();
  }

  // Generate slug from title
  generateSlug(title) {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .trim();
  }

  // Estimate reading time
  estimateReadTime(content) {
    const wordsPerMinute = 200;
    const words = content.trim().split(/\s+/).length;
    return Math.ceil(words / wordsPerMinute);
  }

  // Validate post data
  validatePost(post) {
    const errors = [];

    if (!post.title || post.title.trim().length === 0) {
      errors.push('Title is required');
    }

    if (!post.content || post.content.trim().length === 0) {
      errors.push('Content is required');
    }

    if (!post.category) {
      errors.push('Category is required');
    }

    if (!post.author) {
      errors.push('Author is required');
    }

    if (post.slug && !/^[a-z0-9-]+$/.test(post.slug)) {
      errors.push('Slug can only contain lowercase letters, numbers, and hyphens');
    }

    return errors;
  }

  // Notify landing page of updates (if webhook is set up)
  async notifyUpdate() {
    try {
      await fetch(`${this.apiBase}/webhook/notify-update`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.token}`,
        },
      });
    } catch (error) {
      console.warn('Failed to notify landing page of update:', error);
    }
  }
}

// Example usage in your admin panel:

// Initialize the blog admin
const blogAdmin = new BlogAdmin({
  apiBase: '/api/blog',
  token: 'your-admin-token-here',
});

// Example: Create a new post
async function createNewPost() {
  const postData = {
    title: 'New Blog Post Title',
    slug: blogAdmin.generateSlug('New Blog Post Title'),
    content: 'Your blog post content here...',
    excerpt: 'Brief excerpt of the post...',
    category: 'Security',
    author: 'Author Name',
    featured: false,
    metaTitle: 'SEO Title',
    metaDescription: 'SEO Description',
    publishedAt: new Date().toISOString(),
  };

  // Validate
  const errors = blogAdmin.validatePost(postData);
  if (errors.length > 0) {
    alert('Please fix the following errors:\n' + errors.join('\n'));
    return;
  }

  try {
    const post = await blogAdmin.createPost(postData);
    console.log('Post created:', post);

    // Notify landing page
    await blogAdmin.notifyUpdate();

    alert('Post created successfully!');
  } catch (error) {
    console.error('Error creating post:', error);
    alert('Failed to create post: ' + error.message);
  }
}

// Example: Upload an image
async function uploadBlogImage(file) {
  try {
    const result = await blogAdmin.uploadImage(file, 'Image alt text');
    console.log('Image uploaded:', result.url);
    return result.url;
  } catch (error) {
    console.error('Error uploading image:', error);
    alert('Failed to upload image: ' + error.message);
  }
}

// Export for use in your application
window.BlogAdmin = BlogAdmin;
