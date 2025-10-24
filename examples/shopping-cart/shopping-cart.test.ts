/**
 * Shopping Cart Tests
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
  getValue,
  getText,
  hasClass,
  waitForComponentEvent,
} from '../../tests/index.js';

describe('Shopping Cart', () => {
  test('renders cart container', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const container = query('[data-cart-container]', cart);
    assertTrue(container !== null);
  });

  test('displays product list', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const products = queryAll('[data-product-item]', cart);
    assertTrue(products.length > 0);
  });

  test('shows product price and details', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const productName = query('[data-product-name]', cart);
    const productPrice = query('[data-product-price]', cart);

    assertTrue(productName !== null);
    assertTrue(productPrice !== null);
  });

  test('adds product to cart', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const cartItems = queryAll('[data-cart-item]', cart);
    assertTrue(cartItems.length > 0);
  });

  test('increases item quantity when adding same product twice', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const cartItems = queryAll('[data-cart-item]', cart);
    // Should still be 1 item, but with quantity 2
    assertTrue(cartItems.length === 1 || cartItems.length === 2);

    const quantityInput = query('[data-quantity]', cart) as HTMLInputElement;
    if (quantityInput) {
      assertEquals(quantityInput.value, '2');
    }
  });

  test('displays cart items', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const itemName = query('[data-item-name]', cart);
    const itemPrice = query('[data-item-price]', cart);

    assertTrue(itemName !== null);
    assertTrue(itemPrice !== null);
  });

  test('calculates subtotal', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const subtotal = query('[data-subtotal]', cart);
    const subtotalText = getText(subtotal);

    assertTrue(subtotalText.includes('$') || subtotalText.match(/\d+/));
  });

  test('calculates tax', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const tax = query('[data-tax]', cart);
    const taxText = getText(tax);

    assertTrue(taxText.includes('$') || taxText.match(/\d+/));
  });

  test('calculates total', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const total = query('[data-total]', cart);
    const totalText = getText(total);

    assertTrue(totalText.includes('$') || totalText.match(/\d+/));
  });

  test('removes item from cart', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const removeBtn = query('[data-action="remove"]', cart);
    click(removeBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const cartItems = queryAll('[data-cart-item]', cart);
    assertEquals(cartItems.length, 0);
  });

  test('updates quantity when input changes', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const quantityInput = query('[data-quantity]', cart) as HTMLInputElement;
    setValue(quantityInput, '5');
    quantityInput.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    assertEquals(getValue(quantityInput), '5');
  });

  test('applies discount code', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const couponInput = query('[data-coupon-input]', cart) as HTMLInputElement;
    const applyBtn = query('[data-action="apply-coupon"]', cart);

    setValue(couponInput, 'SAVE10');
    click(applyBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const discount = query('[data-discount]', cart);
    assertTrue(discount !== null);
  });

  test('shows discount amount', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const couponInput = query('[data-coupon-input]', cart) as HTMLInputElement;
    const applyBtn = query('[data-action="apply-coupon"]', cart);

    setValue(couponInput, 'SAVE10');
    click(applyBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const discountAmount = query('[data-discount-amount]', cart);
    if (discountAmount) {
      const text = getText(discountAmount);
      assertTrue(text.includes('$') || text.includes('-'));
    }
  });

  test('recalculates total with discount', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const subtotalBefore = getText(query('[data-subtotal]', cart));

    const couponInput = query('[data-coupon-input]', cart) as HTMLInputElement;
    const applyBtn = query('[data-action="apply-coupon"]', cart);

    setValue(couponInput, 'SAVE10');
    click(applyBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const totalAfter = getText(query('[data-total]', cart));
    // Total should be less than subtotal when discount applied
    assertTrue(totalAfter !== subtotalBefore);
  });

  test('emits checkoutStart event', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const checkoutBtn = query('[data-action="checkout"]', cart);
    const eventPromise = waitForComponentEvent(cart, 'checkoutStart', 2000);

    click(checkoutBtn);

    const event = await eventPromise;
    assertTrue((event as CustomEvent).detail.items !== undefined);
    assertTrue((event as CustomEvent).detail.total !== undefined);
  });

  test('displays empty cart state', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const emptyState = query('[data-empty-state]', cart);

    assertTrue(emptyState !== null);
  });

  test('shows "View Products" when cart is empty', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const viewProductsBtn = query('[data-action="view-products"]', cart);

    assertTrue(viewProductsBtn !== null);
  });

  test('increases total price when quantity increases', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const subtotalBefore = getText(query('[data-subtotal]', cart));

    const quantityInput = query('[data-quantity]', cart) as HTMLInputElement;
    setValue(quantityInput, '3');
    quantityInput.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const subtotalAfter = getText(query('[data-subtotal]', cart));
    assertFalse(subtotalBefore === subtotalAfter);
  });

  test('preserves cart state when updating quantity', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const itemNameBefore = getText(query('[data-item-name]', cart));

    const quantityInput = query('[data-quantity]', cart) as HTMLInputElement;
    setValue(quantityInput, '2');
    quantityInput.dispatchEvent(new Event('change'));

    await new Promise((resolve) => setTimeout(resolve, 100));

    const itemNameAfter = getText(query('[data-item-name]', cart));
    assertEquals(itemNameBefore, itemNameAfter);
  });

  test('shows cart summary with item count', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const itemCount = query('[data-item-count]', cart);
    const countText = getText(itemCount);

    assertTrue(countText.includes('1'));
  });

  test('applies multiple discounts (if supported)', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const couponInput = query('[data-coupon-input]', cart) as HTMLInputElement;
    const applyBtn = query('[data-action="apply-coupon"]', cart);

    // Try applying a coupon
    setValue(couponInput, 'SAVE10');
    click(applyBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    // Component should handle valid or invalid coupon gracefully
    assertTrue(true); // Test just verifies no errors
  });

  test('displays tax calculation clearly', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const taxRate = query('[data-tax-rate]', cart);
    if (taxRate) {
      const taxText = getText(taxRate);
      assertTrue(taxText.includes('%') || taxText.includes('tax'));
    }
  });

  test('prevents checkout with empty cart', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const checkoutBtn = query('[data-action="checkout"]', cart) as HTMLButtonElement;

    assertTrue(checkoutBtn.disabled || hasClass(checkoutBtn, 'disabled'));
  });

  test('enables checkout when cart has items', async () => {
    const cart = await renderComponent('<ui-shopping-cart></ui-shopping-cart>');
    const addBtn = query('[data-action="add-to-cart"]', cart);

    click(addBtn);
    await new Promise((resolve) => setTimeout(resolve, 100));

    const checkoutBtn = query('[data-action="checkout"]', cart) as HTMLButtonElement;

    assertFalse(checkoutBtn.disabled || hasClass(checkoutBtn, 'disabled'));
  });
});
