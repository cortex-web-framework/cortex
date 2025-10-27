/**
 * API Client for Cortex Website
 * Handles all communication with the backend REST APIs
 */

class APIClient {
  constructor(baseURL = '') {
    this.baseURL = baseURL || '';
  }

  /**
   * Make a GET request
   */
  async get(endpoint) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }

  /**
   * Make a POST request
   */
  async post(endpoint, data) {
    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`API Error: ${error.message}`);
      throw error;
    }
  }

  // Blog API Methods

  /**
   * Get all published blog posts
   */
  async getBlogPosts(limit = 10, offset = 0) {
    return this.get(`/api/blog/posts?limit=${limit}&offset=${offset}`);
  }

  /**
   * Search blog posts
   */
  async searchBlogPosts(query, category = 'all', limit = 10, offset = 0) {
    const params = new URLSearchParams({
      q: query,
      category,
      limit,
      offset,
    });
    return this.get(`/api/blog/search?${params}`);
  }

  /**
   * Get blog categories
   */
  async getBlogCategories() {
    return this.get('/api/blog/categories');
  }

  /**
   * Get featured posts
   */
  async getFeaturedPosts(count = 5) {
    return this.get(`/api/blog/featured?count=${count}`);
  }

  // Features API Methods

  /**
   * Get homepage features
   */
  async getFeatures() {
    return this.get('/api/features');
  }

  // Examples API Methods

  /**
   * Get code examples
   */
  async getExamples() {
    return this.get('/api/examples');
  }

  /**
   * Run a code example
   */
  async runExample(exampleId, code) {
    return this.post('/api/examples/run', {
      exampleId,
      code,
    });
  }

  // Status API Method

  /**
   * Check API status
   */
  async getStatus() {
    return this.get('/api/status');
  }
}

// Create global client instance
window.apiClient = new APIClient();
