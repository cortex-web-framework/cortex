import { test, describe } from 'node:test';
import * as assert from 'node:assert';
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

// Helper function to create mock functions
function createMock(): { fn: () => void; called: boolean; callCount: number; reset: () => void } {
  let callCount = 0;
  return {
    fn: function() { callCount++; },
    get called() { return callCount > 0; },
    get callCount() { return callCount; },
    reset() { callCount = 0; },
  };
}

describe('DOM Utilities - Selection', () => {
  before(() => {
    document.body.innerHTML = `
      <div id="container">
        <div class="item" data-id="1">Item 1</div>
        <div class="item" data-id="2">Item 2</div>
        <div class="item" data-id="3">Item 3</div>
      </div>
    `;
  });

  test('should select single element with $', () => {
    const element = $('#container');
    assert.ok(element !== null, 'element should not be null');
    assert.strictEqual(element?.id, 'container', 'element id should be "container"');
  });

  test('should return null when element not found with $', () => {
    const element = $('.non-existent');
    assert.strictEqual(element, null, 'non-existent element should return null');
  });

  test('should select multiple elements with $$', () => {
    const elements = $$('.item');
    assert.strictEqual(elements.length, 3, 'should find 3 elements');
    assert.strictEqual(elements[0].getAttribute('data-id'), '1', 'first element data-id should be "1"');
  });

  test('should return empty array when no elements found with $$', () => {
    const elements = $$('.non-existent');
    assert.strictEqual(elements.length, 0, 'should return empty array');
    assert.strictEqual(Array.isArray(elements), true, 'result should be array');
  });

  test('should select within context', () => {
    const container = $('#container');
    const items = $$('.item', container!);
    assert.strictEqual(items.length, 3, 'should find 3 items in context');
  });
});

describe('DOM Utilities - Classes', () => {
  let element: Element;

  before(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
  });

  test('should add single class', () => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
    addClass(element, 'active');
    assert.strictEqual(element.classList.contains('active'), true);
  });

  test('should add multiple classes', () => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
    addClass(element, 'active', 'visible', 'highlighted');
    assert.strictEqual(element.classList.contains('active'), true);
    assert.strictEqual(element.classList.contains('visible'), true);
    assert.strictEqual(element.classList.contains('highlighted'), true);
  });

  test('should remove single class', () => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
    element.classList.add('active', 'visible');
    removeClass(element, 'active');
    assert.strictEqual(element.classList.contains('active'), false);
    assert.strictEqual(element.classList.contains('visible'), true);
  });

  test('should remove multiple classes', () => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
    element.classList.add('active', 'visible', 'highlighted');
    removeClass(element, 'active', 'visible');
    assert.strictEqual(element.classList.contains('active'), false);
    assert.strictEqual(element.classList.contains('visible'), false);
    assert.strictEqual(element.classList.contains('highlighted'), true);
  });

  test('should toggle class', () => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
    const result1 = toggleClass(element, 'active');
    assert.strictEqual(result1, true);
    assert.strictEqual(element.classList.contains('active'), true);

    const result2 = toggleClass(element, 'active');
    assert.strictEqual(result2, false);
    assert.strictEqual(element.classList.contains('active'), false);
  });

  test('should toggle class with force parameter', () => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
    toggleClass(element, 'active', true);
    assert.strictEqual(element.classList.contains('active'), true);

    toggleClass(element, 'active', true);
    assert.strictEqual(element.classList.contains('active'), true);

    toggleClass(element, 'active', false);
    assert.strictEqual(element.classList.contains('active'), false);
  });

  test('should check if element has class', () => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
    assert.strictEqual(hasClass(element, 'active'), false);
    element.classList.add('active');
    assert.strictEqual(hasClass(element, 'active'), true);
  });
});

describe('DOM Utilities - Attributes', () => {
  let element: Element;

  before(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
  });

  test('should set single attribute', () => {
    setAttributes(element, { 'data-id': '123' });
    expect(element.getAttribute('data-id')).toBe('123');
  });

  test('should set multiple attributes', () => {
    setAttributes(element, {
      'data-id': '123',
      'data-name': 'test',
      'aria-label': 'Test element',
    });
    expect(element.getAttribute('data-id')).toBe('123');
    expect(element.getAttribute('data-name')).toBe('test');
    expect(element.getAttribute('aria-label')).toBe('Test element');
  });

  test('should remove attribute when value is null', () => {
    element.setAttribute('data-id', '123');
    setAttributes(element, { 'data-id': null });
    assert.strictEqual(element.hasAttribute('data-id'), false);
  });

  test('should get all attributes', () => {
    element.setAttribute('data-id', '123');
    element.setAttribute('data-name', 'test');
    const attrs = getAttributes(element);
    expect(attrs['id']).toBe('test');
    expect(attrs['data-id']).toBe('123');
    expect(attrs['data-name']).toBe('test');
  });

  test('should remove multiple attributes', () => {
    element.setAttribute('data-id', '123');
    element.setAttribute('data-name', 'test');
    element.setAttribute('data-value', 'xyz');
    removeAttributes(element, 'data-id', 'data-name');
    assert.strictEqual(element.hasAttribute('data-id'), false);
    assert.strictEqual(element.hasAttribute('data-name'), false);
    assert.strictEqual(element.hasAttribute('data-value'), true);
  });
});

