import { describe, it, beforeEach, afterEach } from 'node:test';
import { strict as assert } from 'node:assert';

describe('ui-table', () => {
  let el: HTMLElement;

  beforeEach(() => {
    el = document.createElement('ui-table');
    document.body.appendChild(el);
  });

  afterEach(() => {
    if (el.parentElement) el.parentElement.removeChild(el);
  });

  it('should render', () => {
    assert.equal(el.tagName, 'UI-TABLE');
  });

  it('should have columns property', () => {
    const e = el as any;
    const cols = [{ key: 'name', label: 'Name' }];
    e.columns = cols;
    assert.deepEqual(e.columns, cols);
  });

  it('should have rows property', () => {
    const e = el as any;
    const rows = [{ id: '1', name: 'Test' }];
    e.rows = rows;
    assert.deepEqual(e.rows, rows);
  });

  it('should have sortKey property', () => {
    const e = el as any;
    e.sortKey = 'name';
    assert.equal(e.sortKey, 'name');
  });
});
