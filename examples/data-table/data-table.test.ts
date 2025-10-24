/**
 * Sortable Data Table Tests
 * TDD approach: Tests define behavior before implementation
 */

import {
  describe,
  test,
  assertEquals,
  assertTrue,
  assertFalse,
  renderComponent,
  query,
  queryAll,
  click,
  getText,
  hasClass,
  getComponentAttribute,
  getAttribute,
  waitForComponentEvent,
} from '../../tests/index.js';

interface TableRow {
  id: number;
  name: string;
  email: string;
  status: string;
  joinDate: string;
}

describe('Sortable Data Table', () => {
  test('renders table element', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const tableElement = query('table', table);
    assertTrue(tableElement !== null);
  });

  test('displays column headers', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const headers = queryAll('thead th', table);
    assertTrue(headers.length > 0);
  });

  test('displays rows of data', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const rows = queryAll('tbody tr', table);
    assertTrue(rows.length > 0);
  });

  test('shows page size selector', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const pageSizeSelect = query('select[data-page-size]', table);
    assertTrue(pageSizeSelect !== null);
  });

  test('shows pagination controls', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const prevBtn = query('[data-action="prev-page"]', table);
    const nextBtn = query('[data-action="next-page"]', table);
    const pageInfo = query('[data-page-info]', table);

    assertTrue(prevBtn !== null);
    assertTrue(nextBtn !== null);
    assertTrue(pageInfo !== null);
  });

  test('sorts table by clicking column header', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const nameHeader = query('th[data-column="name"]', table);

    // Get initial order
    let rows = queryAll('tbody tr', table);
    const initialFirstName = getText(query('td:first-child', rows[0]));

    // Click to sort
    click(nameHeader);

    // Wait for sort
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get new order
    rows = queryAll('tbody tr', table);
    const newFirstName = getText(query('td:first-child', rows[0]));

    // Names should be different (assuming data isn't already sorted)
    assertTrue(initialFirstName !== newFirstName || rows.length === 1);
  });

  test('shows sort direction indicator', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const nameHeader = query('th[data-column="name"]', table);

    click(nameHeader);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Should have sort indicator class
    assertTrue(hasClass(nameHeader, 'sorted') || getText(nameHeader).includes('▲') || getText(nameHeader).includes('▼'));
  });

  test('reverses sort order on second click', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const nameHeader = query('th[data-column="name"]', table);

    // First click - ascending
    click(nameHeader);
    await new Promise((resolve) => setTimeout(resolve, 100));

    let rows = queryAll('tbody tr', table);
    const firstSort = getText(query('td:first-child', rows[0]));

    // Second click - descending
    click(nameHeader);
    await new Promise((resolve) => setTimeout(resolve, 100));

    rows = queryAll('tbody tr', table);
    const secondSort = getText(query('td:first-child', rows[0]));

    // Order should be reversed
    assertTrue(firstSort !== secondSort);
  });

  test('displays correct number of rows per page', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const pageSizeSelect = query('select[data-page-size]', table) as HTMLSelectElement;

    // Change page size
    (pageSizeSelect as any).value = '5';
    pageSizeSelect.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const rows = queryAll('tbody tr', table);
    assertTrue(rows.length <= 5);
  });

  test('navigates to next page', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');

    // Get first row name
    let rows = queryAll('tbody tr', table);
    const firstPageFirstName = getText(query('td:first-child', rows[0]));

    // Click next page
    const nextBtn = query('[data-action="next-page"]', table);
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get new first row name
    rows = queryAll('tbody tr', table);
    const secondPageFirstName = getText(query('td:first-child', rows[0]));

    // Names should be different
    assertFalse(firstPageFirstName === secondPageFirstName);
  });

  test('disables prev button on first page', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const prevBtn = query('[data-action="prev-page"]', table) as HTMLButtonElement;

    assertTrue(prevBtn.disabled || hasClass(prevBtn, 'disabled'));
  });

  test('disables next button on last page', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const pageSizeSelect = query('select[data-page-size]', table) as HTMLSelectElement;

    // Set to large page size
    (pageSizeSelect as any).value = '100';
    pageSizeSelect.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const nextBtn = query('[data-action="next-page"]', table) as HTMLButtonElement;

    assertTrue(nextBtn.disabled || hasClass(nextBtn, 'disabled'));
  });

  test('shows page information', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const pageInfo = query('[data-page-info]', table);

    const infoText = getText(pageInfo);
    // Should show something like "Showing 1-10 of 50"
    assertTrue(infoText.includes('-') || infoText.includes('of'));
  });

  test('can select individual rows', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const firstRowCheckbox = query('tbody tr:first-child input[type="checkbox"]', table);

    click(firstRowCheckbox);

    await new Promise((resolve) => setTimeout(resolve, 50));

    assertTrue((firstRowCheckbox as HTMLInputElement).checked);
  });

  test('can select all rows on page', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const selectAllCheckbox = query('thead th input[type="checkbox"]', table);

    click(selectAllCheckbox);

    await new Promise((resolve) => setTimeout(resolve, 50));

    const rowCheckboxes = queryAll('tbody tr input[type="checkbox"]', table);
    const allChecked = rowCheckboxes.every((cb) => (cb as HTMLInputElement).checked);

    assertTrue(allChecked);
  });

  test('highlights selected rows', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const firstRowCheckbox = query('tbody tr:first-child input[type="checkbox"]', table);
    const firstRow = query('tbody tr:first-child', table);

    click(firstRowCheckbox);

    await new Promise((resolve) => setTimeout(resolve, 50));

    assertTrue(hasClass(firstRow, 'selected'));
  });

  test('emits selectionChange event when selecting rows', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const firstRowCheckbox = query('tbody tr:first-child input[type="checkbox"]', table);

    const eventPromise = waitForComponentEvent(table, 'selectionChange', 2000);

    click(firstRowCheckbox);

    const event = await eventPromise;
    assertTrue((event as CustomEvent).detail.selectedIds !== undefined);
  });

  test('filters data by search term', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const searchInput = query('[data-search]', table) as HTMLInputElement;

    searchInput.value = 'john';
    searchInput.dispatchEvent(new Event('input'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const rows = queryAll('tbody tr', table);
    const allRowsContainSearch = rows.every((row) => getText(row).toLowerCase().includes('john'));

    // Either all rows contain search or there are no rows
    assertTrue(allRowsContainSearch || rows.length === 0);
  });

  test('displays empty state when no results', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const searchInput = query('[data-search]', table) as HTMLInputElement;

    // Search for something unlikely to exist
    searchInput.value = 'xxxxxxxxxxxxxxxx';
    searchInput.dispatchEvent(new Event('input'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const emptyMessage = query('[data-empty-state]', table);
    const rows = queryAll('tbody tr', table);

    assertTrue(emptyMessage !== null || rows.length === 0);
  });

  test('maintains sort when changing pages', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const nameHeader = query('th[data-column="name"]', table);

    // Sort by name
    click(nameHeader);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Go to next page
    const nextBtn = query('[data-action="next-page"]', table);
    click(nextBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify header still shows sort indicator
    assertTrue(hasClass(nameHeader, 'sorted') || getText(nameHeader).includes('▲') || getText(nameHeader).includes('▼'));
  });

  test('displays column with correct data type', async () => {
    const table = await renderComponent('<ui-data-table></ui-data-table>');
    const dateCell = query('tbody tr:first-child td[data-type="date"]', table);

    if (dateCell) {
      const content = getText(dateCell);
      // Date should have / or - separator
      assertTrue(content.includes('/') || content.includes('-'));
    }
  });
});
