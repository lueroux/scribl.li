// Blog API Integration for Scriblli Landing Page
// This file handles fetching blog posts from the main application

// Configuration
const API_CONFIG = {
  baseURL: 'https://scribl.li',
  endpoints: {
    posts: '/api/blog/posts',
    categories: '/api/blog/categories',
    featured: '/api/blog/featured',
  },
};

// Cache blog posts for 1 hour
let cache = {
  posts: null,
  categories: null,
  timestamp: null,
  ttl: 3600000, // 1 hour in milliseconds
};

// Helper function to check if cache is valid
function isCacheValid() {
  return cache.timestamp && Date.now() - cache.timestamp < cache.ttl;
}

// Fetch blog posts from API
async function fetchBlogPosts() {
  if (isCacheValid() && cache.posts) {
    return cache.posts;
  }

  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.posts}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const posts = await response.json();

    // Update cache
    cache.posts = posts;
    cache.timestamp = Date.now();

    return posts;
  } catch (error) {
    console.error('Error fetching blog posts:', error);

    // Return fallback posts if API fails
    return getFallbackPosts();
  }
}

// Fetch categories from API
async function fetchCategories() {
  if (isCacheValid() && cache.categories) {
    return cache.categories;
  }

  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.categories}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const categories = await response.json();

    // Update cache
    cache.categories = categories;
    cache.timestamp = Date.now();

    return categories;
  } catch (error) {
    console.error('Error fetching categories:', error);
    return getFallbackCategories();
  }
}

// Fetch featured post from API
async function fetchFeaturedPost() {
  try {
    const response = await fetch(`${API_CONFIG.baseURL}${API_CONFIG.endpoints.featured}`);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching featured post:', error);
    return getFallbackFeaturedPost();
  }
}

// Fallback data when API is unavailable
function getFallbackPosts() {
  return [
    {
      id: 1,
      title: 'The Future of Digital Signatures: Trends to Watch in 2026',
      slug: 'future-digital-signatures-2026',
      excerpt:
        'Explore the latest trends shaping the e-signature industry, from AI-powered authentication to blockchain-based verification systems.',
      content: 'Full article content here...',
      category: 'Industry Trends',
      author: 'Scrib.li Team',
      publishedAt: '2026-01-29T00:00:00Z',
      readTime: 5,
      featured: true,
      image: null,
    },
    {
      id: 2,
      title: 'How Secure Are Electronic Signatures? A Deep Dive',
      slug: 'electronic-signatures-security',
      excerpt:
        'Understanding the security measures that protect your electronically signed documents.',
      content: 'Full article content here...',
      category: 'Security',
      author: 'Security Team',
      publishedAt: '2026-01-25T00:00:00Z',
      readTime: 7,
      featured: false,
      image: null,
    },
    {
      id: 3,
      title: '5 Ways E-Signatures Transform Your Business Workflow',
      slug: 'transform-business-workflow',
      excerpt:
        'Discover how digital signatures can streamline your processes and boost productivity.',
      content: 'Full article content here...',
      category: 'Efficiency',
      author: 'Product Team',
      publishedAt: '2026-01-22T00:00:00Z',
      readTime: 4,
      featured: false,
      image: null,
    },
  ];
}

function getFallbackCategories() {
  return [
    { name: 'Security', slug: 'security', count: 12 },
    { name: 'Efficiency', slug: 'efficiency', count: 8 },
    { name: 'Integration', slug: 'integration', count: 15 },
    { name: 'Legal', slug: 'legal', count: 10 },
    { name: 'Remote Work', slug: 'remote-work', count: 6 },
    { name: 'Analytics', slug: 'analytics', count: 9 },
  ];
}

function getFallbackFeaturedPost() {
  return getFallbackPosts().find((post) => post.featured);
}

// Format date for display
function formatDate(dateString) {
  const options = { year: 'numeric', month: 'long', day: 'numeric' };
  return new Date(dateString).toLocaleDateString('en-GB', options);
}

