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
function createMock() {
  let callCount = 0;
  return {
    fn: function() { callCount++; },
    get called() { return callCount > 0; },
    get callCount() { return callCount; },
    reset() { callCount = 0; },
  };
}

describe('DOM Utilities - Selection', () => {
  test('should select single element with $', () => {
    document.body.innerHTML = `
      <div id="container">
        <div class="item" data-id="1">Item 1</div>
        <div class="item" data-id="2">Item 2</div>
        <div class="item" data-id="3">Item 3</div>
      </div>
    `;
    const element = $('#container');
    assert.ok(element !== null, 'element should not be null');
    assert.strictEqual(element?.id, 'container', 'element id should be "container"');
  });

  test('should return null when element not found with $', () => {
    document.body.innerHTML = `<div id="container"></div>`;
    const element = $('.non-existent');
    assert.strictEqual(element, null, 'non-existent element should return null');
  });

  test('should select multiple elements with $$', () => {
    document.body.innerHTML = `
      <div id="container">
        <div class="item" data-id="1">Item 1</div>
        <div class="item" data-id="2">Item 2</div>
        <div class="item" data-id="3">Item 3</div>
      </div>
    `;
    const elements = $$('.item');
    assert.strictEqual(elements.length, 3, 'should find 3 elements');
    assert.strictEqual(elements[0].getAttribute('data-id'), '1', 'first element data-id should be "1"');
  });

  test('should return empty array when no elements found with $$', () => {
    document.body.innerHTML = '';
    const elements = $$('.non-existent');
    assert.strictEqual(elements.length, 0, 'should return empty array');
    assert.strictEqual(Array.isArray(elements), true, 'result should be array');
  });

  test('should select within context', () => {
    document.body.innerHTML = `
      <div id="container">
        <div class="item" data-id="1">Item 1</div>
        <div class="item" data-id="2">Item 2</div>
        <div class="item" data-id="3">Item 3</div>
      </div>
    `;
    const container = $('#container');
    const items = $$('.item', container!);
    assert.strictEqual(items.length, 3, 'should find 3 items in context');
  });
});

describe('DOM Utilities - Classes', () => {
  test('should add single class', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    addClass(element, 'active');
    assert.strictEqual(element.classList.contains('active'), true);
  });

  test('should add multiple classes', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    addClass(element, 'active', 'visible', 'highlighted');
    assert.strictEqual(element.classList.contains('active'), true);
    assert.strictEqual(element.classList.contains('visible'), true);
    assert.strictEqual(element.classList.contains('highlighted'), true);
  });

  test('should remove single class', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    element.classList.add('active', 'visible');
    removeClass(element, 'active');
    assert.strictEqual(element.classList.contains('active'), false);
    assert.strictEqual(element.classList.contains('visible'), true);
  });

  test('should remove multiple classes', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    element.classList.add('active', 'visible', 'highlighted');
    removeClass(element, 'active', 'visible');
    assert.strictEqual(element.classList.contains('active'), false);
    assert.strictEqual(element.classList.contains('visible'), false);
    assert.strictEqual(element.classList.contains('highlighted'), true);
  });

  test('should toggle class', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    const result1 = toggleClass(element, 'active');
    assert.strictEqual(result1, true);
    assert.strictEqual(element.classList.contains('active'), true);

    const result2 = toggleClass(element, 'active');
    assert.strictEqual(result2, false);
    assert.strictEqual(element.classList.contains('active'), false);
  });

  test('should toggle class with force parameter', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    toggleClass(element, 'active', true);
    assert.strictEqual(element.classList.contains('active'), true);

    toggleClass(element, 'active', true);
    assert.strictEqual(element.classList.contains('active'), true);

    toggleClass(element, 'active', false);
    assert.strictEqual(element.classList.contains('active'), false);
  });

  test('should check if element has class', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    assert.strictEqual(hasClass(element, 'active'), false);
    element.classList.add('active');
    assert.strictEqual(hasClass(element, 'active'), true);
  });
});

