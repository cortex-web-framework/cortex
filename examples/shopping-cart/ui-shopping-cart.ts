/**
 * Shopping Cart Component
 * Complete e-commerce cart with tax calculation and coupon support
 * NO external dependencies - pure TypeScript
 */

import * as utils from '../../src/utils/index.js';

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

// Sample products
const PRODUCTS: Product[] = [
  { id: 1, name: 'Laptop', description: 'High-performance laptop', price: 999.99 },
  { id: 2, name: 'Mouse', description: 'Wireless mouse', price: 29.99 },
  { id: 3, name: 'Keyboard', description: 'Mechanical keyboard', price: 99.99 },
  { id: 4, name: 'Monitor', description: '4K monitor', price: 399.99 },
  { id: 5, name: 'Headphones', description: 'Noise-cancelling headphones', price: 199.99 },
];

// Coupon codes
const COUPONS: Record<string, number> = {
  SAVE10: 0.1, // 10% off
  SAVE20: 0.2, // 20% off
  WELCOME5: 0.05, // 5% off
};

const TAX_RATE = 0.08; // 8% sales tax

export class ShoppingCart extends HTMLElement {
  private shadowRoot: ShadowRoot;
  private products: Product[] = PRODUCTS;
  private cartState: CartState = { items: [], discount: 0 };
  private currentProductIndex: number = 0;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.loadCartState();
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .cart-container {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 2rem;
          max-width: 1200px;
          margin: 0 auto;
          padding: 2rem;
        }

        .products-section,
        .cart-section {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          padding: 2rem;
        }

        .section-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .product-display {
          border: 1px solid #e0e0e0;
          border-radius: 8px;
          padding: 1.5rem;
          margin-bottom: 1rem;
        }

        .product-name {
          font-size: 1.25rem;
          font-weight: 600;
          color: #333;
          margin-bottom: 0.5rem;
        }

        .product-description {
          color: #666;
          font-size: 0.9rem;
          margin-bottom: 1rem;
        }

        .product-price {
          font-size: 1.75rem;
          font-weight: 700;
          color: #4CAF50;
          margin-bottom: 1rem;
        }

        .product-nav {
          display: flex;
          gap: 0.5rem;
          margin-bottom: 1rem;
          justify-content: space-between;
          align-items: center;
        }

