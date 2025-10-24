# Cortex UI Component Library - Development Plan (TDD + Integrated Examples)

## Overview

This document outlines the development strategy for Cortex UI components and examples using:
- **Test-Driven Development (TDD)** - Write tests first, then implementation
- **Zero External Dependencies** - Pure TypeScript/JavaScript, no frameworks or libraries
- **Strict Code Quality** - Type safety, no `any`, comprehensive documentation
- **Integrated Examples** - Real-world examples combining multiple components with working functionality

---

## Phase 1: Foundation & Testing Infrastructure

### 1.1 Testing Setup (NO external dependencies)

**Goal:** Create a lightweight testing framework for UI components without Jest, Mocha, or Vitest

**Tasks:**

1. **Create `/tests` directory structure**
   ```
   tests/
   ├── test-runner.ts          # Custom test runner (no external deps)
   ├── assertions.ts            # Assert helpers (assertEquals, assertTrue, etc.)
   ├── utils/
   │   ├── dom-helpers.ts       # DOM testing utilities
   │   ├── component-helpers.ts # Component testing utilities
   │   └── matchers.ts          # Custom matchers for components
   └── fixtures/
       ├── html/                # HTML test fixtures
       └── data/                # Test data
   ```

2. **Implement custom test runner** (`tests/test-runner.ts`)
   - `test(name: string, fn: () => void)` - Register test
   - `describe(name: string, fn: () => void)` - Group tests
   - `beforeEach(fn: () => void)` - Setup hook
   - `afterEach(fn: () => void)` - Teardown hook
   - `run()` - Execute all tests
   - Console output with pass/fail indicators
   - Error reporting with line numbers

3. **Implement assertion helpers** (`tests/assertions.ts`)
   ```typescript
   export function assertEquals(actual: any, expected: any, message?: string)
   export function assertTrue(condition: boolean, message?: string)
   export function assertFalse(condition: boolean, message?: string)
   export function assertThrows(fn: () => void, message?: string)
   export function assertArrayEquals(actual: any[], expected: any[], message?: string)
   export function assertObjectEquals(actual: object, expected: object, message?: string)
   ```

4. **Create DOM testing utilities** (`tests/utils/dom-helpers.ts`)
   ```typescript
   export function createDOMElement(html: string): Element
   export function queryAll(selector: string): Element[]
   export function queryOne(selector: string): Element | null
   export function trigger(element: Element, eventName: string, options?: object)
   export function setAttributes(element: Element, attrs: Record<string, string>)
   export function getComputedStyle(element: Element): CSSStyleDeclaration
   export function waitFor(condition: () => boolean, timeout: number): Promise<void>
   ```

5. **Create component testing utilities** (`tests/utils/component-helpers.ts`)
   ```typescript
   export function renderComponent(html: string): Element
   export function getComponentProperty(element: Element, prop: string): any
   export function setComponentProperty(element: Element, prop: string, value: any)
   export function getComponentAttributes(element: Element): Record<string, string>
   export function triggerComponentEvent(element: Element, eventName: string, detail?: any)
   export function waitForComponentRender(element: Element): Promise<void>
   ```

6. **Test runner script** (`package.json`)
   ```json
   {
     "scripts": {
       "test": "node --loader ts-node/esm tests/test-runner.ts",
       "test:watch": "nodemon -e ts,js --exec 'npm run test'",
       "test:coverage": "node tests/coverage.ts"
     }
   }
   ```

---

### 1.2 Code Quality Standards

**File:** `/CODING_STANDARDS.md`

**Standards to enforce:**

1. **TypeScript Strict Mode**
   ```json
   {
     "compilerOptions": {
       "strict": true,
       "noImplicitAny": true,
       "noImplicitThis": true,
       "strictNullChecks": true,
       "strictFunctionTypes": true,
       "noUnusedLocals": true,
       "noUnusedParameters": true,
       "noImplicitReturns": true,
       "noFallthroughCasesInSwitch": true
     }
   }
   ```

2. **No Magic Numbers/Strings**
   - All constants must be named
   - All magic values in comments explaining why

3. **Comprehensive JSDoc Comments**
   ```typescript
   /**
    * Creates a button element with customizable variant and size.
    *
    * @param variant - Visual style ('primary', 'secondary', etc.)
    * @param size - Button size ('small', 'medium', 'large')
    * @returns The configured button element
    * @throws {Error} If variant is not supported
    *
    * @example
    * const btn = createButton('primary', 'large');
    * btn.addEventListener('click', () => console.log('clicked'));
    */
   ```

4. **100% Test Coverage for Core Logic**
   - Unit tests for all component logic
   - Integration tests for component interactions
   - No untested code paths

