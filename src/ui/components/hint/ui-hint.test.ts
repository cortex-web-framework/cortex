import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-hint', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-hint');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-HINT');
  });

  it('should have text property', () => {
    const e = el as any;
    e.text = 'Test hint';
    assert.equal(e.text, 'Test hint');
  });

  it('should have type property', () => {
    const e = el as any;
    e.type = 'warning';
    assert.equal(e.type, 'warning');
  });
});