describe('DOM Utilities - Position and Size', () => {
  let element: HTMLElement;

  before(() => {
    document.body.innerHTML = '<div id="test" style="position: absolute; top: 100px; left: 50px; width: 200px; height: 150px;"></div>';
    element = $('#test') as HTMLElement;
  });

  test('should get element offset', () => {
    const offset = getOffset(element);
    assert.ok(offset["top"] !== undefined);
    assert.ok(offset["left"] !== undefined);
    assert.strictEqual(typeof offset.top, "number");
    assert.strictEqual(typeof offset.left, "number");
  });

  test('should get element position', () => {
    const position = getPosition(element);
    assert.ok(position["x"] !== undefined);
    assert.ok(position["y"] !== undefined);
    assert.strictEqual(typeof position.x, "number");
    assert.strictEqual(typeof position.y, "number");
  });

  test('should get element size', () => {
    const size = getSize(element);
    assert.ok(size["width"] !== undefined);
    assert.ok(size["height"] !== undefined);
    assert.ok(size.width >= 0);
    assert.ok(size.height >= 0);
  });

  test('should get viewport size', () => {
    const viewport = getViewportSize();
    assert.ok(viewport["width"] !== undefined);
    assert.ok(viewport["height"] !== undefined);
    assert.ok(viewport.width > 0);
    assert.ok(viewport.height > 0);
  });
});

describe('DOM Utilities - Scroll', () => {
  let element: HTMLElement;

  before(() => {
    document.body.innerHTML = '<div id="test" style="height: 100px; overflow: auto;"><div style="height: 500px;">Content</div></div>';
    element = $('#test') as HTMLElement;
  });

  test('should get scroll position', () => {
    const position = getScrollPosition();
    assert.ok(position["x"] !== undefined);
    assert.ok(position["y"] !== undefined);
    assert.strictEqual(typeof position.x, "number");
    assert.strictEqual(typeof position.y, "number");
  });

  test('should scroll to element', () => {
    scrollTo(element);
    // In test environment, just verify no errors thrown
    assert.strictEqual(true, true);
  });

  test('should check if element is in viewport', () => {
    const inViewport = isInViewport(element);
    assert.strictEqual(typeof inViewport, "boolean");
  });

  test('should attach scroll listener and return unbind function', () => {
    const handler = createMock().fn;
    const unbind = onScroll(handler);

    assert.strictEqual(typeof unbind, "function");
    unbind();

    // Verify listener was attached and removed
    window.dispatchEvent(new Event('scroll'));
    assert.ok(!handler.called);
  });
});

