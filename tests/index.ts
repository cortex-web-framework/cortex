/**
 * Test framework exports
 * No external dependencies - pure TypeScript testing
 */

// Test runner
export { describe, describe_skip, test, test_skip, beforeEach, afterEach, run, runAndExit, exit } from './test-runner.js';

// Assertions
export {
  assertEquals,
  assertTrue,
  assertFalse,
  assertNull,
  assertNotNull,
  assertThrows,
  assertArrayEquals,
  assertObjectEquals,
  assertStringIncludes,
  assertStringMatches,
  assertType,
  AssertionError,
} from './assertions.js';

// DOM utilities
export {
  createDOMElement,
  createTestContainer,
  removeTestContainer,
  query,
  queryAll,
  getStyle,
  getText,
  getHTML,
  getAttribute,
  setAttributes,
  hasClass,
  addClass,
  removeClass,
  toggleClass,
  getClasses,
  trigger,
  triggerCustom,
  triggerMouse,
  click,
  doubleClick,
  focus,
  blur,
  triggerKey,
  setValue,
  getValue,
  isVisible,
  getBounds,
  waitFor,
  waitForElement,
  cleanupTestContainers,
} from './utils/dom-helpers.js';

// Component utilities
export {
  renderComponent,
  waitForComponentRender,
  getComponentProperty,
  setComponentProperty,
  getComponentAttributes,
  triggerComponentEvent,
  onComponentEvent,
  waitForComponentEvent,
  getShadowRoot,
  queryInShadow,
  queryAllInShadow,
  getShadowStyle,
  getShadowText,
  clickInShadow,
  setValueInShadow,
  getValueInShadow,
  hasComponentAttribute,
  getComponentAttribute,
  setComponentAttributes,
  hasComponentClass,
  changeComponentState,
  submitComponentForm,
  getComponentDataAttributes,
  getComponentA11y,
} from './utils/component-helpers.js';
