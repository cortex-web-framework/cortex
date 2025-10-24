import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-switch', () => {
  let el: HTMLElement;
  beforeEach(() => {
    el = document.createElement('ui-switch');
    document.body.appendChild(el);
  });
  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-SWITCH');
  });

  it('should have checked property', () => {
    const e = el as any;
    assert.equal(e.checked, false);
    e.checked = true;
    assert.equal(e.checked, true);
  });

  it('should have disabled property', () => {
    const e = el as any;
    assert.equal(e.disabled, false);
  });
});
