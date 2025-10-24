/**
 * DOM utilities - NO external dependencies
 * DOM querying, manipulation, and traversal helpers
 */

/**
 * Queries single element
 * @param selector CSS selector
 * @param parent Parent element (default: document)
 * @returns Element or null
 */
export function query<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T | null {
  return parent.querySelector(selector) as T | null;
}

/**
 * Queries all elements matching selector
 * @param selector CSS selector
 * @param parent Parent element (default: document)
 * @returns Array of elements
 */
export function queryAll<T extends Element = Element>(
  selector: string,
  parent: Document | Element = document
): T[] {
  return Array.from(parent.querySelectorAll(selector)) as T[];
}

/**
 * Gets parent element
 * @param element Element to get parent of
 * @returns Parent element or null
 */
export function getParent(element: Element): Element | null {
  return element.parentElement;
}

/**
 * Gets parent matching selector
 * @param element Element to start from
 * @param selector CSS selector
 * @returns Matching parent or null
 */
export function getParentMatching(element: Element, selector: string): Element | null {
  let current: Element | null = element.parentElement;
  while (current) {
    if (current.matches(selector)) {
      return current;
    }
    current = current.parentElement;
  }
  return null;
}

/**
 * Gets all children
 * @param element Element to get children of
 * @returns Array of children
 */
export function getChildren(element: Element): Element[] {
  return Array.from(element.children);
}

/**
 * Gets all child elements matching selector
 * @param element Element to search in
 * @param selector CSS selector
 * @returns Array of matching children
 */
export function getChildrenMatching(element: Element, selector: string): Element[] {
  return Array.from(element.children).filter((child) => child.matches(selector));
}

/**
 * Gets siblings of element
 * @param element Element to get siblings of
 * @returns Array of siblings
 */
export function getSiblings(element: Element): Element[] {
  const parent = element.parentElement;
  if (!parent) return [];
  return Array.from(parent.children).filter((child) => child !== element);
}

/**
 * Gets next sibling
 * @param element Element to start from
 * @returns Next sibling or null
 */
export function getNextSibling(element: Element): Element | null {
  return element.nextElementSibling;
}

/**
 * Gets previous sibling
 * @param element Element to start from
 * @returns Previous sibling or null
 */
export function getPreviousSibling(element: Element): Element | null {
  return element.previousElementSibling;
}

/**
 * Gets computed style of element
 * @param element Element to get style for
 * @param property CSS property name
 * @returns Property value
 */
export function getStyle(element: Element, property: string): string {
  return getComputedStyle(element as HTMLElement).getPropertyValue(property);
}

/**
 * Sets inline style property
 * @param element Element to set style on
 * @param property CSS property name
 * @param value Property value
 */
export function setStyle(element: Element, property: string, value: string): void {
  (element as HTMLElement).style.setProperty(property, value);
}

/**
 * Sets multiple inline styles
 * @param element Element to set styles on
 * @param styles Object with property-value pairs
 */
export function setStyles(element: Element, styles: Record<string, string>): void {
  Object.entries(styles).forEach(([property, value]) => {
    setStyle(element, property, value);
  });
}

/**
 * Gets text content of element
 * @param element Element to get text from
 * @returns Text content
 */
export function getText(element: Element): string {
  return element.textContent || '';
}

/**
 * Sets text content of element
 * @param element Element to set text on
 * @param text Text content
 */
export function setText(element: Element, text: string): void {
  element.textContent = text;
}

/**
 * Gets inner HTML of element
 * @param element Element to get HTML from
 * @returns Inner HTML
 */
export function getHTML(element: Element): string {
  return element.innerHTML;
}

/**
 * Sets inner HTML of element
 * @param element Element to set HTML on
 * @param html HTML content
 */
export function setHTML(element: Element, html: string): void {
  element.innerHTML = html;
}

/**
 * Gets attribute value
 * @param element Element to get attribute from
 * @param name Attribute name
 * @returns Attribute value or null
 */
export function getAttribute(element: Element, name: string): string | null {
  return element.getAttribute(name);
}

/**
 * Sets attribute value
 * @param element Element to set attribute on
 * @param name Attribute name
 * @param value Attribute value
 */
export function setAttribute(element: Element, name: string, value: string): void {
  element.setAttribute(name, value);
}

/**
 * Sets multiple attributes
 * @param element Element to set attributes on
 * @param attributes Object with name-value pairs
 */
export function setAttributes(element: Element, attributes: Record<string, string>): void {
  Object.entries(attributes).forEach(([name, value]) => {
    setAttribute(element, name, value);
  });
}

/**
 * Removes attribute
 * @param element Element to remove attribute from
 * @param name Attribute name
 */
export function removeAttribute(element: Element, name: string): void {
  element.removeAttribute(name);
}

/**
 * Checks if element has class
 * @param element Element to check
 * @param className Class name
 * @returns True if has class
 */
export function hasClass(element: Element, className: string): boolean {
  return element.classList.contains(className);
}

/**
 * Adds class to element
 * @param element Element to add class to
 * @param className Class name
 */
export function addClass(element: Element, className: string): void {
  element.classList.add(className);
}

/**
 * Adds multiple classes to element
 * @param element Element to add classes to
 * @param classNames Class names
 */
