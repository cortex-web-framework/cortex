/**
 * DOM Utilities Library
 *
 * A comprehensive collection of browser-safe DOM manipulation utilities.
 * All functions gracefully handle Node.js environments where DOM is unavailable.
 *
 * @module dom
 */

/**
 * Checks if the DOM is available (browser environment)
 * @internal
 */
const isDOMAvailable = (): boolean => {
  return typeof window !== 'undefined' && typeof document !== 'undefined';
};

/**
 * Safely gets the document object
 * @internal
 */
const getDocument = (): Document | null => {
  return isDOMAvailable() ? document : null;
};

/**
 * Safely gets the window object
 * @internal
 */
const getWindow = (): Window | null => {
  return isDOMAvailable() ? window : null;
};

// ============================================================================
// ELEMENT SELECTION
// ============================================================================

/**
 * Selects a single element using a CSS selector
 *
 * @param selector - CSS selector string
 * @param context - Optional context element or document to search within
 * @returns The first matching element or null if not found
 *
 * @example
 * ```typescript
 * const header = $('#main-header');
 * const button = $('.submit-btn', myForm);
 * ```
 */
export function $(selector: string, context?: Document | Element): Element | null {
  const doc = getDocument();
  if (!doc) return null;

  const searchContext = context || doc;
  return searchContext.querySelector(selector);
}

/**
 * Selects multiple elements using a CSS selector
 *
 * @param selector - CSS selector string
 * @param context - Optional context element or document to search within
 * @returns Array of matching elements (empty array if none found)
 *
 * @example
 * ```typescript
 * const items = $$('.list-item');
 * const inputs = $$('input[type="text"]', myForm);
 * ```
 */
export function $$(selector: string, context?: Document | Element): Element[] {
  const doc = getDocument();
  if (!doc) return [];

  const searchContext = context || doc;
  return Array.from(searchContext.querySelectorAll(selector));
}

// ============================================================================
// CLASS MANIPULATION
// ============================================================================

/**
 * Adds one or more CSS classes to an element
 *
 * @param element - Target element
 * @param classes - One or more class names to add
 *
 * @example
 * ```typescript
 * addClass(button, 'active');
 * addClass(div, 'visible', 'highlighted', 'primary');
 * ```
 */
export function addClass(element: Element, ...classes: string[]): void {
  element.classList.add(...classes);
}

/**
 * Removes one or more CSS classes from an element
 *
 * @param element - Target element
 * @param classes - One or more class names to remove
 *
 * @example
 * ```typescript
 * removeClass(button, 'active');
 * removeClass(div, 'visible', 'highlighted');
 * ```
 */
export function removeClass(element: Element, ...classes: string[]): void {
  element.classList.remove(...classes);
}

/**
 * Toggles a CSS class on an element
 *
 * @param element - Target element
 * @param className - Class name to toggle
 * @param force - Optional boolean to force add (true) or remove (false)
 * @returns True if class is now present, false otherwise
 *
 * @example
 * ```typescript
 * toggleClass(menu, 'open'); // Toggle state
 * toggleClass(menu, 'open', true); // Force add
 * toggleClass(menu, 'open', false); // Force remove
 * ```
 */
export function toggleClass(
  element: Element,
  className: string,
  force?: boolean
): boolean {
  return element.classList.toggle(className, force);
}

/**
 * Checks if an element has a specific CSS class
 *
 * @param element - Target element
 * @param className - Class name to check
 * @returns True if element has the class, false otherwise
 *
 * @example
 * ```typescript
 * if (hasClass(button, 'active')) {
 *   console.log('Button is active');
 * }
 * ```
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

// ============================================================================
// ATTRIBUTE HELPERS
// ============================================================================

/**
 * Sets multiple attributes on an element at once
 *
 * @param element - Target element
 * @param attrs - Object mapping attribute names to values (null removes attribute)
 *
 * @example
 * ```typescript
 * setAttributes(input, {
 *   'type': 'email',
 *   'placeholder': 'Enter email',
 *   'required': 'true',
 *   'old-attr': null // Removes attribute
 * });
 * ```
 */
