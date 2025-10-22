import { describe, it } from 'node:test';
import assert from 'node:assert';
import { NodeProcessOps, processUtils } from '../../src/cli/utils/process.js';

describe('ProcessOps', () => {
  const processOps = new NodeProcessOps();

  describe('cwd', () => {
    it('should return current working directory', () => {
      const cwd = processOps.cwd();
      assert.strictEqual(typeof cwd, 'string');
      assert.ok(cwd.length > 0);
    });
  });

  describe('chdir', () => {
    it('should change working directory', () => {
      const originalCwd = processOps.cwd();
      // const tempDir = 'test-temp-dir';
      
      try {
        processOps.chdir('..');
        const newCwd = processOps.cwd();
        assert.notStrictEqual(newCwd, originalCwd);
      } finally {
        processOps.chdir(originalCwd);
      }
    });

    it('should throw error for non-existent directory', () => {
      assert.throws(() => {
        processOps.chdir('non-existent-directory');
      }, /Failed to change directory/);
    });
  });

  describe('env', () => {
    it('should return environment variables', () => {
      const env = processOps.env;
      assert.strictEqual(typeof env, 'object');
      assert.ok(env.NODE_ENV !== undefined || env.PATH !== undefined);
    });
  });

  describe('argv', () => {
    it('should return command line arguments', () => {
      const argv = processOps.argv;
      assert.ok(Array.isArray(argv));
      assert.ok(argv.length > 0);
    });
  });

  describe('version', () => {
    it('should return Node.js version', () => {
      const version = processOps.version;
      assert.strictEqual(typeof version, 'string');
      assert.ok(version.startsWith('v'));
    });
  });

  describe('platform', () => {
    it('should return platform', () => {
      const platform = processOps.platform;
      assert.strictEqual(typeof platform, 'string');
      assert.ok(['win32', 'darwin', 'linux'].includes(platform));
    });
  });

  describe('arch', () => {
    it('should return architecture', () => {
      const arch = processOps.arch;
      assert.strictEqual(typeof arch, 'string');
      assert.ok(['x64', 'arm64', 'ia32'].includes(arch));
    });
  });

  describe('memoryUsage', () => {
    it('should return memory usage', () => {
      const memory = processOps["memory"]Usage();
      assert.strictEqual(typeof memory, 'object');
      assert.strictEqual(typeof memory.heapUsed, 'number');
      assert.strictEqual(typeof memory.heapTotal, 'number');
      assert.strictEqual(typeof memory.external, 'number');
      assert.strictEqual(typeof memory.rss, 'number');
    });
  });

  describe('uptime', () => {
    it('should return uptime', () => {
      const uptime = processOps.uptime();
      assert.strictEqual(typeof uptime, 'number');
      assert.ok(uptime >= 0);
    });
  });
});

