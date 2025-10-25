import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  $,
  $$,
  addClass,
  removeClass,
  toggleClass,
  hasClass,
  setAttributes,
  getAttributes,
  removeAttributes,
  getOffset,
  getPosition,
  getSize,
  getViewportSize,
  scrollTo,
  getScrollPosition,
  isInViewport,
  onScroll,
  getFocusableElements,
  trapFocus,
  setFocus,
  getText,
  setText,
  getHTML,
  setHTML,
  trigger,
  onceEvent,
  getComputedStyle,
  setStyles,
  getStyles,
  closest,
  getParent,
  getChildren,
  getSiblings,
  onReady,
  observeDOM,
} from './dom';

describe('DOM Utilities - Selection', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <div class="item" data-id="1">Item 1</div>
        <div class="item" data-id="2">Item 2</div>
        <div class="item" data-id="3">Item 3</div>
      </div>
    `;
  });

  it('should select single element with $', () => {
    const element = $('#container');
    expect(element).not.toBeNull();
    expect(element?.id).toBe('container');
  });

  it('should return null when element not found with $', () => {
    const element = $('.non-existent');
    expect(element).toBeNull();
  });

  it('should select multiple elements with $$', () => {
    const elements = $$('.item');
    expect(elements).toHaveLength(3);
    expect(elements[0].getAttribute('data-id')).toBe('1');
  });

  it('should return empty array when no elements found with $$', () => {
    const elements = $$('.non-existent');
    expect(elements).toHaveLength(0);
    expect(Array.isArray(elements)).toBe(true);
  });

  it('should select within context', () => {
    const container = $('#container');
    const items = $$('.item', container!);
    expect(items).toHaveLength(3);
  });
});

describe('DOM Utilities - Classes', () => {
  let element: Element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
  });

  it('should add single class', () => {
    addClass(element, 'active');
    expect(element.classList.contains('active')).toBe(true);
  });

  it('should add multiple classes', () => {
    addClass(element, 'active', 'visible', 'highlighted');
    expect(element.classList.contains('active')).toBe(true);
    expect(element.classList.contains('visible')).toBe(true);
    expect(element.classList.contains('highlighted')).toBe(true);
  });

  it('should remove single class', () => {
    element.classList.add('active', 'visible');
    removeClass(element, 'active');
    expect(element.classList.contains('active')).toBe(false);
    expect(element.classList.contains('visible')).toBe(true);
  });

  it('should remove multiple classes', () => {
    element.classList.add('active', 'visible', 'highlighted');
    removeClass(element, 'active', 'visible');
    expect(element.classList.contains('active')).toBe(false);
    expect(element.classList.contains('visible')).toBe(false);
    expect(element.classList.contains('highlighted')).toBe(true);
  });

  it('should toggle class', () => {
    const result1 = toggleClass(element, 'active');
    expect(result1).toBe(true);
    expect(element.classList.contains('active')).toBe(true);

    const result2 = toggleClass(element, 'active');
    expect(result2).toBe(false);
    expect(element.classList.contains('active')).toBe(false);
  });

  it('should toggle class with force parameter', () => {
    toggleClass(element, 'active', true);
    expect(element.classList.contains('active')).toBe(true);

    toggleClass(element, 'active', true);
    expect(element.classList.contains('active')).toBe(true);

    toggleClass(element, 'active', false);
    expect(element.classList.contains('active')).toBe(false);
  });

  it('should check if element has class', () => {
    expect(hasClass(element, 'active')).toBe(false);
    element.classList.add('active');
    expect(hasClass(element, 'active')).toBe(true);
  });
});

describe('DOM Utilities - Attributes', () => {
  let element: Element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
  });

  it('should set single attribute', () => {
    setAttributes(element, { 'data-id': '123' });
    expect(element.getAttribute('data-id')).toBe('123');
  });

  it('should set multiple attributes', () => {
    setAttributes(element, {
      'data-id': '123',
      'data-name': 'test',
      'aria-label': 'Test element',
    });
    expect(element.getAttribute('data-id')).toBe('123');
    expect(element.getAttribute('data-name')).toBe('test');
    expect(element.getAttribute('aria-label')).toBe('Test element');
  });

  it('should remove attribute when value is null', () => {
    element.setAttribute('data-id', '123');
    setAttributes(element, { 'data-id': null });
    expect(element.hasAttribute('data-id')).toBe(false);
  });

  it('should get all attributes', () => {
    element.setAttribute('data-id', '123');
    element.setAttribute('data-name', 'test');
    const attrs = getAttributes(element);
    expect(attrs['id']).toBe('test');
    expect(attrs['data-id']).toBe('123');
    expect(attrs['data-name']).toBe('test');
  });

  it('should remove multiple attributes', () => {
    element.setAttribute('data-id', '123');
    element.setAttribute('data-name', 'test');
    element.setAttribute('data-value', 'xyz');
    removeAttributes(element, 'data-id', 'data-name');
    expect(element.hasAttribute('data-id')).toBe(false);
    expect(element.hasAttribute('data-name')).toBe(false);
    expect(element.hasAttribute('data-value')).toBe(true);
  });
});

describe('DOM Utilities - Position and Size', () => {
  let element: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test" style="position: absolute; top: 100px; left: 50px; width: 200px; height: 150px;"></div>';
    element = $('#test') as HTMLElement;
  });

  it('should get element offset', () => {
    const offset = getOffset(element);
    expect(offset).toHaveProperty('top');
    expect(offset).toHaveProperty('left');
    expect(typeof offset.top).toBe('number');
    expect(typeof offset.left).toBe('number');
  });

  it('should get element position', () => {
    const position = getPosition(element);
    expect(position).toHaveProperty('x');
    expect(position).toHaveProperty('y');
    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
  });

  it('should get element size', () => {
    const size = getSize(element);
    expect(size).toHaveProperty('width');
    expect(size).toHaveProperty('height');
    expect(size.width).toBeGreaterThanOrEqual(0);
    expect(size.height).toBeGreaterThanOrEqual(0);
  });

  it('should get viewport size', () => {
    const viewport = getViewportSize();
    expect(viewport).toHaveProperty('width');
    expect(viewport).toHaveProperty('height');
    expect(viewport.width).toBeGreaterThan(0);
    expect(viewport.height).toBeGreaterThan(0);
  });
});

describe('DOM Utilities - Scroll', () => {
  let element: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test" style="height: 100px; overflow: auto;"><div style="height: 500px;">Content</div></div>';
    element = $('#test') as HTMLElement;
  });

  it('should get scroll position', () => {
    const position = getScrollPosition();
    expect(position).toHaveProperty('x');
    expect(position).toHaveProperty('y');
    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
  });

  it('should scroll to element', () => {
    scrollTo(element);
    // In test environment, just verify no errors thrown
    expect(true).toBe(true);
  });

  it('should check if element is in viewport', () => {
    const inViewport = isInViewport(element);
    expect(typeof inViewport).toBe('boolean');
  });

  it('should attach scroll listener and return unbind function', () => {
    const handler = vi.fn();
    const unbind = onScroll(handler);

    expect(typeof unbind).toBe('function');
    unbind();

    // Verify listener was attached and removed
    window.dispatchEvent(new Event('scroll'));
    expect(handler).not.toHaveBeenCalled();
  });
});

describe('DOM Utilities - Focus', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div id="container">
        <button id="btn1">Button 1</button>
        <input id="input1" type="text" />
        <a href="#" id="link1">Link 1</a>
        <div tabindex="0" id="div1">Focusable Div</div>
        <div id="div2">Non-focusable</div>
      </div>
    `;
  });

  it('should get all focusable elements', () => {
    const container = $('#container')!;
    const focusable = getFocusableElements(container);
    expect(focusable.length).toBeGreaterThanOrEqual(4);
  });

  it('should set focus on element', () => {
    const input = $('#input1') as HTMLElement;
    setFocus(input);
    expect(document.activeElement).toBe(input);
  });

  it('should trap focus within container', () => {
    const container = $('#container')!;
    const untrap = trapFocus(container);

    expect(typeof untrap).toBe('function');
    untrap();
  });
});

