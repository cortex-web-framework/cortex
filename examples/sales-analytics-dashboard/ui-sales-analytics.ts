/**
 * Sales Analytics Dashboard - Integrated Example
 * Combines: charts, dropdowns, search, and data tables
 * NO external dependencies - pure TypeScript with Web Components
 */

export class SalesAnalyticsDashboard extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private data = {
    dailySales: [
      { date: 'Mon', sales: 2400, revenue: 2210, profit: 229 },
      { date: 'Tue', sales: 1398, revenue: 2210, profit: 229 },
      { date: 'Wed', sales: 9800, revenue: 2290, profit: 200 },
      { date: 'Thu', sales: 3908, revenue: 2000, profit: 221 },
      { date: 'Fri', sales: 4800, revenue: 2181, profit: 500 },
      { date: 'Sat', sales: 3800, revenue: 2500, profit: 400 },
      { date: 'Sun', sales: 4300, revenue: 2100, profit: 600 },
    ],
    productSales: [
      { product: 'Laptop', sales: 1200, margin: 35 },
      { product: 'Phone', sales: 2100, margin: 40 },
      { product: 'Tablet', sales: 800, margin: 38 },
      { product: 'Watch', sales: 950, margin: 42 },
      { product: 'Headphones', sales: 1500, margin: 45 },
    ],
    regionMetrics: [
      { region: 'North', percentage: 28 },
      { region: 'South', percentage: 22 },
      { region: 'East', percentage: 31 },
      { region: 'West', percentage: 19 },
    ],
  };

  private selectedPeriod: string = 'week';
  private filteredData: any[] = [];

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          background: #f5f7fa;
          color: #333;
        }

        .dashboard {
          min-height: 100vh;
          padding: 2rem;
        }

        .header {
          margin-bottom: 2rem;
        }

        .header h1 {
          font-size: 2rem;
          color: #1a1a1a;
          margin-bottom: 0.5rem;
        }

        .header p {
          color: #666;
          font-size: 0.95rem;
        }

        .controls {
          display: flex;
          gap: 1rem;
          margin-bottom: 2rem;
          flex-wrap: wrap;
        }

        .control-group {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .control-group label {
          font-weight: 500;
          color: #333;
          font-size: 0.9rem;
        }

        .metric-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
          gap: 1rem;
          margin-bottom: 2rem;
        }

        .metric-card {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .metric-label {
          font-size: 0.85rem;
          color: #666;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          margin-bottom: 0.5rem;
        }

        .metric-value {
          font-size: 1.8rem;
          font-weight: 600;
          color: #1a1a1a;
        }

        .metric-change {
          font-size: 0.8rem;
          margin-top: 0.5rem;
          color: #27ae60;
        }

        .metric-change.negative {
          color: #e74c3c;
        }

        .charts-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(500px, 1fr));
          gap: 2rem;
          margin-bottom: 2rem;
        }

        .chart-container {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .chart-container h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          color: #1a1a1a;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          padding: 1.5rem;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
          overflow-x: auto;
        }

        .table-container h3 {
          margin-top: 0;
          margin-bottom: 1rem;
          font-size: 1.1rem;
          color: #1a1a1a;
        }

        table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.9rem;
        }

        thead {
          background: #f9f9f9;
          border-bottom: 2px solid #eee;
        }

        th {
          padding: 0.75rem;
          text-align: left;
          font-weight: 600;
          color: #666;
        }

        td {
          padding: 0.75rem;
          border-bottom: 1px solid #eee;
        }

        tr:hover {
          background: #f9f9f9;
        }

        .status-badge {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.8rem;
          font-weight: 500;
        }

        .status-good {
          background: #d4edda;
          color: #155724;
        }

        .status-warning {
          background: #fff3cd;
          color: #856404;
        }

        .search-wrapper {
          min-width: 250px;
        }

        .no-results {
          padding: 2rem;
          text-align: center;
          color: #999;
          font-size: 0.95rem;
        }

        @media (max-width: 1200px) {
          .charts-grid {
            grid-template-columns: 1fr;
          }

          .dashboard {
            padding: 1rem;
          }
        }

        @media (max-width: 768px) {
          .controls {
            flex-direction: column;
          }

          .control-group {
            flex-direction: column;
            align-items: flex-start;
          }

          .metric-grid {
            grid-template-columns: 1fr;
          }

          .header h1 {
            font-size: 1.5rem;
          }
        }
      </style>

      <div class="dashboard">
        <div class="header">
          <h1>📊 Sales Analytics Dashboard</h1>
          <p>Real-time performance metrics and insights</p>
        </div>

        <div class="controls">
          <div class="control-group">
            <label for="period-dropdown">Period:</label>
            <select id="period-dropdown" style="padding: 0.5rem; border: 1px solid #ddd; border-radius: 4px; font-size: 0.9rem;">
              <option value="day">Last Day</option>
              <option value="week" selected>Last Week</option>
              <option value="month">Last Month</option>
              <option value="year">Last Year</option>
            </select>
          </div>

          <div class="control-group search-wrapper">
            <label>Search Metrics:</label>
            <ui-search id="metric-search" data-items="Total Sales,Revenue,Profit Margin,Top Product,Best Region" placeholder="Find metric..."></ui-search>
          </div>
        </div>

        <div class="metric-grid" data-metrics-grid></div>

        <div class="charts-grid">
          <div class="chart-container">
            <h3>Daily Sales Trend</h3>
            <ui-chart id="sales-chart" type="line"></ui-chart>
          </div>

          <div class="chart-container">
            <h3>Product Performance</h3>
            <ui-chart id="product-chart" type="bar"></ui-chart>
          </div>

          <div class="chart-container">
            <h3>Regional Distribution</h3>
            <ui-chart id="region-chart" type="pie"></ui-chart>
          </div>

          <div class="chart-container">
            <h3>Profit Margin by Product</h3>
            <ui-chart id="margin-chart" type="area"></ui-chart>
          </div>
        </div>

        <div class="table-container">
          <h3>Top Products by Sales</h3>
          <table data-products-table>
            <thead>
              <tr>
                <th>Product Name</th>
                <th>Total Sales</th>
                <th>Profit Margin</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody data-products-tbody></tbody>
          </table>
        </div>
      </div>
    `;

    this.initializeCharts();
    this.renderMetrics();
    this.renderProductTable();
  }

  private initializeCharts() {
    const salesChart = this._shadowRoot.getElementById('sales-chart') as any;
    if (salesChart) {
      salesChart.setTitle('Sales Trend Over Time');
      salesChart.setData({
        labels: this.data.dailySales.map((d) => d.date),
        datasets: [
          {
            label: 'Sales',
            data: this.data.dailySales.map((d) => d.sales),
            color: '#667eea',
          },
          {
            label: 'Revenue',
            data: this.data.dailySales.map((d) => d.revenue),
            color: '#764ba2',
          },
        ],
      });
    }

    const productChart = this._shadowRoot.getElementById('product-chart') as any;
    if (productChart) {
      productChart.setTitle('Sales by Product');
      productChart.setData({
        labels: this.data.productSales.map((p) => p.product),
        datasets: [
          {
            label: 'Sales Volume',
            data: this.data.productSales.map((p) => p.sales),
            color: '#f093fb',
          },
        ],
      });
    }

    const regionChart = this._shadowRoot.getElementById('region-chart') as any;
    if (regionChart) {
      regionChart.setTitle('Sales by Region');
      regionChart.setData({
        labels: this.data.regionMetrics.map((r) => r.region),
        datasets: [
          {
            label: 'Market Share',
            data: this.data.regionMetrics.map((r) => r.percentage),
          },
        ],
      });
    }

    const marginChart = this._shadowRoot.getElementById('margin-chart') as any;
    if (marginChart) {
      marginChart.setTitle('Profit Margins by Product');
      marginChart.setData({
        labels: this.data.productSales.map((p) => p.product),
        datasets: [
          {
            label: 'Margin %',
            data: this.data.productSales.map((p) => p.margin),
            color: '#43e97b',
          },
        ],
      });
    }
  }

  private renderMetrics() {
    const totalSales = this.data.dailySales.reduce((sum, d) => sum + d.sales, 0);
    const totalRevenue = this.data.dailySales.reduce((sum, d) => sum + d.revenue, 0);
    const totalProfit = this.data.dailySales.reduce((sum, d) => sum + d.profit, 0);
    const avgMargin = (
      this.data.productSales.reduce((sum, p) => sum + p.margin, 0) / this.data.productSales.length
    ).toFixed(1);

    const metricsGrid = this._shadowRoot.querySelector('[data-metrics-grid]') as HTMLElement;
    if (metricsGrid) {
      metricsGrid.innerHTML = `
        <div class="metric-card">
          <div class="metric-label">Total Sales</div>
          <div class="metric-value">${totalSales.toLocaleString()}</div>
          <div class="metric-change">↑ 12.5% from last period</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Revenue</div>
          <div class="metric-value">$${totalRevenue.toLocaleString()}</div>
          <div class="metric-change">↑ 8.3% from last period</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Total Profit</div>
          <div class="metric-value">$${totalProfit.toLocaleString()}</div>
          <div class="metric-change negative">↓ 2.1% from last period</div>
        </div>

        <div class="metric-card">
          <div class="metric-label">Avg Profit Margin</div>
          <div class="metric-value">${avgMargin}%</div>
          <div class="metric-change">↑ 1.2% from last period</div>
        </div>
      `;
    }
  }

  private renderProductTable() {
    const tbody = this._shadowRoot.querySelector('[data-products-tbody]') as HTMLElement;
    if (tbody) {
      tbody.innerHTML = this.data.productSales
        .sort((a, b) => b.sales - a.sales)
        .map((product) => {
          const status = product.sales > 1500 ? 'High' : product.sales > 1000 ? 'Medium' : 'Low';
          const statusClass = status === 'High' ? 'status-good' : 'status-warning';

          return `
            <tr>
              <td>${product.product}</td>
              <td>${product.sales.toLocaleString()} units</td>
              <td>${product.margin}%</td>
              <td><span class="status-badge ${statusClass}">${status}</span></td>
            </tr>
          `;
        })
        .join('');
    }
  }

  private setupEventListeners() {
    const periodDropdown = this._shadowRoot.getElementById('period-dropdown') as HTMLSelectElement;
    if (periodDropdown) {
      periodDropdown.addEventListener('change', (e) => {
        this.selectedPeriod = (e.target as HTMLSelectElement).value;
        // In a real app, this would reload data based on period
      });
    }

    const searchComponent = this._shadowRoot.querySelector('ui-search') as any;
    if (searchComponent) {
      searchComponent.addEventListener('select', (e: any) => {
        console.log('Metric selected:', e.detail.value);
      });
    }
  }
}

// Register the custom element
if (!customElements.get('ui-sales-analytics')) {
  customElements.define('ui-sales-analytics', SalesAnalyticsDashboard);
}
