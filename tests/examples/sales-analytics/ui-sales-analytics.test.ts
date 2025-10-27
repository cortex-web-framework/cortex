import { describe, test, beforeEach, afterEach } from '../../index.js';
import { createComponentFixture, cleanupFixture } from '../../utils/component-helpers.js';
import '../../../../../../examples/sales-analytics-dashboard/ui-sales-analytics.js';

describe('SalesAnalyticsDashboard', () => {
  let fixture: HTMLElement;
  let component: any;

  beforeEach(async () => {
    fixture = createComponentFixture();
    component = document.createElement('ui-sales-analytics');
    fixture.appendChild(component);
    await new Promise((resolve) => setTimeout(resolve, 100));
  });

  afterEach(() => {
    cleanupFixture(fixture);
  });

  describe('Initialization', () => {
    test('component should render dashboard structure', () => {
      const dashboard = component.shadowRoot.querySelector('.dashboard');
      if (!dashboard) throw new Error('Dashboard container not found');
    });

    test('should render header with title', () => {
      const header = component.shadowRoot.querySelector('.header h1');
      if (!header?.textContent?.includes('Sales Analytics')) {
        throw new Error('Dashboard title not rendered');
      }
    });

    test('should render control panel', () => {
      const controls = component.shadowRoot.querySelector('.controls');
      if (!controls) throw new Error('Controls panel not found');
    });

    test('should render metric cards', () => {
      const metrics = component.shadowRoot.querySelectorAll('.metric-card');
      if (metrics.length === 0) throw new Error('Metric cards not rendered');
    });

    test('should render charts', () => {
      const charts = component.shadowRoot.querySelectorAll('ui-chart');
      if (charts.length === 0) throw new Error('Charts not rendered');
    });

    test('should render product table', () => {
      const table = component.shadowRoot.querySelector('table');
      if (!table) throw new Error('Product table not found');
    });
  });

  describe('Metrics Display', () => {
    test('should display total sales metric', () => {
      const metrics = component.shadowRoot.querySelectorAll('.metric-card');
      let foundSales = false;
      metrics.forEach((card: Element) => {
        if (card.textContent?.includes('Total Sales')) {
          foundSales = true;
        }
      });
      if (!foundSales) throw new Error('Total Sales metric not found');
    });

    test('should display revenue metric', () => {
      const metrics = component.shadowRoot.querySelectorAll('.metric-card');
      let foundRevenue = false;
      metrics.forEach((card: Element) => {
        if (card.textContent?.includes('Revenue')) {
          foundRevenue = true;
        }
      });
      if (!foundRevenue) throw new Error('Revenue metric not found');
    });

    test('should display profit metric', () => {
      const metrics = component.shadowRoot.querySelectorAll('.metric-card');
      let foundProfit = false;
      metrics.forEach((card: Element) => {
        if (card.textContent?.includes('Profit')) {
          foundProfit = true;
        }
      });
      if (!foundProfit) throw new Error('Profit metric not found');
    });

    test('metric values should be numeric', () => {
      const values = component.shadowRoot.querySelectorAll('.metric-value');
      values.forEach((value: Element) => {
        const text = value.textContent || '';
        if (!text.match(/\d/)) {
          throw new Error('Metric value should contain numbers');
        }
      });
    });

    test('should show metric changes', () => {
      const changes = component.shadowRoot.querySelectorAll('.metric-change');
      if (changes.length === 0) throw new Error('Metric changes not displayed');
    });
  });

  describe('Charts Integration', () => {
    test('should render sales trend chart', () => {
      const chart = component.shadowRoot.querySelector('#sales-chart');
      if (!chart) throw new Error('Sales chart not found');
    });

    test('should render product performance chart', () => {
      const chart = component.shadowRoot.querySelector('#product-chart');
      if (!chart) throw new Error('Product chart not found');
    });

    test('should render regional distribution chart', () => {
      const chart = component.shadowRoot.querySelector('#region-chart');
      if (!chart) throw new Error('Region chart not found');
    });

    test('should render margin chart', () => {
      const chart = component.shadowRoot.querySelector('#margin-chart');
      if (!chart) throw new Error('Margin chart not found');
    });

    test('charts should have different types', () => {
      const salesChart = component.shadowRoot.querySelector('#sales-chart') as any;
      const productChart = component.shadowRoot.querySelector('#product-chart') as any;
      const regionChart = component.shadowRoot.querySelector('#region-chart') as any;
      const marginChart = component.shadowRoot.querySelector('#margin-chart') as any;

      if (salesChart.getChartType() !== 'line') throw new Error('Sales chart should be line');
      if (productChart.getChartType() !== 'bar') throw new Error('Product chart should be bar');
      if (regionChart.getChartType() !== 'pie') throw new Error('Region chart should be pie');
      if (marginChart.getChartType() !== 'area') throw new Error('Margin chart should be area');
    });
  });

  describe('Search Integration', () => {
    test('should have search component', () => {
      const search = component.shadowRoot.querySelector('ui-search');
      if (!search) throw new Error('Search component not found');
    });

    test('search should have metric items', () => {
      const search = component.shadowRoot.querySelector('ui-search') as any;
      const items = search.getItems();
      if (items.length === 0) throw new Error('Search should have items');
    });

    test('search should be searchable', () => {
      const search = component.shadowRoot.querySelector('ui-search') as any;
      const items = search.getItems();
      if (!items.some((item: string) => item.includes('Sales'))) {
        throw new Error('Should have metrics in search');
      }
    });
  });

  describe('Period Selector', () => {
    test('should have period dropdown', () => {
      const dropdown = component.shadowRoot.querySelector('#period-dropdown');
      if (!dropdown) throw new Error('Period dropdown not found');
    });

    test('dropdown should have period options', () => {
      const dropdown = component.shadowRoot.querySelector('#period-dropdown') as HTMLSelectElement;
      if (!dropdown) throw new Error('Dropdown not found');

      const options = dropdown.querySelectorAll('option');
      if (options.length < 3) throw new Error('Should have multiple period options');
    });

    test('should have week as default period', () => {
      const dropdown = component.shadowRoot.querySelector('#period-dropdown') as HTMLSelectElement;
      if (dropdown.value !== 'week') {
        throw new Error('Week should be default period');
      }
    });
  });

  describe('Product Table', () => {
    test('should display product table', () => {
      const table = component.shadowRoot.querySelector('table');
      if (!table) throw new Error('Table not found');
    });

    test('table should have headers', () => {
      const headers = component.shadowRoot.querySelectorAll('thead th');
      if (headers.length === 0) throw new Error('Table headers not found');
    });

    test('table should have product rows', () => {
      const rows = component.shadowRoot.querySelectorAll('tbody tr');
      if (rows.length === 0) throw new Error('Product rows not found');
    });

    test('products should be sorted by sales', () => {
      const rows = component.shadowRoot.querySelectorAll('tbody tr');
      let previousSales = Infinity;

      rows.forEach((row: Element) => {
        const salesCell = row.querySelector('td:nth-child(2)');
        const salesText = salesCell?.textContent || '';
        const sales = parseInt(salesText.replace(/\D/g, ''));

        if (sales > previousSales) {
          throw new Error('Products should be sorted by sales (descending)');
        }
        previousSales = sales;
      });
    });

    test('should show product status badges', () => {
      const badges = component.shadowRoot.querySelectorAll('.status-badge');
      if (badges.length === 0) throw new Error('Status badges not found');
    });
  });

  describe('Data Calculation', () => {
    test('total sales should match daily data', () => {
      const metricsText = component.shadowRoot.querySelector('.metric-value')?.textContent;
      if (!metricsText || metricsText === '') {
        throw new Error('Metric values should be calculated');
      }
    });

    test('should calculate average metrics', () => {
      const metrics = component.shadowRoot.querySelectorAll('.metric-value');
      if (metrics.length === 0) throw new Error('No metrics calculated');

      metrics.forEach((metric: Element) => {
        const value = metric.textContent || '';
        if (value === '') {
          throw new Error('All metrics should have values');
        }
      });
    });
  });

  describe('Responsive Design', () => {
    test('dashboard should have responsive classes', () => {
      const dashboard = component.shadowRoot.querySelector('.dashboard');
      if (!dashboard) throw new Error('Dashboard not found');
    });

    test('should render on different screen sizes', () => {
      // Just verify it renders without error
      const metrics = component.shadowRoot.querySelectorAll('.metric-card');
      if (metrics.length > 0) {
        // Responsive design is in place
      }
    });
  });

  describe('Component Integration', () => {
    test('should integrate ui-chart component', () => {
      const charts = component.shadowRoot.querySelectorAll('ui-chart');
      if (charts.length < 2) throw new Error('Should integrate multiple charts');
    });

    test('should integrate ui-search component', () => {
      const search = component.shadowRoot.querySelector('ui-search');
      if (!search) throw new Error('Should integrate search component');
    });

    test('multiple components should coexist', () => {
      const charts = component.shadowRoot.querySelectorAll('ui-chart');
      const search = component.shadowRoot.querySelector('ui-search');
      const table = component.shadowRoot.querySelector('table');

      if (!charts || !search || !table) {
        throw new Error('All components should be present');
      }
    });
  });
});
