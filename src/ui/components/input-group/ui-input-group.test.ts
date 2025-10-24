import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-input-group', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-input-group');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-INPUT-GROUP');
  });

  it('should have beforeText property', () => {
    const e = el as any;
    e.beforeText = '$';
    assert.equal(e.beforeText, '$');
  });

  it('should have afterText property', () => {
    const e = el as any;
    e.afterText = '.00';
    assert.equal(e.afterText, '.00');
  });

  it('should have error property', () => {
    const e = el as any;
    e.error = 'Required field';
    assert.equal(e.error, 'Required field');
  });

  it('should have disabled property', () => {
    const e = el as any;
    e.disabled = true;
    assert.equal(e.disabled, true);
  });
});
