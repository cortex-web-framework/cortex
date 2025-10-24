import { execSync, spawn, spawnSync } from 'child_process';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const projectRoot = path.resolve(__dirname, '..');
const uiTestSrcDir = path.join(projectRoot, 'src', 'ui-test');
const uiTestCompiledDir = path.join(projectRoot, 'dist', 'ui-test-compiled');
const uiDistDir = path.join(projectRoot, 'dist', 'ui');
const testRunnerHtmlDir = path.join(projectRoot, 'dist', 'test-runners'); // Directory for generated HTML test runners

console.log('Running UI tests...');

// Ensure output directories exist
if (!fs.existsSync(uiTestCompiledDir)) {
  fs.mkdirSync(uiTestCompiledDir, { recursive: true });
}
if (!fs.existsSync(testRunnerHtmlDir)) {
  fs.mkdirSync(testRunnerHtmlDir, { recursive: true });
}

// Helper function to recursively get all files in a directory
function getAllFiles(dirPath, arrayOfFiles) {
  const files = fs.readdirSync(dirPath);

  arrayOfFiles = arrayOfFiles || [];

  files.forEach(function(file) {
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      arrayOfFiles.push(path.join(dirPath, "/", file));
    }
  });

  return arrayOfFiles;
}

async function runTests() {
  let dbusPid = null;
  let xvfbPid = null;

  // Graceful cleanup for spawned processes
  const cleanup = () => {
    if (dbusPid) {
      console.log(`Terminating dbus-daemon (PID: ${dbusPid})...`);
      try {
        process.kill(dbusPid);
      } catch (error) {
        console.error(`Error terminating dbus-daemon: ${error.message}`);
      }
    }
    if (xvfbPid) {
      console.log(`Terminating Xvfb (PID: ${xvfbPid})...`);
      try {
        process.kill(xvfbPid);
      } catch (error) {
        console.error(`Error terminating Xvfb: ${error.message}`);
      }
    }
  };

  process.on('exit', cleanup);
  process.on('SIGINT', cleanup);
  process.on('SIGTERM', cleanup);

  async function ensureDbusAndXvfb() {
    console.log('Ensuring D-Bus and Xvfb are available...');

    // More robust check for WSLg activity
    const isWSLgActive = process.env.WAYLAND_DISPLAY || (process.env.DISPLAY && process.env.DISPLAY.includes('localhost'));

    if (isWSLgActive) {
      console.log('  ✅ WSLg detected. Relying on WSLg for D-Bus and Xvfb.');
      // Skip manual D-Bus and Xvfb setup as WSLg should provide them
    } else {
      // Fallback to manual setup if WSLg is not detected or not fully active

      // Check for dbus-daemon
      try {
        execSync('which dbus-daemon', { stdio: 'pipe' });
        console.log('  ✅ dbus-daemon found.');
      } catch (error) {
        console.error('  ❌ dbus-daemon not found. Please install it. For Debian/Ubuntu: sudo apt-get install dbus-x11');
        process.exit(1);
      }

      // Check for dbus-launch
      try {
        execSync('which dbus-launch', { stdio: 'pipe' });
        console.log('  ✅ dbus-launch found.');
      } catch (error) {
        console.error('  ❌ dbus-launch not found. Please install it. For Debian/Ubuntu: sudo apt-get install dbus-x11');
        process.exit(1);
      }

      if (!process.env.DBUS_SESSION_BUS_ADDRESS) {
        console.log('  D-Bus session not found, starting a new one...');
        try {
          const dbusLaunchOutput = execSync('dbus-launch --sh-syntax', { encoding: 'utf8' });
          const lines = dbusLaunchOutput.split('\n');
          let address = '';
          let pid = '';
          for (const line of lines) {
            if (line.startsWith('DBUS_SESSION_BUS_ADDRESS=')) {
              address = line.substring(line.indexOf('=') + 1).replace(/; export DBUS_SESSION_BUS_ADDRESS/, '');
            } else if (line.startsWith('DBUS_SESSION_BUS_PID=')) {
              pid = line.substring(line.indexOf('=') + 1).replace(/; export DBUS_SESSION_BUS_PID/, '');
            }
          }
          process.env.DBUS_SESSION_BUS_ADDRESS = address;
          dbusPid = parseInt(pid, 10);
          process.env.DBUS_SESSION_BUS_PID = dbusPid.toString();
          console.log(`  ✅ New D-Bus session started. PID: ${dbusPid}`);
        } catch (error) {
          console.error(`  ❌ Failed to start D-Bus session: ${error.message}`);
          process.exit(1);
        }
      } else {
        console.log('  ✅ Existing D-Bus session found.');
      }

      // Integrate Xvfb for virtual display
      if (!process.env.DISPLAY) {
        console.log('  Xvfb display not found, starting a new one...');
        try {
          const xvfbProcess = spawn('Xvfb', [':99', '-screen', '0', '1024x768x24'], { detached: true, stdio: 'ignore' });
          xvfbProcess.unref(); // Allow the parent process to exit independently
          xvfbPid = xvfbProcess.pid;
          process.env.DISPLAY = ':99';
          console.log(`  ✅ New Xvfb display started. PID: ${xvfbPid}`);
        } catch (error) {
          console.error(`  ❌ Failed to start Xvfb display: ${error.message}`);
          process.exit(1);
        }
      } else {
        console.log('  ✅ Existing Xvfb display found.');
      }
    }
  }

  try {
    await ensureDbusAndXvfb();
    // 1. Compile UI components (ensure ui-bundle.js is up-to-date)
    console.log('Ensuring UI components are built...');
    execSync(`node ${path.join(projectRoot, 'scripts', 'build-ui.js')}`, { stdio: 'inherit' });
    console.log('UI components build successful.');

    // 2. Compile TypeScript test files
    console.log('Compiling UI test files...');
    execSync(`tsc --project ${path.join(projectRoot, 'tsconfig.test.json')}`, { stdio: 'inherit' });
    console.log('UI test compilation successful.');

    // 3. Find all compiled test files
    const allCompiledTestFiles = getAllFiles(uiTestCompiledDir);
    const testScripts = allCompiledTestFiles.filter(file => file.endsWith('.js') && file.includes('.test.'));

    if (testScripts.length === 0) {
      console.warn('No UI test files found.');
      process.exit(0);
    }

    let allTestsPassed = true;

    for (const testScriptPath of testScripts) {
      const relativeTestPath = path.relative(uiTestCompiledDir, testScriptPath);
      const testName = path.basename(relativeTestPath, '.js');
      const testRunnerHtmlPath = path.join(testRunnerHtmlDir, `${testName}.html`);

      console.log(`Preparing test runner for: ${relativeTestPath}`);

      // Generate HTML test runner file
      const htmlContent = `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test Runner: ${testName}</title>
    <script type="module" src="${path.relative(testRunnerHtmlDir, path.join(uiDistDir, 'ui-bundle.js'))}"></script>
    <script type="module" src="${path.relative(testRunnerHtmlDir, path.join(uiDistDir, 'test-runner-framework.js'))}"></script>
    <script type="module" src="${path.relative(testRunnerHtmlDir, testScriptPath)}"></script>
</head>
<body>
    <div id="test-results"></div>
    <script type="module">
        // Capture console.log messages from tests
        const originalConsoleLog = console.log;
        const originalConsoleError = console.error;
        const results = [];

        console.log = (...args) => {
            originalConsoleLog(...args);
            results.push({ type: 'log', message: args.join(' ') });
        };
        console.error = (...args) => {
            originalConsoleError(...args);
            results.push({ type: 'error', message: args.join(' ') });
        };

        // Report results back to Node.js process (e.g., via a specific console.log format)
        window.addEventListener('load', () => {
            setTimeout(() => {
                // Check if any errors were logged
                const hasErrors = results.some(log => log.type === 'error');
                const testName = document.title.replace('Test Runner: ', '');
                if (hasErrors) {
                    console.error('TEST_RESULT_JSON:' + JSON.stringify({ testName, passed: false, errorMessage: 'Errors logged during test execution.', logs: results }));
                } else {
                    console.log('TEST_RESULT_JSON:' + JSON.stringify({ testName, passed: true, errorMessage: '', logs: results }));
                }
            }, 5000); // Give tests 5 seconds to complete and log
        });
    </script>
</body>
</html>
`;
      fs.writeFileSync(testRunnerHtmlPath, htmlContent, 'utf8');

      // Launch headless Chrome
      console.log(`Launching headless browser for ${testName}...`);
      let chromeProcess;
      try {
        const browserLogPath = path.join(testRunnerHtmlDir, `${testName}-browser.log`);
        chromeProcess = spawn('google-chrome', [
          '--headless=new', // Use new headless mode
          '--disable-gpu',
          '--no-sandbox', // Required for some environments
          '--enable-logging',
          '--v=1',
          '--log-level=0',
          `--log-file=${browserLogPath}`,
          `--virtual-time-budget=10000`, // Give it some time to execute JS
          `file://${testRunnerHtmlPath}`
        ], { stdio: ['inherit', 'inherit', 'ignore'], env: { ...process.env, DBUS_SESSION_BUS_ADDRESS: 'disabled:' } });

        // Handle errors from the child process (e.g., if the executable is not found)
        chromeProcess.on('error', (err) => {
          console.error(`  ❌ ${testName} FAILED: Headless browser process error: ${err.message}`);
          allTestsPassed = false;
        });

        const exitCode = await new Promise((resolve) => {
          chromeProcess.on('close', resolve);
        });

        if (exitCode !== 0) {
          console.error(`Headless browser exited with code ${exitCode} for ${testName}.`);
          allTestsPassed = false;
          // Attempt to read the log file even if Chrome exited with an error
        }

        let browserOutput = '';
        if (fs.existsSync(browserLogPath)) {
          browserOutput = fs.readFileSync(browserLogPath, 'utf8');
          fs.unlinkSync(browserLogPath); // Clean up the log file
        }

        // Parse test results from browser output
        const resultMatch = browserOutput.match(/TEST_RESULT_JSON:({.*})/);
        if (resultMatch && resultMatch[1]) {
          const testResult = JSON.parse(resultMatch[1]);
          if (!testResult.passed) {
            allTestsPassed = false;
            console.error(`  ❌ ${testResult.testName} FAILED: ${testResult.errorMessage}`);
            testResult.logs.filter(log => log.type === 'error').forEach(log => console.error(`    ${log.message}`));
          } else {
            console.log(`  ✅ ${testResult.testName} PASSED`);
          }
        } else {
          console.error(`  ❌ ${testName} FAILED: Could not parse test results from browser output.`);
          console.error('Full browser output:', browserOutput);
          allTestsPassed = false;
        }
      } catch (spawnError) {
        console.error(`  ❌ ${testName} FAILED: Failed to launch headless browser. Is 'google-chrome' installed and in your PATH? Error: ${spawnError.message}`);
        allTestsPassed = false;
        // Continue to the next test script even if browser launch fails
      }
    }

    if (allTestsPassed) {
      console.log('All UI tests passed!');
    } else {
      console.error('Some UI tests failed.');
      process.exit(1);
    }

  } catch (error) {
    console.error('UI test runner failed:', error.message);
    process.exit(1);
  }
}

runTests();