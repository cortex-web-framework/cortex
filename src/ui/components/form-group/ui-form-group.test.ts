import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-form-group', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-form-group');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-FORM-GROUP');
  });

  it('should have label property', () => {
    const e = el as any;
    e.label = 'Email';
    assert.equal(e.label, 'Email');
  });

  it('should have required property', () => {
    const e = el as any;
    e.required = true;
    assert.equal(e.required, true);
  });

  it('should have error property', () => {
    const e = el as any;
    e.error = 'Invalid email';
    assert.equal(e.error, 'Invalid email');
  });

  it('should have disabled property', () => {
    const e = el as any;
    e.disabled = true;
    assert.equal(e.disabled, true);
  });
});
