/**
 * Plugin Marketplace Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

import type { 
  PluginMarketplace, 
  PluginListing, 
  InstalledPlugin,
  PluginVersion,
  SearchFilters,
  Category,
  PluginReview,
  InstallResult,
  UpdateResult,
  GitHubInstallResult
} from './types.js';
import { CortexGitHubInstaller } from './githubInstaller.js';

/**
 * Plugin Marketplace Implementation
 */
export class CortexPluginMarketplace implements PluginMarketplace {
  private readonly plugins = new Map<string, PluginListing>();
  private readonly installedPlugins = new Map<string, InstalledPlugin>();
  private readonly categories = new Map<string, Category>();
  private readonly reviews = new Map<string, PluginReview[]>();
  public readonly githubInstaller: CortexGitHubInstaller;

  constructor() {
    this.githubInstaller = new CortexGitHubInstaller();
    this.initializeDefaultData();
  }

  /**
   * Search for plugins with optional filters
   */
  async searchPlugins(query: string, filters?: SearchFilters): Promise<readonly PluginListing[]> {
    let results = Array.from(this.plugins.values());

    // Apply text search
    if (query) {
      const searchTerms = query.toLowerCase().split(' ');
      results = results.filter(plugin => 
        searchTerms.every(term => 
          plugin.name.toLowerCase().includes(term) ||
          plugin.description.toLowerCase().includes(term) ||
          plugin.tags.some(tag => tag.toLowerCase().includes(term))
        )
      );
    }

    // Apply filters
    if (filters) {
      if (filters.category) {
        results = results.filter(plugin => plugin.categories.includes(filters.category!));
      }
      if (filters.tags && filters.tags.length > 0) {
        results = results.filter(plugin => 
          filters.tags!.some(tag => plugin.tags.includes(tag))
        );
      }
      if (filters.minRating !== undefined) {
        results = results.filter(plugin => plugin.rating >= filters.minRating!);
      }
      if (filters.maxRating !== undefined) {
        results = results.filter(plugin => plugin.rating <= filters.maxRating!);
      }
      if (filters.minDownloads !== undefined) {
        results = results.filter(plugin => plugin.downloads >= filters.minDownloads!);
      }
      if (filters.maxDownloads !== undefined) {
        results = results.filter(plugin => plugin.downloads <= filters.maxDownloads!);
      }
      if (filters.isVerified !== undefined) {
        results = results.filter(plugin => plugin.isVerified === filters.isVerified!);
      }
      if (filters.isInstalled !== undefined) {
        results = results.filter(plugin => plugin.isInstalled === filters.isInstalled!);
      }
      if (filters.license) {
        results = results.filter(plugin => plugin.license === filters.license!);
      }
      if (filters.author) {
        results = results.filter(plugin => plugin.author === filters.author!);
      }

      // Apply sorting
      if (filters.sortBy) {
        results.sort((a, b) => {
          let comparison = 0;
          switch (filters.sortBy) {
            case 'name':
              comparison = a.name.localeCompare(b.name);
              break;
            case 'rating':
              comparison = a.rating - b.rating;
              break;
            case 'downloads':
              comparison = a.downloads - b.downloads;
              break;
            case 'updated':
              comparison = a.lastUpdated.getTime() - b.lastUpdated.getTime();
              break;
            case 'created':
              comparison = a.createdAt.getTime() - b.createdAt.getTime();
              break;
          }
          return filters.sortOrder === 'desc' ? -comparison : comparison;
        });
      }

      // Apply pagination
      if (filters.offset) {
        results = results.slice(filters.offset);
      }
      if (filters.limit) {
        results = results.slice(0, filters.limit);
      }
    }

    return results;
  }

  /**
   * Get a specific plugin by ID
   */
  async getPlugin(id: string): Promise<PluginListing | null> {
    return this.plugins.get(id) || null;
  }