        button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: all 0.2s;
        }

        button[data-action="add-to-cart"] {
          background: #4CAF50;
          color: white;
          flex: 1;
        }

        button[data-action="add-to-cart"]:hover {
          background: #45a049;
        }

        button[data-action="prev-product"],
        button[data-action="next-product"] {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        button[data-action="prev-product"]:hover,
        button[data-action="next-product"]:hover {
          background: #eeeeee;
        }

        button[data-action="prev-product"]:disabled,
        button[data-action="next-product"]:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .empty-state {
          padding: 2rem;
          text-align: center;
          color: #999;
        }

        .empty-state p {
          margin: 1rem 0;
        }

        button[data-action="view-products"],
        button[data-action="checkout"] {
          background: #4CAF50;
          color: white;
          width: 100%;
        }

        button[data-action="view-products"]:hover,
        button[data-action="checkout"]:hover {
          background: #45a049;
        }

        button[data-action="checkout"]:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .cart-item {
          display: grid;
          grid-template-columns: 1fr auto auto;
          gap: 1rem;
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
          align-items: center;
        }

        .cart-item:last-child {
          border-bottom: none;
        }

        .item-info {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .item-name {
          font-weight: 600;
          color: #333;
        }

        .item-price {
          color: #666;
          font-size: 0.9rem;
        }

        .item-quantity-control {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .item-quantity-control input {
          width: 50px;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          text-align: center;
        }

        .item-total {
          font-weight: 600;
          color: #333;
          min-width: 80px;
          text-align: right;
        }

        .item-remove {
          background: #f44336;
          color: white;
          padding: 0.5rem 1rem;
          font-size: 0.85rem;
        }

        .item-remove:hover {
          background: #da190b;
        }

        .coupon-section {
          padding: 1rem;
          background: #f5f5f5;
          border-radius: 4px;
          margin-bottom: 1.5rem;
        }

        .coupon-section label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        .coupon-input-group {
          display: flex;
          gap: 0.5rem;
        }

        .coupon-input-group input {
          flex: 1;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
        }

        .coupon-input-group button {
          background: #2196F3;
          color: white;
          padding: 0.5rem 1rem;
          font-size: 0.9rem;
        }

        .coupon-input-group button:hover {
          background: #0b7dda;
        }

        .summary {
          border-top: 2px solid #e0e0e0;
          padding-top: 1rem;
          margin-top: 1rem;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 0.75rem;
          color: #666;
        }

        .summary-row.total {
          font-size: 1.25rem;
          font-weight: 700;
          color: #333;
          border-top: 1px solid #e0e0e0;
          padding-top: 0.75rem;
          margin-top: 0.75rem;
        }

        .summary-row.discount {
          color: #4CAF50;
          font-weight: 600;
        }

        @media (max-width: 768px) {
          .cart-container {
            grid-template-columns: 1fr;
            padding: 1rem;
          }

          .cart-item {
            grid-template-columns: 1fr;
          }

          .item-total {
            text-align: left;
          }
        }
      </style>

      <div class="cart-container" data-cart-container>
        <!-- Products Section -->
        <div class="products-section">
          <h2 class="section-title">Featured Products</h2>

          <div class="product-display">
            <div class="product-name" data-product-name></div>
            <div class="product-description" data-product-description></div>
            <div class="product-price" data-product-price></div>

            <div class="product-nav">
              <button type="button" data-action="prev-product">← Previous</button>
              <span data-product-counter></span>
              <button type="button" data-action="next-product">Next →</button>
            </div>

            <button type="button" data-action="add-to-cart">Add to Cart</button>
          </div>
        </div>

        <!-- Cart Section -->
        <div class="cart-section">
          <h2 class="section-title">
            Shopping Cart
            <span data-item-count style="font-size: 1rem; color: #666;"></span>
          </h2>

          <div data-empty-state style="display: none;">
            <div class="empty-state">
              <p>Your cart is empty</p>
              <p style="font-size: 0.9rem;">Start shopping to add items</p>
            </div>
          </div>

          <div data-cart-items></div>

          <div class="coupon-section" style="display: none;" data-coupon-section>
            <label for="coupon">Apply Coupon Code:</label>
            <div class="coupon-input-group">
              <input
                type="text"
                id="coupon"
                data-coupon-input
                placeholder="Enter coupon code"
                autocomplete="off"
              />
              <button type="button" data-action="apply-coupon">Apply</button>
            </div>
            <div style="font-size: 0.85rem; color: #666; margin-top: 0.5rem;">
              Available: SAVE10, SAVE20, WELCOME5
            </div>
          </div>

          <div class="summary" style="display: none;" data-summary>
            <div class="summary-row">
              <span>Subtotal:</span>
              <span data-subtotal>$0.00</span>
            </div>
            <div class="summary-row discount" style="display: none;" data-discount>
              <span>Discount:</span>
              <span data-discount-amount>-$0.00</span>
            </div>
            <div class="summary-row">
              <span>Tax (${TAX_RATE * 100}% <span data-tax-rate>${TAX_RATE * 100}</span>%):</span>
              <span data-tax>$0.00</span>
            </div>
            <div class="summary-row total">
              <span>Total:</span>
              <span data-total>$0.00</span>
            </div>

            <button type="button" data-action="checkout" style="margin-top: 1rem;">
              Proceed to Checkout
            </button>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    const prevBtn = this.shadowRoot.querySelector('[data-action="prev-product"]') as HTMLButtonElement;
    const nextBtn = this.shadowRoot.querySelector('[data-action="next-product"]') as HTMLButtonElement;
    const addBtn = this.shadowRoot.querySelector('[data-action="add-to-cart"]') as HTMLButtonElement;
    const applyBtn = this.shadowRoot.querySelector('[data-action="apply-coupon"]') as HTMLButtonElement;
    const checkoutBtn = this.shadowRoot.querySelector('[data-action="checkout"]') as HTMLButtonElement;

    prevBtn.addEventListener('click', () => this.previousProduct());
    nextBtn.addEventListener('click', () => this.nextProduct());
    addBtn.addEventListener('click', () => this.addToCart());
    applyBtn.addEventListener('click', () => this.applyCoupon());
    checkoutBtn.addEventListener('click', () => this.checkout());

    this.updateProductDisplay();
    this.updateCartDisplay();
  }

  private updateProductDisplay() {
    const product = this.products[this.currentProductIndex];
    const nameEl = this.shadowRoot.querySelector('[data-product-name]') as HTMLElement;
    const descEl = this.shadowRoot.querySelector('[data-product-description]') as HTMLElement;
    const priceEl = this.shadowRoot.querySelector('[data-product-price]') as HTMLElement;
    const counterEl = this.shadowRoot.querySelector('[data-product-counter]') as HTMLElement;
    const prevBtn = this.shadowRoot.querySelector('[data-action="prev-product"]') as HTMLButtonElement;
    const nextBtn = this.shadowRoot.querySelector('[data-action="next-product"]') as HTMLButtonElement;

    nameEl.textContent = product.name;
    descEl.textContent = product.description;
    priceEl.textContent = utils.formatCurrency(product.price);
    counterEl.textContent = `${this.currentProductIndex + 1} / ${this.products.length}`;

    prevBtn.disabled = this.currentProductIndex === 0;
    nextBtn.disabled = this.currentProductIndex === this.products.length - 1;
  }

  private previousProduct() {
    if (this.currentProductIndex > 0) {
      this.currentProductIndex--;
      this.updateProductDisplay();
    }
  }

  private nextProduct() {
    if (this.currentProductIndex < this.products.length - 1) {
      this.currentProductIndex++;
      this.updateProductDisplay();
    }
  }

  private addToCart() {
    const product = this.products[this.currentProductIndex];
    const existingItem = this.cartState.items.find((item) => item.product.id === product.id);

    if (existingItem) {
      existingItem.quantity++;
    } else {
      this.cartState.items.push({ product, quantity: 1 });
    }

    this.saveCartState();
    this.updateCartDisplay();
  }

  private applyCoupon() {
    const couponInput = this.shadowRoot.querySelector('[data-coupon-input]') as HTMLInputElement;
    const coupon = couponInput.value.toUpperCase();

    if (!COUPONS[coupon]) {
      alert('Invalid coupon code');
      return;
    }

    this.cartState.appliedCoupon = coupon;
    this.cartState.discount = COUPONS[coupon];
    couponInput.value = '';

    this.saveCartState();
    this.updateCartDisplay();
  }

  private removeFromCart(productId: number) {
    this.cartState.items = this.cartState.items.filter((item) => item.product.id !== productId);
    this.saveCartState();
    this.updateCartDisplay();
  }

  private updateItemQuantity(productId: number, quantity: number) {
    const item = this.cartState.items.find((item) => item.product.id === productId);
    if (item) {
      item.quantity = Math.max(1, quantity);
      this.saveCartState();
      this.updateCartDisplay();
    }
  }

  private updateCartDisplay() {
    const itemsEl = this.shadowRoot.querySelector('[data-cart-items]') as HTMLElement;
    const emptyState = this.shadowRoot.querySelector('[data-empty-state]') as HTMLElement;
    const summary = this.shadowRoot.querySelector('[data-summary]') as HTMLElement;
    const couponSection = this.shadowRoot.querySelector('[data-coupon-section]') as HTMLElement;
    const itemCountEl = this.shadowRoot.querySelector('[data-item-count]') as HTMLElement;

    // Update item count
    const totalItems = this.cartState.items.reduce((sum, item) => sum + item.quantity, 0);
    itemCountEl.textContent = `(${totalItems} items)`;

    if (this.cartState.items.length === 0) {
      itemsEl.innerHTML = '';
      emptyState.style.display = 'block';
      summary.style.display = 'none';
      couponSection.style.display = 'none';
      return;
    }

    emptyState.style.display = 'none';
    summary.style.display = 'block';
    couponSection.style.display = 'block';

    itemsEl.innerHTML = this.cartState.items
      .map(
        (item) => `
      <div class="cart-item" data-cart-item>
        <div class="item-info">
          <div class="item-name" data-item-name>${item.product.name}</div>
          <div class="item-price" data-item-price>${utils.formatCurrency(item.product.price)} each</div>
        </div>
        <div class="item-quantity-control">
          <input
            type="number"
            min="1"
            value="${item.quantity}"
            data-quantity
            data-product-id="${item.product.id}"
          />
        </div>
        <div class="item-total" data-item-total>
          ${utils.formatCurrency(item.product.price * item.quantity)}
        </div>
        <button type="button" class="item-remove" data-action="remove" data-product-id="${item.product.id}">
          Remove
        </button>
      </div>
    `
      )
      .join('');

    // Add event listeners to quantity inputs
    const quantityInputs = this.shadowRoot.querySelectorAll('[data-quantity]');
    quantityInputs.forEach((input) => {
      input.addEventListener('change', (e) => {
        const productId = parseInt((e.target as HTMLInputElement).getAttribute('data-product-id')!);
        const quantity = parseInt((e.target as HTMLInputElement).value);
        this.updateItemQuantity(productId, quantity);
      });
    });

    // Add event listeners to remove buttons
    const removeButtons = this.shadowRoot.querySelectorAll('[data-action="remove"]');
    removeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const productId = parseInt(btn.getAttribute('data-product-id')!);
        this.removeFromCart(productId);
      });
    });

    // Update summary
    this.updateSummary();
  }

  private updateSummary() {
    const subtotal = this.getSubtotal();
    const discountAmount = subtotal * this.cartState.discount;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = subtotalAfterDiscount * TAX_RATE;
    const total = subtotalAfterDiscount + tax;

    const subtotalEl = this.shadowRoot.querySelector('[data-subtotal]') as HTMLElement;
    const discountEl = this.shadowRoot.querySelector('[data-discount]') as HTMLElement;
    const discountAmountEl = this.shadowRoot.querySelector('[data-discount-amount]') as HTMLElement;
    const taxEl = this.shadowRoot.querySelector('[data-tax]') as HTMLElement;
    const totalEl = this.shadowRoot.querySelector('[data-total]') as HTMLElement;

    subtotalEl.textContent = utils.formatCurrency(subtotal);
    taxEl.textContent = utils.formatCurrency(tax);
    totalEl.textContent = utils.formatCurrency(total);

    if (this.cartState.discount > 0) {
      discountEl.style.display = 'flex';
      discountAmountEl.textContent = `-${utils.formatCurrency(discountAmount)}`;
    } else {
      discountEl.style.display = 'none';
    }
  }

  private getSubtotal() {
    return this.cartState.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }

  private checkout() {
    const subtotal = this.getSubtotal();
    const discountAmount = subtotal * this.cartState.discount;
    const subtotalAfterDiscount = subtotal - discountAmount;
    const tax = subtotalAfterDiscount * TAX_RATE;
    const total = subtotalAfterDiscount + tax;

    this.dispatchEvent(
      new CustomEvent('checkoutStart', {
        detail: {
          items: this.cartState.items.map((item) => ({
            id: item.product.id,
            name: item.product.name,
            price: item.product.price,
            quantity: item.quantity,
          })),
          subtotal,
          discount: discountAmount,
          tax,
          total,
          coupon: this.cartState.appliedCoupon,
        },
        bubbles: true,
        composed: true,
      })
    );
  }

  private saveCartState() {
    utils.setItem('cart_state', this.cartState);
  }

  private loadCartState() {
    const saved = utils.getItem<CartState>('cart_state');
    if (saved) {
      this.cartState = saved;
    }
  }

  // Public methods
  getCartItems() {
    return this.cartState.items;
  }

  getCartTotal() {
    const subtotal = this.getSubtotal();
    const discountAmount = subtotal * this.cartState.discount;
    const subtotalAfterDiscount = subtotal - discountAmount;
    return subtotalAfterDiscount + subtotalAfterDiscount * TAX_RATE;
  }

  clearCart() {
    this.cartState.items = [];
    this.cartState.appliedCoupon = undefined;
    this.cartState.discount = 0;
    this.saveCartState();
    this.updateCartDisplay();
  }
}

// Register the custom element
if (!customElements.get('ui-shopping-cart')) {
  customElements.define('ui-shopping-cart', ShoppingCart);
}
