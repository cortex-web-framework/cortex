import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('TestComponent', () => {
  let element: HTMLElement;

  beforeEach(() => {
    element = document.createElement('test-component');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should render with default message', () => {
    assert.ok(element.shadowRoot, 'shadowRoot should exist');
    const p = element.shadowRoot.querySelector('p');
    assert.ok(p, 'p element should exist');
    assert.strictEqual(p.textContent, 'Hello, Cortex!');
  });

  it('should render with a custom message', () => {
    element.setAttribute('message', 'Custom Message');
    assert.ok(element.shadowRoot, 'shadowRoot should exist');
    const p = element.shadowRoot.querySelector('p');
    assert.ok(p, 'p element should exist');
    assert.strictEqual(p.textContent, 'Custom Message');
  });
});
