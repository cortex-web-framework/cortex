import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';
describe('ui-copy', () => {
  let el: HTMLElement;
  beforeEach(() => { el = document.createElement('ui-copy'); document.body.appendChild(el); });
  afterEach(() => { if (el.parentElement) el.parentElement.removeChild(el); });
  it('should render', () => { assert.equal(el.tagName, 'UI-COPY'); });
  it('should have copy method', () => { assert(typeof (el as any).copy === 'function'); });
});
