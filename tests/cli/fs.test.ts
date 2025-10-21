import { describe, it, beforeEach, afterEach } from 'node:test';
import assert from 'node:assert';
import { NodeFileSystem, fileUtils } from '../../src/cli/utils/fs';
import { rmSync } from 'fs';
import { join } from 'path';

describe('FileSystem', () => {
  const fs = new NodeFileSystem();
  const testDir = 'test-temp';
  const testFile = join(testDir, 'test.txt');
  const testContent = 'Hello, World!';

  beforeEach(() => {
    // Clean up test directory
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore if directory doesn't exist
    }
  });

  afterEach(() => {
    // Clean up test directory
    try {
      rmSync(testDir, { recursive: true, force: true });
    } catch {
      // Ignore if directory doesn't exist
    }
  });

  describe('exists', () => {
    it('should return false for non-existent file', () => {
      assert.strictEqual(fs.exists('non-existent.txt'), false);
    });

    it('should return true for existing file', () => {
      fs.writeFile(testFile, testContent);
      assert.strictEqual(fs.exists(testFile), true);
    });

    it('should return true for existing directory', () => {
      fs.mkdir(testDir);
      assert.strictEqual(fs.exists(testDir), true);
    });
  });

  describe('writeFile and readFile', () => {
    it('should write and read file content', () => {
      fs.writeFile(testFile, testContent);
      const content = fs.readFile(testFile);
      assert.strictEqual(content, testContent);
    });

    it('should create directory when writing file', () => {
      const nestedFile = join(testDir, 'nested', 'file.txt');
      fs.writeFile(nestedFile, testContent);
      assert.strictEqual(fs.exists(nestedFile), true);
    });

    it('should throw error when reading non-existent file', () => {
      assert.throws(() => {
        fs.readFile('non-existent.txt');
      }, /Failed to read file/);
    });
  });

  describe('mkdir', () => {
    it('should create directory', () => {
      fs.mkdir(testDir);
      assert.strictEqual(fs.exists(testDir), true);
    });

    it('should create nested directories with recursive', () => {
      const nestedDir = join(testDir, 'nested', 'deep');
      fs.mkdir(nestedDir, true);
      assert.strictEqual(fs.exists(nestedDir), true);
    });

    it('should throw error when creating nested directories without recursive', () => {
      const nestedDir = join(testDir, 'nested', 'deep');
      assert.throws(() => {
        fs.mkdir(nestedDir, false);
      }, /Failed to create directory/);
    });
  });

  describe('readdir', () => {
    it('should read directory contents', () => {
      fs.mkdir(testDir);
      fs.writeFile(join(testDir, 'file1.txt'), 'content1');
      fs.writeFile(join(testDir, 'file2.txt'), 'content2');
      
      const files = fs.readdir(testDir);
      assert.strictEqual(files.length, 2);
      assert.ok(files.includes('file1.txt'));
      assert.ok(files.includes('file2.txt'));
    });

    it('should throw error when reading non-existent directory', () => {
      assert.throws(() => {
        fs.readdir('non-existent-dir');
      }, /Failed to read directory/);
    });
  });

  describe('stat', () => {
    it('should get file stats', () => {
      fs.writeFile(testFile, testContent);
      const stats = fs.stat(testFile);
      assert.strictEqual(stats.isFile(), true);
      assert.strictEqual(stats.size, testContent.length);
    });

    it('should get directory stats', () => {
      fs.mkdir(testDir);
      const stats = fs.stat(testDir);
      assert.strictEqual(stats.isDirectory(), true);
    });

    it('should throw error when getting stats for non-existent path', () => {
      assert.throws(() => {
        fs.stat('non-existent.txt');
      }, /Failed to get stats/);
    });
  });

  describe('chmod', () => {
    it('should change file permissions', () => {
      fs.writeFile(testFile, testContent);
      fs.chmod(testFile, 0o755);
      
      const stats = fs.stat(testFile);
      assert.strictEqual((stats.mode & 0o777), 0o755);
    });

    it('should throw error when changing permissions for non-existent file', () => {
      assert.throws(() => {
        fs.chmod('non-existent.txt', 0o755);
      }, /Failed to change permissions/);
    });
  });
});

