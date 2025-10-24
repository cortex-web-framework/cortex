# Sortable Data Table Component

A production-ready, fully-featured data table component with sorting, pagination, filtering, and row selection. Built with Web Components and pure TypeScript - **zero external dependencies**.

## Features

### Core Functionality
- **Sorting** - Click column headers to sort by any sortable column
- **Pagination** - Navigate pages with customizable page sizes
- **Search/Filter** - Real-time filtering across all data
- **Row Selection** - Select individual or all rows on current page
- **Responsive Design** - Works seamlessly on mobile and desktop
- **Type-aware Sorting** - Different sorting for strings, numbers, and dates

### UI/UX
- Beautiful, modern design with smooth transitions
- Status badges with color coding
- Visual feedback for selected rows
- Sort direction indicators (▲/▼)
- Empty state messaging
- Accessible form controls

### Performance
- Efficient pagination limits DOM nodes
- Smart filtering without re-rendering entire dataset
- No external dependencies, minimal bundle size

## Usage

### Basic Setup

```html
<ui-data-table id="table"></ui-data-table>

<script type="module">
  import './ui-data-table.js';

  const table = document.getElementById('table');

  // Listen for selection changes
  table.addEventListener('selectionChange', (event) => {
    console.log('Selected IDs:', event.detail.selectedIds);
    console.log('Selected Data:', table.getSelectedData());
  });
</script>
```

### Setting Custom Data

```javascript
const customData = [
  { id: 1, name: 'John', email: 'john@example.com', status: 'Active', joinDate: '2023-01-15' },
  { id: 2, name: 'Jane', email: 'jane@example.com', status: 'Inactive', joinDate: '2023-02-20' },
  // ...
];

table.setData(customData);
```

### Programmatic Control

```javascript
// Get selected rows data
const selected = table.getSelectedData();

// Clear selection
table.clearSelection();

// Get all data
const allData = table.getData();
```

## API

### Events

#### selectionChange
Fired when user selects/deselects rows

```javascript
table.addEventListener('selectionChange', (event) => {
  // event.detail.selectedIds - Array of selected row IDs
});
```

### Public Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `setData(data)` | `any[]` | `void` | Replace table data |
| `getData()` | none | `any[]` | Get all data |
| `getSelectedData()` | none | `any[]` | Get selected rows |
| `clearSelection()` | none | `void` | Deselect all rows |

## Component Details

### Data Format

Data should be an array of objects with unique `id` field:

```typescript
interface TableRow {
  id: number;
  [key: string]: any; // Other fields as needed
}
```

### Column Configuration

The component automatically detects columns from data keys. Column definitions are internal:

```typescript
interface TableColumn {
  key: string;        // Object key
  label: string;      // Display name
  sortable?: boolean; // Enable sorting (default: true)
  type?: 'string' | 'number' | 'date'; // For sorting
}
```

### Sorting

- **String**: Alphabetical (case-insensitive)
- **Number**: Numeric value
- **Date**: ISO format (YYYY-MM-DD)

Toggle sort direction by clicking the same column header again.

### Pagination

- Default page size: 10 rows
- Adjustable: 5, 10, 25, 50 rows per page
- Shows "Showing X-Y of Z" information
- Prev/Next buttons with auto-disable on first/last page

### Filtering

- Real-time search across all columns
- Case-insensitive matching
- Resets to page 1 when filtering
- Maintains sorting during filter

### Row Selection

- Checkbox in first column
- "Select all" checkbox in header
- Visual highlighting of selected rows (green background)
- Emits `selectionChange` event
- Track via `event.detail.selectedIds`

## Styling

The component uses Shadow DOM for encapsulation. All styles are scoped internally.

### Theme Colors
- Primary: #4CAF50 (Green)
- Secondary: #667eea (Purple)
- Neutral backgrounds and borders

### Responsive Breakpoints
- Mobile: < 768px - Compact layout, smaller fonts
- Desktop: ≥ 768px - Full layout

## Test Coverage

### Test Suite (25+ tests)
- ✅ Table rendering and column display
- ✅ Sorting (ascending/descending/toggle)
- ✅ Pagination (navigation, page size change)
- ✅ Row selection (individual/all)
- ✅ Search/filtering with empty states
- ✅ Event emission on selection
- ✅ Data persistence across operations
- ✅ Sort direction maintenance during pagination

## Performance Characteristics

| Operation | Time Complexity | Notes |
|-----------|-----------------|-------|
| Initial render | O(n) | n = page size |
| Sort | O(n log n) | Full dataset sort once |
| Filter | O(n) | Search across all data |
| Select row | O(1) | Set addition |
| Pagination | O(1) | Slice from filtered data |

## Browser Compatibility

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+
- Modern mobile browsers

## Implementation Highlights

### Shadow DOM
- Encapsulated styles don't affect parent document
- Protected component structure
- No style conflicts

### Smart Data Management
```typescript
allData    → filtered on search
         ↓
filteredData → sorted by column
         ↓
displayData (slice for current page)
```

### Event-Driven Updates
- Single event listener pattern
- Efficient re-rendering
- Custom events for parent integration

## Example: With Export

```html
<ui-data-table id="table"></ui-data-table>
<button id="exportBtn">Export Selected</button>

<script type="module">
  import './ui-data-table.js';

  const table = document.getElementById('table');
  const exportBtn = document.getElementById('exportBtn');

  exportBtn.addEventListener('click', () => {
    const selected = table.getSelectedData();
    const csv = selected.map(row =>
      Object.values(row).join(',')
    ).join('\n');

    // Download CSV...
  });
</script>
```

## Limitations & Future Enhancements

### Current Limitations
- Single column sort (no multi-column)
- No server-side pagination
- No column resizing
- No horizontal scrolling for wide tables

### Planned Features
- [ ] Multi-column sorting
- [ ] Server-side pagination API
- [ ] Resizable columns
- [ ] Fixed header on scroll
- [ ] Column visibility toggle
- [ ] Custom cell templates
- [ ] Inline editing
- [ ] Row grouping
- [ ] Aggregate functions (sum, avg, etc.)

## Code Size

- TypeScript source: 650 LOC
- Compiled JavaScript: ~22 KB
- Minified: ~8 KB
- No dependencies

## Related Components

- **ui-pagination** - Standalone pagination control
- **ui-search** - Advanced search/filter component
- **ui-button** - Reusable button styles
- **ui-input** - Form input component

## License

MIT

---

**Status**: Production Ready ✅
**Test Coverage**: 25+ tests
**Dependencies**: 0
**Bundle Size**: ~8 KB minified
