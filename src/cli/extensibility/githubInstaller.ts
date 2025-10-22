/**
 * GitHub Installer Implementation
 * Zero dependencies, strictest TypeScript configuration
 */

// import { readFile, writeFile, mkdir, readdir, stat } from 'node:fs/promises';
// import { join, basename, dirname } from 'node:path';
import type {
  GitHubInstaller,
  GitHubRepository,
  GitHubRepositoryInfo,
  GitHubValidationResult,
  GitHubRelease,
  GitHubTag,
  GitHubInstallResult,
  GitHubInstalledPlugin
} from './types.js';

/**
 * GitHub Installer Implementation
 */
export class CortexGitHubInstaller implements GitHubInstaller {
  private readonly installedPlugins = new Map<string, GitHubInstalledPlugin>();
  private readonly cache = new Map<string, unknown>();

  /**
   * Parse repository URL to extract owner and name
   */
  parseRepositoryUrl(repository: string): GitHubRepositoryInfo | null {
    // Support formats: owner/repo, https://github.com/owner/repo, git@github.com:owner/repo.git
    const patterns = [
      /^([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)$/, // owner/repo
      /github\.com[/:]([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(?:\.git)?$/, // URL format
      /git@github\.com:([a-zA-Z0-9._-]+)\/([a-zA-Z0-9._-]+)(?:\.git)?$/ // SSH format
    ];

    for (const pattern of patterns) {
      const match = repository.match(pattern);
      if (match) {
        const owner = match[1];
        const name = match[2];
        return {
          owner,
          name,
          fullName: `${owner}/${name}`,
          url: `https://github.com/${owner}/${name}`
        };
      }
    }

    return null;
  }

  /**
   * Validate repository URL and check if it exists
   */
  async validateRepository(repository: string): Promise<GitHubValidationResult> {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Parse repository URL
    const info = this.parseRepositoryUrl(repository);
    if (!info) {
      errors.push('Invalid repository format. Use: owner/repo');
      return {
        valid: false,
        repository,
        errors,
        warnings
      };
    }

    // Check if repository exists (mock implementation)
    // In real implementation, this would make HTTP request to GitHub API
    try {
      const repoInfo = await this.getRepositoryInfo(repository);
      if (!repoInfo) {
        errors.push('Repository not found or not accessible');
      } else {
        // Check if it's a valid plugin repository
        if (!this.isValidPluginRepository(repoInfo)) {
          warnings.push('Repository may not be a valid Cortex plugin');
        }
      }
    } catch (error) {
      errors.push(`Failed to validate repository: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }

    return {
      valid: errors.length === 0,
      repository,
      errors,
      warnings,
      info
    };
  }

  /**
   * Get repository information
   */
  async getRepositoryInfo(repository: string): Promise<GitHubRepository | null> {
    const info = this.parseRepositoryUrl(repository);
    if (!info) return null;

    // Check cache first
    const cacheKey = `repo:${info.fullName}`;
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey) as GitHubRepository;
    }

    // Mock repository data - in real implementation, this would fetch from GitHub API
    const mockRepo: GitHubRepository = {
      id: Math.floor(Math.random() * 1000000),
      name: info.name,
      fullName: info.fullName,
      description: `A Cortex plugin for ${info.name}`,
      owner: {
        id: Math.floor(Math.random() * 100000),
        login: info.owner,
        name: info.owner,
        email: `${info.owner}@example.com`,
        avatarUrl: `https://github.com/${info.owner}.png`,
        htmlUrl: `https://github.com/${info.owner}`,
        type: 'User',
        siteAdmin: false,
        publicRepos: Math.floor(Math.random() * 100),
        publicGists: Math.floor(Math.random() * 50),
        followers: Math.floor(Math.random() * 1000),
        following: Math.floor(Math.random() * 500),
        createdAt: new Date('2020-01-01'),
        updatedAt: new Date()
      },
      htmlUrl: info.url,
      cloneUrl: `https://github.com/${info.fullName}.git`,
      sshUrl: `git@github.com:${info.fullName}.git`,
      defaultBranch: 'main',
      language: 'TypeScript',
      stargazersCount: Math.floor(Math.random() * 1000),
      forksCount: Math.floor(Math.random() * 100),
      openIssuesCount: Math.floor(Math.random() * 50),
      createdAt: new Date('2023-01-01'),
      updatedAt: new Date(),
      pushedAt: new Date(),
      size: Math.floor(Math.random() * 10000),
      isPrivate: false,
      isFork: false,
      isArchived: false,
      isDisabled: false,
      topics: ['cortex', 'plugin', 'cli'],
      license: {
        key: 'mit',
        name: 'MIT License',
        spdxId: 'MIT',
        url: 'https://api.github.com/licenses/mit',
        nodeId: 'MDc6TGljZW5zZTEz'
      },
      permissions: {
        admin: false,
        maintain: false,
        push: false,
        triage: false,
        pull: true
      }
    };

    this.cache.set(cacheKey, mockRepo);
    return mockRepo;
  }

  /**
   * Get repository releases
   */
  async getRepositoryReleases(repository: string): Promise<readonly GitHubRelease[]> {
    const info = this.parseRepositoryUrl(repository);
    if (!info) return [];

    // Mock releases data
    return [
      {
        id: 1,
        tagName: 'v1.0.0',
        name: 'Version 1.0.0',
        body: 'Initial release with basic functionality',
        draft: false,
        prerelease: false,
        createdAt: new Date('2024-01-01'),
        publishedAt: new Date('2024-01-01'),
        author: {
          id: 1,
          login: info.owner,
          name: info.owner,
          email: `${info.owner}@example.com`,
          avatarUrl: `https://github.com/${info.owner}.png`,
          htmlUrl: `https://github.com/${info.owner}`,
          type: 'User',
          siteAdmin: false,
          publicRepos: 10,
          publicGists: 5,
          followers: 100,
          following: 50,
          createdAt: new Date('2020-01-01'),
          updatedAt: new Date()
        },
        assets: [],
        tarballUrl: `https://api.github.com/repos/${info.fullName}/tarball/v1.0.0`,
        zipballUrl: `https://api.github.com/repos/${info.fullName}/zipball/v1.0.0`,
        htmlUrl: `https://github.com/${info.fullName}/releases/tag/v1.0.0`
      }
    ];
  }

  /**
   * Get repository tags
   */
  async getRepositoryTags(repository: string): Promise<readonly GitHubTag[]> {
    const info = this.parseRepositoryUrl(repository);
    if (!info) return [];

    // Mock tags data
    return [
      {
        name: 'v1.0.0',
        commit: {
          sha: 'abc123def456',
          url: `https://api.github.com/repos/${info.fullName}/commits/abc123def456`,
          htmlUrl: `https://github.com/${info.fullName}/commit/abc123def456`,
          author: {
            name: info.owner,
            email: `${info.owner}@example.com`,
            date: new Date('2024-01-01')
          },
          committer: {
            name: info.owner,
            email: `${info.owner}@example.com`,
            date: new Date('2024-01-01')
          },
          message: 'Release v1.0.0',
          tree: {
            sha: 'def456ghi789',
            url: `https://api.github.com/repos/${info.fullName}/git/trees/def456ghi789`
          },
          parents: [],
          verification: {
            verified: true,
            reason: 'valid'
          }
        },
        zipballUrl: `https://api.github.com/repos/${info.fullName}/zipball/v1.0.0`,
        tarballUrl: `https://api.github.com/repos/${info.fullName}/tarball/v1.0.0`,
        nodeId: 'MDM6UmVmMTIzNDU2Nzg5'
      }
    ];
  }

  /**
   * Install plugin from repository
   */
  async installFromRepository(repository: string, version?: string): Promise<GitHubInstallResult> {
    const info = this.parseRepositoryUrl(repository);
    if (!info) {
      return {
        success: false,
        repository,
        version: version || 'unknown',
        installedAt: new Date(),
        pluginId: '',
        errors: ['Invalid repository format'],
        metadata: {
          source: 'github',
          repository,
          owner: '',
          name: '',
          branch: 'main',
          commit: '',
          downloadUrl: '',
          size: 0
        }
      };
    }

    try {
      // Validate repository
      const validation = await this.validateRepository(repository);
      if (!validation.valid) {
        return {
          success: false,
          repository,
          version: version || 'latest',
          installedAt: new Date(),
          pluginId: info.fullName,
          errors: validation.errors,
          warnings: validation.warnings,
          metadata: {
            source: 'github',
            repository,
            owner: info.owner,
            name: info.name,
            branch: 'main',
            commit: 'latest',
            downloadUrl: info.url,
            size: 0
          }
        };
      }

      // Get repository info
      const repoInfo = await this.getRepositoryInfo(repository);
      if (!repoInfo) {
        return {
          success: false,
          repository,
          version: version || 'latest',
          installedAt: new Date(),
          pluginId: info.fullName,
          errors: ['Repository not found'],
          metadata: {
            source: 'github',
            repository,
            owner: info.owner,
            name: info.name,
            branch: 'main',
            commit: 'latest',
            downloadUrl: info.url,
            size: 0
          }
        };
      }

      // Determine version to install
      const installVersion = version || 'latest';
      const branch = installVersion === 'latest' ? repoInfo.defaultBranch : installVersion;

      // Create plugin ID
      const pluginId = `github:${info.fullName}`;

      // Mock installation process
      const installedPlugin: GitHubInstalledPlugin = {
        id: pluginId,
        name: info.name,
        version: installVersion,
        repository: info.fullName,
        owner: info.owner,
        installedAt: new Date(),
        lastUpdated: new Date(),
        isEnabled: true,
        updateAvailable: false,
        latestVersion: installVersion,
        metadata: {
          source: 'github',
          repository: info.fullName,
          owner: info.owner,
          name: info.name,
          branch,
          commit: 'abc123def456',
          downloadUrl: info.url,
          size: repoInfo.size,
          license: repoInfo.license?.name,
          readme: `# ${info.name}\n\nA Cortex plugin for ${info.name}`,
          packageJson: {
            name: `@cortex/${info.name}`,
            version: installVersion,
            description: repoInfo.description,
            main: 'index.js',
            scripts: {
              test: 'echo "No tests specified"'
            }
          }
        }
      };

      this.installedPlugins.set(pluginId, installedPlugin);

      return {
        success: true,
        repository: info.fullName,
        version: installVersion,
        installedAt: new Date(),
        pluginId,
        metadata: installedPlugin.metadata
      };

    } catch (error) {
      return {
        success: false,
        repository,
        version: version || 'unknown',
        installedAt: new Date(),
        pluginId: info?.fullName || '',
        errors: [`Installation failed: ${error instanceof Error ? error.message : 'Unknown error'}`],
        metadata: {
          source: 'github',
          repository,
          owner: info?.owner || '',
          name: info?.name || '',
          branch: 'main',
          commit: '',
          downloadUrl: info?.url || '',
          size: 0
        }
      };
    }
  }

  /**
   * Install plugin from specific release
   */
  async installFromRelease(repository: string, release: string): Promise<GitHubInstallResult> {
    return this.installFromRepository(repository, release);
  }

  /**
   * Install plugin from specific tag
   */
  async installFromTag(repository: string, tag: string): Promise<GitHubInstallResult> {
    return this.installFromRepository(repository, tag);
  }

  /**
   * Install plugin from specific branch
   */
  async installFromBranch(repository: string, branch: string): Promise<GitHubInstallResult> {
    return this.installFromRepository(repository, branch);
  }

  /**
   * Get all plugins installed from GitHub
   */
  getInstalledFromGitHub(): readonly GitHubInstalledPlugin[] {
    return Array.from(this.installedPlugins.values());
  }

  /**
   * Update plugin from GitHub
   */
  async updateFromGitHub(pluginId: string): Promise<GitHubInstallResult> {
    const installed = this.installedPlugins.get(pluginId);
    if (!installed) {
      return {
        success: false,
        repository: '',
        version: 'unknown',
        installedAt: new Date(),
        pluginId,
        errors: ['Plugin not found'],
        metadata: {
          source: 'github',
          repository: '',
          owner: '',
          name: '',
          branch: 'main',
          commit: '',
          downloadUrl: '',
          size: 0
        }
      };
    }

    // Update the plugin
    const updatedPlugin = {
      ...installed,
      lastUpdated: new Date(),
      updateAvailable: false
    };

    this.installedPlugins.set(pluginId, updatedPlugin);

    return {
      success: true,
      repository: installed.repository,
      version: installed.version,
      installedAt: new Date(),
      pluginId,
      metadata: installed.metadata
    };
  }

  /**
   * Uninstall plugin from GitHub
   */
  async uninstallFromGitHub(pluginId: string): Promise<boolean> {
    return this.installedPlugins.delete(pluginId);
  }

  /**
   * Check if repository is a valid plugin repository
   */
  private isValidPluginRepository(repo: GitHubRepository): boolean {
    // Check for common plugin indicators
    const indicators = [
      'cortex',
      'plugin',
      'cli',
      'template',
      'extension'
    ];

    const searchText = [
      repo.name,
      repo.description,
      ...repo.topics
    ].join(' ').toLowerCase();

    return indicators.some(indicator => searchText.includes(indicator));
  }
}