export function setAttributes(
  element: Element,
  attrs: Record<string, string | null>
): void {
  Object.entries(attrs).forEach(([key, value]) => {
    if (value === null) {
      element.removeAttribute(key);
    } else {
      element.setAttribute(key, value);
    }
  });
}

/**
 * Gets all attributes from an element as an object
 *
 * @param element - Target element
 * @returns Object mapping attribute names to values
 *
 * @example
 * ```typescript
 * const attrs = getAttributes(input);
 * console.log(attrs['data-id']); // '123'
 * ```
 */
export function getAttributes(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {};
  Array.from(element.attributes).forEach((attr) => {
    attrs[attr.name] = attr.value;
  });
  return attrs;
}

/**
 * Removes multiple attributes from an element
 *
 * @param element - Target element
 * @param attrs - One or more attribute names to remove
 *
 * @example
 * ```typescript
 * removeAttributes(input, 'disabled', 'readonly', 'data-old');
 * ```
 */
export function removeAttributes(element: Element, ...attrs: string[]): void {
  attrs.forEach((attr) => element.removeAttribute(attr));
}

// ============================================================================
// POSITION/DIMENSION UTILITIES
// ============================================================================

/**
 * Gets the position of an element relative to the document
 *
 * @param element - Target element
 * @returns Object with top and left properties
 *
 * @example
 * ```typescript
 * const offset = getOffset(div);
 * console.log(`Top: ${offset.top}, Left: ${offset.left}`);
 * ```
 */
export function getOffset(element: Element): { top: number; left: number } {
  const rect = element.getBoundingClientRect();
  const win = getWindow();

  if (!win) {
    return { top: 0, left: 0 };
  }

  return {
    top: rect.top + win.pageYOffset,
    left: rect.left + win.pageXOffset,
  };
}

/**
 * Gets the position of an element relative to the viewport
 *
 * @param element - Target element
 * @returns Object with x and y coordinates
 *
 * @example
 * ```typescript
 * const pos = getPosition(button);
 * console.log(`X: ${pos.x}, Y: ${pos.y}`);
 * ```
 */
export function getPosition(element: Element): { x: number; y: number } {
  const rect = element.getBoundingClientRect();
  return {
    x: rect.left,
    y: rect.top,
  };
}

/**
 * Gets the dimensions of an element
 *
 * @param element - Target element
 * @returns Object with width and height properties
 *
 * @example
 * ```typescript
 * const size = getSize(container);
 * console.log(`Width: ${size.width}, Height: ${size.height}`);
 * ```
 */
export function getSize(element: Element): { width: number; height: number } {
  const rect = element.getBoundingClientRect();
  return {
    width: rect.width,
    height: rect.height,
  };
}

/**
 * Gets the dimensions of the viewport
 *
 * @returns Object with width and height of the viewport
 *
 * @example
 * ```typescript
 * const viewport = getViewportSize();
 * console.log(`Viewport: ${viewport.width}x${viewport.height}`);
 * ```
 */
export function getViewportSize(): { width: number; height: number } {
  const win = getWindow();
  const doc = getDocument();

  if (!win || !doc) {
    return { width: 0, height: 0 };
  }

  return {
    width: win.innerWidth || doc.documentElement.clientWidth,
    height: win.innerHeight || doc.documentElement.clientHeight,
  };
}

// ============================================================================
// SCROLL UTILITIES
// ============================================================================

/**
 * Scrolls an element into view or to a specific position
 *
 * @param element - Target element to scroll
 * @param options - Optional ScrollToOptions
 *
 * @example
 * ```typescript
 * scrollTo(section);
 * scrollTo(section, { behavior: 'smooth' });
 * ```
 */
export function scrollTo(element: Element, options?: ScrollToOptions): void {
  if ('scrollIntoView' in element) {
    element.scrollIntoView(options);
  }
}

/**
 * Gets the current scroll position of the window
 *
 * @returns Object with x and y scroll coordinates
 *
 * @example
 * ```typescript
 * const scroll = getScrollPosition();
 * console.log(`Scrolled ${scroll.y}px from top`);
 * ```
 */
