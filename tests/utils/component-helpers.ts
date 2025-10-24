/**
 * Web Component testing utilities - no external dependencies
 */

import * as dom from './dom-helpers.js';

/**
 * Renders a Web Component and waits for it to be ready
 * @param html HTML containing the component
 * @param container Optional container element
 * @returns The rendered component element
 */
export async function renderComponent(
  html: string,
  container?: HTMLElement
): Promise<Element> {
  const el = dom.createDOMElement(html);

  if (!container) {
    container = dom.createTestContainer();
  }

  container.appendChild(el);

  // Wait for component to render
  await waitForComponentRender(el);

  return el;
}

/**
 * Waits for a component to render (handles async component initialization)
 * @param element The component element
 * @param timeout Maximum time to wait in ms
 */
export async function waitForComponentRender(
  element: Element,
  timeout: number = 5000
): Promise<void> {
  // Wait for next animation frame and a bit more for component initialization
  await new Promise((resolve) => requestAnimationFrame(resolve));
  await new Promise((resolve) => setTimeout(resolve, 100));

  // If component has a custom render method, optionally wait for it
  // This is a simplified version - adjust based on your component patterns
}

/**
 * Gets a component property value
 * @param element The component element
 * @param prop Property name
 * @returns Property value
 */
export function getComponentProperty(element: Element, prop: string): any {
  return (element as any)[prop];
}

/**
 * Sets a component property
 * @param element The component element
 * @param prop Property name
 * @param value Property value
 */
export function setComponentProperty(element: Element, prop: string, value: any): void {
  (element as any)[prop] = value;
}

/**
 * Gets all component attributes
 * @param element The component element
 * @returns Object with attribute names and values
 */
export function getComponentAttributes(element: Element): Record<string, string> {
  const attrs: Record<string, string> = {};

  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attrs[attr.name] = attr.value;
  }

  return attrs;
}

/**
 * Triggers a component event and captures it
 * @param element The component element
 * @param eventName Event name
 * @param detail Event detail
 * @returns Promise with event detail
 */
export function triggerComponentEvent(
  element: Element,
  eventName: string,
  detail?: any
): Promise<CustomEvent> {
  return new Promise((resolve) => {
    const handler = (event: Event) => {
      element.removeEventListener(eventName, handler);
      resolve(event as CustomEvent);
    };

    element.addEventListener(eventName, handler);
    dom.triggerCustom(element, eventName, detail);
  });
}

/**
 * Listens for component events
 * @param element The component element
 * @param eventName Event name
 * @param callback Callback function
 * @returns Function to remove listener
 */
export function onComponentEvent(
  element: Element,
  eventName: string,
  callback: (event: CustomEvent) => void
): () => void {
  const handler = (event: Event) => {
    callback(event as CustomEvent);
  };

  element.addEventListener(eventName, handler);

  return () => {
    element.removeEventListener(eventName, handler);
  };
}

/**
 * Waits for a component event to fire
 * @param element The component element
 * @param eventName Event name
 * @param timeout Maximum time to wait in ms
 * @returns Promise with event detail
 */
export async function waitForComponentEvent(
  element: Element,
  eventName: string,
  timeout: number = 5000
): Promise<any> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      element.removeEventListener(eventName, handler);
      reject(new Error(`Component event not fired: ${eventName}`));
    }, timeout);

    const handler = (event: Event) => {
      clearTimeout(timer);
      element.removeEventListener(eventName, handler);
      resolve((event as CustomEvent).detail);
    };

    element.addEventListener(eventName, handler);
  });
}

/**
 * Gets the shadow root of a component
 * @param element The component element
 * @returns The shadow root
 */
export function getShadowRoot(element: Element): ShadowRoot | null {
  return (element as any).shadowRoot || null;
}

/**
 * Queries within a component's shadow DOM
 * @param element The component element
 * @param selector CSS selector
 * @returns The element or null
 */
export function queryInShadow<T extends Element = Element>(
  element: Element,
  selector: string
): T | null {
  const shadowRoot = getShadowRoot(element);

  if (!shadowRoot) {
    throw new Error('Component has no shadow root');
  }

  return shadowRoot.querySelector(selector) as T | null;
}

/**
 * Queries all elements within shadow DOM
 * @param element The component element
 * @param selector CSS selector
 * @returns Array of elements
 */
export function queryAllInShadow<T extends Element = Element>(
  element: Element,
  selector: string
): T[] {
  const shadowRoot = getShadowRoot(element);

  if (!shadowRoot) {
    throw new Error('Component has no shadow root');
  }

  return Array.from(shadowRoot.querySelectorAll(selector)) as T[];
}

/**
 * Gets computed styles from shadow DOM element
 * @param element The component element
 * @param selector Selector for element in shadow DOM
 * @returns Computed style
 */
