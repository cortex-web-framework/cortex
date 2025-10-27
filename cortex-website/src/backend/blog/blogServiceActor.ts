/**
 * BlogServiceActor - High-level blog service management
 * Handles searching, filtering, and aggregating blog posts
 * Uses PostActor for individual post operations
 */

import { PostActor, BlogPost } from './postActor.js';

export interface BlogQuery {
  search?: string;
  category?: 'tutorial' | 'update' | 'guide' | 'all';
  tag?: string;
  limit?: number;
  offset?: number;
  sortBy?: 'date' | 'title' | 'author';
  sortOrder?: 'asc' | 'desc';
}

export type BlogServiceMessage =
  | { type: 'search'; query: BlogQuery }
  | { type: 'featured'; count: number }
  | { type: 'latest'; count: number }
  | { type: 'categories' }
  | { type: 'trending'; count: number }
  | { type: 'init-sample-data' };

export interface BlogServiceResponse {
  success: boolean;
  data?: BlogPost[] | string[];
  metadata?: {
    total: number;
    limit?: number;
    offset?: number;
    categories?: { [key: string]: number };
  };
  error?: string;
  message?: string;
}

export class BlogServiceActor {
  private postActor: PostActor;

  constructor() {
    this.postActor = new PostActor();
  }

  /**
   * Handle incoming messages
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
          return this.initializeSampleData();
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
   * Search posts with filtering and sorting
   */
  private searchPosts(query: BlogQuery): BlogServiceResponse {
    let results = this.postActor.getPublishedPosts();

    // Text search
    if (query.search) {
      results = this.postActor.searchPosts(query.search);
    }

    // Category filter
    if (query.category && query.category !== 'all') {
      results = results.filter(post => post.category === query.category);
    }

    // Tag filter
    if (query.tag) {
      results = results.filter(post => post.tags.includes(query.tag!));
    }

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
   * Get featured (most recent) posts
   */
  private getFeaturedPosts(count: number): BlogServiceResponse {
    const posts = this.postActor.getPublishedPosts();
    const featured = posts
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, count);

    return {
      success: true,
      data: featured,
      metadata: { total: featured.length },
    };
  }

  /**
   * Get latest posts
   */
  private getLatestPosts(count: number): BlogServiceResponse {
    const posts = this.postActor.getPublishedPosts();
    const latest = posts
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime())
      .slice(0, count);

    return {
      success: true,
      data: latest,
      metadata: { total: latest.length },
    };
  }

  /**
   * Get list of categories with post counts
   */
  private getCategories(): BlogServiceResponse {
    const posts = this.postActor.getPublishedPosts();
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
   * Get trending posts (by a simple heuristic: recently updated published posts)
   */
  private getTrendingPosts(count: number): BlogServiceResponse {
    const posts = this.postActor.getPublishedPosts();
    const trending = posts
      .sort((a, b) => {
        const aScore = Math.max(
          a.createdAt.getTime(),
          a.updatedAt.getTime()
        );
        const bScore = Math.max(
          b.createdAt.getTime(),
          b.updatedAt.getTime()
        );
        return bScore - aScore;
      })
      .slice(0, count);

    return {
      success: true,
      data: trending,
      metadata: { total: trending.length },
    };
  }

  /**
   * Initialize with sample blog data
   */
  private initializeSampleData(): BlogServiceResponse {
    const samplePosts = [
      {
        type: 'create' as const,
        post: {
          title: 'Getting Started with Cortex',
          excerpt: 'Learn the basics of building your first application with Cortex.',
          content: 'Full article content about getting started...',
          author: 'Team Cortex',
          category: 'tutorial' as const,
          tags: ['beginner', 'tutorial', 'setup'],
          published: true,
        },
      },
      {
        type: 'create' as const,
        post: {
          title: 'Building Resilient Systems',
          excerpt: 'Explore patterns for building fault-tolerant systems using Cortex.',
          content: 'Full article about resilience patterns...',
          author: 'Team Cortex',
          category: 'guide' as const,
          tags: ['advanced', 'resilience', 'patterns'],
          published: true,
        },
      },
      {
        type: 'create' as const,
        post: {
          title: 'Cortex v1.0.0 Released',
          excerpt: 'We are excited to announce the release of Cortex v1.0.0!',
          content: 'Release notes and features...',
          author: 'Team Cortex',
          category: 'update' as const,
          tags: ['release', 'announcement'],
          published: true,
        },
      },
      {
        type: 'create' as const,
        post: {
          title: 'Actor Model Explained',
          excerpt: 'A deep dive into the actor model and how it enables concurrent systems.',
          content: 'Detailed explanation of the actor model...',
          author: 'Contributors',
          category: 'guide' as const,
          tags: ['architecture', 'concepts'],
          published: true,
        },
      },
    ];

    samplePosts.forEach(samplePost => {
      this.postActor.handle(samplePost);
    });

    return {
      success: true,
      message: 'Sample blog posts initialized',
    };
  }
}
