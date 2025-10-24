import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('{{componentPascalCase}}', () => {
  let element;

  beforeEach(() => {
    element = document.createElement('{{componentKebabCase}}');
    document.body.appendChild(element);
  });

  afterEach(() => {
    document.body.removeChild(element);
  });

  it('should render with default message', () => {
    assert.strictEqual(element.shadowRoot.querySelector('p').textContent, 'Hello, Cortex!');
  });

  it('should render with a custom message', () => {
    element.setAttribute('message', 'Custom Message');
    assert.strictEqual(element.shadowRoot.querySelector('p').textContent, 'Custom Message');
  });
});
