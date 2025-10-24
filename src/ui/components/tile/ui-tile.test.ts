import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-tile', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-tile');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-TILE');
  });

  it('should have title property', () => {
    const e = el as any;
    e.title = 'Test Tile';
    assert.equal(e.title, 'Test Tile');
  });

  it('should have description property', () => {
    const e = el as any;
    e.description = 'Tile description';
    assert.equal(e.description, 'Tile description');
  });

  it('should have imageUrl property', () => {
    const e = el as any;
    e.imageUrl = 'https://example.com/image.jpg';
    assert.equal(e.imageUrl, 'https://example.com/image.jpg');
  });

  it('should have href property', () => {
    const e = el as any;
    e.href = 'https://example.com';
    assert.equal(e.href, 'https://example.com');
  });
});
