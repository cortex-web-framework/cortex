/**
 * DOM testing utilities - no external dependencies
 */

/**
 * Creates a DOM element from HTML string
 * @param html The HTML string
 * @returns The created element
 */
export function createDOMElement(html: string): Element {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const element = template.content.firstElementChild;

  if (!element) {
    throw new Error(`Failed to create element from HTML: ${html}`);
  }

  return element;
}

/**
 * Creates a DOM container for tests
 * @returns A div element
 */
export function createTestContainer(): HTMLElement {
  const container = document.createElement('div');
  container.id = `test-container-${Date.now()}`;
  document.body.appendChild(container);
  return container;
}

/**
 * Removes a test container from DOM
 * @param container The container to remove
 */
export function removeTestContainer(container: HTMLElement): void {
  if (container.parentElement) {
    container.parentElement.removeChild(container);
  }
}

/**
 * Queries a single element
 * @param selector CSS selector
 * @param root Root element to search from
 * @returns The element or null
 */
export function query<T extends Element = Element>(
  selector: string,
  root: Element | Document = document
): T | null {
  return root.querySelector(selector) as T | null;
}

/**
 * Queries all matching elements
 * @param selector CSS selector
 * @param root Root element to search from
 * @returns Array of elements
 */
export function queryAll<T extends Element = Element>(
  selector: string,
  root: Element | Document = document
): T[] {
  return Array.from(root.querySelectorAll(selector)) as T[];
}

/**
 * Gets computed style of an element
 * @param element The element
 * @returns Computed style
 */
export function getStyle(element: Element): CSSStyleDeclaration {
  return window.getComputedStyle(element);
}

/**
 * Gets text content of an element
 * @param element The element
 * @returns Text content
 */
export function getText(element: Element): string {
  return element.textContent || '';
}

/**
 * Gets HTML content of an element
 * @param element The element
 * @returns HTML content
 */
export function getHTML(element: Element): string {
  return element.innerHTML;
}

/**
 * Gets an attribute value
 * @param element The element
 * @param name Attribute name
 * @returns Attribute value or null
 */
export function getAttribute(element: Element, name: string): string | null {
  return element.getAttribute(name);
}

/**
 * Sets attribute(s)
 * @param element The element
 * @param attrs Attributes to set
 */
export function setAttributes(
  element: Element,
  attrs: Record<string, string | boolean | number>
): void {
  Object.entries(attrs).forEach(([name, value]) => {
    if (typeof value === 'boolean') {
      if (value) {
        element.setAttribute(name, '');
      } else {
        element.removeAttribute(name);
      }
    } else {
      element.setAttribute(name, String(value));
    }
  });
}

/**
 * Checks if element has a class
 * @param element The element
 * @param className Class name
 * @returns True if element has class
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Adds a class to element
 * @param element The element
 * @param className Class name
 */
export function addClass(element: Element, className: string): void {
  element.classList.add(className);
}

/**
 * Removes a class from element
 * @param element The element
 * @param className Class name
 */
export function removeClass(element: Element, className: string): void {
  element.classList.remove(className);
}

/**
 * Toggles a class on element
 * @param element The element
 * @param className Class name
 */
export function toggleClass(element: Element, className: string): void {
  element.classList.toggle(className);
}

/**
 * Gets all classes of an element
 * @param element The element
 * @returns Array of class names
 */
export function getClasses(element: Element): string[] {
  return Array.from(element.classList);
}

/**
 * Triggers an event on an element
 * @param element The element
 * @param eventName Event name
 * @param options Event options
 */
export function trigger(
  element: Element,
  eventName: string,
  options?: EventInit
): boolean {
  const event = new Event(eventName, options || {});
  return element.dispatchEvent(event);
}

/**
 * Triggers a custom event
 * @param element The element
 * @param eventName Event name
 * @param detail Event detail/data
 */
export function triggerCustom(
  element: Element,
  eventName: string,
  detail?: any
): boolean {
  const event = new CustomEvent(eventName, { detail });
  return element.dispatchEvent(event);
}

