# ⚡ ZERO DEPENDENCIES PLEDGE

## Commitment

**Cortex UI Component Library is built with ZERO external dependencies.**

No npm packages. No third-party libraries. No frameworks. Pure TypeScript/JavaScript only.

---

## What This Means

### ✅ ALLOWED
- TypeScript (compile-time only)
- Node.js built-in modules (fs, path, etc.)
- Browser standard APIs (DOM, Web Components, etc.)
- ES6+ JavaScript features
- Our own custom utilities and helpers

### ❌ NOT ALLOWED
- React, Vue, Angular, or any framework
- jQuery or DOM manipulation libraries
- Testing frameworks (Jest, Mocha, Vitest, etc.)
- Form validation libraries
- Date/time libraries (moment.js, date-fns, etc.)
- HTTP client libraries (axios, fetch polyfills)
- UI libraries or component frameworks
- Chart libraries
- Animation libraries
- Any npm packages for runtime code

---

## Architecture

### Components
**Location:** `src/ui/components/`

Each component:
- Pure Web Components (custom HTML elements)
- Self-contained TypeScript
- No external dependencies
- Full type safety

### Testing
**Location:** `tests/`

Custom test runner:
- No Jest, Mocha, Vitest
- Pure TypeScript test framework
- Built-in assertions
- DOM testing utilities

### Examples
**Location:** `examples/`

Working examples:
- Pure HTML, CSS, JavaScript
- Combine multiple components
- Functional without server
- localStorage for persistence (no database)

---

## Implementation Details

### How We Handle Common Tasks

#### Form Validation
```typescript
// Pure implementation, no validation library
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

export function validatePassword(password: string): string | null {
  if (password.length < 8) return 'Password must be at least 8 characters';
  if (!/[A-Z]/.test(password)) return 'Password must contain uppercase letter';
  if (!/[0-9]/.test(password)) return 'Password must contain number';
  return null;
}
```

#### Data Filtering & Sorting
```typescript
// Pure array methods, no lodash
export function filterProducts(
  products: Product[],
  category: string,
  minPrice: number,
  maxPrice: number
): Product[] {
  return products.filter(p =>
    p.category === category &&
    p.price >= minPrice &&
    p.price <= maxPrice
  );
}

export function sortProducts(
  products: Product[],
  sortBy: 'price' | 'rating' | 'newest'
): Product[] {
  const sorted = [...products]; // Copy to avoid mutation

  switch (sortBy) {
    case 'price':
      return sorted.sort((a, b) => a.price - b.price);
    case 'rating':
      return sorted.sort((a, b) => b.rating - a.rating);
    case 'newest':
      return sorted.sort((a, b) => b.id - a.id);
  }
}
```

#### Data Persistence
```typescript
// localStorage, no database
export class Cart {
  private storageKey = 'cortex-cart';

  save(items: CartItem[]): void {
    localStorage.setItem(this.storageKey, JSON.stringify(items));
  }

  load(): CartItem[] {
    const data = localStorage.getItem(this.storageKey);
    return data ? JSON.parse(data) : [];
  }
}
```

#### HTTP Requests (if needed)
```typescript
// Fetch API, no axios
export async function fetchProducts(): Promise<Product[]> {
  const response = await fetch('/api/products');
  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }
  return response.json();
}
```

#### Date Handling
```typescript
// Pure JavaScript, no moment.js
export function formatDate(date: Date): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
}

export function getDaysSince(date: Date): number {
  const now = new Date();
  const ms = now.getTime() - date.getTime();
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}
```

#### Event Handling
```typescript
// Pure DOM events, no jQuery
export function onElementClick(
  selector: string,
  handler: (event: MouseEvent) => void
): void {
  document.addEventListener('click', (event) => {
    const target = event.target as HTMLElement;
    if (target.matches(selector)) {
      handler(event);
    }
  });
}

export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}
```

#### Animation
```typescript
// CSS animations + requestAnimationFrame, no animation library
export function animateValue(
  element: HTMLElement,
  from: number,
  to: number,
  duration: number
): Promise<void> {
  return new Promise((resolve) => {
    const startTime = performance.now();

    function animate(currentTime: number): void {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const value = from + (to - from) * progress;

      element.textContent = Math.round(value).toString();

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        resolve();
      }
    }

    requestAnimationFrame(animate);
  });
}
```

---

## Quality Metrics

### Code Size
- Each component: < 5KB unminified
- Test runner: < 3KB
- Total bundle: < 500KB (all 54 components + examples)