describe('DOM Utilities - Text and HTML', () => {
  let element: Element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test">Initial content</div>';
    element = $('#test')!;
  });

  it('should get text content', () => {
    const text = getText(element);
    expect(text).toBe('Initial content');
  });

  it('should set text content', () => {
    setText(element, 'New content');
    expect(element.textContent).toBe('New content');
  });

  it('should get HTML content', () => {
    element.innerHTML = '<span>HTML content</span>';
    const html = getHTML(element);
    expect(html).toContain('HTML content');
    expect(html).toContain('<span>');
  });

  it('should set HTML content', () => {
    setHTML(element, '<strong>Bold text</strong>');
    expect(element.innerHTML).toContain('<strong>Bold text</strong>');
  });
});

describe('DOM Utilities - Events', () => {
  let element: Element;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
  });

  it('should trigger custom event', () => {
    const handler = vi.fn();
    element.addEventListener('custom-event', handler);

    trigger(element, 'custom-event', { data: 'test' });

    expect(handler).toHaveBeenCalled();
  });

  it('should trigger event with detail', () => {
    const handler = vi.fn((e: Event) => {
      const customEvent = e as CustomEvent;
      expect(customEvent.detail).toEqual({ value: 123 });
    });
    element.addEventListener('test-event', handler);

    trigger(element, 'test-event', { value: 123 });

    expect(handler).toHaveBeenCalled();
  });

  it('should listen for event once', () => {
    const handler = vi.fn();
    onceEvent(element, 'click', handler);

    element.dispatchEvent(new Event('click'));
    element.dispatchEvent(new Event('click'));

    expect(handler).toHaveBeenCalledTimes(1);
  });
});