describe('DOM Utilities - Focus', () => {
  before(() => {
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

  test('should get all focusable elements', () => {
    const container = $('#container')!;
    const focusable = getFocusableElements(container);
    assert.ok(focusable.length >= 4);
  });

  test('should set focus on element', () => {
    const input = $('#input1') as HTMLElement;
    setFocus(input);
    expect(document.activeElement).toBe(input);
  });

  test('should trap focus within container', () => {
    const container = $('#container')!;
    const untrap = trapFocus(container);

    assert.strictEqual(typeof untrap, "function");
    untrap();
  });
});

describe('DOM Utilities - Text and HTML', () => {
  let element: Element;

  before(() => {
    document.body.innerHTML = '<div id="test">Initial content</div>';
    element = $('#test')!;
  });

  test('should get text content', () => {
    const text = getText(element);
    expect(text).toBe('Initial content');
  });

  test('should set text content', () => {
    setText(element, 'New content');
    expect(element.textContent).toBe('New content');
  });

  test('should get HTML content', () => {
    element.innerHTML = '<span>HTML content</span>';
    const html = getHTML(element);
    assert.ok(html.includes('HTML content'));
    assert.ok(html.includes('<span>'));
  });

  test('should set HTML content', () => {
    setHTML(element, '<strong>Bold text</strong>');
    assert.ok(element.innerHTML.includes('<strong>Bold text</strong>'));
  });
});

describe('DOM Utilities - Events', () => {
  let element: Element;

  before(() => {
    document.body.innerHTML = '<div id="test"></div>';
    element = $('#test')!;
  });

  test('should trigger custom event', () => {
    const handler = createMock().fn;
    element.addEventListener('custom-event', handler);

    trigger(element, 'custom-event', { data: 'test' });

    assert.ok(handler.called);
  });

  test('should trigger event with detail', () => {
    const handler = vi.fn((e: Event) => {
      const customEvent = e as CustomEvent;
      assert.deepEqual(customEvent.detail, { value: 123 });
    });
    element.addEventListener('test-event', handler);

    trigger(element, 'test-event', { value: 123 });

    assert.ok(handler.called);
  });

  test('should listen for event once', () => {
    const handler = createMock().fn;
    onceEvent(element, 'click', handler);

    element.dispatchEvent(new Event('click'));
    element.dispatchEvent(new Event('click'));

    assert.strictEqual(handler.callCount, 1);
  });
});

describe('DOM Utilities - CSS and Styles', () => {
  let element: HTMLElement;

  before(() => {
    document.body.innerHTML = '<div id="test" style="color: red; font-size: 16px;"></div>';
    element = $('#test') as HTMLElement;
  });

  test('should get computed style', () => {
    const style = getComputedStyle(element, 'color');
    assert.ok(style !== undefined);
  });

  test('should get all computed styles', () => {
    const styles = getComputedStyle(element);
    assert.ok(styles !== undefined);
    assert.strictEqual(typeof styles, "object");
  });

  test('should set multiple inline styles', () => {
    setStyles(element, {
      color: 'blue',
      backgroundColor: 'yellow',
      fontSize: '20px',
    });
    expect(element.style.color).toBe('blue');
    expect(element.style.backgroundColor).toBe('yellow');
    expect(element.style.fontSize).toBe('20px');
  });

  test('should get inline styles', () => {
    const styles = getStyles(element);
    expect(styles.color).toBe('red');
    expect(styles['font-size']).toBe('16px');
  });
});

describe('DOM Utilities - Parent/Child Relationships', () => {
  before(() => {
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

  test('should find closest ancestor', () => {
    const child = $('#c1')!;
    const parent = closest(child, '.parent');
    assert.ok(parent !== null);
    expect(parent?.id).toBe('p');
  });

  test('should return null when no ancestor matches', () => {
    const child = $('#c1')!;
    const result = closest(child, '.non-existent');
    assert.strictEqual(result, null);
  });

  test('should get parent element', () => {
    const child = $('#c1')!;
    const parent = getParent(child);
    assert.ok(parent !== null);
    expect(parent?.id).toBe('p');
  });

  test('should get parent matching selector', () => {
    const child = $('#c1')!;
    const grandparent = getParent(child, '.grandparent');
    assert.ok(grandparent !== null);
    expect(grandparent?.id).toBe('gp');
  });

  test('should get all children', () => {
    const parent = $('#p')!;
    const children = getChildren(parent);
    expect(children.length).toBe(3);
  });

  test('should get filtered children', () => {
    const parent = $('#p')!;
    const divChildren = getChildren(parent, 'div');
    expect(divChildren.length).toBe(2);
  });

  test('should get siblings', () => {
    const child = $('#c2')!;
    const siblings = getSiblings(child);
    expect(siblings.length).toBe(2);
    assert.strictEqual(siblings.some(s => s.id === 'c1'), true);
    assert.strictEqual(siblings.some(s => s.id === 'c3'), true);
  });

  test('should get filtered siblings', () => {
    const child = $('#c2')!;
    const divSiblings = getSiblings(child, 'div');
    expect(divSiblings.length).toBe(1);
    expect(divSiblings[0].id).toBe('c1');
  });
});

describe('DOM Utilities - DOM Ready and Mutations', () => {
  test('should call callback when DOM is ready', () => {
    const callback = createMock().fn;
    onReady(callback);

    // In test environment, document is already ready
    assert.ok(callback.called);
  });

  test('should observe DOM mutations', () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = $('#container')!;
    const callback = createMock().fn;

    const stop = observeDOM(container, callback);

    // Trigger a mutation
    container.appendChild(document.createElement('div'));

    // Stop observing
    stop();

    assert.strictEqual(typeof stop, "function");
  });
});

describe('DOM Utilities - Browser Safety', () => {
  test('should handle selection when element does not exist', () => {
    const result = $('.completely-non-existent-element');
    assert.strictEqual(result, null);
  });

  test('should return empty array for non-existent elements', () => {
    const results = $$('.completely-non-existent-elements');
    assert.deepEqual(results, []);
  });

  test('should handle viewport size in test environment', () => {
    const viewport = getViewportSize();
    assert.ok(viewport.width >= 0);
    assert.ok(viewport.height >= 0);
  });

  test('should handle scroll position in test environment', () => {
    const position = getScrollPosition();
    assert.strictEqual(typeof position.x, "number");
    assert.strictEqual(typeof position.y, "number");
  });
});
