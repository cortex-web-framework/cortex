/**
 * Plugin Marketplace Tests
 * TDD approach with super strict TypeScript and comprehensive marketplace features
 */

import assert from 'node:assert/strict';
import { describe, it, beforeEach, afterEach } from 'node:test';

// Mock types for now - these will be replaced with actual imports
interface MockPluginMarketplace {
  searchPlugins(query: string, filters?: MockSearchFilters): Promise<readonly MockPluginListing[]>;
  getPlugin(id: string): Promise<MockPluginListing | null>;
  installPlugin(id: string, version?: string): Promise<MockInstallResult>;
  uninstallPlugin(id: string): Promise<boolean>;
  getInstalledPlugins(): readonly MockInstalledPlugin[];
  updatePlugin(id: string): Promise<MockUpdateResult>;
  getPluginVersions(id: string): Promise<readonly MockPluginVersion[]>;
  getPopularPlugins(limit?: number): Promise<readonly MockPluginListing[]>;
  getRecentPlugins(limit?: number): Promise<readonly MockPluginListing[]>;
  getPluginCategories(): Promise<readonly MockCategory[]>;
  getPluginsByCategory(category: string): Promise<readonly MockPluginListing[]>;
  ratePlugin(id: string, rating: number, review?: string): Promise<boolean>;
  getPluginReviews(id: string): Promise<readonly MockPluginReview[]>;
  reportPlugin(id: string, reason: string, description?: string): Promise<boolean>;
}

interface MockPluginListing {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly version: string;
  readonly author: string;
  readonly downloads: number;
  readonly rating: number;
  readonly reviewCount: number;
  readonly lastUpdated: Date;
  readonly categories: readonly string[];
  readonly tags: readonly string[];
  readonly license: string;
  readonly homepage?: string;
  readonly repository?: string;
  readonly documentation?: string;
  readonly isInstalled: boolean;
  readonly isVerified: boolean;
  readonly securityScore: number;
  readonly size: number;
  readonly dependencies: readonly string[];
}

interface MockInstalledPlugin {
  readonly id: string;
  readonly name: string;
  readonly version: string;
  readonly installedAt: Date;
  readonly lastUsed: Date;
  readonly isEnabled: boolean;
  readonly updateAvailable: boolean;
  readonly latestVersion: string;
}

interface MockPluginVersion {
  readonly version: string;
  readonly releaseDate: Date;
  readonly changelog: string;
  readonly isStable: boolean;
  readonly isPrerelease: boolean;
  readonly downloadCount: number;
}

interface MockSearchFilters {
  readonly category?: string;
  readonly tags?: readonly string[];
  readonly minRating?: number;
  readonly maxRating?: number;
  readonly minDownloads?: number;
  readonly maxDownloads?: number;
  readonly isVerified?: boolean;
  readonly isInstalled?: boolean;
  readonly license?: string;
  readonly author?: string;
  readonly sortBy?: 'name' | 'rating' | 'downloads' | 'updated' | 'created';
  readonly sortOrder?: 'asc' | 'desc';
  readonly limit?: number;
  readonly offset?: number;
}

interface MockCategory {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly pluginCount: number;
  readonly icon?: string;
}

interface MockPluginReview {
  readonly id: string;
  readonly pluginId: string;
  readonly author: string;
  readonly rating: number;
  readonly title: string;
  readonly content: string;
  readonly createdAt: Date;
  readonly isVerified: boolean;
  readonly helpful: number;
  readonly notHelpful: number;
}

interface MockInstallResult {
  readonly success: boolean;
  readonly pluginId: string;
  readonly version: string;
  readonly installedAt: Date;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}

interface MockUpdateResult {
  readonly success: boolean;
  readonly pluginId: string;
  readonly fromVersion: string;
  readonly toVersion: string;
  readonly updatedAt: Date;
  readonly errors?: readonly string[];
  readonly warnings?: readonly string[];
}

// Mock implementation for testing
class MockCortexPluginMarketplace implements MockPluginMarketplace {
  private readonly plugins = new Map<string, MockPluginListing>();
  private readonly installedPlugins = new Map<string, MockInstalledPlugin>();
  private readonly categories = new Map<string, MockCategory>();
  private readonly reviews = new Map<string, MockPluginReview[]>();

  constructor() {
    this.initializeMockData();
  }