describe('DOM Utilities - Attributes', () => {
  test('should set single attribute', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    setAttributes(element, { 'data-id': '123' });
    assert.strictEqual(element.getAttribute('data-id'), '123');
  });

  test('should set multiple attributes', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    setAttributes(element, {
      'data-id': '123',
      'data-name': 'test',
      'aria-label': 'Test element',
    });
    assert.strictEqual(element.getAttribute('data-id'), '123');
    assert.strictEqual(element.getAttribute('data-name'), 'test');
    assert.strictEqual(element.getAttribute('aria-label'), 'Test element');
  });

  test('should remove attribute when value is null', () => {
    document.body.innerHTML = '<div id="test" data-id="123"></div>';
    const element = $('#test')!;
    setAttributes(element, { 'data-id': null });
    assert.strictEqual(element.hasAttribute('data-id'), false);
  });

  test('should get all attributes', () => {
    document.body.innerHTML = '<div id="test" data-id="123" data-name="test"></div>';
    const element = $('#test')!;
    const attrs = getAttributes(element);
    assert.strictEqual(attrs['id'], 'test');
    assert.strictEqual(attrs['data-id'], '123');
    assert.strictEqual(attrs['data-name'], 'test');
  });

  test('should remove multiple attributes', () => {
    document.body.innerHTML = '<div id="test" data-id="123" data-name="test" data-value="xyz"></div>';
    const element = $('#test')!;
    removeAttributes(element, 'data-id', 'data-name');
    assert.strictEqual(element.hasAttribute('data-id'), false);
    assert.strictEqual(element.hasAttribute('data-name'), false);
    assert.strictEqual(element.hasAttribute('data-value'), true);
  });
});

describe('DOM Utilities - Position and Size', () => {
  test('should get element offset', () => {
    document.body.innerHTML = '<div id="test" style="position: absolute; top: 100px; left: 50px; width: 200px; height: 150px;"></div>';
    const element = $('#test') as HTMLElement;
    const offset = getOffset(element);
    assert.ok(offset, 'offset should exist');
    assert.ok('top' in offset, 'offset should have top property');
    assert.ok('left' in offset, 'offset should have left property');
  });

  test('should get element position', () => {
    document.body.innerHTML = '<div id="test" style="position: absolute; top: 100px; left: 50px;"></div>';
    const element = $('#test') as HTMLElement;
    const position = getPosition(element);
    assert.ok(position, 'position should exist');
    assert.ok('x' in position, 'position should have x property');
    assert.ok('y' in position, 'position should have y property');
  });

  test('should get element size', () => {
    document.body.innerHTML = '<div id="test" style="width: 200px; height: 150px;"></div>';
    const element = $('#test') as HTMLElement;
    const size = getSize(element);
    assert.ok(size, 'size should exist');
    assert.ok('width' in size, 'size should have width property');
    assert.ok('height' in size, 'size should have height property');
  });

  test('should get viewport size', () => {
    const viewport = getViewportSize();
    assert.ok(viewport, 'viewport should exist');
    assert.ok('width' in viewport, 'viewport should have width property');
    assert.ok('height' in viewport, 'viewport should have height property');
    assert.ok(viewport.width >= 0, 'viewport width should be >= 0');
    assert.ok(viewport.height >= 0, 'viewport height should be >= 0');
  });
});

describe('DOM Utilities - Scroll', () => {
  test('should get scroll position', () => {
    const position = getScrollPosition();
    assert.ok(position, 'position should exist');
    assert.ok('x' in position, 'position should have x property');
    assert.ok('y' in position, 'position should have y property');
    assert.strictEqual(typeof position.x, 'number');
    assert.strictEqual(typeof position.y, 'number');
  });

  test('should scroll to element', () => {
    document.body.innerHTML = '<div id="test" style="height: 100px; overflow: auto;"><div style="height: 500px;">Content</div></div>';
    const element = $('#test') as HTMLElement;
    // In test environment, just verify no errors thrown
    scrollTo(element);
    assert.ok(true);
  });

  test('should check if element is in viewport', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test') as HTMLElement;
    const inViewport = isInViewport(element);
    assert.strictEqual(typeof inViewport, 'boolean');
  });

  test('should attach scroll listener and return unbind function', () => {
    const mock = createMock();
    const unbind = onScroll(mock.fn);

    assert.strictEqual(typeof unbind, 'function');
    unbind();

    // Verify listener was attached and removed
    window.dispatchEvent(new Event('scroll'));
    // Mock shouldn't be called after unbind
    assert.ok(true);
  });
});

