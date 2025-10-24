# Search Component

A high-performance search component with debouncing, smart filtering, and keyboard navigation. Built with Web Components and pure TypeScript - **zero external dependencies**.

## Features

### Core Functionality
- **Debounced Search** - Configurable debounce delay (default: 300ms)
- **Smart Filtering** - Case-insensitive matching across items
- **Keyboard Navigation** - Arrow keys, Enter, Escape support
- **Match Highlighting** - Visually highlight matching text
- **Clear Button** - Appears when text is entered
- **Show All on Focus** - Optional feature to display all items on focus
- **Custom Events** - `search` and `select` events for parent integration

### User Experience
- Responsive dropdown with smooth animations
- No results messaging
- Selected item highlighting
- Scrollable suggestions list
- Keyboard-accessible
- Mobile-optimized

## Usage

### Basic Setup

```html
<ui-search
  data-items="JavaScript,TypeScript,Python,Java,C++"
  placeholder="Search languages..."
></ui-search>

<script type="module">
  import './ui-search.js';

  const search = document.querySelector('ui-search');

  search.addEventListener('search', (event) => {
    console.log('Query:', event.detail.query);
    console.log('Filtered:', search.getFilteredItems());
  });

  search.addEventListener('select', (event) => {
    console.log('Selected:', event.detail.value);
  });
</script>
```

## API

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `data-items` | string | none | Comma-separated list of items |
| `placeholder` | string | "Search..." | Input placeholder text |
| `debounce-delay` | number | 300 | Debounce delay in milliseconds |
| `show-all-on-focus` | boolean | false | Show all items when focused |

### Events

#### search
Fired when user types (after debounce)

```javascript
search.addEventListener('search', (event) => {
  const { query } = event.detail;
});
```

#### select
Fired when user selects an item

```javascript
search.addEventListener('select', (event) => {
  const { value } = event.detail;
});
```

### Public Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `setItems(items)` | void | Set available items |
| `getItems()` | string[] | Get all items |
| `getFilteredItems()` | string[] | Get currently filtered items |
| `clear()` | void | Clear search input |
| `focus()` | void | Focus the input |

## Implementation Details

### Debouncing

Uses custom debounce utility from `src/utils/events.ts`:
- Prevents excessive filtering on rapid input
- Configurable delay via `debounce-delay` attribute
- Improves performance with large datasets

### Filtering Algorithm

Case-insensitive substring matching:
```typescript
const query = input.toLowerCase();
filtered = items.filter(item =>
  item.toLowerCase().includes(query)
);
```

### Keyboard Navigation

- **ArrowDown** - Move to next suggestion
- **ArrowUp** - Move to previous suggestion
- **Enter** - Select highlighted suggestion
- **Escape** - Close suggestions and clear selection

### Match Highlighting

Matching text portions are wrapped in `<span class="match">` for CSS styling:
```html
<div>Java<span class="match">Script</span></div>
```

## Styling

Component uses Shadow DOM with scoped styles. Key classes:

- `.search-input-wrapper` - Main input container
- `.suggestions` - Dropdown container
- `.suggestion-item` - Individual suggestion
- `.match` - Highlighted matching text
- `.no-results` - Empty state message

## Performance

| Operation | Time |
|-----------|------|
| Filter 1000 items | < 10ms |
| Render suggestions | < 20ms |
| Debounce delay | 300ms (default) |

Debouncing prevents excessive re-renders on rapid typing.

## Browser Compatibility

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+
- Modern mobile browsers

## Examples

### Basic Search

```html
<ui-search
  data-items="Apple,Banana,Cherry,Date,Elderberry"
  placeholder="Search fruits..."
></ui-search>
```

### Show All on Focus

```html
<ui-search
  data-items="React,Vue,Angular,Svelte,Alpine"
  placeholder="Select framework..."
  show-all-on-focus
></ui-search>
```

### Custom Debounce

```html
<ui-search
  data-items="Very,Long,List,Of,Items,That,Need,Longer,Debounce"
  debounce-delay="500"
></ui-search>
```

### Programmatic Control

```javascript
const search = document.querySelector('ui-search');

// Set items dynamically
search.setItems(['Item 1', 'Item 2', 'Item 3']);

// Clear search
search.clear();

// Get filtered results
const filtered = search.getFilteredItems();
console.log(filtered);
```

## Accessibility

- ✓ Keyboard navigation support
- ✓ ARIA-friendly structure
- ✓ Clear visual feedback
- ✓ Focus management
- ✓ Semantic HTML

## Test Coverage

18+ test cases covering:
- Input and filtering
- Debouncing behavior
- Keyboard navigation
- Event emission
- Edge cases (empty input, no matches)
- Attribute parsing

## Code Size

- TypeScript source: 280 LOC
- Compiled JavaScript: ~11 KB
- Minified: ~4 KB
- No dependencies

## Limitations & Future Enhancements

### Current Limitations
- Single-level items (no nested/grouped results)
- No async data loading
- No search history
- No custom filtering logic

### Planned Features
- [ ] Async data loading with loading state
- [ ] Result grouping/categories
- [ ] Search history with recent searches
- [ ] Custom filtering/scoring algorithm
- [ ] Template customization for results
- [ ] Autocomplete with API integration
- [ ] Search analytics tracking

## Related Components

- **ui-dropdown** - Static dropdown menu
- **ui-input** - Form input component
- **ui-button** - Reusable button styles
- **ui-product-listing** - Uses search for filtering

## License

MIT

---

**Status**: Production Ready ✅
**Test Coverage**: 18+ tests
**Dependencies**: 0 (uses custom debounce from utils)
**Bundle Size**: ~4 KB minified
