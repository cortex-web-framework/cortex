/**
 * Zero-dependency file system utilities
 * Strictest TypeScript configuration
 */

import { readFileSync, writeFileSync, mkdirSync, readdirSync, statSync, chmodSync, existsSync } from 'fs';
import { join, dirname, basename, extname } from 'path';
import { FileSystem } from '../types';

/**
 * File system implementation using Node.js built-ins
 */
export class NodeFileSystem implements FileSystem {
  /**
   * Check if file or directory exists
   */
  exists(path: string): boolean {
    try {
      return existsSync(path);
    } catch {
      return false;
    }
  }

  /**
   * Read file contents as string
   */
  readFile(path: string): string {
    try {
      return readFileSync(path, 'utf8');
    } catch (error) {
      throw new Error(`Failed to read file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Write content to file
   */
  writeFile(path: string, content: string): void {
    try {
      // Ensure directory exists
      const dir = dirname(path);
      if (!this.exists(dir)) {
        this.mkdir(dir, true);
      }
      
      writeFileSync(path, content, 'utf8');
    } catch (error) {
      throw new Error(`Failed to write file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Create directory
   */
  mkdir(path: string, recursive: boolean = false): void {
    try {
      mkdirSync(path, { recursive });
    } catch (error) {
      throw new Error(`Failed to create directory ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Read directory contents
   */
  readdir(path: string): readonly string[] {
    try {
      return readdirSync(path);
    } catch (error) {
      throw new Error(`Failed to read directory ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Get file stats
   */
  stat(path: string): any {
    try {
      return statSync(path);
    } catch (error) {
      throw new Error(`Failed to get stats for ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Change file permissions
   */
  chmod(path: string, mode: number): void {
    try {
      chmodSync(path, mode);
    } catch (error) {
      throw new Error(`Failed to change permissions for ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

/**
 * Default file system instance
 */
export const fs = new NodeFileSystem();

/**
 * Utility functions for common file operations
 */
export const fileUtils = {
  /**
   * Get file extension
   */
  getExtension(path: string): string {
    return extname(path);
  },

  /**
   * Get file name without extension
   */
  getBasename(path: string): string {
    return basename(path, this.getExtension(path));
  },

  /**
   * Get directory name
   */
  getDirname(path: string): string {
    return dirname(path);
  },

  /**
   * Join path segments
   */
  join(...paths: readonly string[]): string {
    return join(...paths);
  },

  /**
   * Check if path is a directory
   */
  isDirectory(path: string): boolean {
    try {
      return fs.stat(path).isDirectory();
    } catch {
      return false;
    }
  },

  /**
   * Check if path is a file
   */
  isFile(path: string): boolean {
    try {
      return fs.stat(path).isFile();
    } catch {
      return false;
    }
  },

  /**
   * Get file size in bytes
   */
  getFileSize(path: string): number {
    try {
      return fs.stat(path).size;
    } catch {
      return 0;
    }
  },

  /**
   * Check if file is executable
   */
  isExecutable(path: string): boolean {
    try {
      const stats = fs.stat(path);
      return stats.isFile() && (stats.mode & 0o111) !== 0;
    } catch {
      return false;
    }
  },

  /**
   * Make file executable
   */
  makeExecutable(path: string): void {
    try {
      const stats = fs.stat(path);
      fs.chmod(path, stats.mode | 0o111);
    } catch (error) {
      throw new Error(`Failed to make file executable: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Copy file
   */
  copyFile(src: string, dest: string): void {
    const content = fs.readFile(src);
    fs.writeFile(dest, content);
  },

  /**
   * Move file
   */
  moveFile(src: string, dest: string): void {
    this.copyFile(src, dest);
    fs.writeFile(src, ''); // Clear source file
  },

  /**
   * Find files matching pattern
   */
  findFiles(dir: string, pattern: RegExp): readonly string[] {
    const files: string[] = [];
    
    try {
      const entries = fs.readdir(dir);
      
      for (const entry of entries) {
        const fullPath = this.join(dir, entry);
        
        if (this.isDirectory(fullPath)) {
          files.push(...this.findFiles(fullPath, pattern));
        } else if (pattern.test(entry)) {
          files.push(fullPath);
        }
      }
    } catch {
      // Ignore errors (permission denied, etc.)
    }
    
    return files;
  },

  /**
   * Create directory structure
   */
  ensureDir(path: string): void {
    if (!fs.exists(path)) {
      this.ensureDir(this.getDirname(path));
      fs.mkdir(path);
    }
  },

  /**
   * Remove file
   */
  removeFile(path: string): void {
    try {
      fs.writeFile(path, ''); // Clear file
    } catch (error) {
      throw new Error(`Failed to remove file ${path}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  },

  /**
   * Get relative path
   */
  getRelativePath(from: string, to: string): string {
    const fromParts = from.split('/');
    const toParts = to.split('/');
    
    let i = 0;
    while (i < fromParts.length && i < toParts.length && fromParts[i] === toParts[i]) {
      i++;
    }
    
    const upLevels = fromParts.length - i;
    const downPath = toParts.slice(i).join('/');
    
    return '../'.repeat(upLevels) + downPath;
  },
} as const;