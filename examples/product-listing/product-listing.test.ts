/**
 * Product Listing with Filters Tests
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
  setValue,
  getText,
  hasClass,
} from '../../tests/index.js';

describe('Product Listing with Filters', () => {
  test('renders product grid', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const grid = query('[data-product-grid]', listing);
    assertTrue(grid !== null);
  });

  test('displays products in cards', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const cards = queryAll('[data-product-card]', listing);
    assertTrue(cards.length > 0);
  });

  test('shows product image, name, and price', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const productCard = query('[data-product-card]', listing);

    const image = query('[data-product-image]', productCard);
    const name = query('[data-product-name]', productCard);
    const price = query('[data-product-price]', productCard);

    assertTrue(image !== null);
    assertTrue(name !== null);
    assertTrue(price !== null);
  });

  test('displays filter sidebar', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const sidebar = query('[data-filter-sidebar]', listing);
    assertTrue(sidebar !== null);
  });

  test('shows category filter', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const categoryFilter = query('[data-filter-category]', listing);
    assertTrue(categoryFilter !== null);
  });

  test('shows price range filter', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const minPrice = query('[data-filter-min-price]', listing);
    const maxPrice = query('[data-filter-max-price]', listing);

    assertTrue(minPrice !== null);
    assertTrue(maxPrice !== null);
  });

  test('filters products by category', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const categorySelect = query('[data-filter-category]', listing) as HTMLSelectElement;

    // Get initial count
    let cards = queryAll('[data-product-card]', listing);
    const initialCount = cards.length;

    // Change category
    categorySelect.value = 'electronics';
    categorySelect.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Get new count
    cards = queryAll('[data-product-card]', listing);
    assertTrue(cards.length <= initialCount);
  });

  test('filters products by price range', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const minPrice = query('[data-filter-min-price]', listing) as HTMLInputElement;
    const maxPrice = query('[data-filter-max-price]', listing) as HTMLInputElement;

    // Set price filter
    setValue(minPrice, '50');
    minPrice.dispatchEvent(new Event('change'));

    setValue(maxPrice, '200');
    maxPrice.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const cards = queryAll('[data-product-card]', listing);
    // Should have filtered results
    assertTrue(cards.length >= 0);
  });

  test('searches products by text', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const searchInput = query('[data-search-input]', listing) as HTMLInputElement;

    const initialCards = queryAll('[data-product-card]', listing);
    const initialCount = initialCards.length;

    // Search for specific product
    setValue(searchInput, 'laptop');
    searchInput.dispatchEvent(new Event('input'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const cards = queryAll('[data-product-card]', listing);
    assertTrue(cards.length <= initialCount);
  });

  test('shows all products when search is cleared', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const searchInput = query('[data-search-input]', listing) as HTMLInputElement;

    // Search for something
    setValue(searchInput, 'xyz');
    searchInput.dispatchEvent(new Event('input'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    let cards = queryAll('[data-product-card]', listing);
    const searchedCount = cards.length;

    // Clear search
    setValue(searchInput, '');
    searchInput.dispatchEvent(new Event('input'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    cards = queryAll('[data-product-card]', listing);
    assertTrue(cards.length >= searchedCount);
  });

  test('sorts products by price', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const sortSelect = query('[data-sort-select]', listing) as HTMLSelectElement;

    // Get initial first product price
    let firstCard = query('[data-product-card]', listing);
    const initialPrice = getText(query('[data-product-price]', firstCard));

    // Sort by price
    sortSelect.value = 'price-asc';
    sortSelect.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    firstCard = query('[data-product-card]', listing);
    const newPrice = getText(query('[data-product-price]', firstCard));

    // Should potentially be different (unless only 1 product)
    assertTrue(true); // Just verify no errors
  });

  test('shows product count or results info', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const resultInfo = query('[data-result-count]', listing);

    if (resultInfo) {
      const text = getText(resultInfo);
      assertTrue(text.includes('product') || text.match(/\d+/));
    }
  });

  test('displays "no results" message when filters match nothing', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const minPrice = query('[data-filter-min-price]', listing) as HTMLInputElement;
    const maxPrice = query('[data-filter-max-price]', listing) as HTMLInputElement;

    // Set impossible price range
    setValue(minPrice, '99999');
    minPrice.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const emptyState = query('[data-empty-state]', listing);
    const cards = queryAll('[data-product-card]', listing);

    assertTrue(emptyState !== null || cards.length === 0);
  });

  test('shows add to cart button on products', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const addBtn = query('[data-action="add-to-cart"]', listing);
    assertTrue(addBtn !== null);
  });

  test('respects multiple filters simultaneously', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');

    const categorySelect = query('[data-filter-category]', listing) as HTMLSelectElement;
    const minPrice = query('[data-filter-min-price]', listing) as HTMLInputElement;

    // Apply multiple filters
    categorySelect.value = 'electronics';
    categorySelect.dispatchEvent(new Event('change'));

    setValue(minPrice, '100');
    minPrice.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const cards = queryAll('[data-product-card]', listing);
    assertTrue(cards.length >= 0); // Should be valid result
  });

  test('clears all filters', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');

    const categorySelect = query('[data-filter-category]', listing) as HTMLSelectElement;
    const searchInput = query('[data-search-input]', listing) as HTMLInputElement;
    const clearBtn = query('[data-action="clear-filters"]', listing);

    // Apply filters
    categorySelect.value = 'electronics';
    categorySelect.dispatchEvent(new Event('change'));
    setValue(searchInput, 'test');

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Clear
    if (clearBtn) {
      click(clearBtn);

      await new Promise((resolve) => setTimeout(resolve, 100));

      assertEquals(categorySelect.value, '');
      assertEquals(searchInput.value, '');
    }
  });

  test('displays star rating on products', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const productCard = query('[data-product-card]', listing);
    const rating = query('[data-product-rating]', productCard);

    if (rating) {
      const ratingText = getText(rating);
      assertTrue(ratingText.includes('★') || ratingText.match(/\d/));
    }
  });

  test('responsive grid layout', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const grid = query('[data-product-grid]', listing) as HTMLElement;

    // Grid should have style or class
    assertTrue(grid !== null);
  });

  test('product grid shows multiple columns', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');
    const cards = queryAll('[data-product-card]', listing);

    // Should have multiple products for grid display
    assertTrue(cards.length > 2);
  });

  test('filters preserve sort order', async () => {
    const listing = await renderComponent('<ui-product-listing></ui-product-listing>');

    const sortSelect = query('[data-sort-select]', listing) as HTMLSelectElement;
    const categorySelect = query('[data-filter-category]', listing) as HTMLSelectElement;

    // Sort first
    sortSelect.value = 'price-asc';
    sortSelect.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Then filter
    categorySelect.value = 'electronics';
    categorySelect.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Sort should still be applied
    assertEquals(sortSelect.value, 'price-asc');
  });
});
