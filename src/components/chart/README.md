# Chart Component

A comprehensive charting component supporting multiple chart types (Bar, Line, Pie, Area) with interactive tooltips, custom colors, and responsive design. Built with Canvas API and pure TypeScript - **zero external dependencies**.

## Features

- **Multiple Chart Types** - Bar, Line, Pie, and Area charts
- **Multi-Dataset Support** - Display multiple data series in one chart
- **Interactive Tooltips** - Hover to see detailed information
- **Custom Colors** - Full control over dataset colors
- **Responsive Design** - Auto-scales to container size
- **Real-time Updates** - Change data and type dynamically
- **Legend Display** - Visual legend for all datasets
- **Canvas Rendering** - Fast, efficient rendering with Canvas API

## Usage

```html
<ui-chart id="myChart" type="bar"></ui-chart>

<script type="module">
  import './ui-chart.js';

  const chart = document.getElementById('myChart');

  const data = {
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

  chart.setTitle('Monthly Sales Report');
  chart.setData(data);

  chart.addEventListener('data-change', (event) => {
    console.log('Chart data updated:', event.detail);
  });
</script>
```

## API

### Attributes

| Attribute | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | "bar" | Chart type: bar, line, pie, area |

### Data Structure

```typescript
interface ChartData {
  labels: string[];              // X-axis or pie labels
  datasets: {
    label: string;               // Dataset name for legend
    data: number[];              // Values
    color?: string;              // Hex color code
    borderColor?: string;         // Optional border color
  }[];
}
```

### Public Methods

| Method | Returns | Description |
|--------|---------|-------------|
| `setData(data)` | void | Update chart data |
| `getData()` | ChartData | Get current data |
| `setChartType(type)` | void | Change chart type |
| `getChartType()` | ChartType | Get current type |
| `setTitle(title)` | void | Set chart title |
| `getTitle()` | string | Get chart title |

### Events

#### data-change
Fired when chart data is updated

```javascript
chart.addEventListener('data-change', (event) => {
  const { data, chartType } = event.detail;
});
```

## Chart Types

### Bar Chart
Vertical bars showing categorical data

```javascript
chart.setChartType('bar');
chart.setData({
  labels: ['A', 'B', 'C'],
  datasets: [{ label: 'Data', data: [10, 20, 30] }],
});
```

### Line Chart
Connected points showing trends

```javascript
chart.setChartType('line');
```

### Pie Chart
Proportional segments with percentages

```javascript
chart.setChartType('pie');
```

### Area Chart
Filled areas for time-series data

```javascript
chart.setChartType('area');
```

## Examples

### Single Dataset
```javascript
const data = {
  labels: ['Q1', 'Q2', 'Q3', 'Q4'],
  datasets: [
    { label: 'Revenue', data: [100, 150, 120, 200] }
  ],
};
chart.setData(data);
```

### Multiple Datasets
```javascript
const data = {
  labels: ['Jan', 'Feb', 'Mar'],
  datasets: [
    { label: 'Sales', data: [65, 59, 80], color: '#667eea' },
    { label: 'Profit', data: [45, 55, 70], color: '#764ba2' },
  ],
};
chart.setData(data);
```

### Dynamic Updates
```javascript
// Update chart data
chart.setData(newData);

// Change type
chart.setChartType('line');

// Update title
chart.setTitle('Q3 Performance Report');
```

## Performance

| Operation | Time |
|-----------|------|
| Render 100 points | < 20ms |
| Render 500 points | < 50ms |
| Update data | < 30ms |
| Type change | < 20ms |

## Browser Compatibility

- Chrome 67+
- Firefox 63+
- Safari 11+
- Edge 79+

Requires Canvas API support (all modern browsers).

## Test Coverage

35+ test cases covering:
- Data management
- Chart type changes
- Title management
- Legend rendering
- Canvas rendering
- Data validation
- Responsive behavior
- Tooltip interaction

## Code Size

- TypeScript source: ~340 LOC
- Compiled JavaScript: ~14 KB
- Minified: ~5.5 KB
- No dependencies

## Limitations & Future Features

### Current Limitations
- No animation on chart transitions
- No axis labels (only data labels)
- No click/interaction events
- No data point selection

### Planned Features
- [ ] Animated transitions
- [ ] Custom axis labels
- [ ] Click event handling
- [ ] Zoom/pan functionality
- [ ] Export as image
- [ ] Stacked bar charts
- [ ] Horizontal bar charts
- [ ] Scatter plot type

## Related Components

- **ui-table** - Data table
- **ui-tree** - Hierarchical data
- **ui-dropdown** - Selection dropdown

## License

MIT

---

**Status**: Production Ready ✅
**Test Coverage**: 35+ tests
**Dependencies**: 0
**Bundle Size**: ~5.5 KB minified
