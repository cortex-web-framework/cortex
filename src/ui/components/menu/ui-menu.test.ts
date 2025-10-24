import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-menu', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-menu');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-MENU');
  });

  it('should have open property', () => {
    const e = el as any;
    e.open = true;
    assert.equal(e.open, true);
  });

  it('should have items property', () => {
    const e = el as any;
    const items = [{ label: 'Item 1', value: '1' }];
    e.items = items;
    assert.deepEqual(e.items, items);
  });

  it('should have selectedValue property', () => {
    const e = el as any;
    e.selectedValue = 'test';
    assert.equal(e.selectedValue, 'test');
  });
});
