# Shopping Cart Component

A complete, production-ready e-commerce shopping cart component with tax calculation, coupon support, and localStorage persistence. Built with Web Components and pure TypeScript - **zero external dependencies**.

## Features

### Core Functionality
- **Product Browsing** - Navigate featured products with prev/next controls
- **Smart Cart** - Automatically increments quantities for duplicate items
- **Quantity Management** - Update quantities on-the-fly with recalculation
- **Item Removal** - Remove items from cart individually
- **Price Calculation** - Automatic subtotal, tax, and total computation
- **Coupon Codes** - Apply discount codes for instant price reduction
- **Persistent Storage** - Cart saved to localStorage, survives page refresh
- **Checkout Integration** - Custom event with complete order data

### UI/UX
- Beautiful two-column layout (products + cart)
- Real-time price updates
- Coupon code validation with helpful messaging
- Item counter in cart header
- Empty cart state with helpful messaging
- Responsive design for mobile and desktop
- Smooth animations and transitions

### Business Logic
- Accurate tax calculation (configurable rate)
- Multiple coupon codes with percentage discounts
- Subtotal updates with quantity changes
- Discount amount clearly displayed
- Order summary on checkout

## Usage

### Basic Setup

```html
<ui-shopping-cart id="cart"></ui-shopping-cart>

<script type="module">
  import './ui-shopping-cart.js';

  const cart = document.getElementById('cart');

  // Listen for checkout
  cart.addEventListener('checkoutStart', (event) => {
    const orderData = event.detail;
    console.log('Order:', orderData);
    // Send to server for processing
  });
</script>
```

### Using with Custom Products

```javascript
const customProducts = [
  { id: 1, name: 'Widget A', description: 'Great widget', price: 49.99 },
  { id: 2, name: 'Widget B', description: 'Better widget', price: 99.99 },
];

// Note: Component currently has fixed products in code
// Can be enhanced to accept setProducts() method
```

### Programmatic Control

```javascript
// Get cart items
const items = cart.getCartItems();

// Get cart total
const total = cart.getCartTotal();

// Clear cart
cart.clearCart();
```

## API

### Events

#### checkoutStart
Fired when user clicks checkout button with items in cart

```javascript
cart.addEventListener('checkoutStart', (event) => {
  const {
    items,        // Array of cart items with quantities
    subtotal,     // Subtotal before discount
    discount,     // Discount amount
    tax,          // Tax amount
    total,        // Final total
    coupon,       // Applied coupon code (if any)
  } = event.detail;
});
```

### Public Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `getCartItems()` | `CartItem[]` | Get all items in cart |
| `getCartTotal()` | `number` | Get calculated total price |
| `clearCart()` | `void` | Clear all items and reset cart |

## Component Details

### Data Structure

```typescript
interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  image?: string;
}

interface CartItem {
  product: Product;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  appliedCoupon?: string;
  discount: number;
}
```

### Built-in Products

Default 5 products (laptop, mouse, keyboard, monitor, headphones):
- Prices from $29.99 to $999.99
- Each with descriptive text
- Navigate with prev/next buttons

### Built-in Coupons

| Code | Discount |
|------|----------|
| SAVE10 | 10% off |
| SAVE20 | 20% off |
| WELCOME5 | 5% off |

### Tax Calculation

- **Rate**: 8% (configurable in code)
- **Applies to**: Subtotal after discount
- **Formula**: (Subtotal - Discount) × Tax Rate = Tax

### Price Formatting

All prices automatically formatted using `formatCurrency()` utility:
- USD currency by default
- Thousands separator
- 2 decimal places
- Example: $1,234.56

## Storage

### localStorage Keys

- `cart_state` - Complete cart state (items, coupon, discount)

### Persistence

Cart automatically saved on any change:
- Adding items
- Removing items
- Updating quantities
- Applying coupons

Cart automatically loaded when component initialized.

## Styling

Component uses Shadow DOM for complete encapsulation.

### Theme Colors
- Primary: #4CAF50 (Green) - Add to cart, checkout
- Secondary: #2196F3 (Blue) - Apply coupon
- Danger: #f44336 (Red) - Remove button
- Neutral: #333, #666, #999 - Text colors

### Layout
- **Desktop**: Two-column layout (products | cart)
- **Mobile**: Single column (responsive)
- Gap: 2rem between sections

## Test Coverage

### Test Suite (25+ tests)
- ✅ Component rendering
- ✅ Product display and navigation
- ✅ Adding items to cart (single and multiple)
- ✅ Quantity management
- ✅ Item removal
- ✅ Subtotal calculation
- ✅ Tax calculation
- ✅ Total calculation
- ✅ Coupon application
- ✅ Discount display
- ✅ Cart persistence
- ✅ Empty cart state
- ✅ Checkout event emission
- ✅ Empty state messaging
- ✅ Responsive behavior

## Performance

| Operation | Time Complexity |
|-----------|-----------------|
| Add item | O(n) - O(1) if new |
| Remove item | O(n) |
| Update quantity | O(n) |
| Calculate total | O(n) |
| Apply coupon | O(1) |
| Save to storage | O(1) |
| Load from storage | O(1) |

## Browser Compatibility

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+
- Modern mobile browsers

## Example: Complete Integration

```html
<ui-shopping-cart id="myCart"></ui-shopping-cart>

<script type="module">
  import './ui-shopping-cart.js';

  const cart = document.getElementById('myCart');

  cart.addEventListener('checkoutStart', async (event) => {
    const order = event.detail;

    try {
      // Send order to server
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(order),
      });

      if (response.ok) {
        const result = await response.json();
        alert('Order placed! #' + result.orderNumber);
        cart.clearCart();
      }
    } catch (error) {
      alert('Error placing order: ' + error.message);
    }
  });
</script>
```

## Implementation Highlights

### Smart State Management
```
Product Selection
    ↓
Add to Cart → Check if exists
    ↓           ↓
   New Item    Increment Qty
    ↓           ↓
  Save to localStorage
    ↓
Update UI Display
    ↓
Recalculate Totals
```

### Real-time Updates
- Quantity change → Immediate total recalculation
- Item removal → Cart and summary update
- Coupon application → Discount display and recalculation
- All with seamless UI updates

### Encapsulation
- Shadow DOM prevents style leakage
- Component state is private
- Only exposed via public methods and events
- localStorage key scoped to 'cart_state'

## Limitations & Future Enhancements

### Current Limitations
- Fixed product list (no custom products yet)
- Single coupon at a time
- No product images in current demo
- No quantity limits
- No out-of-stock handling

### Planned Features
- [ ] Custom product data API
- [ ] Multiple coupon stacking
- [ ] Product images
- [ ] Quantity limits and stock checking
- [ ] Wishlist integration
- [ ] Order history
- [ ] Promo code generator
- [ ] Bulk discount tiers
- [ ] Free shipping calculation
- [ ] Payment method integration

## Code Size

- TypeScript source: 480 LOC
- Compiled JavaScript: ~20 KB
- Minified: ~7 KB
- No dependencies

## Related Components

- **ui-data-table** - Manage large product catalogs
- **ui-input** - Custom form inputs
- **ui-button** - Reusable button styles
- **ui-storage** - localStorage wrapper utility

## License

MIT

---

**Status**: Production Ready ✅
**Test Coverage**: 25+ tests
**Dependencies**: 0
**Bundle Size**: ~7 KB minified