/**
 * Triggers a mouse event
 * @param element The element
 * @param eventName Event name (click, mousedown, mouseup, etc.)
 * @param options Mouse event options
 */
export function triggerMouse(
  element: Element,
  eventName: string,
  options?: Partial<MouseEventInit>
): boolean {
  const event = new MouseEvent(eventName, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  return element.dispatchEvent(event);
}

/**
 * Simulates a click
 * @param element The element
 */
export function click(element: Element): void {
  (element as HTMLElement).click?.();
  if (!(element as HTMLElement).click) {
    triggerMouse(element, 'click');
  }
}

/**
 * Simulates a double-click
 * @param element The element
 */
export function doubleClick(element: Element): void {
  triggerMouse(element, 'dblclick');
}

/**
 * Simulates focus
 * @param element The element
 */
export function focus(element: Element): void {
  (element as HTMLElement).focus();
}

/**
 * Simulates blur
 * @param element The element
 */
export function blur(element: Element): void {
  (element as HTMLElement).blur();
}

/**
 * Simulates keyboard input
 * @param element The element
 * @param key Key name
 * @param options Keyboard event options
 */
export function triggerKey(
  element: Element,
  key: string,
  options?: Partial<KeyboardEventInit>
): boolean {
  const event = new KeyboardEvent('keydown', {
    key,
    bubbles: true,
    cancelable: true,
    ...options,
  });
  return element.dispatchEvent(event);
}

/**
 * Sets value on input element
 * @param element The input element
 * @param value The value
 */
export function setValue(element: Element, value: string): void {
  if (element instanceof HTMLInputElement) {
    element.value = value;
    trigger(element, 'input');
    trigger(element, 'change');
  } else if (element instanceof HTMLTextAreaElement) {
    element.value = value;
    trigger(element, 'input');
    trigger(element, 'change');
  }
}

/**
 * Gets value from input element
 * @param element The input element
 * @returns The value
 */
export function getValue(element: Element): string {
  if (element instanceof HTMLInputElement) {
    return element.value;
  } else if (element instanceof HTMLTextAreaElement) {
    return element.value;
  }
  return '';
}

/**
 * Checks if element is visible
 * @param element The element
 * @returns True if visible
 */
export function isVisible(element: Element): boolean {
  const style = getStyle(element);
  return style.display !== 'none' && style.visibility !== 'hidden';
}

/**
 * Gets the bounding rectangle of an element
 * @param element The element
 * @returns DOMRect
 */
export function getBounds(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * Waits for a condition to be true
 * @param condition Function that returns boolean
 * @param timeout Maximum time to wait in ms
 * @returns Promise that resolves when condition is true
 */
export async function waitFor(
  condition: () => boolean,
  timeout: number = 5000
): Promise<void> {
  const startTime = Date.now();

  while (!condition()) {
    if (Date.now() - startTime > timeout) {
      throw new Error('waitFor timeout exceeded');
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
}

/**
 * Waits for element to be added to DOM
 * @param selector CSS selector
 * @param root Root element to search from
 * @param timeout Maximum time to wait in ms
 * @returns Promise that resolves with the element
 */
export async function waitForElement<T extends Element = Element>(
  selector: string,
  root: Element | Document = document,
  timeout: number = 5000
): Promise<T> {
  await waitFor(() => query(selector, root) !== null, timeout);
  const element = query<T>(selector, root);

  if (!element) {
    throw new Error(`Element not found: ${selector}`);
  }

  return element;
}

/**
 * Gets all event listeners on an element (mock tracking)
 * @param element The element
 * @returns Object with event names and listener counts
 */
export function getEventListeners(element: Element): Record<string, number> {
  // Note: This is a simplified version. Real event listeners aren't easily accessible.
  // For testing, we typically track listeners manually in our code.
  return {};
}

/**
 * Cleans up all test containers
 */
export function cleanupTestContainers(): void {
  const containers = queryAll('[id^="test-container-"]');
  containers.forEach((container) => {
    if (container.parentElement) {
      container.parentElement.removeChild(container);
    }
  });
}
