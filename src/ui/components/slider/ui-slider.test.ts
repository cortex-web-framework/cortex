import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-slider', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-slider');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-SLIDER');
  });

  it('should have value property', () => {
    const e = el as any;
    e.value = 75;
    assert.equal(e.value, 75);
  });

  it('should have min/max properties', () => {
    const e = el as any;
    e.min = 0;
    e.max = 100;
    assert.equal(e.min, 0);
    assert.equal(e.max, 100);
  });

  it('should have disabled property', () => {
    const e = el as any;
    e.disabled = true;
    assert.equal(e.disabled, true);
  });
});