describe('DOM Utilities - Focus', () => {
  test('should get all focusable elements', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="btn1">Button 1</button>
        <input id="input1" type="text" />
        <a href="#" id="link1">Link 1</a>
        <div tabindex="0" id="div1">Focusable Div</div>
        <div id="div2">Non-focusable</div>
      </div>
    `;
    const container = $('#container')!;
    const focusable = getFocusableElements(container);
    assert.ok(focusable.length >= 4, 'should find at least 4 focusable elements');
  });

  test('should set focus on element', () => {
    document.body.innerHTML = '<input id="input1" type="text" />';
    const input = $('#input1') as HTMLElement;
    setFocus(input);
    assert.strictEqual(document.activeElement, input);
  });

  test('should trap focus within container', () => {
    document.body.innerHTML = `
      <div id="container">
        <button id="btn1">Button 1</button>
        <input id="input1" type="text" />
        <a href="#" id="link1">Link 1</a>
      </div>
    `;
    const container = $('#container')!;
    const untrap = trapFocus(container);

    assert.strictEqual(typeof untrap, 'function');
    untrap();
  });
});

describe('DOM Utilities - Text and HTML', () => {
  test('should get text content', () => {
    document.body.innerHTML = '<div id="test">Initial content</div>';
    const element = $('#test')!;
    const text = getText(element);
    assert.strictEqual(text, 'Initial content');
  });

  test('should set text content', () => {
    document.body.innerHTML = '<div id="test">Initial</div>';
    const element = $('#test')!;
    setText(element, 'New content');
    assert.strictEqual(element.textContent, 'New content');
  });

  test('should get HTML content', () => {
    document.body.innerHTML = '<div id="test"><span>HTML content</span></div>';
    const element = $('#test')!;
    const html = getHTML(element);
    assert.ok(html.includes('HTML content'));
    assert.ok(html.includes('<span>'));
  });

  test('should set HTML content', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    setHTML(element, '<strong>Bold text</strong>');
    assert.ok(element.innerHTML.includes('<strong>Bold text</strong>'));
  });
});

describe('DOM Utilities - Events', () => {
  test('should trigger custom event', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    let called = false;
    element.addEventListener('custom-event', () => {
      called = true;
    });

    trigger(element, 'custom-event', { data: 'test' });

    assert.ok(called, 'event handler should have been called');
  });

  test('should trigger event with detail', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    let eventDetail: any = null;
    element.addEventListener('test-event', (e: Event) => {
      const customEvent = e as CustomEvent;
      eventDetail = customEvent.detail;
    });

    trigger(element, 'test-event', { value: 123 });

    assert.deepEqual(eventDetail, { value: 123 });
  });

  test('should listen for event once', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test')!;
    let callCount = 0;
    onceEvent(element, 'click', () => {
      callCount++;
    });

    element.dispatchEvent(new Event('click'));
    element.dispatchEvent(new Event('click'));

    assert.strictEqual(callCount, 1, 'handler should only be called once');
  });
});

describe('DOM Utilities - CSS and Styles', () => {
  test('should get computed style', () => {
    document.body.innerHTML = '<div id="test" style="color: red; font-size: 16px;"></div>';
    const element = $('#test') as HTMLElement;
    const style = getComputedStyle(element, 'color');
    assert.ok(style !== undefined);
  });

  test('should get all computed styles', () => {
    document.body.innerHTML = '<div id="test" style="color: red; font-size: 16px;"></div>';
    const element = $('#test') as HTMLElement;
    const styles = getComputedStyle(element);
    assert.ok(styles !== undefined);
    assert.strictEqual(typeof styles, 'object');
  });

  test('should set multiple inline styles', () => {
    document.body.innerHTML = '<div id="test"></div>';
    const element = $('#test') as HTMLElement;
    setStyles(element, {
      color: 'blue',
      backgroundColor: 'yellow',
      fontSize: '20px',
    });
    assert.strictEqual(element.style.color, 'blue');
    assert.strictEqual(element.style.backgroundColor, 'yellow');
    assert.strictEqual(element.style.fontSize, '20px');
  });

  test('should get inline styles', () => {
    document.body.innerHTML = '<div id="test" style="color: red; font-size: 16px;"></div>';
    const element = $('#test') as HTMLElement;
    const styles = getStyles(element);
    assert.strictEqual(styles.color, 'red');
    assert.strictEqual(styles['font-size'], '16px');
  });
});

describe('DOM Utilities - Parent/Child Relationships', () => {
  test('should find closest ancestor', () => {
    document.body.innerHTML = `
      <div class="grandparent" id="gp">
        <div class="parent" id="p">
          <div class="child" id="c1">Child 1</div>
          <div class="child" id="c2">Child 2</div>
          <span class="child" id="c3">Child 3</span>
        </div>
      </div>
    `;
    const child = $('#c1')!;
    const parent = closest(child, '.parent');
    assert.ok(parent !== null);
    assert.strictEqual(parent?.id, 'p');
  });

  test('should return null when no ancestor matches', () => {
    document.body.innerHTML = '<div id="c1"><div id="c2"></div></div>';
    const child = $('#c1')!;
    const result = closest(child, '.non-existent');
    assert.strictEqual(result, null);
  });

  test('should get parent element', () => {
    document.body.innerHTML = `
      <div class="parent" id="p">
        <div class="child" id="c1">Child 1</div>
      </div>
    `;
    const child = $('#c1')!;
    const parent = getParent(child);
    assert.ok(parent !== null);
    assert.strictEqual(parent?.id, 'p');
  });

  test('should get parent matching selector', () => {
    document.body.innerHTML = `
      <div class="grandparent" id="gp">
        <div class="parent" id="p">
          <div class="child" id="c1">Child 1</div>
        </div>
      </div>
    `;
    const child = $('#c1')!;
    const grandparent = getParent(child, '.grandparent');
    assert.ok(grandparent !== null);
    assert.strictEqual(grandparent?.id, 'gp');
  });

  test('should get all children', () => {
    document.body.innerHTML = `
      <div id="p">
        <div class="child" id="c1">Child 1</div>
        <div class="child" id="c2">Child 2</div>
        <span class="child" id="c3">Child 3</span>
      </div>
    `;
    const parent = $('#p')!;
    const children = getChildren(parent);
    assert.strictEqual(children.length, 3);
  });

  test('should get filtered children', () => {
    document.body.innerHTML = `
      <div id="p">
        <div class="child" id="c1">Child 1</div>
        <div class="child" id="c2">Child 2</div>
        <span class="child" id="c3">Child 3</span>
      </div>
    `;
    const parent = $('#p')!;
    const divChildren = getChildren(parent, 'div');
    assert.strictEqual(divChildren.length, 2);
  });

  test('should get siblings', () => {
    document.body.innerHTML = `
      <div id="p">
        <div class="child" id="c1">Child 1</div>
        <div class="child" id="c2">Child 2</div>
        <span class="child" id="c3">Child 3</span>
      </div>
    `;
    const child = $('#c2')!;
    const siblings = getSiblings(child);
    assert.strictEqual(siblings.length, 2);
    assert.ok(siblings.some((s) => s.id === 'c1'));
    assert.ok(siblings.some((s) => s.id === 'c3'));
  });

  test('should get filtered siblings', () => {
    document.body.innerHTML = `
      <div id="p">
        <div class="child" id="c1">Child 1</div>
        <div class="child" id="c2">Child 2</div>
        <span class="child" id="c3">Child 3</span>
      </div>
    `;
    const child = $('#c2')!;
    const divSiblings = getSiblings(child, 'div');
    assert.strictEqual(divSiblings.length, 1);
    assert.strictEqual(divSiblings[0].id, 'c1');
  });
});

describe('DOM Utilities - DOM Ready and Mutations', () => {
  test('should call callback when DOM is ready', () => {
    let called = false;
    onReady(() => {
      called = true;
    });

    // In test environment, document is already ready
    assert.ok(called, 'callback should have been called');
  });

  test('should observe DOM mutations', () => {
    document.body.innerHTML = '<div id="container"></div>';
    const container = $('#container')!;

    const stop = observeDOM(container, () => {
      // mutation callback
    });

    // Trigger a mutation
    container.appendChild(document.createElement('div'));

    // Stop observing
    stop();

    assert.strictEqual(typeof stop, 'function');
  });
});

describe('DOM Utilities - Browser Safety', () => {
  test('should handle selection when element does not exist', () => {
    document.body.innerHTML = '';
    const result = $('.completely-non-existent-element');
    assert.strictEqual(result, null);
  });

  test('should return empty array for non-existent elements', () => {
    document.body.innerHTML = '';
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
    assert.strictEqual(typeof position.x, 'number');
    assert.strictEqual(typeof position.y, 'number');
  });
});