### Performance
- First paint: < 500ms
- Interactive: < 1s
- No JavaScript blocking

### Accessibility
- WCAG 2.1 AA compliant
- Keyboard navigation
- Screen reader support
- ARIA attributes

### Type Safety
- TypeScript strict mode
- No `any` types
- 100% type coverage for public APIs

---

## Why Zero Dependencies?

### Advantages
1. **Complete Control** - We own every line of code
2. **Smaller Bundle** - No bloat from unused packages
3. **Faster Performance** - No runtime overhead
4. **Security** - No supply chain vulnerabilities
5. **Maintainability** - Simple, understandable codebase
6. **Learning** - Study how components really work
7. **Reliability** - No breaking updates from dependencies

### Trade-offs
1. **More Code** - We implement utilities ourselves
2. **More Testing** - We test everything
3. **More Responsibility** - We maintain all code

---

## Implementation Checklist

### Custom Test Runner
- [x] Test registration and execution
- [x] Assertion helpers
- [x] DOM utilities
- [x] Component helpers
- [x] Console reporting
- [x] Error handling

### Utility Libraries (Built-in)
- [ ] Validation utilities
- [ ] Array manipulation (filter, sort, map)
- [ ] Object utilities
- [ ] String utilities
- [ ] Number formatting
- [ ] Date utilities
- [ ] Storage utilities
- [ ] Event utilities
- [ ] DOM utilities
- [ ] Animation utilities

### Examples
- [ ] Multi-step form (with validation)
- [ ] Data table (with sorting/pagination)
- [ ] Shopping cart (with calculations)
- [ ] Admin dashboard (with metrics)
- [ ] Product listing (with filters)

### Components (TDD)
- [ ] ui-accordion (enhance)
- [ ] ui-search (new)
- [ ] ui-dropdown (new)
- [ ] ui-chart (new)
- [ ] ui-tree (new)
- [ ] ui-command-palette (new)
- [ ] ui-notification (enhance)
- [ ] ui-theme-switcher (new)

---

## File Structure - Zero Dependencies

```
cortex/
├── src/
│   ├── ui/
│   │   ├── components/          # Pure Web Components
│   │   │   ├── button/
│   │   │   ├── form/
│   │   │   └── ... (54 components)
│   │   └── theme/               # Pure CSS variables
│   └── utils/                   # Custom utility library
│       ├── validation.ts
│       ├── array.ts
│       ├── string.ts
│       ├── format.ts
│       ├── storage.ts
│       ├── events.ts
│       ├── dom.ts
│       └── animation.ts
│
├── tests/
│   ├── test-runner.ts           # Custom test framework
│   ├── assertions.ts            # Assert helpers
│   └── utils/                   # Test utilities
│
├── examples/
│   ├── multi-step-form/         # Pure example + tests
│   ├── data-table/              # Pure example + tests
│   ├── shopping-cart/           # Pure example + tests
│   ├── admin-dashboard/         # Pure example + tests
│   └── product-listing/         # Pure example + tests
│
└── dist/
    └── ui-bundle.js             # Bundled with NO dependencies
```

---

## Development Guidelines

### When Faced with a Dependency Temptation

**Question:** "I need feature X, should I use library Y?"

**Answer:** NO. Implement it yourself:

```typescript
// ❌ DON'T
import { debounce } from 'lodash';

// ✅ DO
function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): T {
  let timeoutId: ReturnType<typeof setTimeout>;
  return ((...args: any[]) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }) as T;
}
```

### Code Review Checklist

- [ ] No `import` from npm packages (except TypeScript)
- [ ] No `require()` statements
- [ ] No external CDN usage
- [ ] All utilities defined locally
- [ ] TypeScript strict mode passing
- [ ] Tests included
- [ ] Performance acceptable

---

## Declaration

> By contributing to Cortex UI, I pledge to maintain ZERO external dependencies.
> Every line of code is mine. Every decision is intentional. Every feature is built with care.

**Started:** October 24, 2025
**Maintainer:** @cortex-web-framework
**Status:** ✅ ACTIVE & ENFORCED

---

## Success Metrics

When complete, Cortex will be:

✅ **54 fully functional components**
✅ **5 complete working examples**
✅ **8 new components added**
✅ **100% test coverage**
✅ **0 npm dependencies**
✅ **< 500KB total bundle**
✅ **Pure TypeScript/JavaScript**
✅ **Accessible & performant**