5. **No External Dependencies**
   - No npm packages except TypeScript/build tools
   - Pure browser APIs
   - Pure ES modules

---

## Phase 2: Integrated Examples (Working Functionality)

### 2.1 Example 1: Multi-Step Registration Form

**File:** `examples/multi-step-form/index.html`

**Components Used:**
- ui-stepper (progress indicator)
- ui-form-group (form container)
- ui-form-field (labeled inputs)
- ui-text-input (email, password)
- ui-select (country selection)
- ui-checkbox (terms acceptance)
- ui-button (navigation + submit)
- ui-alert (success/error messages)

**Tests Required** (`examples/multi-step-form/form.test.ts`):
```typescript
describe('MultiStepForm', () => {
  describe('Step Navigation', () => {
    test('should initialize on step 1', () => {})
    test('should not allow prev on step 1', () => {})
    test('should disable next button if current step invalid', () => {})
    test('should allow next to step 2 when step 1 valid', () => {})
    test('should show all steps after completion', () => {})
  })

  describe('Validation', () => {
    test('should validate email format on step 1', () => {})
    test('should validate password strength', () => {})
    test('should require country selection', () => {})
    test('should require checkbox acceptance', () => {})
    test('should show error messages for invalid fields', () => {})
  })

  describe('Submission', () => {
    test('should collect all form data', () => {})
    test('should submit form data on completion', () => {})
    test('should show success message', () => {})
    test('should clear form after success', () => {})
  })
})
```

**Functionality to Implement:**
1. **Step validation** - Only move forward if current step valid
2. **Progress tracking** - Update stepper position
3. **Form data collection** - Gather all step data
4. **Validation errors** - Show field-level errors
5. **Success handling** - Display confirmation

**No External Deps:** Pure JS event handlers, no form libraries

---

### 2.2 Example 2: Sortable Data Table with Pagination

**File:** `examples/data-table/index.html`

**Components Used:**
- ui-table (data display)
- ui-pagination (page navigation)
- ui-text-input (search)
- ui-select (filter)
- ui-button (actions)
- ui-checkbox (row selection)

**Tests Required** (`examples/data-table/table.test.ts`):
```typescript
describe('DataTable', () => {
  describe('Data Loading', () => {
    test('should load and display data', () => {})
    test('should show empty state when no data', () => {})
    test('should handle large datasets', () => {})
  })

  describe('Sorting', () => {
    test('should sort by column ascending', () => {})
    test('should sort by column descending', () => {})
    test('should toggle sort order on column click', () => {})
    test('should show sort indicator', () => {})
  })

  describe('Pagination', () => {
    test('should show correct page data', () => {})
    test('should navigate to next page', () => {})
    test('should navigate to previous page', () => {})
    test('should disable prev on first page', () => {})
    test('should disable next on last page', () => {})
  })

  describe('Filtering', () => {
    test('should filter by search text', () => {})
    test('should filter by select option', () => {})
    test('should combine multiple filters', () => {})
  })

  describe('Selection', () => {
    test('should select individual rows', () => {})
    test('should select all rows on current page', () => {})
    test('should enable bulk actions when rows selected', () => {})
  })
})
```

**Functionality to Implement:**
1. **Column sorting** - Click header to sort, toggle ascending/descending
2. **Pagination** - Show 10 items per page, navigation
3. **Search filtering** - Filter by text across columns
4. **Category filtering** - Filter by status/category
5. **Row selection** - Checkbox selection, select all
6. **Bulk actions** - Delete/export selected rows

**Data:** 50 sample records with realistic data

---

### 2.3 Example 3: Shopping Cart Workflow

**File:** `examples/shopping-cart/index.html`

**Components Used:**
- ui-card (product cards)
- ui-button (add to cart, checkout)
- ui-badge (item count)
- ui-number-input (quantity)
- ui-text-input (coupon code)
- ui-alert (notifications)
- ui-modal (checkout confirmation)
- ui-stepper (checkout steps)

**Tests Required** (`examples/shopping-cart/cart.test.ts`):
```typescript
describe('ShoppingCart', () => {
  describe('Add to Cart', () => {
    test('should add product to cart', () => {})
    test('should increase quantity if already in cart', () => {})
    test('should update cart total', () => {})
    test('should show success notification', () => {})
  })

  describe('Cart Management', () => {
    test('should update item quantity', () => {})
    test('should remove item from cart', () => {})
    test('should calculate subtotal correctly', () => {})
    test('should calculate tax (8%)', () => {})
    test('should calculate total', () => {})
  })

  describe('Coupon Application', () => {
    test('should apply valid coupon', () => {})
    test('should show error for invalid coupon', () => {})
    test('should apply discount percentage', () => {})
    test('should update total with discount', () => {})
  })

  describe('Checkout', () => {
    test('should show checkout modal', () => {})
    test('should validate all required fields', () => {})
    test('should show order confirmation', () => {})
    test('should clear cart after purchase', () => {})
  })
})
```

