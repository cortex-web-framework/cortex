/**
 * PostActor - Manages individual blog post operations
 * Handles CRUD operations (Create, Read, Update, Delete) for blog posts
 */

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  category: 'tutorial' | 'update' | 'guide';
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  published: boolean;
}

export type PostMessage =
  | { type: 'create'; post: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'> }
  | { type: 'read'; id: string }
  | { type: 'update'; id: string; post: Partial<BlogPost> }
  | { type: 'delete'; id: string }
  | { type: 'list' }
  | { type: 'publish'; id: string }
  | { type: 'unpublish'; id: string };

export interface PostResponse {
  success: boolean;
  data?: BlogPost | BlogPost[] | null;
  error?: string;
  message?: string;
}

export class PostActor {
  private posts: Map<string, BlogPost> = new Map();
  private idCounter: number = 1;

  /**
   * Handle incoming messages for post operations
   */
  async handle(message: PostMessage): Promise<PostResponse> {
    try {
      switch (message.type) {
        case 'create':
          return this.createPost(message.post);
        case 'read':
          return this.readPost(message.id);
        case 'update':
          return this.updatePost(message.id, message.post);
        case 'delete':
          return this.deletePost(message.id);
        case 'list':
          return this.listPosts();
        case 'publish':
          return this.publishPost(message.id);
        case 'unpublish':
          return this.unpublishPost(message.id);
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
   * Create a new blog post
   */
  private createPost(postData: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt'>): PostResponse {
    const id = `post-${this.idCounter++}`;
    const now = new Date();

    const post: BlogPost = {
      ...postData,
      id,
      createdAt: now,
      updatedAt: now,
    };

    this.posts.set(id, post);

    return {
      success: true,
      data: post,
      message: `Post "${post.title}" created successfully`,
    };
  }

  /**
   * Read a single blog post
   */
  private readPost(id: string): PostResponse {
    const post = this.posts.get(id);

    if (!post) {
      return {
        success: false,
        error: `Post with id "${id}" not found`,
      };
    }

    return {
      success: true,
      data: post,
    };
  }

  /**
   * Update a blog post
   */
  private updatePost(id: string, updates: Partial<BlogPost>): PostResponse {
    const post = this.posts.get(id);

    if (!post) {
      return {
        success: false,
        error: `Post with id "${id}" not found`,
      };
    }

    const updatedPost: BlogPost = {
      ...post,
      ...updates,
      id: post.id, // Prevent ID changes
      createdAt: post.createdAt, // Prevent creation date changes
      updatedAt: new Date(),
    };

    this.posts.set(id, updatedPost);

    return {
      success: true,
      data: updatedPost,
      message: `Post "${updatedPost.title}" updated successfully`,
    };
  }

  /**
   * Delete a blog post
   */
  private deletePost(id: string): PostResponse {
    const post = this.posts.get(id);

    if (!post) {
      return {
        success: false,
        error: `Post with id "${id}" not found`,
      };
    }

    this.posts.delete(id);

    return {
      success: true,
      data: post,
      message: `Post "${post.title}" deleted successfully`,
    };
  }

  /**
   * List all blog posts
   */
  private listPosts(): PostResponse {
    const posts = Array.from(this.posts.values());

    return {
      success: true,
      data: posts,
      message: `Found ${posts.length} posts`,
    };
  }

  /**
   * Publish a blog post
   */
  private publishPost(id: string): PostResponse {
    const post = this.posts.get(id);

    if (!post) {
      return {
        success: false,
        error: `Post with id "${id}" not found`,
      };
    }

    const updatedPost = { ...post, published: true, updatedAt: new Date() };
    this.posts.set(id, updatedPost);

    return {
      success: true,
      data: updatedPost,
      message: `Post "${updatedPost.title}" published`,
    };
  }

  /**
   * Unpublish a blog post
   */
  private unpublishPost(id: string): PostResponse {
    const post = this.posts.get(id);

    if (!post) {
      return {
        success: false,
        error: `Post with id "${id}" not found`,
      };
    }

    const updatedPost = { ...post, published: false, updatedAt: new Date() };
    this.posts.set(id, updatedPost);

    return {
      success: true,
      data: updatedPost,
      message: `Post "${updatedPost.title}" unpublished`,
    };
  }

  /**
   * Get all published posts
   */
  getPublishedPosts(): BlogPost[] {
    return Array.from(this.posts.values()).filter(post => post.published);
  }

  /**
   * Get posts by category
   */
  getPostsByCategory(category: string): BlogPost[] {
    return Array.from(this.posts.values()).filter(
      post => post.category === category && post.published
    );
  }

  /**
   * Search posts by text
   */
  searchPosts(query: string): BlogPost[] {
    const lowerQuery = query.toLowerCase();
    return Array.from(this.posts.values()).filter(
      post =>
        post.published &&
        (post.title.toLowerCase().includes(lowerQuery) ||
          post.excerpt.toLowerCase().includes(lowerQuery) ||
          post.content.toLowerCase().includes(lowerQuery))
    );
  }
}