  /**
   * Install a plugin
   */
  async installPlugin(id: string, version?: string): Promise<InstallResult> {
    const plugin = this.plugins.get(id);
    if (!plugin) {
      return {
        success: false,
        pluginId: id,
        version: version || 'unknown',
        installedAt: new Date(),
        errors: ['Plugin not found']
      };
    }

    const installVersion = version || plugin.version;
    const installedPlugin: InstalledPlugin = {
      id: plugin.id,
      name: plugin.name,
      version: installVersion,
      installedAt: new Date(),
      lastUsed: new Date(),
      isEnabled: true,
      updateAvailable: installVersion !== plugin.version,
      latestVersion: plugin.version
    };

    this.installedPlugins.set(id, installedPlugin);
    
    // Update plugin listing
    const updatedPlugin = { ...plugin, isInstalled: true };
    this.plugins.set(id, updatedPlugin);

    return {
      success: true,
      pluginId: id,
      version: installVersion,
      installedAt: new Date()
    };
  }

  /**
   * Uninstall a plugin
   */
  async uninstallPlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (plugin) {
      const updatedPlugin = { ...plugin, isInstalled: false };
      this.plugins.set(id, updatedPlugin);
    }
    return this.installedPlugins.delete(id);
  }

  /**
   * Get all installed plugins
   */
  getInstalledPlugins(): readonly InstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  /**
   * Update a plugin to the latest version
   */
  async updatePlugin(id: string): Promise<UpdateResult> {
    const installed = this.installedPlugins.get(id);
    const plugin = this.plugins.get(id);
    
    if (!installed || !plugin) {
      return {
        success: false,
        pluginId: id,
        fromVersion: 'unknown',
        toVersion: 'unknown',
        updatedAt: new Date(),
        errors: ['Plugin not found or not installed']
      };
    }

    const fromVersion = installed.version;
    const toVersion = plugin.version;

    const updatedInstalled = {
      ...installed,
      version: toVersion,
      updateAvailable: false,
      lastUsed: new Date()
    };
    this.installedPlugins.set(id, updatedInstalled);

    return {
      success: true,
      pluginId: id,
      fromVersion,
      toVersion,
      updatedAt: new Date()
    };
  }

  /**
   * Get available versions for a plugin
   */
  async getPluginVersions(_id: string): Promise<readonly PluginVersion[]> {
    // In a real implementation, this would fetch from a remote API
    // For now, return mock data
    return [
      {
        version: '1.0.0',
        releaseDate: new Date('2024-01-01'),
        changelog: 'Initial release',
        isStable: true,
        isPrerelease: false,
        downloadCount: 1000
      },
      {
        version: '1.1.0',
        releaseDate: new Date('2024-01-15'),
        changelog: 'Added new features',
        isStable: true,
        isPrerelease: false,
        downloadCount: 500
      },
      {
        version: '2.0.0-beta',
        releaseDate: new Date('2024-02-01'),
        changelog: 'Major rewrite',
        isStable: false,
        isPrerelease: true,
        downloadCount: 100
      }
    ];
  }

  /**
   * Get popular plugins
   */
  async getPopularPlugins(limit = 10): Promise<readonly PluginListing[]> {
    const results = Array.from(this.plugins.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
    return results;
  }

  /**
   * Get recently updated plugins
   */
  async getRecentPlugins(limit = 10): Promise<readonly PluginListing[]> {
    const results = Array.from(this.plugins.values())
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, limit);
    return results;
  }

  /**
   * Get all plugin categories
   */
  async getPluginCategories(): Promise<readonly Category[]> {
    return Array.from(this.categories.values());
  }

  /**
   * Get plugins by category
   */
  async getPluginsByCategory(category: string): Promise<readonly PluginListing[]> {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.categories.includes(category));
  }

  /**
   * Rate a plugin
   */
  async ratePlugin(id: string, rating: number, review?: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;

    // Clamp rating to valid range
    const clampedRating = Math.max(1, Math.min(5, rating));

    // Update plugin rating (simplified calculation)
    const currentRating = plugin.rating;
    const currentCount = plugin.reviewCount;
    const newRating = ((currentRating * currentCount) + clampedRating) / (currentCount + 1);
    
    const updatedPlugin = {
      ...plugin,
      rating: Math.round(newRating * 10) / 10,
      reviewCount: plugin.reviewCount + 1
    };
    this.plugins.set(id, updatedPlugin);

    // Add review if provided
    if (review) {
      const pluginReviews = this.reviews.get(id) || [];
      const newReview: PluginReview = {
        id: `review-${Date.now()}`,
        pluginId: id,
        author: 'Current User',
        rating: clampedRating,
        title: review.substring(0, 50),
        content: review,
        createdAt: new Date(),
        isVerified: false,
        helpful: 0,
        notHelpful: 0
      };
      pluginReviews.push(newReview);
      this.reviews.set(id, pluginReviews);
    }

    return true;
  }

  /**
   * Get plugin reviews
   */
  async getPluginReviews(id: string): Promise<readonly PluginReview[]> {
    return this.reviews.get(id) || [];
  }

  /**
   * Report a plugin
   */
  async reportPlugin(id: string, reason: string, description?: string): Promise<boolean> {
    // In a real implementation, this would send to a moderation system
    console.log(`Plugin ${id} reported: ${reason} - ${description || 'No description'}`);
    return true;
  }

  /**
   * Install plugin from GitHub repository
   */
  async installFromGitHub(repository: string, version?: string): Promise<GitHubInstallResult> {
    return this.githubInstaller.installFromRepository(repository, version);
  }

  /**
   * Validate GitHub repository
   */
  async validateGitHubRepository(repository: string) {
    return this.githubInstaller.validateRepository(repository);
  }

  /**
   * Get GitHub repository information
   */
  async getGitHubRepositoryInfo(repository: string) {
    return this.githubInstaller.getRepositoryInfo(repository);
  }

  /**
   * Get GitHub repository releases
   */
  async getGitHubReleases(repository: string) {
    return this.githubInstaller.getRepositoryReleases(repository);
  }

  /**
   * Get GitHub repository tags
   */
  async getGitHubTags(repository: string) {
    return this.githubInstaller.getRepositoryTags(repository);
  }

  /**
   * Get plugins installed from GitHub
   */
  getGitHubInstalledPlugins() {
    return this.githubInstaller.getInstalledFromGitHub();
  }

  /**
   * Update plugin from GitHub
   */
  async updateFromGitHub(pluginId: string) {
    return this.githubInstaller.updateFromGitHub(pluginId);
  }

  /**
   * Uninstall plugin from GitHub
   */
  async uninstallFromGitHub(pluginId: string) {
    return this.githubInstaller.uninstallFromGitHub(pluginId);
  }

  /**
   * Initialize default marketplace data
   */
  private initializeDefaultData(): void {
    // Initialize categories
    this.categories.set('development', {
      id: 'development',
      name: 'Development',
      description: 'Tools for software development',
      pluginCount: 0,
      icon: 'code'
    });
    this.categories.set('productivity', {
      id: 'productivity',
      name: 'Productivity',
      description: 'Tools to improve productivity',
      pluginCount: 0,
      icon: 'zap'
    });
    this.categories.set('utilities', {
      id: 'utilities',
      name: 'Utilities',
      description: 'General utility tools',
      pluginCount: 0,
      icon: 'wrench'
    });
    this.categories.set('security', {
      id: 'security',
      name: 'Security',
      description: 'Security and privacy tools',
      pluginCount: 0,
      icon: 'shield'
    });
    this.categories.set('templates', {
      id: 'templates',
      name: 'Templates',
      description: 'Project templates and scaffolding',
      pluginCount: 0,
      icon: 'file-template'
    });

    // Initialize some default plugins
    const defaultPlugins: PluginListing[] = [
      {
        id: 'typescript-support',
        name: 'TypeScript Support',
        description: 'Enhanced TypeScript support for Cortex CLI with advanced type checking and IntelliSense',
        version: '1.2.0',
        author: 'Cortex Team',
        downloads: 15000,
        rating: 4.8,
        reviewCount: 234,
        lastUpdated: new Date('2024-01-20'),
        createdAt: new Date('2024-01-01'),
        categories: ['development'],
        tags: ['typescript', 'language', 'support', 'intellisense'],
        license: 'MIT',
        homepage: 'https://cortex.dev/plugins/typescript',
        repository: 'https://github.com/cortex/typescript-plugin',
        documentation: 'https://docs.cortex.dev/plugins/typescript',
        isInstalled: false,
        isVerified: true,
        securityScore: 95,
        size: 2048000,
        dependencies: ['@types/node']
      },
      {
        id: 'code-formatter',
        name: 'Code Formatter',
        description: 'Automatic code formatting for multiple languages with customizable rules',
        version: '2.1.0',
        author: 'CodeMaster',
        downloads: 12000,
        rating: 4.6,
        reviewCount: 189,
        lastUpdated: new Date('2024-01-18'),
        createdAt: new Date('2024-01-05'),
        categories: ['development', 'productivity'],
        tags: ['formatting', 'code', 'prettier', 'eslint'],
        license: 'Apache-2.0',
        isInstalled: false,
        isVerified: true,
        securityScore: 92,
        size: 1536000,
        dependencies: ['prettier', 'eslint']
      },
      {
        id: 'file-manager',
        name: 'Advanced File Manager',
        description: 'Enhanced file management capabilities with batch operations and advanced search',
        version: '1.0.5',
        author: 'FileGuru',
        downloads: 8500,
        rating: 4.3,
        reviewCount: 156,
        lastUpdated: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
        categories: ['utilities'],
        tags: ['files', 'management', 'explorer', 'search'],
        license: 'GPL-3.0',
        isInstalled: false,
        isVerified: false,
        securityScore: 78,
        size: 1024000,
        dependencies: []
      },
      {
        id: 'security-scanner',
        name: 'Security Scanner',
        description: 'Comprehensive security scanning for vulnerabilities and compliance checks',
        version: '1.5.2',
        author: 'SecurityPro',
        downloads: 6200,
        rating: 4.7,
        reviewCount: 98,
        lastUpdated: new Date('2024-01-12'),
        createdAt: new Date('2024-01-08'),
        categories: ['security'],
        tags: ['security', 'vulnerability', 'scanning', 'compliance'],
        license: 'MIT',
        isInstalled: false,
        isVerified: true,
        securityScore: 98,
        size: 3072000,
        dependencies: ['@types/node', 'crypto']
      },
      {
        id: 'react-template',
        name: 'React Project Template',
        description: 'Complete React project template with TypeScript, testing, and modern tooling',
        version: '3.0.1',
        author: 'ReactExpert',
        downloads: 9800,
        rating: 4.9,
        reviewCount: 312,
        lastUpdated: new Date('2024-01-19'),
        createdAt: new Date('2024-01-03'),
        categories: ['templates', 'development'],
        tags: ['react', 'template', 'typescript', 'testing', 'webpack'],
        license: 'MIT',
        isInstalled: false,
        isVerified: true,
        securityScore: 96,
        size: 5120000,
        dependencies: ['react', 'typescript', 'webpack']
      }
    ];

    for (const plugin of defaultPlugins) {
      this.plugins.set(plugin.id, plugin);
    }

    // Update category counts
    for (const plugin of defaultPlugins) {
      for (const categoryId of plugin.categories) {
        const category = this.categories.get(categoryId);
        if (category) {
          const updatedCategory = { ...category, pluginCount: category.pluginCount + 1 };
          this.categories.set(categoryId, updatedCategory);
        }
      }
    }
  }
}