**Functionality to Implement:**
1. **Add to cart** - Add products, manage quantities
2. **Price calculation** - Subtotal, tax (8%), total
3. **Coupon system** - Apply discount codes
4. **Checkout flow** - Multi-step checkout with validation
5. **Order confirmation** - Show order summary and ID
6. **Cart persistence** - Save to localStorage (no DB needed)

**Sample Data:** 10-15 products with prices

---

### 2.4 Example 4: Admin Dashboard

**File:** `examples/admin-dashboard/index.html`

**Components Used:**
- ui-card (stat cards, data sections)
- ui-stat (KPI metrics)
- ui-progress-bar (progress indicators)
- ui-progress-circle (circular progress)
- ui-table (user/order tables)
- ui-tabs (different dashboard sections)
- ui-breadcrumb (navigation)
- ui-menu (sidebar navigation)
- ui-button (actions)

**Tests Required** (`examples/admin-dashboard/dashboard.test.ts`):
```typescript
describe('AdminDashboard', () => {
  describe('Metrics Display', () => {
    test('should display revenue stat', () => {})
    test('should display user count stat', () => {})
    test('should calculate percentage change', () => {})
    test('should show trend indicators', () => {})
  })

  describe('Data Sections', () => {
    test('should load recent orders', () => {})
    test('should load top products', () => {})
    test('should load user activity', () => {})
  })

  describe('Tabs Navigation', () => {
    test('should switch between tabs', () => {})
    test('should maintain tab state', () => {})
    test('should load tab-specific data', () => {})
  })

  describe('Navigation', () => {
    test('should navigate via sidebar menu', () => {})
    test('should show breadcrumb trail', () => {})
    test('should highlight current page', () => {})
  })
})
```

**Functionality to Implement:**
1. **Metrics dashboard** - KPI cards with trend indicators
2. **Tab navigation** - Orders, Products, Users, Reports
3. **Data tables** - Recent orders, top products, user list
4. **Sidebar menu** - Navigation to different sections
5. **Breadcrumb** - Show current location
6. **Real-time data** - Update metrics (simulated)

---

### 2.5 Example 5: Product Listing with Filters

**File:** `examples/product-listing/index.html`

**Components Used:**
- ui-card (product cards in grid)
- ui-badge (sale badges, ratings)
- ui-rating (star ratings)
- ui-select (category filter)
- ui-slider (price range filter)
- ui-checkbox (feature filters)
- ui-text-input (search)
- ui-button (sort buttons)
- ui-pagination (product pages)

**Tests Required** (`examples/product-listing/products.test.ts`):
```typescript
describe('ProductListing', () => {
  describe('Product Display', () => {
    test('should display products in grid', () => {})
    test('should show product image', () => {})
    test('should show product name and price', () => {})
    test('should show rating and reviews count', () => {})
  })

  describe('Filtering', () => {
    test('should filter by category', () => {})
    test('should filter by price range', () => {})
    test('should filter by features', () => {})
    test('should combine multiple filters', () => {})
    test('should clear all filters', () => {})
  })

  describe('Sorting', () => {
    test('should sort by price low-to-high', () => {})
    test('should sort by price high-to-low', () => {})
    test('should sort by rating', () => {})
    test('should sort by newest', () => {})
  })

  describe('Search', () => {
    test('should search by product name', () => {})
    test('should search by description', () => {})
    test('should highlight search term', () => {})
  })

  describe('Pagination', () => {
    test('should paginate results', () => {})
    test('should show correct page info', () => {})
  })
})
```

**Functionality to Implement:**
1. **Product grid** - Responsive layout, 3-4 columns
2. **Category filter** - Dropdown select
3. **Price range filter** - Slider from $0-$1000
4. **Feature filters** - Checkboxes (brand, color, etc.)
5. **Search** - Real-time product search
6. **Sorting** - Price, rating, newest, bestsellers
7. **Pagination** - 12 items per page
8. **Detail view** - Click product to show modal

**Sample Data:** 50 products with images, prices, ratings

---

## Phase 3: Component Development (TDD Style)

### 3.1 New Component Template

**For each new component, create:**

1. **Test file first** (`src/ui/components/[name]/[name].test.ts`)
   - Write all tests (BEFORE implementation)
   - Cover all behaviors, states, edge cases
   - Include accessibility tests