export function getShadowStyle(element: Element, selector: string): CSSStyleDeclaration {
  const shadowElement = queryInShadow(element, selector);

  if (!shadowElement) {
    throw new Error(`Element not found in shadow DOM: ${selector}`);
  }

  return window.getComputedStyle(shadowElement);
}

/**
 * Gets text content from element in shadow DOM
 * @param element The component element
 * @param selector Selector for element in shadow DOM
 * @returns Text content
 */
export function getShadowText(element: Element, selector: string): string {
  const shadowElement = queryInShadow(element, selector);

  if (!shadowElement) {
    throw new Error(`Element not found in shadow DOM: ${selector}`);
  }

  return shadowElement.textContent || '';
}

/**
 * Triggers click on element in shadow DOM
 * @param element The component element
 * @param selector Selector for element in shadow DOM
 */
export function clickInShadow(element: Element, selector: string): void {
  const shadowElement = queryInShadow(element, selector);

  if (!shadowElement) {
    throw new Error(`Element not found in shadow DOM: ${selector}`);
  }

  dom.click(shadowElement);
}

/**
 * Sets value on input in shadow DOM
 * @param element The component element
 * @param selector Selector for input in shadow DOM
 * @param value The value
 */
export function setValueInShadow(element: Element, selector: string, value: string): void {
  const shadowElement = queryInShadow(element, selector);

  if (!shadowElement) {
    throw new Error(`Element not found in shadow DOM: ${selector}`);
  }

  dom.setValue(shadowElement, value);
}

/**
 * Gets value from input in shadow DOM
 * @param element The component element
 * @param selector Selector for input in shadow DOM
 * @returns The value
 */
export function getValueInShadow(element: Element, selector: string): string {
  const shadowElement = queryInShadow(element, selector);

  if (!shadowElement) {
    throw new Error(`Element not found in shadow DOM: ${selector}`);
  }

  return dom.getValue(shadowElement);
}

/**
 * Checks if component has specific attribute
 * @param element The component element
 * @param name Attribute name
 * @returns True if attribute exists
 */
export function hasComponentAttribute(element: Element, name: string): boolean {
  return element.hasAttribute(name);
}

/**
 * Gets component attribute value
 * @param element The component element
 * @param name Attribute name
 * @returns Attribute value or null
 */
export function getComponentAttribute(element: Element, name: string): string | null {
  return element.getAttribute(name);
}

/**
 * Sets component attributes
 * @param element The component element
 * @param attrs Attributes to set
 */
export function setComponentAttributes(
  element: Element,
  attrs: Record<string, string | boolean | number>
): void {
  dom.setAttributes(element, attrs);
}

/**
 * Checks if component has specific class
 * @param element The component element
 * @param className Class name
 * @returns True if component has class
 */
export function hasComponentClass(element: Element, className: string): boolean {
  return dom.hasClass(element, className);
}

/**
 * Simulates component state change
 * @param element The component element
 * @param prop Property name
 * @param value New value
 * @param eventName Optional event name to wait for
 */
export async function changeComponentState(
  element: Element,
  prop: string,
  value: any,
  eventName?: string
): Promise<void> {
  setComponentProperty(element, prop, value);

  // Trigger change detection
  await waitForComponentRender(element);

  if (eventName) {
    await waitForComponentEvent(element, eventName);
  }
}

/**
 * Simulates form submission within component
 * @param element The component element
 * @param formSelector Selector for form in component
 */
export async function submitComponentForm(
  element: Element,
  formSelector: string = 'form'
): Promise<void> {
  const form = queryInShadow<HTMLFormElement>(element, formSelector);

  if (!form) {
    throw new Error(`Form not found: ${formSelector}`);
  }

  form.dispatchEvent(new Event('submit', { bubbles: true, cancelable: true }));
  await waitForComponentRender(element);
}

/**
 * Gets all data attributes from component
 * @param element The component element
 * @returns Object with data attributes
 */
export function getComponentDataAttributes(element: Element): Record<string, string> {
  const data: Record<string, string> = {};
  const attrs = element.attributes;

  for (let i = 0; i < attrs.length; i++) {
    const attr = attrs[i];
    if (attr.name.startsWith('data-')) {
      data[attr.name.substring(5)] = attr.value;
    }
  }

  return data;
}

/**
 * Verifies component accessibility attributes
 * @param element The component element
 * @returns Object with accessibility info
 */
export function getComponentA11y(element: Element): Record<string, any> {
  return {
    role: element.getAttribute('role'),
    ariaLabel: element.getAttribute('aria-label'),
    ariaLabelledBy: element.getAttribute('aria-labelledby'),
    ariaDescribedBy: element.getAttribute('aria-describedby'),
    ariaHidden: element.getAttribute('aria-hidden'),
    tabIndex: (element as any).tabIndex,
    disabled: element.hasAttribute('disabled'),
  };
}