export function getScrollPosition(): { x: number; y: number } {
  const win = getWindow();
  const doc = getDocument();

  if (!win || !doc) {
    return { x: 0, y: 0 };
  }

  return {
    x: win.pageXOffset || doc.documentElement.scrollLeft,
    y: win.pageYOffset || doc.documentElement.scrollTop,
  };
}

/**
 * Checks if an element is visible in the viewport
 *
 * @param element - Target element
 * @param partial - If true, returns true when element is partially visible
 * @returns True if element is in viewport, false otherwise
 *
 * @example
 * ```typescript
 * if (isInViewport(image)) {
 *   // Lazy load image
 * }
 * if (isInViewport(section, true)) {
 *   // Section is at least partially visible
 * }
 * ```
 */
export function isInViewport(element: Element, partial: boolean = false): boolean {
  const rect = element.getBoundingClientRect();
  const viewport = getViewportSize();

  if (partial) {
    return (
      rect.top < viewport.height &&
      rect.bottom > 0 &&
      rect.left < viewport.width &&
      rect.right > 0
    );
  }

  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= viewport.height &&
    rect.right <= viewport.width
  );
}

/**
 * Adds a scroll event listener to the window
 *
 * @param handler - Event handler function
 * @returns Function to remove the event listener
 *
 * @example
 * ```typescript
 * const unbind = onScroll((e) => {
 *   console.log('Scrolled!', e);
 * });
 *
 * // Later, remove listener
 * unbind();
 * ```
 */
export function onScroll(handler: (e: Event) => void): () => void {
  const win = getWindow();

  if (!win) {
    return () => {};
  }

  win.addEventListener('scroll', handler);

  return () => {
    win.removeEventListener('scroll', handler);
  };
}

// ============================================================================
// FOCUS MANAGEMENT
// ============================================================================

/**
 * Gets all focusable elements within a container
 *
 * @param container - Container element to search within
 * @returns Array of focusable elements
 *
 * @example
 * ```typescript
 * const focusable = getFocusableElements(dialog);
 * const firstFocusable = focusable[0];
 * ```
 */
export function getFocusableElements(container: Element): Element[] {
  const selector = [
    'a[href]',
    'button:not([disabled])',
    'input:not([disabled])',
    'select:not([disabled])',
    'textarea:not([disabled])',
    '[tabindex]:not([tabindex="-1"])',
  ].join(',');

  return Array.from(container.querySelectorAll(selector));
}

/**
 * Traps focus within a container element (useful for modals/dialogs)
 *
 * @param container - Container element to trap focus within
 * @returns Function to release the focus trap
 *
 * @example
 * ```typescript
 * const dialog = $('#dialog');
 * const untrap = trapFocus(dialog);
 *
 * // When dialog closes
 * untrap();
 * ```
 */
export function trapFocus(container: Element): () => void {
  const focusableElements = getFocusableElements(container);

  if (focusableElements.length === 0) {
    return () => {};
  }

  const firstElement = focusableElements[0] as HTMLElement;
  const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement;

  const handleKeyDown = (e: KeyboardEvent) => {
    if (e.key !== 'Tab') return;

    if (e.shiftKey) {
      if (document.activeElement === firstElement) {
        e.preventDefault();
        lastElement.focus();
      }
    } else {
      if (document.activeElement === lastElement) {
        e.preventDefault();
        firstElement.focus();
      }
    }
  };

  container.addEventListener('keydown', handleKeyDown as EventListener);

  return () => {
    container.removeEventListener('keydown', handleKeyDown as EventListener);
  };
}

/**
 * Safely sets focus on an HTML element
 *
 * @param element - Target element to focus
 *
 * @example
 * ```typescript
 * setFocus(inputElement);
 * ```
 */
export function setFocus(element: HTMLElement): void {
  if ('focus' in element && typeof element.focus === 'function') {
    element.focus();
  }
}

// ============================================================================
// TEXT CONTENT UTILITIES
// ============================================================================

