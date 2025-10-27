/**
 * PersistentBlogServiceActor - Blog service with file-based persistence
 * Implements the same interface as BlogServiceActor but with file-based persistence
 */

import { BlogQuery, BlogServiceMessage, BlogServiceResponse } from './blogServiceActor.js';
import { FileStorage } from '../storage/fileStorage.js';
import { BlogPost } from './postActor.js';

export class PersistentBlogServiceActor {
  private collectionName = 'blog-posts';
  private persistedPosts: Map<string, BlogPost> = new Map();
  private postIdCounter: number = 1;

  constructor() {
    this.loadFromStorage();
  }

  /**
   * Load posts from file storage
   */
  private loadFromStorage(): void {
    const posts = FileStorage.read<BlogPost>(this.collectionName);
    if (posts.length > 0) {
      posts.forEach(post => {
        this.persistedPosts.set(post.id, post);
        // Update counter to avoid ID conflicts
        const idNum = parseInt(post.id.replace('post-', ''), 10);
        if (idNum >= this.postIdCounter) {
          this.postIdCounter = idNum + 1;
        }
      });
      console.log(`Loaded ${posts.length} posts from storage`);
    } else {
      // Initialize with sample data if no persisted data exists
      this.loadSampleData();
    }
  }

  /**
   * Save posts to file storage
   */
  private saveToStorage(): void {
    const posts = Array.from(this.persistedPosts.values());
    FileStorage.write(this.collectionName, posts);
  }

  /**
   * Load sample data and persist it
   */
  private loadSampleData(): void {
    // Create sample posts directly
    const samplePosts: BlogPost[] = [
      {
        id: 'post-1',
        title: 'Getting Started with Cortex',
        excerpt: 'Learn the basics of building your first application with Cortex.',
        content: 'Full article content about getting started...',
        author: 'Team Cortex',
        category: 'tutorial',
        tags: ['beginner', 'tutorial', 'setup'],
        published: true,
        createdAt: new Date('2024-10-27'),
        updatedAt: new Date('2024-10-27'),
      },
      {
        id: 'post-2',
        title: 'Building Resilient Systems',
        excerpt: 'Explore patterns for building fault-tolerant systems using Cortex.',
        content: 'Full article about resilience patterns...',
        author: 'Team Cortex',
        category: 'guide',
        tags: ['advanced', 'resilience', 'patterns'],
        published: true,
        createdAt: new Date('2024-10-20'),
        updatedAt: new Date('2024-10-20'),
      },
      {
        id: 'post-3',
        title: 'Cortex v1.0.0 Released',
        excerpt: 'We are excited to announce the release of Cortex v1.0.0!',
        content: 'Release notes and features...',
        author: 'Team Cortex',
        category: 'update',
        tags: ['release', 'announcement'],
        published: true,
        createdAt: new Date('2024-10-15'),
        updatedAt: new Date('2024-10-15'),
      },
      {
        id: 'post-4',
        title: 'Actor Model Explained',
        excerpt: 'A deep dive into the actor model and how it enables concurrent systems.',
        content: 'Detailed explanation of the actor model...',
        author: 'Contributors',
        category: 'guide',
        tags: ['architecture', 'concepts'],
        published: true,
        createdAt: new Date('2024-10-10'),
        updatedAt: new Date('2024-10-10'),
      },
    ];

    samplePosts.forEach(post => {
      this.persistedPosts.set(post.id, post);
    });

    this.saveToStorage();
    console.log('Initialized and persisted sample blog posts');
  }

