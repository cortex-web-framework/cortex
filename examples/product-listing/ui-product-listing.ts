/**
 * Product Listing Component with Advanced Filters
 * Grid view with category, price, and search filters
 * NO external dependencies - pure TypeScript
 */

import * as utils from '../../src/utils/index.js';

interface Product {
  id: number;
  name: string;
  description: string;
  price: number;
  category: string;
  rating: number;
  reviews: number;
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

// Sample product data
const PRODUCTS: Product[] = [
  {
    id: 1,
    name: 'Laptop Pro',
    description: 'High-performance laptop for professionals',
    price: 1299.99,
    category: 'electronics',
    rating: 4.8,
    reviews: 245,
    inStock: true,
  },
  {
    id: 2,
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse',
    price: 29.99,
    category: 'accessories',
    rating: 4.5,
    reviews: 1230,
    inStock: true,
  },
  {
    id: 3,
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with custom switches',
    price: 149.99,
    category: 'accessories',
    rating: 4.7,
    reviews: 890,
    inStock: true,
  },
  {
    id: 4,
    name: '4K Monitor',
    description: '32-inch 4K display for content creators',
    price: 599.99,
    category: 'electronics',
    rating: 4.6,
    reviews: 432,
    inStock: true,
  },
  {
    id: 5,
    name: 'Noise-Cancelling Headphones',
    description: 'Premium wireless headphones with ANC',
    price: 299.99,
    category: 'audio',
    rating: 4.9,
    reviews: 2156,
    inStock: true,
  },
  {
    id: 6,
    name: 'USB-C Hub',
    description: 'Multi-port USB-C hub adapter',
    price: 49.99,
    category: 'accessories',
    rating: 4.4,
    reviews: 567,
    inStock: false,
  },
  {
    id: 7,
    name: 'Webcam 4K',
    description: '4K webcam for streaming and calls',
    price: 179.99,
    category: 'electronics',
    rating: 4.5,
    reviews: 678,
    inStock: true,
  },
  {
    id: 8,
    name: 'Desk Lamp LED',
    description: 'Adjustable LED desk lamp with USB charging',
    price: 59.99,
    category: 'office',
    rating: 4.3,
    reviews: 445,
    inStock: true,
  },
  {
    id: 9,
    name: 'Phone Stand',
    description: 'Adjustable phone and tablet stand',
    price: 19.99,
    category: 'accessories',
    rating: 4.2,
    reviews: 1089,
    inStock: true,
  },
  {
    id: 10,
    name: 'External SSD 1TB',
    description: 'Fast external SSD with USB-C',
    price: 129.99,
    category: 'storage',
    rating: 4.7,
    reviews: 756,
    inStock: true,
  },
  {
    id: 11,
    name: 'Portable Charger',
    description: '20000mAh portable power bank',
    price: 39.99,
    category: 'accessories',
    rating: 4.4,
    reviews: 2341,
    inStock: true,
  },
  {
    id: 12,
    name: 'Cable Organizer',
    description: 'Magnetic cable organizer clips set',
    price: 14.99,
    category: 'office',
    rating: 4.1,
    reviews: 823,
    inStock: true,
  },
];

const CATEGORIES = [
  'electronics',
  'accessories',
  'audio',
  'office',
  'storage',
];

export class ProductListing extends HTMLElement {
  private shadowRoot: ShadowRoot;
  private products: Product[] = PRODUCTS;
  private filteredProducts: Product[] = [];
  private filterState: FilterState = {
    searchTerm: '',
    category: '',
    minPrice: 0,
    maxPrice: 10000,
    sortBy: 'name',
  };

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.applyFilters();
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          padding: 2rem;
        }

        .container {
          display: grid;
          grid-template-columns: 250px 1fr;
          gap: 2rem;
          max-width: 1400px;
          margin: 0 auto;
        }

        .filter-sidebar {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          height: fit-content;
          position: sticky;
          top: 20px;
        }

        .filter-title {
          font-size: 1.1rem;
          font-weight: 600;
          margin-bottom: 1.5rem;
          color: #333;
        }

        .filter-group {
          margin-bottom: 1.5rem;
        }