2. **Component file** (`src/ui/components/[name]/[name].ts`)
   - Implement to pass all tests
   - Full TypeScript typing
   - Comprehensive JSDoc comments

3. **Metadata file** (`src/ui/components/[name]/[name].metadata.ts`)
   - Props documentation
   - Events documentation
   - Slots documentation
   - Usage examples

4. **Showcase example** (`examples/ui-component-test-app/index.html`)
   - Add component to showcase
   - Show all variants
   - Show all states
   - Show usage examples

### 3.2 Identified Missing/Incomplete Components

**High Priority (Write tests + implement):**

1. **ui-search** (new)
   - Search input with suggestions
   - Debounced search
   - Clear button
   - Recent searches

2. **ui-dropdown** (new)
   - Flexible dropdown menu
   - Trigger element (button or any element)
   - Positioning (top, bottom, left, right)
   - Dismiss on click outside

3. **ui-chart** (new) - if time permits
   - Bar chart
   - Line chart
   - Pie chart
   - Legend
   - Tooltips

4. **ui-notification** (enhance)
   - Stack multiple notifications
   - Auto-dismiss
   - Custom close button
   - Different positions (top-right, top-left, bottom-right, etc.)

5. **ui-data-grid** (enhance)
   - Virtual scrolling for large datasets
   - Column resizing
   - Column reordering
   - Cell editing

6. **ui-tree** (new)
   - Expandable tree view
   - Keyboard navigation
   - Checkboxes for selection
   - Icons

7. **ui-command-palette** (new)
   - Keyboard shortcut (Cmd+K / Ctrl+K)
   - Search commands
   - Recent commands
   - Execute command

8. **ui-theme-switcher** (new)
   - Toggle light/dark theme
   - Persist preference
   - System preference detection

---

## Phase 4: Documentation & Polish

### 4.1 Example Documentation

**Each example needs:**

1. **Overview section**
   - What the example demonstrates
   - Real-world use case
   - Components involved

2. **Code walkthrough**
   - Step-by-step explanation
   - Key implementation details
   - How components interact

3. **Features list**
   - What functionality is demonstrated
   - Key features to try
   - User interactions

4. **Try it yourself**
   - Interactive instructions
   - Things to try
   - Things to modify

### 4.2 Code Comments

**Every component example needs:**
- Section comments explaining major parts
- Inline comments for complex logic
- JSDoc for all functions

---

## Implementation Timeline

### Week 1: Foundation
- [ ] Set up custom test runner (no external deps)
- [ ] Create testing utilities and assertions
- [ ] Document code quality standards
- [ ] Set up CI/CD for tests

### Week 2: Example 1 & 2
- [ ] Multi-step form example (TDD)
- [ ] Data table example (TDD)
- [ ] Add to showcase
- [ ] Write documentation

### Week 3: Example 3, 4, 5
- [ ] Shopping cart example (TDD)
- [ ] Admin dashboard example (TDD)
- [ ] Product listing example (TDD)
- [ ] Add all to showcase

### Week 4: New Components
- [ ] ui-search (TDD)
- [ ] ui-dropdown (TDD)
- [ ] ui-tree (TDD)
- [ ] Add to showcase

### Week 5: Polish & Documentation
- [ ] Component metadata extraction
- [ ] API documentation
- [ ] Best practices guide
- [ ] Performance optimization

---

## Testing Strategy

### Unit Tests
- Test individual component behavior
- Mock DOM when needed
- Test props, attributes, events
- Test all edge cases

### Integration Tests
- Test components working together
- Test data flow between components
- Test event propagation
- Test state management

### Visual Tests
- Manual verification of appearance
- Cross-browser testing
- Responsive design verification
- Accessibility verification

### End-to-End Tests
- Full example workflows
- User interaction flows
- Data persistence
- Form submission

---

## Code Quality Checklist

For each component/example:

- [ ] All tests passing (100% relevant coverage)
- [ ] TypeScript strict mode passing (no `any`)
- [ ] JSDoc on all public methods
- [ ] No console errors or warnings
- [ ] Accessibility verified (keyboard nav, ARIA)
- [ ] Cross-browser tested (Chrome, Firefox, Safari)
- [ ] Mobile responsive verified
- [ ] Performance acceptable (<50ms interactions)
- [ ] No external dependencies
- [ ] Code reviewed by team
- [ ] Documented in showcase

---

## Success Criteria

1. **All examples functional and interactive**
2. **100% test coverage for core logic**
3. **All components showing all variants/states**
4. **Clear documentation and code examples**
5. **Zero external dependencies**
6. **Clean, strict TypeScript code**
7. **Accessibility compliant**
8. **Performance optimized**

