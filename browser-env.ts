/**
 * Browser Environment Mock for Testing
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

// Mock DOM environment
(global as any).document = {
  createElement: (tagName: string): HTMLElement => {
    const element = {
      tagName: tagName.toUpperCase(),
      attributes: new Map<string, string>(),
      textContent: '',
      innerHTML: '',
      addEventListener: (event: string, callback: (event: any) => void) => {
        // Mock event listener storage
        if (!(element as any).eventListeners) {
          (element as any).eventListeners = new Map();
        }
        (element as any).eventListeners.set(event, callback);
      },
      removeEventListener: (event: string, callback: (event: any) => void) => {
        if ((element as any).eventListeners) {
          (element as any).eventListeners.delete(event);
        }
      },
      dispatchEvent: (event: CustomEvent) => {
        if ((element as any).eventListeners) {
          const callback = (element as any).eventListeners.get(event.type);
          if (callback) {
            callback(event);
          }
        }
      },
      getAttribute: (name: string): string | null => {
        return (element as any).attributes.get(name) || null;
      },
      setAttribute: (name: string, value: string): void => {
        (element as any).attributes.set(name, value);
      },
      removeAttribute: (name: string): void => {
        (element as any).attributes.delete(name);
      },
      hasAttribute: (name: string): boolean => {
        return (element as any).attributes.has(name);
      },
      getAttributeNames: (): string[] => {
        return Array.from((element as any).attributes.keys());
      }
    } as HTMLElement;
    
    return element;
  },
  querySelector: (selector: string): HTMLElement | null => null,
  querySelectorAll: (selector: string): NodeListOf<HTMLElement> => {
    return [] as any;
  }
};

(global as any).window = {
  performance: {
    now: (): number => Date.now()
  },
  customElements: {
    define: (name: string, constructor: any): void => {
      // Mock custom elements registry
      if (!(global as any).customElementsRegistry) {
        (global as any).customElementsRegistry = new Map();
      }
      (global as any).customElementsRegistry.set(name, constructor);
    },
    get: (name: string): any => {
      return (global as any).customElementsRegistry?.get(name);
    }
  }
};

(global as any).HTMLElement = class HTMLElement {
  public tagName: string = '';
  public attributes: Map<string, string> = new Map();
  public eventListeners: Map<string, (event: any) => void> = new Map();
  public shadowRoot: ShadowRoot | null = null;

  constructor() {
    this.tagName = 'HTMLElement';
  }

  addEventListener(event: string, callback: (event: any) => void): void {
    this.eventListeners.set(event, callback);
  }

  removeEventListener(event: string, callback: (event: any) => void): void {
    this.eventListeners.delete(event);
  }

  dispatchEvent(event: CustomEvent): boolean {
    const callback = this.eventListeners.get(event.type);
    if (callback) {
      callback(event);
      return true;
    }
    return false;
  }

  getAttribute(name: string): string | null {
    return this.attributes.get(name) || null;
  }

  setAttribute(name: string, value: string): void {
    this.attributes.set(name, value);
  }

  removeAttribute(name: string): void {
    this.attributes.delete(name);
  }

  hasAttribute(name: string): boolean {
    return this.attributes.has(name);
  }

  getAttributeNames(): string[] {
    return Array.from(this.attributes.keys());
  }

  attachShadow(options: { mode: string }): ShadowRoot {
    this.shadowRoot = {
      innerHTML: '',
      querySelector: (selector: string) => {
        // Mock querySelector to return elements based on innerHTML content
        if (selector === '.accordion' && this.shadowRoot?.innerHTML.includes('class="accordion"')) {
          return {
            getAttribute: (name: string) => {
              if (name === 'role') return 'region';
              if (name === 'aria-label') return 'Accordion';
              return null;
            }
          } as HTMLElement;
        }
        return null;
      },
      querySelectorAll: (selector: string) => [] as any
    } as ShadowRoot;
    return this.shadowRoot;
  }

  click(): void {
    this.dispatchEvent(new CustomEvent('click', {
      bubbles: true,
      composed: true
    }));
  }

  focus(): void {
    this.dispatchEvent(new CustomEvent('focus', {
      bubbles: true,
      composed: true
    }));
  }

  blur(): void {
    this.dispatchEvent(new CustomEvent('blur', {
      bubbles: true,
      composed: true
    }));
  }
};

(global as any).ShadowRoot = class ShadowRoot {
  public innerHTML: string = '';
  
  querySelector(selector: string): HTMLElement | null {
    return null;
  }
  
  querySelectorAll(selector: string): NodeListOf<HTMLElement> {
    return [] as any;
  }
};

(global as any).CustomEvent = class CustomEvent {
  public type: string;
  public detail: any;
  public bubbles: boolean;
  public composed: boolean;

  constructor(type: string, options: { detail?: any; bubbles?: boolean; composed?: boolean } = {}) {
    this.type = type;
    this.detail = options.detail;
    this.bubbles = options.bubbles || false;
    this.composed = options.composed || false;
  }
};

(global as any).KeyboardEvent = class KeyboardEvent {
  public type: string;
  public key: string;
  public bubbles: boolean;
  public composed: boolean;

  constructor(type: string, options: { key?: string; bubbles?: boolean; composed?: boolean } = {}) {
    this.type = type;
    this.key = options.key || '';
    this.bubbles = options.bubbles || false;
    this.composed = options.composed || false;
  }
};

(global as any).NodeListOf = class NodeListOf<T> extends Array<T> {
  constructor(...items: T[]) {
    super(...items);
  }
};

// Mock performance API
(global as any).performance = {
  now: (): number => Date.now()
};

export {};