        .filter-group label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .filter-group select,
        .filter-group input {
          width: 100%;
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .price-inputs {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 0.5rem;
        }

        .filter-group input:focus,
        .filter-group select:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .filter-actions {
          display: flex;
          gap: 0.5rem;
          margin-top: 1.5rem;
        }

        .filter-actions button {
          flex: 1;
          padding: 0.5rem;
          border: none;
          border-radius: 4px;
          font-weight: 500;
          cursor: pointer;
          font-size: 0.85rem;
        }

        button[data-action="clear-filters"] {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        button[data-action="clear-filters"]:hover {
          background: #eeeeee;
        }

        .main-content {
          display: flex;
          flex-direction: column;
          gap: 1.5rem;
        }

        .controls {
          background: white;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .search-box {
          flex: 1;
          margin-right: 1rem;
        }

        .search-box input {
          width: 100%;
          padding: 0.75rem 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.95rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .sort-select {
          min-width: 180px;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        .result-info {
          color: #666;
          font-size: 0.9rem;
          margin-top: 0.5rem;
        }

        .product-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
          gap: 1.5rem;
        }

        .product-card {
          background: white;
          border-radius: 8px;
          overflow: hidden;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          transition: transform 0.2s, box-shadow 0.2s;
          cursor: pointer;
        }

        .product-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        .product-image {
          width: 100%;
          height: 200px;
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 3rem;
          position: relative;
        }

        .stock-badge {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          background: #4CAF50;
          color: white;
          padding: 0.25rem 0.75rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 600;
        }

        .stock-badge.out-of-stock {
          background: #f44336;
        }

        .product-info {
          padding: 1rem;
        }

        .product-name {
          font-weight: 600;
          color: #333;
          margin-bottom: 0.25rem;
          font-size: 0.95rem;
        }

        .product-category {
          color: #999;
          font-size: 0.8rem;
          text-transform: uppercase;
          margin-bottom: 0.5rem;
        }

        .product-rating {
          color: #ff9800;
          font-size: 0.85rem;
          margin-bottom: 0.5rem;
        }

        .product-price {
          font-size: 1.3rem;
          font-weight: 700;
          color: #4CAF50;
          margin-bottom: 0.75rem;
        }

        .add-to-cart {
          width: 100%;
          padding: 0.75rem;
          background: #4CAF50;
          color: white;
          border: none;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: background 0.2s;
        }

        .add-to-cart:hover {
          background: #45a049;
        }

        .add-to-cart:disabled {
          background: #ccc;
          cursor: not-allowed;
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 3rem;
          text-align: center;
          color: #999;
        }

        .empty-state h3 {
          margin-bottom: 0.5rem;
          color: #666;
        }

        @media (max-width: 768px) {
          :host {
            padding: 1rem;
          }

          .container {
            grid-template-columns: 1fr;
          }

          .filter-sidebar {
            position: static;
          }

          .controls {
            flex-direction: column;
            align-items: stretch;
            gap: 0.75rem;
          }

          .search-box {
            margin-right: 0;
          }

          .sort-select {
            min-width: auto;
          }

          .product-grid {
            grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
          }
        }
      </style>

      <div class="container">
        <!-- Sidebar Filters -->
        <div class="filter-sidebar" data-filter-sidebar>
          <div class="filter-title">Filters</div>

          <div class="filter-group">
            <label>Search Products:</label>
            <input type="text" data-search-input placeholder="Search..." />
          </div>

          <div class="filter-group">
            <label>Category:</label>
            <select data-filter-category>
              <option value="">All Categories</option>
              <option value="electronics">Electronics</option>
              <option value="accessories">Accessories</option>
              <option value="audio">Audio</option>
              <option value="office">Office</option>
              <option value="storage">Storage</option>
            </select>
          </div>

          <div class="filter-group">
            <label>Price Range:</label>
            <div class="price-inputs">
              <input type="number" data-filter-min-price min="0" placeholder="Min" />
              <input type="number" data-filter-max-price max="10000" placeholder="Max" />
            </div>
          </div>

          <div class="filter-actions">
            <button type="button" data-action="clear-filters">Clear Filters</button>
          </div>
        </div>

        <!-- Main Content -->
        <div class="main-content">
          <!-- Controls -->
          <div class="controls">
            <div class="search-box">
              <input type="text" data-search-input placeholder="Search products..." />
            </div>
            <select class="sort-select" data-sort-select>
              <option value="name">Sort by Name</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="rating">Best Rating</option>
              <option value="newest">Newest</option>
            </select>
          </div>

          <div class="result-info">
            <span data-result-count>Showing 0 products</span>
          </div>

          <!-- Product Grid -->
          <div class="product-grid" data-product-grid></div>

          <!-- Empty State -->
          <div class="empty-state" data-empty-state style="display: none;">
            <h3>No Products Found</h3>
            <p>Try adjusting your filters or search terms</p>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    const searchInputs = this.shadowRoot.querySelectorAll('[data-search-input]');
    const categorySelect = this.shadowRoot.querySelector('[data-filter-category]') as HTMLSelectElement;
    const minPriceInput = this.shadowRoot.querySelector('[data-filter-min-price]') as HTMLInputElement;
    const maxPriceInput = this.shadowRoot.querySelector('[data-filter-max-price]') as HTMLInputElement;
    const sortSelect = this.shadowRoot.querySelector('[data-sort-select]') as HTMLSelectElement;
    const clearBtn = this.shadowRoot.querySelector('[data-action="clear-filters"]') as HTMLButtonElement;

    // Search handlers (both copies)
    searchInputs.forEach((input) => {
      input.addEventListener('input', (e) => {
        this.filterState.searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
        this.applyFilters();
      });
    });

    // Category filter
    categorySelect.addEventListener('change', (e) => {
      this.filterState.category = (e.target as HTMLSelectElement).value;
      this.applyFilters();
    });

    // Price filters
    minPriceInput.addEventListener('change', (e) => {
      this.filterState.minPrice = parseInt((e.target as HTMLInputElement).value) || 0;
      this.applyFilters();
    });

    maxPriceInput.addEventListener('change', (e) => {
      this.filterState.maxPrice = parseInt((e.target as HTMLInputElement).value) || 10000;
      this.applyFilters();
    });

    // Sort
    sortSelect.addEventListener('change', (e) => {
      this.filterState.sortBy = (e.target as HTMLSelectElement).value as FilterState['sortBy'];
      this.applyFilters();
    });

    // Clear filters
    clearBtn.addEventListener('click', () => {
      this.filterState = {
        searchTerm: '',
        category: '',
        minPrice: 0,
        maxPrice: 10000,
        sortBy: 'name',
      };

      searchInputs.forEach((input) => {
        (input as HTMLInputElement).value = '';
      });
      categorySelect.value = '';
      minPriceInput.value = '';
      maxPriceInput.value = '';
      sortSelect.value = 'name';

      this.applyFilters();
    });
  }

  private applyFilters() {
    // Filter products
    this.filteredProducts = this.products.filter((product) => {
      // Search filter
      if (this.filterState.searchTerm) {
        const matches =
          product.name.toLowerCase().includes(this.filterState.searchTerm) ||
          product.description.toLowerCase().includes(this.filterState.searchTerm);
        if (!matches) return false;
      }

      // Category filter
      if (this.filterState.category && product.category !== this.filterState.category) {
        return false;
      }

      // Price filter
      if (product.price < this.filterState.minPrice || product.price > this.filterState.maxPrice) {
        return false;
      }

      return true;
    });

    // Sort products
    this.sortProducts();

    // Render grid
    this.renderGrid();
  }

  private sortProducts() {
    const sorted = [...this.filteredProducts];

    switch (this.filterState.sortBy) {
      case 'name':
        sorted.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'price-asc':
        sorted.sort((a, b) => a.price - b.price);
        break;
      case 'price-desc':
        sorted.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        sorted.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        sorted.sort((a, b) => b.id - a.id);
        break;
    }

    this.filteredProducts = sorted;
  }

  private renderGrid() {
    const grid = this.shadowRoot.querySelector('[data-product-grid]') as HTMLElement;
    const emptyState = this.shadowRoot.querySelector('[data-empty-state]') as HTMLElement;
    const resultInfo = this.shadowRoot.querySelector('[data-result-count]') as HTMLElement;

    resultInfo.textContent = `Showing ${this.filteredProducts.length} product${this.filteredProducts.length !== 1 ? 's' : ''}`;

    if (this.filteredProducts.length === 0) {
      grid.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    grid.innerHTML = this.filteredProducts
      .map(
        (product) => `
      <div class="product-card" data-product-card>
        <div class="product-image" data-product-image>
          📦
          <div class="stock-badge ${!product.inStock ? 'out-of-stock' : ''}">
            ${product.inStock ? 'In Stock' : 'Out of Stock'}
          </div>
        </div>
        <div class="product-info">
          <div class="product-category">${product.category}</div>
          <div class="product-name" data-product-name>${product.name}</div>
          <div class="product-rating" data-product-rating>
            ${'★'.repeat(Math.floor(product.rating))} ${product.rating.toFixed(1)}
            <span style="color: #ccc; font-size: 0.8rem;">(${product.reviews})</span>
          </div>
          <div class="product-price" data-product-price>${utils.formatCurrency(product.price)}</div>
          <button
            type="button"
            class="add-to-cart"
            data-action="add-to-cart"
            ${!product.inStock ? 'disabled' : ''}
          >
            ${product.inStock ? 'Add to Cart' : 'Out of Stock'}
          </button>
        </div>
      </div>
    `
      )
      .join('');
  }

  // Public methods
  getProducts() {
    return this.products;
  }

  getFilteredProducts() {
    return this.filteredProducts;
  }

  setProducts(products: Product[]) {
    this.products = products;
    this.applyFilters();
  }
}

// Register the custom element
if (!customElements.get('ui-product-listing')) {
  customElements.define('ui-product-listing', ProductListing);
}
