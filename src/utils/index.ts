/**
 * Cortex UI Custom Utilities - NO external dependencies
 * Central export point for all utility functions
 */

// Array utilities - actually exported from array.ts
export {
  chunk,
  unique,
  flatten,
  findIndex,
  findLastIndex,
  groupBy,
  sortBy,
  range,
  fill,
  partition,
  compact,
  intersection,
  difference,
  shuffle,
  sample,
  pluck,
  uniq,
  without,
} from './array.js';

// String utilities - actually exported from string.ts
export {
  capitalize,
  camelCase,
  pascalCase,
  kebabCase,
  snakeCase,
  truncate,
  repeat,
  padStart,
  padEnd,
  reverse,
  startsWith,
  endsWith,
  includes,
  isEmpty,
  escapeHtml,
  unescapeHtml,
  slugify,
  isEmail,
  isUrl,
  wordCount,
  characterCount,
  stripHtml,
} from './string.js';

// Validation utilities - actually exported from validation.ts
export {
  validateEmail,
  validatePhone,
  validateURL,
  validateRequired,
  validateMinLength,
  validateMaxLength,
  validatePattern,
  validateNumberRange,
  validateCreditCard,
  validateDate,
  validatePasswordStrength,
  createValidator,
} from './validation.js';

// Format utilities - actually exported from format.ts
export {
  formatCurrency,
  formatPercent,
  formatNumber,
  formatFileSize,
  formatDate,
  formatTime,
  formatDateTime,
  formatRelativeTime,
  formatDuration,
  formatPhone,
  formatCreditCard,
  formatOrdinal,
} from './format.js';

// Storage utilities - actually exported from storage.ts
export {
  getItem,
  setItem,
  removeItem,
  clear,
  hasItem,
  keys,
  getAll,
  onStorageChange,
  createStorage,
  createSessionStorage,
  createMemoryStorage,
} from './storage.js';

// Event utilities - actually exported from events.ts
export {
  debounce,
  throttle,
  once,
  createEventEmitter,
  waitFor,
  delegate,
  rafThrottle,
} from './events.js';

// DOM utilities - actually exported from dom.ts
export {
  getParent,
  getSiblings,
  getChildren,
  getHTML,
  getText,
  setHTML,
  setText,
  getAttributes,
  setAttributes,
  removeAttributes,
  hasClass,
  addClass,
  removeClass,
  toggleClass,
  getStyles,
  setStyles,
  getComputedStyle,
  getSize,
  getOffset,
  getPosition,
  getScrollPosition,
  getViewportSize,
  scrollTo,
  isInViewport,
  closest,
  setFocus,
  onReady,
  observeDOM,
  trapFocus,
  getFocusableElements,
  onceEvent,
  onScroll,
  trigger,
} from './dom.js';