describe('DOM Utilities - CSS and Styles', () => {
  let element: HTMLElement;

  beforeEach(() => {
    document.body.innerHTML = '<div id="test" style="color: red; font-size: 16px;"></div>';
    element = $('#test') as HTMLElement;
  });

  it('should get computed style', () => {
    const style = getComputedStyle(element, 'color');
    expect(style).toBeDefined();
  });

  it('should get all computed styles', () => {
    const styles = getComputedStyle(element);
    expect(styles).toBeDefined();
    expect(typeof styles).toBe('object');
  });

  it('should set multiple inline styles', () => {
    setStyles(element, {
      color: 'blue',
      backgroundColor: 'yellow',
      fontSize: '20px',
    });
    expect(element.style.color).toBe('blue');
    expect(element.style.backgroundColor).toBe('yellow');
    expect(element.style.fontSize).toBe('20px');
  });

  it('should get inline styles', () => {
    const styles = getStyles(element);
    expect(styles.color).toBe('red');
    expect(styles['font-size']).toBe('16px');
  });
});

describe('DOM Utilities - Parent/Child Relationships', () => {
  beforeEach(() => {
    document.body.innerHTML = `
      <div class="grandparent" id="gp">
        <div class="parent" id="p">
          <div class="child" id="c1">Child 1</div>
          <div class="child" id="c2">Child 2</div>
          <span class="child" id="c3">Child 3</span>
        </div>
      </div>
    `;
  });

  it('should find closest ancestor', () => {
    const child = $('#c1')!;
    const parent = closest(child, '.parent');
    expect(parent).not.toBeNull();
    expect(parent?.id).toBe('p');
  });

  it('should return null when no ancestor matches', () => {
    const child = $('#c1')!;
    const result = closest(child, '.non-existent');
    expect(result).toBeNull();
  });

  it('should get parent element', () => {
    const child = $('#c1')!;
    const parent = getParent(child);
    expect(parent).not.toBeNull();
    expect(parent?.id).toBe('p');
  });

  it('should get parent matching selector', () => {
    const child = $('#c1')!;
    const grandparent = getParent(child, '.grandparent');
    expect(grandparent).not.toBeNull();
    expect(grandparent?.id).toBe('gp');
  });

  it('should get all children', () => {
    const parent = $('#p')!;
    const children = getChildren(parent);
    expect(children.length).toBe(3);
  });

  it('should get filtered children', () => {
    const parent = $('#p')!;
    const divChildren = getChildren(parent, 'div');
    expect(divChildren.length).toBe(2);
  });

  it('should get siblings', () => {
    const child = $('#c2')!;
    const siblings = getSiblings(child);
    expect(siblings.length).toBe(2);
    expect(siblings.some(s => s.id === 'c1')).toBe(true);
    expect(siblings.some(s => s.id === 'c3')).toBe(true);
  });

  it('should get filtered siblings', () => {
    const child = $('#c2')!;
    const divSiblings = getSiblings(child, 'div');
    expect(divSiblings.length).toBe(1);
    expect(divSiblings[0].id).toBe('c1');
  });
});

describe('DOM Utilities - DOM Ready and Mutations', () => {
  it('should call callback when DOM is ready', () => {
    const callback = vi.fn();
    onReady(callback);

    // In test environment, document is already ready
    expect(callback).toHaveBeenCalled();
  });

  it('should observe DOM mutations', () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = $('#container')!;
    const callback = vi.fn();

    const stop = observeDOM(container, callback);

    // Trigger a mutation
    container.appendChild(document.createElement('div'));

    // Stop observing
    stop();

    expect(typeof stop).toBe('function');
  });
});

describe('DOM Utilities - Browser Safety', () => {
  it('should handle selection when element does not exist', () => {
    const result = $('.completely-non-existent-element');
    expect(result).toBeNull();
  });

  it('should return empty array for non-existent elements', () => {
    const results = $$('.completely-non-existent-elements');
    expect(results).toEqual([]);
  });

  it('should handle viewport size in test environment', () => {
    const viewport = getViewportSize();
    expect(viewport.width).toBeGreaterThanOrEqual(0);
    expect(viewport.height).toBeGreaterThanOrEqual(0);
  });

  it('should handle scroll position in test environment', () => {
    const position = getScrollPosition();
    expect(typeof position.x).toBe('number');
    expect(typeof position.y).toBe('number');
  });
});
