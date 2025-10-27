/**
 * FileStorage - Simple file-based data persistence
 * Stores data as JSON files in the data directory
 */

import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DATA_DIR = path.join(__dirname, '../../../../data');

export class FileStorage {
  /**
   * Ensure data directory exists
   */
  static ensureDataDir(): void {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  }

  /**
   * Get the file path for a collection
   */
  static getFilePath(collection: string): string {
    return path.join(DATA_DIR, `${collection}.json`);
  }

  /**
   * Read all items from a collection
   */
  static read<T>(collection: string): T[] {
    this.ensureDataDir();
    const filePath = this.getFilePath(collection);

    try {
      if (!fs.existsSync(filePath)) {
        return [];
      }

      const data = fs.readFileSync(filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch (error) {
      console.error(`Error reading ${collection} from file:`, error);
      return [];
    }
  }

  /**
   * Write items to a collection (overwrites existing data)
   */
  static write<T>(collection: string, data: T[]): void {
    this.ensureDataDir();
    const filePath = this.getFilePath(collection);

    try {
      const jsonData = JSON.stringify(data, null, 2);
      fs.writeFileSync(filePath, jsonData, 'utf-8');
    } catch (error) {
      console.error(`Error writing ${collection} to file:`, error);
    }
  }

  /**
   * Append items to a collection
   */
  static append<T>(collection: string, items: T[]): void {
    const existing = this.read<T>(collection);
    const combined = [...existing, ...items];
    this.write(collection, combined);
  }

  /**
   * Clear a collection
   */
  static clear(collection: string): void {
    this.write(collection, []);
  }

  /**
   * Check if collection exists
   */
  static exists(collection: string): boolean {
    this.ensureDataDir();
    const filePath = this.getFilePath(collection);
    return fs.existsSync(filePath);
  }

  /**
   * Get file size in bytes
   */
  static getSize(collection: string): number {
    this.ensureDataDir();
    const filePath = this.getFilePath(collection);

    try {
      if (!fs.existsSync(filePath)) {
        return 0;
      }
      const stats = fs.statSync(filePath);
      return stats.size;
    } catch (error) {
      return 0;
    }
  }
}
