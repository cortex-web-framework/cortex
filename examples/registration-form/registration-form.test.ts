/**
 * Multi-step Registration Form Tests
 * TDD approach: Tests define the behavior before implementation
 */

import {
  describe,
  test,
  assertEquals,
  assertTrue,
  assertFalse,
  assertThrows,
  renderComponent,
  query,
  queryAll,
  click,
  setValue,
  getValue,
  getText,
  hasClass,
  waitForComponentEvent,
  triggerComponentEvent,
  getComponentAttribute,
  setComponentAttributes,
} from '../../tests/index.js';

describe('Multi-step Registration Form', () => {
  // Test form navigation
  test('displays step 1 by default', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const step1 = query('[data-step="1"]', form);
    assertTrue(step1 !== null);
  });

  test('has next button on step 1', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const nextBtn = query('[data-action="next"]', form);
    assertTrue(nextBtn !== null);
    assertEquals(getText(nextBtn), 'Next');
  });

  test('does not have previous button on step 1', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const prevBtn = query('[data-action="prev"]', form);
    assertFalse(hasClass(prevBtn, 'visible') || prevBtn === null);
  });

  test('validates email before moving to step 2', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    const nextBtn = query('[data-action="next"]', form);

    // Try to submit with invalid email
    setValue(emailInput, 'invalid-email');
    click(nextBtn);

    // Should still be on step 1
    const step1 = query('[data-step="1"]', form);
    assertTrue(hasClass(step1, 'active'));
  });

  test('shows error message for invalid email', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    const nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'invalid');
    click(nextBtn);

    const errorMsg = query('[data-error="email"]', form);
    assertTrue(errorMsg !== null);
    assertTrue(getText(errorMsg).length > 0);
  });

  test('moves to step 2 with valid email', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    const nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    // Wait for step transition
    await new Promise((resolve) => setTimeout(resolve, 100));

    const step2 = query('[data-step="2"]', form);
    assertTrue(hasClass(step2, 'active'));
  });

  test('has previous button on step 2', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    const nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const prevBtn = query('[data-action="prev"]', form);
    assertTrue(hasClass(prevBtn, 'visible'));
  });

  test('goes back to step 1 when clicking previous on step 2', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const prevBtn = query('[data-action="prev"]', form);
    click(prevBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const step1 = query('[data-step="1"]', form);
    assertTrue(hasClass(step1, 'active'));
  });

  test('validates password on step 2', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const passwordInput = query('input[name="password"]', form);
    const confirmPasswordInput = query('input[name="confirmPassword"]', form);

    // Try weak password
    setValue(passwordInput, 'weak');
    setValue(confirmPasswordInput, 'weak');
    nextBtn = query('[data-action="next"]', form);
    click(nextBtn);

    // Should still be on step 2
    const step2 = query('[data-step="2"]', form);
    assertTrue(hasClass(step2, 'active'));
  });

  test('shows password validation errors', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const passwordInput = query('input[name="password"]', form);
    setValue(passwordInput, 'weak');

    const errorMsg = query('[data-error="password"]', form);
    assertTrue(errorMsg !== null);
  });

  test('validates password confirmation match', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const passwordInput = query('input[name="password"]', form);
    const confirmPasswordInput = query('input[name="confirmPassword"]', form);

    setValue(passwordInput, 'SecurePass123!');
    setValue(confirmPasswordInput, 'DifferentPass123!');

    const errorMsg = query('[data-error="confirmPassword"]', form);
    assertTrue(errorMsg !== null);
  });

  test('moves to step 3 with valid passwords', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const passwordInput = query('input[name="password"]', form);
    const confirmPasswordInput = query('input[name="confirmPassword"]', form);

    setValue(passwordInput, 'SecurePass123!');
    setValue(confirmPasswordInput, 'SecurePass123!');

    nextBtn = query('[data-action="next"]', form);
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const step3 = query('[data-step="3"]', form);
    assertTrue(hasClass(step3, 'active'));
  });

  test('shows step 3 profile information fields', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const passwordInput = query('input[name="password"]', form);
    const confirmPasswordInput = query('input[name="confirmPassword"]', form);

    setValue(passwordInput, 'SecurePass123!');
    setValue(confirmPasswordInput, 'SecurePass123!');

    nextBtn = query('[data-action="next"]', form);
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const firstNameInput = query('input[name="firstName"]', form);
    const lastNameInput = query('input[name="lastName"]', form);

    assertTrue(firstNameInput !== null);
    assertTrue(lastNameInput !== null);
  });

  test('shows submit button on final step', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const passwordInput = query('input[name="password"]', form);
    const confirmPasswordInput = query('input[name="confirmPassword"]', form);

    setValue(passwordInput, 'SecurePass123!');
    setValue(confirmPasswordInput, 'SecurePass123!');

    nextBtn = query('[data-action="next"]', form);
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const submitBtn = query('[data-action="submit"]', form);
    assertTrue(submitBtn !== null);
    assertEquals(getText(submitBtn), 'Register');
  });

  test('persists form data across steps', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    const testEmail = 'persist@example.com';
    setValue(emailInput, testEmail);
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const prevBtn = query('[data-action="prev"]', form);
    click(prevBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const emailInputAfter = query('input[name="email"]', form);
    assertEquals(getValue(emailInputAfter), testEmail);
  });

  test('emits formSubmit event with all data on submit', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    let nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'submit@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const passwordInput = query('input[name="password"]', form);
    const confirmPasswordInput = query('input[name="confirmPassword"]', form);

    setValue(passwordInput, 'SecurePass123!');
    setValue(confirmPasswordInput, 'SecurePass123!');

    nextBtn = query('[data-action="next"]', form);
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    const firstNameInput = query('input[name="firstName"]', form);
    const lastNameInput = query('input[name="lastName"]', form);

    setValue(firstNameInput, 'John');
    setValue(lastNameInput, 'Doe');

    const submitBtn = query('[data-action="submit"]', form);

    const formDataPromise = waitForComponentEvent(form, 'formSubmit', 5000);
    click(submitBtn);

    const event = await formDataPromise;
    assertEquals((event as CustomEvent).detail.email, 'submit@example.com');
    assertEquals((event as CustomEvent).detail.firstName, 'John');
    assertEquals((event as CustomEvent).detail.lastName, 'Doe');
  });

  test('displays progress indicator', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const progressSteps = queryAll('[data-progress-step]', form);
    assertEquals(progressSteps.length, 3);
  });

  test('highlights current step in progress indicator', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const progressSteps = queryAll('[data-progress-step]', form);

    assertTrue(hasClass(progressSteps[0], 'active'));
    assertFalse(hasClass(progressSteps[1], 'active'));
    assertFalse(hasClass(progressSteps[2], 'active'));

    const emailInput = query('input[name="email"]', form);
    const nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, 'user@example.com');
    click(nextBtn);

    await new Promise((resolve) => setTimeout(resolve, 100));

    assertFalse(hasClass(progressSteps[0], 'active'));
    assertTrue(hasClass(progressSteps[1], 'active'));
    assertFalse(hasClass(progressSteps[2], 'active'));
  });

  test('prevents leaving step with unsaved validation errors', async () => {
    const form = await renderComponent('<ui-registration-form></ui-registration-form>');
    const emailInput = query('input[name="email"]', form);
    const nextBtn = query('[data-action="next"]', form);

    setValue(emailInput, '');
    click(nextBtn);

    const step1 = query('[data-step="1"]', form);
    assertTrue(hasClass(step1, 'active'));
  });
});