describe('processUtils', () => {
  describe('isCI', () => {
    it('should return boolean', () => {
      const result = processUtils.isCI();
      assert.strictEqual(typeof result, 'boolean');
    });
  });

  describe('isTTY', () => {
    it('should return boolean', () => {
      const result = processUtils.isTTY();
      assert.strictEqual(typeof result, 'boolean');
    });
  });

  describe('isDevelopment', () => {
    it('should return true when NODE_ENV is development', () => {
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = 'development';
      assert.strictEqual(processUtils.isDevelopment(), true);
      process.env["NODE_ENV"] = originalEnv;
    });

    it('should return true when NODE_ENV is undefined', () => {
      const originalEnv = process.env["NODE_ENV"];
      delete process.env["NODE_ENV"];
      assert.strictEqual(processUtils.isDevelopment(), true);
      process.env["NODE_ENV"] = originalEnv;
    });

    it('should return false when NODE_ENV is production', () => {
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = 'production';
      assert.strictEqual(processUtils.isDevelopment(), false);
      process.env["NODE_ENV"] = originalEnv;
    });
  });

  describe('isProduction', () => {
    it('should return true when NODE_ENV is production', () => {
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = 'production';
      assert.strictEqual(processUtils.isProduction(), true);
      process.env["NODE_ENV"] = originalEnv;
    });

    it('should return false when NODE_ENV is development', () => {
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = 'development';
      assert.strictEqual(processUtils.isProduction(), false);
      process.env["NODE_ENV"] = originalEnv;
    });
  });

  describe('isTest', () => {
    it('should return true when NODE_ENV is test', () => {
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = 'test';
      assert.strictEqual(processUtils.isTest(), true);
      process.env["NODE_ENV"] = originalEnv;
    });

    it('should return false when NODE_ENV is not test', () => {
      const originalEnv = process.env["NODE_ENV"];
      process.env["NODE_ENV"] = 'development';
      assert.strictEqual(processUtils.isTest(), false);
      process.env["NODE_ENV"] = originalEnv;
    });
  });

  describe('getEnv', () => {
    it('should return environment variable value', () => {
      const originalEnv = process.env["TEST_VAR"];
      process.env["TEST_VAR"] = 'test-value';
      assert.strictEqual(processUtils.getEnv('TEST_VAR'), 'test-value');
      process.env["TEST_VAR"] = originalEnv;
    });

    it('should return default value when variable is undefined', () => {
      const originalEnv = process.env["TEST_VAR"];
      delete process.env["TEST_VAR"];
      assert.strictEqual(processUtils.getEnv('TEST_VAR', 'default'), 'default');
      process.env["TEST_VAR"] = originalEnv;
    });
  });

  describe('getBooleanEnv', () => {
    it('should return true for "true" value', () => {
      const originalEnv = process.env["TEST_BOOL"];
      process.env["TEST_BOOL"] = 'true';
      assert.strictEqual(processUtils.getBooleanEnv('TEST_BOOL'), true);
      process.env["TEST_BOOL"] = originalEnv;
    });

    it('should return true for "1" value', () => {
      const originalEnv = process.env["TEST_BOOL"];
      process.env["TEST_BOOL"] = '1';
      assert.strictEqual(processUtils.getBooleanEnv('TEST_BOOL'), true);
      process.env["TEST_BOOL"] = originalEnv;
    });

    it('should return false for "false" value', () => {
      const originalEnv = process.env["TEST_BOOL"];
      process.env["TEST_BOOL"] = 'false';
      assert.strictEqual(processUtils.getBooleanEnv('TEST_BOOL'), false);
      process.env["TEST_BOOL"] = originalEnv;
    });

    it('should return default value when variable is undefined', () => {
      const originalEnv = process.env["TEST_BOOL"];
      delete process.env["TEST_BOOL"];
      assert.strictEqual(processUtils.getBooleanEnv('TEST_BOOL', true), true);
      process.env["TEST_BOOL"] = originalEnv;
    });
  });

  describe('getNumberEnv', () => {
    it('should return parsed number', () => {
      const originalEnv = process.env["TEST_NUM"];
      process.env["TEST_NUM"] = '42';
      assert.strictEqual(processUtils.getNumberEnv('TEST_NUM'), 42);
      process.env["TEST_NUM"] = originalEnv;
    });

    it('should return default value for invalid number', () => {
      const originalEnv = process.env["TEST_NUM"];
      process.env["TEST_NUM"] = 'invalid';
      assert.strictEqual(processUtils.getNumberEnv('TEST_NUM', 0), 0);
      process.env["TEST_NUM"] = originalEnv;
    });

    it('should return default value when variable is undefined', () => {
      const originalEnv = process.env["TEST_NUM"];
      delete process.env["TEST_NUM"];
      assert.strictEqual(processUtils.getNumberEnv('TEST_NUM', 10), 10);
      process.env["TEST_NUM"] = originalEnv;
    });
  });

  describe('getAvailableMemory', () => {
    it('should return number', () => {
      const memory = processUtils.getAvailableMemory();
      assert.strictEqual(typeof memory, 'number');
      assert.ok(memory >= 0);
    });
  });

  describe('getTotalMemory', () => {
    it('should return number', () => {
      const memory = processUtils.getTotalMemory();
      assert.strictEqual(typeof memory, 'number');
      assert.ok(memory >= 0);
    });
  });

  describe('getSystemInfo', () => {
    it('should return system information', () => {
      const info = processUtils.getSystemInfo();
      assert.strictEqual(typeof info.node, 'string');
      assert.strictEqual(typeof info.platform, 'string');
      assert.strictEqual(typeof info.arch, 'string');
      assert.strictEqual(typeof info.cwd, 'string');
      assert.strictEqual(typeof info["memory"], 'object');
      assert.strictEqual(typeof info.uptime, 'number');
    });
  });

  describe('commandExists', () => {
    it('should return boolean', () => {
      const result = processUtils.commandExists('node');
      assert.strictEqual(typeof result, 'boolean');
    });
  });

  describe('getPID', () => {
    it('should return process ID', () => {
      const pid = processUtils.getPID();
      assert.strictEqual(typeof pid, 'number');
      assert.ok(pid > 0);
    });
  });

  describe('getPPID', () => {
    it('should return parent process ID or undefined', () => {
      const ppid = processUtils.getPPID();
      assert.ok(typeof ppid === 'number' || typeof ppid === 'undefined');
    });
  });

  describe('isRoot', () => {
    it('should return boolean', () => {
      const result = processUtils.isRoot();
      assert.strictEqual(typeof result, 'boolean');
    });
  });

  describe('getUID', () => {
    it('should return user ID or undefined', () => {
      const uid = processUtils.getUID();
      assert.ok(typeof uid === 'number' || typeof uid === 'undefined');
    });
  });

  describe('getGID', () => {
    it('should return group ID or undefined', () => {
      const gid = processUtils.getGID();
      assert.ok(typeof gid === 'number' || typeof gid === 'undefined');
    });
  });
});