export function addClasses(element: Element, classNames: string[]): void {
  element.classList.add(...classNames);
}

/**
 * Removes class from element
 * @param element Element to remove class from
 * @param className Class name
 */
export function removeClass(element: Element, className: string): void {
  element.classList.remove(className);
}

/**
 * Removes multiple classes from element
 * @param element Element to remove classes from
 * @param classNames Class names
 */
export function removeClasses(element: Element, classNames: string[]): void {
  element.classList.remove(...classNames);
}

/**
 * Toggles class on element
 * @param element Element to toggle class on
 * @param className Class name
 * @param force Force add or remove (optional)
 */
export function toggleClass(element: Element, className: string, force?: boolean): void {
  element.classList.toggle(className, force);
}

/**
 * Gets all classes of element
 * @param element Element to get classes from
 * @returns Array of class names
 */
export function getClasses(element: Element): string[] {
  return Array.from(element.classList);
}

/**
 * Creates element from HTML string
 * @param html HTML string
 * @returns Created element
 */
export function createElement(html: string): Element {
  const template = document.createElement('template');
  template.innerHTML = html.trim();
  const element = template.content.firstElementChild;
  if (!element) throw new Error('Invalid HTML');
  return element;
}

/**
 * Appends element to parent
 * @param parent Parent element
 * @param child Child element to append
 */
export function append(parent: Element, child: Element): void {
  parent.appendChild(child);
}

/**
 * Appends multiple children to parent
 * @param parent Parent element
 * @param children Child elements to append
 */
export function appendChildren(parent: Element, children: Element[]): void {
  children.forEach((child) => parent.appendChild(child));
}

/**
 * Prepends element to parent
 * @param parent Parent element
 * @param child Child element to prepend
 */
export function prepend(parent: Element, child: Element): void {
  parent.insertBefore(child, parent.firstElementChild);
}

/**
 * Inserts element before reference element
 * @param reference Reference element
 * @param element Element to insert
 */
export function insertBefore(reference: Element, element: Element): void {
  reference.parentElement?.insertBefore(element, reference);
}

/**
 * Inserts element after reference element
 * @param reference Reference element
 * @param element Element to insert
 */
export function insertAfter(reference: Element, element: Element): void {
  reference.parentElement?.insertBefore(element, reference.nextElementSibling);
}

/**
 * Removes element from DOM
 * @param element Element to remove
 */
export function remove(element: Element): void {
  element.remove();
}

/**
 * Removes all children from element
 * @param element Element to clear
 */
export function clear(element: Element): void {
  element.innerHTML = '';
}

/**
 * Replaces element with another
 * @param oldElement Element to replace
 * @param newElement Replacement element
 */
export function replace(oldElement: Element, newElement: Element): void {
  oldElement.parentElement?.replaceChild(newElement, oldElement);
}

/**
 * Clones element
 * @param element Element to clone
 * @param deep Deep clone (default: true)
 * @returns Cloned element
 */
export function clone(element: Element, deep: boolean = true): Element {
  return element.cloneNode(deep) as Element;
}

/**
 * Gets element at position
 * @param x X coordinate
 * @param y Y coordinate
 * @returns Element at position or null
 */
export function getElementAtPosition(x: number, y: number): Element | null {
  return document.elementFromPoint(x, y);
}

/**
 * Gets bounding rect of element
 * @param element Element to measure
 * @returns Bounding rect
 */
export function getBounds(element: Element): DOMRect {
  return element.getBoundingClientRect();
}

/**
 * Checks if element is in viewport
 * @param element Element to check
 * @returns True if in viewport
 */
export function isInViewport(element: Element): boolean {
  const rect = getBounds(element);
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Scrolls element into view
 * @param element Element to scroll into view
 * @param smooth Use smooth scrolling (default: false)
 */
export function scrollIntoView(element: Element, smooth: boolean = false): void {
  element.scrollIntoView({ behavior: smooth ? 'smooth' : 'auto' });
}

/**
 * Gets scroll position of element
 * @param element Element to get scroll position of
 * @returns Object with scrollLeft and scrollTop
 */
export function getScroll(element: Element): { left: number; top: number } {
  const el = element as HTMLElement;
  return { left: el.scrollLeft, top: el.scrollTop };
}

/**
 * Sets scroll position of element
 * @param element Element to set scroll position on
 * @param left Scroll left
 * @param top Scroll top
 */
export function setScroll(element: Element, left: number = 0, top: number = 0): void {
  const el = element as HTMLElement;
  el.scrollLeft = left;
  el.scrollTop = top;
}

/**
 * Checks if element matches selector
 * @param element Element to check
 * @param selector CSS selector
 * @returns True if matches
 */
export function matches(element: Element, selector: string): boolean {
  return element.matches(selector);
}

/**
 * Gets element index among siblings
 * @param element Element to get index of
 * @returns Index or -1
 */
export function getIndex(element: Element): number {
  const parent = element.parentElement;
  if (!parent) return -1;
  return Array.from(parent.children).indexOf(element);
}

/**
 * Focuses element
 * @param element Element to focus
 */
export function focus(element: Element): void {
  (element as HTMLElement).focus();
}

/**
 * Blurs element
 * @param element Element to blur
 */
export function blur(element: Element): void {
  (element as HTMLElement).blur();
}