describe('fileUtils', () => {
  describe('getExtension', () => {
    it('should return file extension', () => {
      assert.strictEqual(fileUtils.getExtension('file.txt'), '.txt');
      assert.strictEqual(fileUtils.getExtension('file.js'), '.js');
      assert.strictEqual(fileUtils.getExtension('file'), '');
    });
  });

  describe('getBasename', () => {
    it('should return filename without extension', () => {
      assert.strictEqual(fileUtils.getBasename('file.txt'), 'file');
      assert.strictEqual(fileUtils.getBasename('file.js'), 'file');
      assert.strictEqual(fileUtils.getBasename('file'), 'file');
    });
  });

  describe('getDirname', () => {
    it('should return directory name', () => {
      assert.strictEqual(fileUtils.getDirname('/path/to/file.txt'), '/path/to');
      assert.strictEqual(fileUtils.getDirname('file.txt'), '.');
    });
  });

  describe('join', () => {
    it('should join path segments', () => {
      assert.strictEqual(fileUtils.join('a', 'b', 'c'), 'a/b/c');
      assert.strictEqual(fileUtils.join('/', 'a', 'b'), '/a/b');
    });
  });

  describe('isDirectory', () => {
    it('should return true for directory', () => {
      const fs = new NodeFileSystem();
      fs.mkdir('test-dir');
      assert.strictEqual(fileUtils.isDirectory('test-dir'), true);
      rmSync('test-dir', { recursive: true, force: true });
    });

    it('should return false for non-existent path', () => {
      assert.strictEqual(fileUtils.isDirectory('non-existent'), false);
    });
  });

  describe('isFile', () => {
    it('should return true for file', () => {
      const fs = new NodeFileSystem();
      fs.writeFile('test-file.txt', 'content');
      assert.strictEqual(fileUtils.isFile('test-file.txt'), true);
      rmSync('test-file.txt', { force: true });
    });

    it('should return false for non-existent path', () => {
      assert.strictEqual(fileUtils.isFile('non-existent.txt'), false);
    });
  });

  describe('getFileSize', () => {
    it('should return file size', () => {
      const fs = new NodeFileSystem();
      const content = 'Hello, World!';
      fs.writeFile('test-file.txt', content);
      assert.strictEqual(fileUtils.getFileSize('test-file.txt'), content.length);
      rmSync('test-file.txt', { force: true });
    });

    it('should return 0 for non-existent file', () => {
      assert.strictEqual(fileUtils.getFileSize('non-existent.txt'), 0);
    });
  });

  describe('isExecutable', () => {
    it('should return false for non-existent file', () => {
      assert.strictEqual(fileUtils.isExecutable('non-existent.txt'), false);
    });
  });

  describe('makeExecutable', () => {
    it('should make file executable', () => {
      const fs = new NodeFileSystem();
      fs.writeFile('test-file.txt', 'content');
      fileUtils.makeExecutable('test-file.txt');
      assert.strictEqual(fileUtils.isExecutable('test-file.txt'), true);
      rmSync('test-file.txt', { force: true });
    });
  });

  describe('copyFile', () => {
    it('should copy file', () => {
      const fs = new NodeFileSystem();
      const content = 'Hello, World!';
      fs.writeFile('source.txt', content);
      fileUtils.copyFile('source.txt', 'dest.txt');
      
      assert.strictEqual(fs.exists('dest.txt'), true);
      assert.strictEqual(fs.readFile('dest.txt'), content);
      
      rmSync('source.txt', { force: true });
      rmSync('dest.txt', { force: true });
    });
  });

  describe('ensureDir', () => {
    it('should create directory structure', () => {
      const nestedDir = 'a/b/c/d';
      fileUtils.ensureDir(nestedDir);
      assert.strictEqual(fileUtils.isDirectory(nestedDir), true);
      rmSync('a', { recursive: true, force: true });
    });
  });

  describe('getRelativePath', () => {
    it('should return relative path', () => {
      assert.strictEqual(fileUtils.getRelativePath('/a/b', '/a/c'), '../c');
      assert.strictEqual(fileUtils.getRelativePath('/a/b', '/a/b/c'), 'c');
    });
  });
});