/**
 * Gets the text content of an element
 *
 * @param element - Target element
 * @returns Text content of the element
 *
 * @example
 * ```typescript
 * const text = getText(paragraph);
 * console.log(text);
 * ```
 */
export function getText(element: Element): string {
  return element.textContent || '';
}

/**
 * Sets the text content of an element
 *
 * @param element - Target element
 * @param text - Text to set
 *
 * @example
 * ```typescript
 * setText(heading, 'New Title');
 * ```
 */
export function setText(element: Element, text: string): void {
  element.textContent = text;
}

/**
 * Gets the inner HTML of an element
 *
 * @param element - Target element
 * @returns Inner HTML content
 *
 * @example
 * ```typescript
 * const html = getHTML(container);
 * console.log(html);
 * ```
 */
export function getHTML(element: Element): string {
  return element.innerHTML;
}

/**
 * Sets the inner HTML of an element
 *
 * @param element - Target element
 * @param html - HTML string to set
 *
 * @example
 * ```typescript
 * setHTML(container, '<p>New content</p>');
 * ```
 */
export function setHTML(element: Element, html: string): void {
  element.innerHTML = html;
}

// ============================================================================
// EVENT UTILITIES
// ============================================================================

/**
 * Triggers a custom event on an element
 *
 * @param element - Target element
 * @param eventType - Name of the event to trigger
 * @param detail - Optional data to pass with the event
 *
 * @example
 * ```typescript
 * trigger(button, 'custom-click', { userId: 123 });
 * ```
 */
export function trigger(element: Element, eventType: string, detail?: any): void {
  const event = new CustomEvent(eventType, {
    detail,
    bubbles: true,
    cancelable: true,
  });
  element.dispatchEvent(event);
}

/**
 * Adds an event listener that will only fire once
 *
 * @param element - Target element
 * @param event - Event name
 * @param handler - Event handler function
 *
 * @example
 * ```typescript
 * onceEvent(button, 'click', () => {
 *   console.log('Clicked once!');
 * });
 * ```
 */
export function onceEvent(
  element: Element,
  event: string,
  handler: EventListener
): void {
  element.addEventListener(event, handler, { once: true });
}

// ============================================================================
// CSS AND STYLE UTILITIES
// ============================================================================

/**
 * Gets computed styles for an element
 *
 * @param element - Target element
 * @param prop - Optional specific property to get
 * @returns Computed style value or CSSStyleDeclaration object
 *
 * @example
 * ```typescript
 * const color = getComputedStyle(div, 'color');
 * const allStyles = getComputedStyle(div);
 * ```
 */
export function getComputedStyle(element: Element, prop?: string): any {
  const win = getWindow();

  if (!win) {
    return prop ? '' : {};
  }

  const styles = win.getComputedStyle(element);
  return prop ? styles.getPropertyValue(prop) : styles;
}

/**
 * Sets multiple inline styles on an element
 *
 * @param element - Target HTML element
 * @param styles - Object mapping CSS properties to values
 *
 * @example
 * ```typescript
 * setStyles(div, {
 *   color: 'red',
 *   backgroundColor: 'blue',
 *   fontSize: '16px'
 * });
 * ```
 */
export function setStyles(element: HTMLElement, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([property, value]) => {
    // Use setProperty method for safe CSS property assignment
    if (property.startsWith('--')) {
      // Custom CSS properties
      element.style.setProperty(property, value);
    } else {
      // Standard CSS properties - convert camelCase to kebab-case
      const cssProperty = property.replace(/([A-Z])/g, '-$1').toLowerCase();
      element.style.setProperty(cssProperty, value);
    }
  });
}

/**
 * Gets all inline styles from an element
 *
 * @param element - Target element
 * @returns Object mapping CSS properties to values
 *
 * @example
 * ```typescript
 * const styles = getStyles(div);
 * console.log(styles.color); // 'red'
 * ```
 */