// Render blog posts on the page
async function renderBlogPosts() {
  const postsContainer = document.getElementById('blog-posts');
  const featuredContainer = document.getElementById('featured-post');

  if (!postsContainer) return;

  try {
    // Fetch featured post
    if (featuredContainer) {
      const featuredPost = await fetchFeaturedPost();
      renderFeaturedPost(featuredPost, featuredContainer);
    }

    // Fetch recent posts
    const posts = await fetchBlogPosts();
    const recentPosts = posts.filter((post) => !post.featured).slice(0, 6);

    postsContainer.innerHTML = recentPosts
      .map(
        (post) => `
            <article class="card card-hover">
                <div class="aspect-video bg-primary-100 rounded-geometric mb-4 flex items-center justify-center">
                    ${
                      post.image
                        ? `<img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover rounded-geometric">`
                        : `<svg class="w-12 h-12 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                        </svg>`
                    }
                </div>
                <div class="flex items-center gap-4 mb-3">
                    <span class="text-sm text-primary-600 font-medium">${post.category}</span>
                    <span class="text-sm text-muted-foreground">${formatDate(post.publishedAt)}</span>
                </div>
                <h3 class="heading-sm mb-3">${post.title}</h3>
                <p class="text-muted-foreground mb-4">${post.excerpt}</p>
                <a href="blog/${post.slug}.html" class="text-primary-600 font-medium hover:text-primary-700">Read more →</a>
            </article>
        `,
      )
      .join('');
  } catch (error) {
    console.error('Error rendering blog posts:', error);
    postsContainer.innerHTML =
      '<p class="text-muted-foreground">Unable to load blog posts. Please try again later.</p>';
  }
}

// Render featured post
function renderFeaturedPost(post, container) {
  container.innerHTML = `
        <article class="card card-hover">
            <div class="grid md:grid-cols-2 gap-8">
                <div class="aspect-video bg-primary-100 rounded-geometric flex items-center justify-center">
                    ${
                      post.image
                        ? `<img src="${post.image}" alt="${post.title}" class="w-full h-full object-cover rounded-geometric">`
                        : `<svg class="w-16 h-16 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path>
                        </svg>`
                    }
                </div>
                <div>
                    <div class="flex items-center gap-4 mb-4">
                        <span class="text-sm text-primary-600 font-medium">Featured</span>
                        <span class="text-sm text-muted-foreground">${formatDate(post.publishedAt)}</span>
                        <span class="text-sm text-muted-foreground">${post.readTime} min read</span>
                    </div>
                    <h3 class="heading-md mb-4">${post.title}</h3>
                    <p class="text-muted-foreground mb-6">${post.excerpt}</p>
                    <a href="blog/${post.slug}.html" class="text-primary-600 font-medium hover:text-primary-700">Read full article →</a>
                </div>
            </div>
        </article>
    `;
}

// Render categories
async function renderCategories() {
  const categoriesContainer = document.getElementById('blog-categories');

  if (!categoriesContainer) return;

  try {
    const categories = await fetchCategories();

    categoriesContainer.innerHTML = categories
      .map(
        (category) => `
            <a href="blog/category/${category.slug}.html" class="card card-hover text-center p-6">
                <div class="w-12 h-12 bg-primary-100 rounded-geometric flex items-center justify-center mx-auto mb-3">
                    <svg class="w-6 h-6 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"></path>
                    </svg>
                </div>
                <h3 class="font-semibold">${category.name}</h3>
                <p class="text-sm text-muted-foreground mt-1">${category.count} articles</p>
            </a>
        `,
      )
      .join('');
  } catch (error) {
    console.error('Error rendering categories:', error);
  }
}

// Initialize blog functionality
document.addEventListener('DOMContentLoaded', function () {
  // Check if we're on the blog page
  if (document.body.classList.contains('blog-page')) {
    renderBlogPosts();
    renderCategories();
  }
});

// Export functions for use in other scripts
window.BlogAPI = {
  fetchBlogPosts,
  fetchCategories,
  fetchFeaturedPost,
  renderBlogPosts,
  renderCategories,
};
