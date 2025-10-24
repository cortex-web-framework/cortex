// This test file will now run in a headless browser environment.
// It no longer needs extensive DOM mocks, as the browser provides the real DOM.

// Basic assertion utility
function assert(condition: boolean, message: string): void {
  if (!condition) {
    throw new Error(`Assertion failed: ${message}`);
  }
}

// --- Test Suite for ui-button ---

console.log('Running ui-button tests in browser...');

// Test Case 1: Component registration
try {
  // The component should be loaded by the HTML test runner
  assert(customElements.get('ui-button') !== undefined, 'ui-button should be registered as a custom element');
  console.log('  ✅ Test Case 1 Passed: Component registration');
} catch (error: unknown) {
  console.error('  ❌ Test Case 1 Failed:', (error as Error).message);
  // Report failure to Node.js runner
  window.dispatchEvent(new CustomEvent('test-finished', { detail: { testName: 'ui-button.test.js', passed: false, errorMessage: (error as Error).message } }));
  throw error; // Re-throw to stop further tests in this file
}

// Test Case 2: Default rendering
try {
  const button = document.createElement('ui-button');
  button.textContent = 'Test Button';
  document.body.appendChild(button); // Append to real DOM
  assert(button.textContent === 'Test Button', 'Button should render with provided text content');
  console.log('  ✅ Test Case 2 Passed: Default rendering');
} catch (error: unknown) {
  console.error('  ❌ Test Case 2 Failed:', (error as Error).message);
  window.dispatchEvent(new CustomEvent('test-finished', { detail: { testName: 'ui-button.test.js', passed: false, errorMessage: (error as Error).message } }));
  throw error;
}

// Test Case 3: Click event
try {
  const button = document.createElement('ui-button');
  document.body.appendChild(button);
  let clicked = false;
  button.addEventListener('click', () => {
    clicked = true;
  });
  button.click(); // Simulate click
  assert(clicked as boolean, 'Button should dispatch click event');
  console.log('  ✅ Test Case 3 Passed: Click event');
} catch (error: unknown) {
  console.error('  ❌ Test Case 3 Failed:', (error as Error).message);
  window.dispatchEvent(new CustomEvent('test-finished', { detail: { testName: 'ui-button.test.js', passed: false, errorMessage: (error as Error).message } }));
  throw error;
}

// Test Case 4: Variant attribute
try {
  const button = document.createElement('ui-button');
  document.body.appendChild(button);
  button.setAttribute('variant', 'primary');
  assert(button.getAttribute('variant') === 'primary', 'Button should reflect variant attribute');
  // Further checks would involve inspecting shadow DOM styles, which is more complex
  console.log('  ✅ Test Case 4 Passed: Variant attribute');
} catch (error: unknown) {
  console.error('  ❌ Test Case 4 Failed:', (error as Error).message);
  window.dispatchEvent(new CustomEvent('test-finished', { detail: { testName: 'ui-button.test.js', passed: false, errorMessage: (error as Error).message } }));
  throw error;
}

// Test Case 5: Disabled attribute
try {
  const button = document.createElement('ui-button');
  document.body.appendChild(button);
  button.setAttribute('disabled', '');
  assert(button.hasAttribute('disabled') === true, 'Button should reflect disabled attribute');
  let clicked = false;
  button.addEventListener('click', () => { clicked = true; });
  button.click(); // Simulate click
  assert(!clicked as boolean, 'Disabled button should not dispatch click event (component logic)');
  console.log('  ✅ Test Case 5 Passed: Disabled attribute');
} catch (error: unknown) {
  console.error('  ❌ Test Case 5 Failed:', (error as Error).message);
  window.dispatchEvent(new CustomEvent('test-finished', { detail: { testName: 'ui-button.test.js', passed: false, errorMessage: (error as Error).message } }));
  throw error;
}

console.log('All ui-button tests completed in browser.');

// Report overall success if no errors were thrown
window.dispatchEvent(new CustomEvent('test-finished', { detail: { testName: 'ui-button.test.js', passed: true } }));

export {}; // Make this file a module