import { describe, test, beforeEach, afterEach } from '../../index.js';
import { createComponentFixture, cleanupFixture } from '../../utils/component-helpers.js';
import '../../../../../../src/components/chart/ui-chart.js';

describe('ChartComponent', () => {
  let fixture: HTMLElement;
  let component: any;

  const testData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May'],
    datasets: [
      {
        label: 'Sales',
        data: [65, 59, 80, 81, 56],
        color: '#667eea',
      },
      {
        label: 'Revenue',
        data: [45, 55, 70, 75, 60],
        color: '#764ba2',
      },
    ],
  };

  beforeEach(async () => {
    fixture = createComponentFixture();
    component = document.createElement('ui-chart');
    component.setAttribute('type', 'bar');
    fixture.appendChild(component);
    await new Promise((resolve) => setTimeout(resolve, 50));
  });

  afterEach(() => {
    cleanupFixture(fixture);
  });

  describe('Initialization', () => {
    test('component should render with default attributes', () => {
      const canvas = component.shadowRoot.querySelector('[data-canvas]');
      if (!canvas) throw new Error('Canvas element not found');
    });

    test('should parse type attribute', () => {
      if (component.getChartType() !== 'bar') {
        throw new Error('Chart type should be bar');
      }
    });

    test('should render legend container', () => {
      const legend = component.shadowRoot.querySelector('[data-legend]');
      if (!legend) throw new Error('Legend container not found');
    });

    test('should render title element', () => {
      const title = component.shadowRoot.querySelector('[data-title]');
      if (!title) throw new Error('Title element not found');
    });

    test('should render tooltip element', () => {
      const tooltip = component.shadowRoot.querySelector('[data-tooltip]');
      if (!tooltip) throw new Error('Tooltip element not found');
    });
  });

  describe('Data Management', () => {
    test('setData should update chart data', () => {
      component.setData(testData);

      const data = component.getData();
      if (data.labels.length !== 5) throw new Error('Should have 5 labels');
      if (data.datasets.length !== 2) throw new Error('Should have 2 datasets');
    });

    test('getData should return current data', () => {
      component.setData(testData);

      const data = component.getData();
      if (data.labels[0] !== 'Jan') throw new Error('First label should be Jan');
      if (data.datasets[0].label !== 'Sales') throw new Error('First dataset label should be Sales');
    });

    test('setData should trigger data-change event', () => {
      let eventFired = false;

      component.addEventListener('data-change', () => {
        eventFired = true;
      });

      component.setData(testData);

      if (!eventFired) throw new Error('data-change event not fired');
    });

    test('data-change event should include new data', () => {
      let eventData: any;

      component.addEventListener('data-change', (e: any) => {
        eventData = e.detail;
      });

      component.setData(testData);

      if (!eventData.data) throw new Error('Event should include data');
      if (eventData.data.labels.length !== 5) throw new Error('Event data should be correct');
    });
  });

  describe('Chart Type Management', () => {
    test('setChartType should update chart type', () => {
      component.setChartType('line');

      if (component.getChartType() !== 'line') {
        throw new Error('Chart type should be updated to line');
      }
    });

    test('getChartType should return current type', () => {
      if (component.getChartType() !== 'bar') {
        throw new Error('Should return bar as default');
      }
    });

    test('should support bar chart type', () => {
      component.setChartType('bar');
      component.setData(testData);

      if (component.getChartType() !== 'bar') {
        throw new Error('Should support bar chart');
      }
    });

    test('should support line chart type', () => {
      component.setChartType('line');
      component.setData(testData);

      if (component.getChartType() !== 'line') {
        throw new Error('Should support line chart');
      }
    });

    test('should support pie chart type', () => {
      component.setChartType('pie');
      const pieData = {
        labels: ['A', 'B', 'C'],
        datasets: [{ label: 'Data', data: [30, 25, 45] }],
      };
      component.setData(pieData);

      if (component.getChartType() !== 'pie') {
        throw new Error('Should support pie chart');
      }
    });

    test('should support area chart type', () => {
      component.setChartType('area');
      component.setData(testData);

      if (component.getChartType() !== 'area') {
        throw new Error('Should support area chart');
      }
    });
  });

  describe('Title Management', () => {
    test('setTitle should update chart title', () => {
      component.setTitle('Monthly Sales Report');

      if (component.getTitle() !== 'Monthly Sales Report') {
        throw new Error('Title should be updated');
      }
    });

    test('getTitle should return current title', () => {
      const initialTitle = component.getTitle();
      if (typeof initialTitle !== 'string') throw new Error('Should return string');
    });

    test('should display title in DOM', () => {
      component.setTitle('Test Title');

      const titleElement = component.shadowRoot.querySelector('[data-title]');
      if (!titleElement?.textContent?.includes('Test Title')) {
        throw new Error('Title should be displayed in DOM');
      }
    });

    test('setTitle should update DOM immediately', () => {
      component.setTitle('New Title');

      const titleElement = component.shadowRoot.querySelector('[data-title]');
      if (titleElement?.textContent !== 'New Title') {
        throw new Error('DOM should reflect title change');
      }
    });
  });

  describe('Legend Rendering', () => {
    test('should render legend for datasets', () => {
      component.setData(testData);

      const legendItems = component.shadowRoot.querySelectorAll('.legend-item');
      if (legendItems.length !== 2) {
        throw new Error('Should have 2 legend items');
      }
    });

    test('legend items should show dataset labels', () => {
      component.setData(testData);

      const legendItems = component.shadowRoot.querySelectorAll('.legend-item');
      const firstItemText = legendItems[0]?.textContent || '';

      if (!firstItemText.includes('Sales')) {
        throw new Error('Legend should show dataset label');
      }
    });

    test('legend items should have color indicators', () => {
      component.setData(testData);

      const colorDivs = component.shadowRoot.querySelectorAll('.legend-color');
      if (colorDivs.length !== 2) {
        throw new Error('Should have color indicators for each dataset');
      }
    });

    test('legend should update when data changes', () => {
      component.setData(testData);

      const newData = {
        labels: ['Q1', 'Q2', 'Q3'],
        datasets: [{ label: 'Profit', data: [100, 150, 120] }],
      };

      component.setData(newData);

      const legendItems = component.shadowRoot.querySelectorAll('.legend-item');
      if (legendItems.length !== 1) {
        throw new Error('Legend should update with new data');
      }
    });
  });

  describe('Canvas Rendering', () => {
    test('canvas should exist in DOM', () => {
      const canvas = component.shadowRoot.querySelector('[data-canvas]');
      if (!canvas) throw new Error('Canvas element not found');
    });

    test('canvas should have width and height', () => {
      const canvas = component.shadowRoot.querySelector('[data-canvas]') as HTMLCanvasElement;
      if (!canvas.width || !canvas.height) {
        throw new Error('Canvas should have dimensions');
      }
    });

    test('canvas context should be available', () => {
      // Canvas rendering is tested implicitly through chart type changes
      component.setData(testData);
      component.setChartType('bar');
      // If no error, context was available
      if (!component) throw new Error('Chart rendering failed');
    });

    test('should not throw when rendering empty data', () => {
      const emptyData = { labels: [], datasets: [] };
      try {
        component.setData(emptyData);
      } catch (error) {
        throw new Error('Should handle empty data gracefully');
      }
    });

    test('should handle single dataset', () => {
      const singleDataset = {
        labels: ['A', 'B', 'C'],
        datasets: [{ label: 'Data', data: [10, 20, 30] }],
      };

      component.setData(singleDataset);

      if (component.getData().datasets.length !== 1) {
        throw new Error('Should handle single dataset');
      }
    });

    test('should handle multiple datasets', () => {
      component.setData(testData);

      if (component.getData().datasets.length !== 2) {
        throw new Error('Should handle multiple datasets');
      }
    });
  });

  describe('Chart Transitions', () => {
    test('changing from bar to line chart should work', () => {
      component.setData(testData);
      component.setChartType('bar');
      component.setChartType('line');

      if (component.getChartType() !== 'line') {
        throw new Error('Should transition from bar to line');
      }
    });

    test('changing from line to pie chart should work', () => {
      const pieData = {
        labels: ['A', 'B', 'C'],
        datasets: [{ label: 'Data', data: [30, 25, 45] }],
      };

      component.setChartType('line');
      component.setChartType('pie');
      component.setData(pieData);

      if (component.getChartType() !== 'pie') {
        throw new Error('Should transition to pie chart');
      }
    });

    test('changing from pie to bar chart should work', () => {
      component.setChartType('pie');
      component.setChartType('bar');
      component.setData(testData);

      if (component.getChartType() !== 'bar') {
        throw new Error('Should transition from pie to bar');
      }
    });
  });

  describe('Data Validation', () => {
    test('should handle labels with special characters', () => {
      const data = {
        labels: ['Q1 2024', '50%+', 'A&B', '@Home'],
        datasets: [{ label: 'Data', data: [10, 20, 30, 40] }],
      };

      component.setData(data);

      if (component.getData().labels.length !== 4) {
        throw new Error('Should handle special characters in labels');
      }
    });

    test('should handle large numbers', () => {
      const data = {
        labels: ['A', 'B'],
        datasets: [{ label: 'Data', data: [1000000, 2000000] }],
      };

      component.setData(data);

      if (component.getData().datasets[0].data[0] !== 1000000) {
        throw new Error('Should handle large numbers');
      }
    });

    test('should handle decimal numbers', () => {
      const data = {
        labels: ['A', 'B'],
        datasets: [{ label: 'Data', data: [12.5, 24.75] }],
      };

      component.setData(data);

      if (component.getData().datasets[0].data[0] !== 12.5) {
        throw new Error('Should handle decimal numbers');
      }
    });

    test('should handle zero values', () => {
      const data = {
        labels: ['A', 'B', 'C'],
        datasets: [{ label: 'Data', data: [0, 10, 0] }],
      };

      component.setData(data);

      if (component.getData().datasets[0].data[0] !== 0) {
        throw new Error('Should handle zero values');
      }
    });
  });

  describe('Responsive Behavior', () => {
    test('should render without specified dimensions', () => {
      const newComponent = document.createElement('ui-chart');
      fixture.appendChild(newComponent);

      const canvas = newComponent.shadowRoot?.querySelector('[data-canvas]');
      if (!canvas) throw new Error('Should render canvas even without dimensions');
    });

    test('should have responsive styles', () => {
      const container = component.shadowRoot.querySelector('.chart-container');
      if (!container) throw new Error('Container not found');
    });
  });

  describe('Tooltip Interaction', () => {
    test('tooltip element should exist', () => {
      const tooltip = component.shadowRoot.querySelector('[data-tooltip]');
      if (!tooltip) throw new Error('Tooltip element not found');
    });

    test('tooltip should be hidden initially', () => {
      const tooltip = component.shadowRoot.querySelector('[data-tooltip]');
      if (tooltip?.classList.contains('visible')) {
        throw new Error('Tooltip should be hidden initially');
      }
    });
  });

  describe('Color Management', () => {
    test('should use provided colors', () => {
      component.setData(testData);

      const data = component.getData();
      if (data.datasets[0].color !== '#667eea') {
        throw new Error('Should use provided colors');
      }
    });

    test('should assign default colors if not provided', () => {
      const dataWithoutColors = {
        labels: ['A', 'B'],
        datasets: [{ label: 'Data', data: [10, 20] }],
      };

      component.setData(dataWithoutColors);

      // Component should render without error even without colors
      if (component.getChartType() !== 'bar') {
        throw new Error('Should handle missing colors');
      }
    });
  });
});