export function getStyles(element: Element): Record<string, string> {
  const styles: Record<string, string> = {};
  const htmlElement = element as HTMLElement;

  if (!htmlElement.style) {
    return styles;
  }

  Array.from(htmlElement.style).forEach((property) => {
    styles[property] = htmlElement.style.getPropertyValue(property);
  });

  return styles;
}

// ============================================================================
// PARENT/CHILD UTILITIES
// ============================================================================

/**
 * Finds the closest ancestor element matching a selector
 *
 * @param element - Starting element
 * @param selector - CSS selector to match
 * @returns Closest matching ancestor or null
 *
 * @example
 * ```typescript
 * const form = closest(input, 'form');
 * const container = closest(button, '.container');
 * ```
 */
export function closest(element: Element, selector: string): Element | null {
  return element.closest(selector);
}

/**
 * Gets the parent element, optionally matching a selector
 *
 * @param element - Child element
 * @param selector - Optional CSS selector to match
 * @returns Parent element or null
 *
 * @example
 * ```typescript
 * const parent = getParent(child);
 * const formParent = getParent(input, 'form');
 * ```
 */
export function getParent(element: Element, selector?: string): Element | null {
  const parent = element.parentElement;

  if (!parent) {
    return null;
  }

  if (selector) {
    return parent.matches(selector) ? parent : closest(parent, selector);
  }

  return parent;
}

/**
 * Gets all child elements, optionally filtered by selector
 *
 * @param element - Parent element
 * @param selector - Optional CSS selector to filter children
 * @returns Array of child elements
 *
 * @example
 * ```typescript
 * const allChildren = getChildren(container);
 * const divChildren = getChildren(container, 'div');
 * ```
 */
export function getChildren(element: Element, selector?: string): Element[] {
  const children = Array.from(element.children);

  if (selector) {
    return children.filter((child) => child.matches(selector));
  }

  return children;
}

/**
 * Gets all sibling elements, optionally filtered by selector
 *
 * @param element - Reference element
 * @param selector - Optional CSS selector to filter siblings
 * @returns Array of sibling elements
 *
 * @example
 * ```typescript
 * const siblings = getSiblings(element);
 * const divSiblings = getSiblings(element, 'div');
 * ```
 */
export function getSiblings(element: Element, selector?: string): Element[] {
  const parent = element.parentElement;

  if (!parent) {
    return [];
  }

  const siblings = Array.from(parent.children).filter((child) => child !== element);

  if (selector) {
    return siblings.filter((sibling) => sibling.matches(selector));
  }

  return siblings;
}

// ============================================================================
// DOM READY AND MUTATION UTILITIES
// ============================================================================

/**
 * Executes a callback when the DOM is ready
 *
 * @param callback - Function to execute when DOM is ready
 *
 * @example
 * ```typescript
 * onReady(() => {
 *   console.log('DOM is ready!');
 *   initApp();
 * });
 * ```
 */
export function onReady(callback: () => void): void {
  const doc = getDocument();

  if (!doc) {
    return;
  }

  if (doc.readyState === 'loading') {
    doc.addEventListener('DOMContentLoaded', callback);
  } else {
    callback();
  }
}

/**
 * Observes DOM mutations on an element
 *
 * @param element - Element to observe
 * @param callback - Function to call when mutations occur
 * @param options - Optional MutationObserver options
 * @returns Function to stop observing
 *
 * @example
 * ```typescript
 * const stopObserving = observeDOM(
 *   container,
 *   (mutations) => {
 *     console.log('DOM changed:', mutations);
 *   },
 *   { childList: true, subtree: true }
 * );
 *
 * // Later, stop observing
 * stopObserving();
 * ```
 */
export function observeDOM(
  element: Element,
  callback: (mutations: MutationRecord[]) => void,
  options?: MutationObserverInit
): () => void {
  if (typeof MutationObserver === 'undefined') {
    return () => {};
  }

  const defaultOptions: MutationObserverInit = {
    childList: true,
    subtree: true,
    attributes: true,
    ...options,
  };

  const observer = new MutationObserver(callback);
  observer.observe(element, defaultOptions);

  return () => {
    observer.disconnect();
  };
}
