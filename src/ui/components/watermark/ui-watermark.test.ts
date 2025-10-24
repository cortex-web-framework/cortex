import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-watermark', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-watermark');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-WATERMARK');
  });

  it('should have text property', () => {
    const e = el as any;
    e.text = 'DRAFT';
    assert.equal(e.text, 'DRAFT');
  });

  it('should have opacity property', () => {
    const e = el as any;
    e.opacity = 0.5;
    assert.equal(e.opacity, 0.5);
  });

  it('should have fontSize property', () => {
    const e = el as any;
    e.fontSize = 48;
    assert.equal(e.fontSize, 48);
  });

  it('should have angle property', () => {
    const e = el as any;
    e.angle = -30;
    assert.equal(e.angle, -30);
  });
});