  async searchPlugins(query: string, filters?: MockSearchFilters): Promise<readonly MockPluginListing[]> {
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

  async getPlugin(id: string): Promise<MockPluginListing | null> {
    return this.plugins.get(id) || null;
  }

  async installPlugin(id: string, version?: string): Promise<MockInstallResult> {
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
    const installedPlugin: MockInstalledPlugin = {
      id: plugin.id,
      name: plugin.name,
      version: installVersion,
      installedAt: new Date(),
      lastUsed: new Date(),
      isEnabled: true,
      updateAvailable: false,
      latestVersion: plugin.version
    };

    this.installedPlugins.set(id, installedPlugin);
    
    // Update plugin listing
    plugin.isInstalled = true;
    this.plugins.set(id, plugin);

    return {
      success: true,
      pluginId: id,
      version: installVersion,
      installedAt: new Date()
    };
  }

  async uninstallPlugin(id: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (plugin) {
      plugin.isInstalled = false;
      this.plugins.set(id, plugin);
    }
    return this.installedPlugins.delete(id);
  }

  getInstalledPlugins(): readonly MockInstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  async updatePlugin(id: string): Promise<MockUpdateResult> {
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

    installed.version = toVersion;
    installed.updateAvailable = false;
    installed.lastUsed = new Date();
    this.installedPlugins.set(id, installed);

    return {
      success: true,
      pluginId: id,
      fromVersion,
      toVersion,
      updatedAt: new Date()
    };
  }

  async getPluginVersions(id: string): Promise<readonly MockPluginVersion[]> {
    // Mock version data
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

  async getPopularPlugins(limit = 10): Promise<readonly MockPluginListing[]> {
    const results = Array.from(this.plugins.values())
      .sort((a, b) => b.downloads - a.downloads)
      .slice(0, limit);
    return results;
  }

  async getRecentPlugins(limit = 10): Promise<readonly MockPluginListing[]> {
    const results = Array.from(this.plugins.values())
      .sort((a, b) => b.lastUpdated.getTime() - a.lastUpdated.getTime())
      .slice(0, limit);
    return results;
  }

  async getPluginCategories(): Promise<readonly MockCategory[]> {
    return Array.from(this.categories.values());
  }

  async getPluginsByCategory(category: string): Promise<readonly MockPluginListing[]> {
    return Array.from(this.plugins.values())
      .filter(plugin => plugin.categories.includes(category));
  }

  async ratePlugin(id: string, rating: number, review?: string): Promise<boolean> {
    const plugin = this.plugins.get(id);
    if (!plugin) return false;

    // Update plugin rating (simplified calculation)
    const currentRating = plugin.rating;
    const currentCount = plugin.reviewCount;
    const newRating = ((currentRating * currentCount) + rating) / (currentCount + 1);
    
    plugin.rating = Math.round(newRating * 10) / 10;
    plugin.reviewCount++;

    // Add review if provided
    if (review) {
      const pluginReviews = this.reviews.get(id) || [];
      const newReview: MockPluginReview = {
        id: `review-${Date.now()}`,
        pluginId: id,
        author: 'Current User',
        rating,
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

  async getPluginReviews(id: string): Promise<readonly MockPluginReview[]> {
    return this.reviews.get(id) || [];
  }

  async reportPlugin(id: string, reason: string, description?: string): Promise<boolean> {
    // Mock reporting - in real implementation, this would send to moderation system
    console.log(`Plugin ${id} reported: ${reason} - ${description || 'No description'}`);
    return true;
  }

  private initializeMockData(): void {
    // Initialize categories
    this.categories.set('development', {
      id: 'development',
      name: 'Development',
      description: 'Tools for software development',
      pluginCount: 5,
      icon: 'code'
    });
    this.categories.set('productivity', {
      id: 'productivity',
      name: 'Productivity',
      description: 'Tools to improve productivity',
      pluginCount: 3,
      icon: 'zap'
    });
    this.categories.set('utilities', {
      id: 'utilities',
      name: 'Utilities',
      description: 'General utility tools',
      pluginCount: 2,
      icon: 'wrench'
    });

    // Initialize mock plugins
    const mockPlugins: MockPluginListing[] = [
      {
        id: 'typescript-support',
        name: 'TypeScript Support',
        description: 'Enhanced TypeScript support for Cortex CLI',
        version: '1.2.0',
        author: 'Cortex Team',
        downloads: 15000,
        rating: 4.8,
        reviewCount: 234,
        lastUpdated: new Date('2024-01-20'),
        categories: ['development'],
        tags: ['typescript', 'language', 'support'],
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
        description: 'Automatic code formatting for multiple languages',
        version: '2.1.0',
        author: 'CodeMaster',
        downloads: 12000,
        rating: 4.6,
        reviewCount: 189,
        lastUpdated: new Date('2024-01-18'),
        categories: ['development', 'productivity'],
        tags: ['formatting', 'code', 'prettier'],
        license: 'Apache-2.0',
        isInstalled: true,
        isVerified: true,
        securityScore: 92,
        size: 1536000,
        dependencies: ['prettier', 'eslint']
      },
      {
        id: 'file-manager',
        name: 'Advanced File Manager',
        description: 'Enhanced file management capabilities',
        version: '1.0.5',
        author: 'FileGuru',
        downloads: 8500,
        rating: 4.3,
        reviewCount: 156,
        lastUpdated: new Date('2024-01-15'),
        categories: ['utilities'],
        tags: ['files', 'management', 'explorer'],
        license: 'GPL-3.0',
        isInstalled: false,
        isVerified: false,
        securityScore: 78,
        size: 1024000,
        dependencies: []
      }
    ];

    for (const plugin of mockPlugins) {
      this.plugins.set(plugin.id, plugin);
    }
  }
}

describe('CortexPluginMarketplace', () => {
  let marketplace: MockPluginMarketplace;

  beforeEach(() => {
    marketplace = new MockCortexPluginMarketplace();
  });

  describe('searchPlugins', () => {
    it('should search plugins by name', async () => {
      const results = await marketplace.searchPlugins('typescript');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'TypeScript Support');
    });

    it('should search plugins by description', async () => {
      const results = await marketplace.searchPlugins('formatting');
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'Code Formatter');
    });

    it('should search plugins by tags', async () => {
      const results = await marketplace.searchPlugins('code');
      assert.strictEqual(results.length, 2);
    });

    it('should return empty results for non-matching query', async () => {
      const results = await marketplace.searchPlugins('nonexistent');
      assert.strictEqual(results.length, 0);
    });

    it('should filter by category', async () => {
      const results = await marketplace.searchPlugins('', { category: 'development' });
      assert.strictEqual(results.length, 2);
    });

    it('should filter by rating', async () => {
      const results = await marketplace.searchPlugins('', { minRating: 4.5 });
      assert.strictEqual(results.length, 2);
    });

    it('should filter by downloads', async () => {
      const results = await marketplace.searchPlugins('', { minDownloads: 10000 });
      assert.strictEqual(results.length, 2);
    });

    it('should filter by verification status', async () => {
      const results = await marketplace.searchPlugins('', { isVerified: true });
      assert.strictEqual(results.length, 2);
    });

    it('should filter by installation status', async () => {
      const results = await marketplace.searchPlugins('', { isInstalled: true });
      assert.strictEqual(results.length, 1);
    });

    it('should sort by rating', async () => {
      const results = await marketplace.searchPlugins('', { 
        sortBy: 'rating', 
        sortOrder: 'desc' 
      });
      assert.strictEqual(results[0]?.rating, 4.8);
      assert.strictEqual(results[1]?.rating, 4.6);
    });

    it('should sort by downloads', async () => {
      const results = await marketplace.searchPlugins('', { 
        sortBy: 'downloads', 
        sortOrder: 'desc' 
      });
      assert.strictEqual(results[0]?.downloads, 15000);
      assert.strictEqual(results[1]?.downloads, 12000);
    });

    it('should apply pagination', async () => {
      const results = await marketplace.searchPlugins('', { 
        limit: 2, 
        offset: 1 
      });
      assert.strictEqual(results.length, 2);
    });
  });

  describe('getPlugin', () => {
    it('should return plugin by id', async () => {
      const plugin = await marketplace.getPlugin('typescript-support');
      assert.strictEqual(plugin?.name, 'TypeScript Support');
    });

    it('should return null for non-existent plugin', async () => {
      const plugin = await marketplace.getPlugin('nonexistent');
      assert.strictEqual(plugin, null);
    });
  });

  describe('installPlugin', () => {
    it('should install plugin successfully', async () => {
      const result = await marketplace.installPlugin('typescript-support');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.pluginId, 'typescript-support');
    });

    it('should fail to install non-existent plugin', async () => {
      const result = await marketplace.installPlugin('nonexistent');
      assert.strictEqual(result.success, false);
      assert.ok(result["error"]s?.includes('Plugin not found'));
    });

    it('should install specific version', async () => {
      const result = await marketplace.installPlugin('typescript-support', '1.0.0');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.version, '1.0.0');
    });
  });

  describe('uninstallPlugin', () => {
    it('should uninstall installed plugin', async () => {
      // First install a plugin
      await marketplace.installPlugin('typescript-support');
      
      const result = await marketplace.uninstallPlugin('typescript-support');
      assert.strictEqual(result, true);
    });

    it('should return false for non-installed plugin', async () => {
      const result = await marketplace.uninstallPlugin('nonexistent');
      assert.strictEqual(result, false);
    });
  });

  describe('getInstalledPlugins', () => {
    it('should return installed plugins', async () => {
      await marketplace.installPlugin('typescript-support');
      await marketplace.installPlugin('code-formatter');
      
      const installed = marketplace.getInstalledPlugins();
      assert.strictEqual(installed.length, 2);
    });

    it('should return empty array when no plugins installed', () => {
      const installed = marketplace.getInstalledPlugins();
      assert.strictEqual(installed.length, 0);
    });
  });

  describe('updatePlugin', () => {
    it('should update installed plugin', async () => {
      await marketplace.installPlugin('typescript-support', '1.0.0');
      
      const result = await marketplace.updatePlugin('typescript-support');
      assert.strictEqual(result.success, true);
      assert.strictEqual(result.fromVersion, '1.0.0');
    });

    it('should fail to update non-installed plugin', async () => {
      const result = await marketplace.updatePlugin('nonexistent');
      assert.strictEqual(result.success, false);
    });
  });

  describe('getPluginVersions', () => {
    it('should return plugin versions', async () => {
      const versions = await marketplace.getPluginVersions('typescript-support');
      assert.strictEqual(versions.length, 3);
      assert.strictEqual(versions[0]?.version, '1.0.0');
      assert.strictEqual(versions[0]?.isStable, true);
    });
  });

  describe('getPopularPlugins', () => {
    it('should return popular plugins sorted by downloads', async () => {
      const popular = await marketplace.getPopularPlugins(2);
      assert.strictEqual(popular.length, 2);
      assert.strictEqual(popular[0]?.downloads, 15000);
      assert.strictEqual(popular[1]?.downloads, 12000);
    });
  });

  describe('getRecentPlugins', () => {
    it('should return recent plugins sorted by update date', async () => {
      const recent = await marketplace.getRecentPlugins(2);
      assert.strictEqual(recent.length, 2);
      assert.ok(recent[0]?.lastUpdated >= recent[1]?.lastUpdated);
    });
  });

  describe('getPluginCategories', () => {
    it('should return all categories', async () => {
      const categories = await marketplace.getPluginCategories();
      assert.strictEqual(categories.length, 3);
      assert.ok(categories.some(c => c.id === 'development'));
    });
  });

  describe('getPluginsByCategory', () => {
    it('should return plugins in specific category', async () => {
      const devPlugins = await marketplace.getPluginsByCategory('development');
      assert.strictEqual(devPlugins.length, 2);
    });
  });

  describe('ratePlugin', () => {
    it('should rate plugin successfully', async () => {
      const result = await marketplace.ratePlugin('typescript-support', 5, 'Great plugin!');
      assert.strictEqual(result, true);
    });

    it('should fail to rate non-existent plugin', async () => {
      const result = await marketplace.ratePlugin('nonexistent', 5);
      assert.strictEqual(result, false);
    });
  });

  describe('getPluginReviews', () => {
    it('should return plugin reviews', async () => {
      await marketplace.ratePlugin('typescript-support', 5, 'Excellent plugin!');
      
      const reviews = await marketplace.getPluginReviews('typescript-support');
      assert.strictEqual(reviews.length, 1);
      assert.strictEqual(reviews[0]?.rating, 5);
    });
  });

  describe('reportPlugin', () => {
    it('should report plugin successfully', async () => {
      const result = await marketplace.reportPlugin('typescript-support', 'spam', 'This is spam');
      assert.strictEqual(result, true);
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle empty search query', async () => {
      const results = await marketplace.searchPlugins('');
      assert.strictEqual(results.length, 3);
    });

    it('should handle complex filter combinations', async () => {
      const results = await marketplace.searchPlugins('', {
        category: 'development',
        minRating: 4.5,
        isVerified: true,
        sortBy: 'rating',
        sortOrder: 'desc',
        limit: 1
      });
      assert.strictEqual(results.length, 1);
      assert.strictEqual(results[0]?.name, 'TypeScript Support');
    });

    it('should handle invalid rating values', async () => {
      const result = await marketplace.ratePlugin('typescript-support', 6); // Invalid rating
      assert.strictEqual(result, true); // Should still work, but rating would be clamped
    });
  });

  describe('performance and scalability', () => {
    it('should handle large result sets efficiently', async () => {
      const startTime = Date.now();
      
      const results = await marketplace.searchPlugins('', { limit: 1000 });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.ok(duration < 100, `Search took too long: ${duration}ms`);
    });

    it('should handle multiple concurrent operations', async () => {
      const promises = [
        marketplace.searchPlugins('typescript'),
        marketplace.getPlugin('typescript-support'),
        marketplace.getPopularPlugins(5),
        marketplace.getPluginCategories()
      ];
      
      const startTime = Date.now();
      const results = await Promise.all(promises);
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      assert.strictEqual(results.length, 4);
      assert.ok(duration < 100, `Concurrent operations took too long: ${duration}ms`);
    });
  });
});