  /**
   * Override handle to use persisted posts
   */
  async handle(message: BlogServiceMessage): Promise<BlogServiceResponse> {
    try {
      switch (message.type) {
        case 'search':
          return this.searchPosts(message.query);
        case 'featured':
          return this.getFeaturedPosts(message.count);
        case 'latest':
          return this.getLatestPosts(message.count);
        case 'categories':
          return this.getCategories();
        case 'trending':
          return this.getTrendingPosts(message.count);
        case 'init-sample-data':
          return { success: true, message: 'Sample data already initialized' };
        default:
          return {
            success: false,
            error: 'Unknown message type',
          };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }

  /**
   * Add a new post and persist it
   */
  public addPost(post: BlogPost): void {
    this.persistedPosts.set(post.id, post);
    this.saveToStorage();
  }

  /**
   * Update a post and persist it
   */
  public updatePost(id: string, updates: Partial<BlogPost>): BlogPost | null {
    const post = this.persistedPosts.get(id);
    if (!post) {
      return null;
    }

    const updated = { ...post, ...updates, id: post.id, createdAt: post.createdAt };
    this.persistedPosts.set(id, updated);
    this.saveToStorage();
    return updated;
  }

  /**
   * Delete a post and persist it
   */
  public deletePost(id: string): boolean {
    const existed = this.persistedPosts.has(id);
    this.persistedPosts.delete(id);
    if (existed) {
      this.saveToStorage();
    }
    return existed;
  }

  /**
   * Search posts using persisted data
   */
  private searchPosts(query: BlogQuery): BlogServiceResponse {
    let results = Array.from(this.persistedPosts.values());

    // Text search
    if (query.search) {
      const lowerQuery = query.search.toLowerCase();
      results = results.filter(
        post =>
          post.title.toLowerCase().includes(lowerQuery) ||
          post.excerpt.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery)
      );
    }

    // Category filter
    if (query.category && query.category !== 'all') {
      results = results.filter(post => post.category === query.category);
    }

    // Tag filter
    if (query.tag) {
      results = results.filter(post => post.tags.includes(query.tag!));
    }

    // Only published posts
    results = results.filter(post => post.published);

    // Sorting
    const sortBy = query.sortBy || 'date';
    const sortOrder = query.sortOrder || 'desc';

    results.sort((a, b) => {
      let compareValue = 0;
      switch (sortBy) {
        case 'date':
          compareValue = a.createdAt.getTime() - b.createdAt.getTime();
          break;
        case 'title':
          compareValue = a.title.localeCompare(b.title);
          break;
        case 'author':
          compareValue = a.author.localeCompare(b.author);
          break;
      }
      return sortOrder === 'desc' ? -compareValue : compareValue;
    });

    // Pagination
    const offset = query.offset || 0;
    const limit = query.limit || 10;
    const paginatedResults = results.slice(offset, offset + limit);

    return {
      success: true,
      data: paginatedResults,
      metadata: {
        total: results.length,
        limit,
        offset,
      },
    };
  }

  /**
   * Get featured posts from persisted data
   */
  private getFeaturedPosts(count: number): BlogServiceResponse {
    const posts = Array.from(this.persistedPosts.values())
      .filter(p => p.published)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, count);

    return {
      success: true,
      data: posts,
      metadata: { total: posts.length },
    };
  }

  /**
   * Get latest posts from persisted data
   */
  private getLatestPosts(count: number): BlogServiceResponse {
    const posts = Array.from(this.persistedPosts.values())
      .filter(p => p.published)
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, count);

    return {
      success: true,
      data: posts,
      metadata: { total: posts.length },
    };
  }

  /**
   * Get categories from persisted data
   */
  private getCategories(): BlogServiceResponse {
    const posts = Array.from(this.persistedPosts.values()).filter(p => p.published);
    const categories: { [key: string]: number } = {
      tutorial: 0,
      update: 0,
      guide: 0,
    };

    posts.forEach(post => {
      categories[post.category]++;
    });

    return {
      success: true,
      data: Object.keys(categories),
      metadata: { total: Object.keys(categories).length, categories },
    };
  }

  /**
   * Get trending posts from persisted data
   */
  private getTrendingPosts(count: number): BlogServiceResponse {
    const posts = Array.from(this.persistedPosts.values())
      .filter(p => p.published)
      .sort((a, b) => {
        const aScore = Math.max(a.createdAt.getTime(), a.updatedAt.getTime());
        const bScore = Math.max(b.createdAt.getTime(), b.updatedAt.getTime());
        return bScore - aScore;
      })
      .slice(0, count);

    return {
      success: true,
      data: posts,
      metadata: { total: posts.length },
    };
  }
}
