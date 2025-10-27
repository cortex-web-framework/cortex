/**
 * FeatureActor - Manages homepage features
 * Provides feature data for the homepage showcase
 */

export interface Feature {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  highlights?: string[];
}

export type FeatureMessage =
  | { type: 'get-features'; category?: string }
  | { type: 'add-feature'; feature: Omit<Feature, 'id'> }
  | { type: 'get-feature'; id: string }
  | { type: 'list-categories' };

export interface FeatureResponse {
  success: boolean;
  data?: Feature | Feature[] | string[];
  metadata?: {
    total: number;
    categories?: { [key: string]: number };
  };
  error?: string;
  message?: string;
}

export class FeatureActor {
  private features: Map<string, Feature> = new Map();
  private idCounter: number = 1;

  constructor() {
    this.initializeDefaultFeatures();
  }

  /**
   * Initialize with default features
   */
  private initializeDefaultFeatures(): void {
    const defaultFeatures = [
      {
        title: 'Actor Model',
        description: 'Leverage the power of the actor model for concurrent, isolated, and fault-tolerant systems.',
        icon: '⚡',
        category: 'core',
        highlights: ['Message-driven', 'Isolated state', 'Concurrent execution'],
      },
      {
        title: 'Event-Driven',
        description: 'Build event-driven architectures with our integrated EventBus for loose coupling and high scalability.',
        icon: '📡',
        category: 'core',
        highlights: ['Pub/Sub pattern', 'Loosely coupled', 'Highly scalable'],
      },
      {
        title: 'Observability',
        description: 'Monitor and trace your distributed systems with built-in metrics, logging, and health checks.',
        icon: '🔍',
        category: 'features',
        highlights: ['Metrics collection', 'Distributed tracing', 'Health checks'],
      },
      {
        title: 'Resilience',
        description: 'Circuit breakers, rate limiters, and retry mechanisms for building robust, fault-tolerant applications.',
        icon: '🛡️',
        category: 'features',
        highlights: ['Circuit breaker', 'Rate limiting', 'Retry logic'],
      },
      {
        title: 'Security',
        description: 'Built-in security features and patterns to protect your applications and data.',
        icon: '🔐',
        category: 'features',
        highlights: ['Authentication', 'Authorization', 'Data protection'],
      },
      {
        title: 'Zero Dependencies',
        description: 'Core framework components have zero external dependencies, ensuring simplicity and reliability.',
        icon: '📦',
        category: 'core',
        highlights: ['Pure TypeScript', 'No bloat', 'Maximum reliability'],
      },
    ];

    defaultFeatures.forEach(feature => {
      const id = `feature-${this.idCounter++}`;
      this.features.set(id, { ...feature, id });
    });
  }

  /**
   * Handle incoming messages
   */
  async handle(message: FeatureMessage): Promise<FeatureResponse> {
    try {
      switch (message.type) {
        case 'get-features':
          return this.getFeatures(message.category);
        case 'add-feature':
          return this.addFeature(message.feature);
        case 'get-feature':
          return this.getFeature(message.id);
        case 'list-categories':
          return this.listCategories();
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
   * Get all features, optionally filtered by category
   */
  private getFeatures(category?: string): FeatureResponse {
    let features = Array.from(this.features.values());

    if (category) {
      features = features.filter(f => f.category === category);
    }

    return {
      success: true,
      data: features,
      metadata: {
        total: features.length,
      },
    };
  }

  /**
   * Add a new feature
   */
  private addFeature(featureData: Omit<Feature, 'id'>): FeatureResponse {
    const id = `feature-${this.idCounter++}`;
    const feature: Feature = { ...featureData, id };

    this.features.set(id, feature);

    return {
      success: true,
      data: feature,
      message: `Feature "${feature.title}" added successfully`,
    };
  }

  /**
   * Get a specific feature
   */
  private getFeature(id: string): FeatureResponse {
    const feature = this.features.get(id);

    if (!feature) {
      return {
        success: false,
        error: `Feature with id "${id}" not found`,
      };
    }

    return {
      success: true,
      data: feature,
    };
  }

  /**
   * List all categories with counts
   */
  private listCategories(): FeatureResponse {
    const categories: { [key: string]: number } = {};

    this.features.forEach(feature => {
      categories[feature.category] = (categories[feature.category] || 0) + 1;
    });

    return {
      success: true,
      data: Object.keys(categories),
      metadata: {
        total: Object.keys(categories).length,
        categories,
      },
    };
  }
}
