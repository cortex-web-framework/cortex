import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-description-list', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-description-list');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-DESCRIPTION-LIST');
  });

  it('should have items property', () => {
    const e = el as any;
    const items = [{ term: 'Term', description: 'Description' }];
    e.items = items;
    assert.deepEqual(e.items, items);
  });

  it('should have bordered property', () => {
    const e = el as any;
    e.bordered = true;
    assert.equal(e.bordered, true);
  });
});
