# Product Listing Component

A fully-featured product catalog with advanced filtering, searching, and sorting capabilities. Built with Web Components and pure TypeScript - **zero external dependencies**.

## Features

### Filtering & Search
- **Text Search** - Real-time search across product names and descriptions
- **Category Filter** - Filter by 5 predefined categories
- **Price Range Filter** - Min and max price filtering
- **Multiple Filters** - Combine search, category, and price filters
- **Clear Filters** - Reset all filters with single click

### Sorting
- **By Name** - Alphabetical A-Z
- **By Price** - Low to High or High to Low
- **By Rating** - Best rated products first
- **By Newest** - Latest products first

### Display
- **Responsive Grid** - Auto-adjusting columns for different screen sizes
- **Product Cards** - Image, name, category, price, and rating
- **Stock Status** - Visual indicator for in-stock/out-of-stock
- **Star Ratings** - 5-star system with review count
- **Price Display** - Formatted currency with `formatCurrency()` utility
- **Empty State** - Helpful message when no results found

### User Experience
- **Fast Filtering** - Instant results as user adjusts filters
- **Result Count** - Shows number of displayed products
- **Sticky Sidebar** - Filters remain visible while scrolling
- **Mobile Optimized** - Single column layout on mobile
- **Smooth Hover Effects** - Cards elevate on hover

## Usage

### Basic Setup

```html
<ui-product-listing id="catalog"></ui-product-listing>

<script type="module">
  import './ui-product-listing.js';

  const catalog = document.getElementById('catalog');

  // Get filtered products
  const products = catalog.getFilteredProducts();

  // Get all products
  const allProducts = catalog.getProducts();
</script>
```

### Custom Products

```javascript
const customProducts = [
  {
    id: 1,
    name: 'Custom Product',
    description: 'Product description',
    price: 99.99,
    category: 'electronics',
    rating: 4.5,
    reviews: 123,
    inStock: true,
  },
  // ...more products
];

catalog.setProducts(customProducts);
```

## API

### Public Methods

| Method | Parameters | Returns | Description |
|--------|-----------|---------|-------------|
| `getProducts()` | none | `Product[]` | Get all products |
| `getFilteredProducts()` | none | `Product[]` | Get filtered/sorted products |
| `setProducts(products)` | `Product[]` | `void` | Replace product list |

### Data Structures

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;  // 'electronics', 'accessories', 'audio', 'office', 'storage'
  rating: number;    // 0-5
  reviews: number;   // count of reviews
  image?: string;
  inStock: boolean;
}

interface FilterState {
  searchTerm: string;
  category: string;
  minPrice: number;
  maxPrice: number;
  sortBy: 'name' | 'price-asc' | 'price-desc' | 'rating' | 'newest';
}
```

## Component Details

### Built-in Products

12 sample products across 5 categories:
- **Electronics**: Laptop, Monitor, Webcam
- **Accessories**: Mouse, Keyboard, USB Hub, Phone Stand, Cable Organizer
- **Audio**: Headphones
- **Office**: Desk Lamp
- **Storage**: External SSD, Portable Charger

Price range: $14.99 - $1,299.99

### Categories

- `electronics` - Computing and digital devices
- `accessories` - Peripherals and add-ons
- `audio` - Speakers, headphones, microphones
- `office` - Desk and workspace items
- `storage` - Hard drives and memory

### Sorting Logic

1. **Name**: Case-insensitive alphabetical sort
2. **Price**: Numeric sort (ascending or descending)
3. **Rating**: By rating value (5★ first)
4. **Newest**: By product ID (highest ID first)

Sort order is preserved when filtering/searching.

### Filter Combinations

All filters work together intelligently:
- Search + Category: Products matching text in selected category
- Search + Price: Results matching text within price range
- Category + Price: All category products in price range
- All three: Intersection of all criteria

## Performance

| Operation | Complexity |
|-----------|------------|
| Filter products | O(n) |
| Sort products | O(n log n) |
| Search text | O(n × m) (n=products, m=avg text length) |
| Render grid | O(n) |
| Apply all filters | O(n log n) |

## Styling

Component uses Shadow DOM for complete style encapsulation.

### Theme Colors
- Primary: #667eea (Purple) - Headers, accents
- Success: #4CAF50 (Green) - Prices, buttons
- Warning: #f44336 (Red) - Out of stock
- Neutral: #f5f5f5 - Backgrounds

### Responsive Breakpoints
- **Mobile**: < 768px - Single sidebar, 1-2 column grid
- **Tablet**: 768-1024px - Side-by-side layout
- **Desktop**: > 1024px - Full layout with sticky sidebar

### Grid Layout
- **Desktop**: Auto-fill grid with 250px minimum column width
- **Tablet**: Auto-fill with 200px minimum
- **Mobile**: Auto-fill with 150px minimum

## Test Coverage

### Test Suite (20+ tests)
- ✅ Component rendering
- ✅ Product display and grid
- ✅ Category filtering
- ✅ Price range filtering
- ✅ Text search functionality
- ✅ Multiple filter combination
- ✅ Sorting by all options
- ✅ Filter persistence during sort
- ✅ Clear filters functionality
- ✅ Empty state handling
- ✅ Result count display
- ✅ Mobile responsiveness
- ✅ Stock status display
- ✅ Rating display

## Browser Compatibility

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+
- Modern mobile browsers (iOS Safari 11+, Chrome Mobile)

## Example: E-commerce Integration

```javascript
const catalog = document.getElementById('catalog');

catalog.addEventListener('click', (event) => {
  const btn = event.target;
  if (btn.hasAttribute('data-action') &&
      btn.getAttribute('data-action') === 'add-to-cart') {
    const card = btn.closest('[data-product-card]');
    const productName = card.querySelector('[data-product-name]').textContent;

    // Add to cart in parent application
    cart.addItem(productName);
  }
});
```

## Implementation Highlights

### Smart Filtering

```
User Input (search/category/price)
         ↓
Apply All Filters
         ↓
Filtered Products
         ↓
Apply Sort
         ↓
Sorted & Filtered Products
         ↓
Render Grid
```

### Sticky Sidebar

Sidebar remains visible during scroll on desktop:
```css
position: sticky;
top: 20px;
height: fit-content;
```

### Responsive Grid

Auto-adjusting columns using CSS Grid:
```css
grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
```

## Limitations & Future Enhancements

### Current Limitations
- No pagination (shows all filtered results)
- Single product data set (no multiple data sources)
- No product images (uses placeholder emoji)
- No variant selection (color, size, etc.)
- No wishlist integration

### Planned Features
- [ ] Pagination or infinite scroll
- [ ] Product image support
- [ ] Multi-select filters (multiple categories)
- [ ] Price slider instead of text inputs
- [ ] Rating filter slider
- [ ] Product comparison view
- [ ] Wishlist/favorites
- [ ] Recently viewed products
- [ ] Related products
- [ ] Advanced search with operators
- [ ] Saved filter presets
- [ ] URL query parameters for filters

## Code Size

- TypeScript source: 550 LOC
- Compiled JavaScript: ~18 KB
- Minified: ~6.5 KB
- No dependencies

## Related Components

- **ui-data-table** - Tabular product view
- **ui-shopping-cart** - Shopping cart integration
- **ui-search** - Advanced search component
- **ui-pagination** - Pagination control

## License

MIT

---

**Status**: Production Ready ✅
**Test Coverage**: 20+ tests
**Dependencies**: 0
**Bundle Size**: ~6.5 KB minified
