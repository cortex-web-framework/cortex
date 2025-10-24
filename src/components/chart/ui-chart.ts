/**
 * Chart Component with Bar, Line, and Pie Charts
 * NO external dependencies - pure TypeScript with Canvas API
 */

export type ChartType = 'bar' | 'line' | 'pie' | 'area';

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ChartData {
  labels: string[];
  datasets: {
    label: string;
    data: number[];
    color?: string;
    borderColor?: string;
  }[];
}

export class ChartComponent extends HTMLElement {
  private _shadowRoot: ShadowRoot;
  private canvas: HTMLCanvasElement | null = null;
  private ctx: CanvasRenderingContext2D | null = null;
  private chartType: ChartType = 'bar';
  private data: ChartData = { labels: [], datasets: [] };
  private width: number = 0;
  private height: number = 0;
  private padding: number = 60;
  private tooltipNode: HTMLElement | null = null;

  constructor() {
    super();
    this._shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.parseAttributes();
    this.render();
    this.setupEventListeners();
  }

  private parseAttributes() {
    const typeAttr = this.getAttribute('type');
    if (typeAttr === 'line' || typeAttr === 'pie' || typeAttr === 'area') {
      this.chartType = typeAttr;
    }

    const dataAttr = this.getAttribute('data-chart');
    if (dataAttr) {
      try {
        this.data = JSON.parse(dataAttr);
      } catch {
        console.error('Invalid JSON in data-chart attribute');
      }
    }
  }

  private render() {
    const width = Math.min(this.clientWidth || 600, 800);
    const height = Math.min(this.clientHeight || 400, 500);

    this._shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          width: 100%;
        }

        .chart-container {
          position: relative;
          width: 100%;
          max-width: 100%;
          background: white;
          border-radius: 8px;
          padding: 1rem;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
        }

        .chart-title {
          margin: 0 0 1rem 0;
          color: #333;
          font-size: 1.2rem;
          font-weight: 600;
        }

        canvas {
          display: block;
          max-width: 100%;
          border-radius: 4px;
          background: white;
        }

        .chart-legend {
          display: flex;
          flex-wrap: wrap;
          gap: 1rem;
          margin-top: 1rem;
          padding-top: 1rem;
          border-top: 1px solid #eee;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          font-size: 0.9rem;
          color: #666;
        }

        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 2px;
        }

        .tooltip {
          position: absolute;
          background: rgba(0, 0, 0, 0.9);
          color: white;
          padding: 0.5rem 0.75rem;
          border-radius: 4px;
          font-size: 0.85rem;
          pointer-events: none;
          display: none;
          z-index: 1000;
          white-space: nowrap;
        }

        .tooltip.visible {
          display: block;
        }

        @media (max-width: 640px) {
          .chart-container {
            padding: 0.75rem;
          }

          canvas {
            max-width: 100%;
            height: auto;
          }

          .chart-legend {
            flex-direction: column;
            gap: 0.5rem;
          }
        }
      </style>

      <div class="chart-container">
        <h3 class="chart-title" data-title></h3>
        <canvas data-canvas width="${width}" height="${height}"></canvas>
        <div class="tooltip" data-tooltip></div>
        <div class="chart-legend" data-legend></div>
      </div>
    `;

    this.canvas = this._shadowRoot.querySelector('[data-canvas]') as HTMLCanvasElement;
    this.ctx = this.canvas?.getContext('2d');
    this.tooltipNode = this._shadowRoot.querySelector('[data-tooltip]') as HTMLElement;

    if (this.canvas) {
      this.width = this.canvas.width;
      this.height = this.canvas.height;
    }

    this.drawChart();
    this.renderLegend();
  }

  private drawChart() {
    if (!this.ctx || !this.canvas) return;

    this.ctx.clearRect(0, 0, this.width, this.height);

    switch (this.chartType) {
      case 'bar':
        this.drawBarChart();
        break;
      case 'line':
        this.drawLineChart();
        break;
      case 'pie':
        this.drawPieChart();
        break;
      case 'area':
        this.drawAreaChart();
        break;
    }
  }

  private drawBarChart() {
    if (!this.ctx || !this.canvas || this.data.datasets.length === 0) return;

    const { labels, datasets } = this.data;
    const barWidth = (this.width - this.padding * 2) / (labels.length * datasets.length + labels.length);
    const maxValue = Math.max(...datasets.flatMap((d) => d.data));
    const scale = (this.height - this.padding * 2) / maxValue;

    // Draw axes
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 1;
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding, this.padding);
    this.ctx.lineTo(this.padding, this.height - this.padding);
    this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
    this.ctx.stroke();

    // Draw bars
    let x = this.padding + barWidth / 2;
    labels.forEach((_, i) => {
      datasets.forEach((dataset, j) => {
        const value = dataset.data[i] || 0;
        const barHeight = value * scale;
        const color = dataset.color || this.getDefaultColor(j);

        this.ctx!.fillStyle = color;
        this.ctx!.fillRect(x, this.height - this.padding - barHeight, barWidth, barHeight);

        x += barWidth;
      });
      x += barWidth;
    });

    // Draw labels
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'center';
    x = this.padding + (barWidth * (datasets.length + 1)) / 2;
    labels.forEach((label) => {
      this.ctx!.fillText(label, x, this.height - this.padding + 20);
      x += barWidth * (datasets.length + 1);
    });
  }

  private drawLineChart() {
    if (!this.ctx || !this.canvas || this.data.datasets.length === 0) return;

    const { labels, datasets } = this.data;
    const maxValue = Math.max(...datasets.flatMap((d) => d.data));
    const scale = (this.height - this.padding * 2) / maxValue;
    const pointSpacing = (this.width - this.padding * 2) / (labels.length - 1 || 1);

    // Draw grid
    this.ctx.strokeStyle = '#eee';
    this.ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
      const y = this.padding + ((this.height - this.padding * 2) / 5) * i;
      this.ctx.beginPath();
      this.ctx.moveTo(this.padding, y);
      this.ctx.lineTo(this.width - this.padding, y);
      this.ctx.stroke();
    }

    // Draw axes
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding, this.padding);
    this.ctx.lineTo(this.padding, this.height - this.padding);
    this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
    this.ctx.stroke();

    // Draw lines
    datasets.forEach((dataset, datasetIndex) => {
      this.ctx!.strokeStyle = dataset.color || this.getDefaultColor(datasetIndex);
      this.ctx!.lineWidth = 2;
      this.ctx!.beginPath();

      dataset.data.forEach((value, i) => {
        const x = this.padding + pointSpacing * i;
        const y = this.height - this.padding - value * scale;

        if (i === 0) {
          this.ctx!.moveTo(x, y);
        } else {
          this.ctx!.lineTo(x, y);
        }
      });

      this.ctx!.stroke();

      // Draw points
      this.ctx!.fillStyle = dataset.color || this.getDefaultColor(datasetIndex);
      dataset.data.forEach((value, i) => {
        const x = this.padding + pointSpacing * i;
        const y = this.height - this.padding - value * scale;

        this.ctx!.beginPath();
        this.ctx!.arc(x, y, 4, 0, Math.PI * 2);
        this.ctx!.fill();
      });
    });

    // Draw labels
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = this.padding + pointSpacing * i;
      this.ctx!.fillText(label, x, this.height - this.padding + 20);
    });
  }

  private drawPieChart() {
    if (!this.ctx || !this.canvas || this.data.datasets.length === 0 || this.data.datasets[0].data.length === 0) return;

    const data = this.data.datasets[0].data;
    const total = data.reduce((sum, val) => sum + val, 0);

    const centerX = this.width / 2;
    const centerY = (this.height - 60) / 2 + 30;
    const radius = Math.min(this.width, this.height) / 3;

    let currentAngle = -Math.PI / 2;

    data.forEach((value, i) => {
      const sliceAngle = (value / total) * Math.PI * 2;

      this.ctx!.fillStyle = this.getDefaultColor(i);
      this.ctx!.beginPath();
      this.ctx!.moveTo(centerX, centerY);
      this.ctx!.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx!.closePath();
      this.ctx!.fill();

      // Draw label
      const labelAngle = currentAngle + sliceAngle / 2;
      const labelRadius = radius * 0.7;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;

      this.ctx!.fillStyle = 'white';
      this.ctx!.font = 'bold 12px sans-serif';
      this.ctx!.textAlign = 'center';
      this.ctx!.textBaseline = 'middle';

      const percentage = Math.round((value / total) * 100);
      this.ctx!.fillText(`${percentage}%`, labelX, centerY + Math.sin(labelAngle) * labelRadius);

      currentAngle += sliceAngle;
    });
  }

  private drawAreaChart() {
    if (!this.ctx || !this.canvas || this.data.datasets.length === 0) return;

    const { labels, datasets } = this.data;
    const maxValue = Math.max(...datasets.flatMap((d) => d.data));
    const scale = (this.height - this.padding * 2) / maxValue;
    const pointSpacing = (this.width - this.padding * 2) / (labels.length - 1 || 1);

    // Draw axes
    this.ctx.strokeStyle = '#ddd';
    this.ctx.lineWidth = 2;
    this.ctx.beginPath();
    this.ctx.moveTo(this.padding, this.padding);
    this.ctx.lineTo(this.padding, this.height - this.padding);
    this.ctx.lineTo(this.width - this.padding, this.height - this.padding);
    this.ctx.stroke();

    // Draw areas
    datasets.forEach((dataset, datasetIndex) => {
      this.ctx!.fillStyle = this.getDefaultColor(datasetIndex);
      this.ctx!.globalAlpha = 0.6;
      this.ctx!.beginPath();

      dataset.data.forEach((value, i) => {
        const x = this.padding + pointSpacing * i;
        const y = this.height - this.padding - value * scale;

        if (i === 0) {
          this.ctx!.moveTo(x, y);
        } else {
          this.ctx!.lineTo(x, y);
        }
      });

      this.ctx!.lineTo(this.width - this.padding, this.height - this.padding);
      this.ctx!.lineTo(this.padding, this.height - this.padding);
      this.ctx!.closePath();
      this.ctx!.fill();

      this.ctx!.globalAlpha = 1;
    });

    // Draw labels
    this.ctx.fillStyle = '#666';
    this.ctx.font = '12px sans-serif';
    this.ctx.textAlign = 'center';
    labels.forEach((label, i) => {
      const x = this.padding + pointSpacing * i;
      this.ctx!.fillText(label, x, this.height - this.padding + 20);
    });
  }

  private renderLegend() {
    const legendElement = this._shadowRoot.querySelector('[data-legend]') as HTMLElement;
    if (!legendElement || this.data.datasets.length === 0) return;

    legendElement.innerHTML = this.data.datasets
      .map((dataset, i) => {
        const color = dataset.color || this.getDefaultColor(i);
        return `
          <div class="legend-item">
            <div class="legend-color" style="background: ${color};"></div>
            <span>${dataset.label}</span>
          </div>
        `;
      })
      .join('');
  }

  private getDefaultColor(index: number): string {
    const colors = ['#667eea', '#764ba2', '#f093fb', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
    return colors[index % colors.length];
  }

  private setupEventListeners() {
    if (!this.canvas) return;

    this.canvas.addEventListener('mousemove', (e) => {
      const rect = this.canvas!.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      this.showTooltip(x, y, e);
    });

    this.canvas.addEventListener('mouseleave', () => {
      if (this.tooltipNode) {
        this.tooltipNode.classList.remove('visible');
      }
    });
  }

  private showTooltip(x: number, _y: number, event: MouseEvent) {
    if (!this.tooltipNode || this.data.datasets.length === 0) return;

    const pointSpacing = (this.width - this.padding * 2) / (this.data.labels.length - 1 || 1);
    const relativeX = x - this.padding;
    const index = Math.round(relativeX / pointSpacing);

    if (index >= 0 && index < this.data.labels.length) {
      const values = this.data.datasets.map((d) => d.data[index] || 0);
      const label = this.data.labels[index];

      let tooltipText = label;
      if (values.length === 1) {
        tooltipText += `: ${values[0]}`;
      }

      this.tooltipNode.textContent = tooltipText;
      this.tooltipNode.classList.add('visible');
      this.tooltipNode.style.left = `${event.clientX}px`;
      this.tooltipNode.style.top = `${event.clientY - 30}px`;
    }
  }

  // Public API
  setData(data: ChartData) {
    this.data = data;
    this.drawChart();
    this.renderLegend();
    this.emitDataChangeEvent();
  }

  getData(): ChartData {
    return this.data;
  }

  setChartType(type: ChartType) {
    this.chartType = type;
    this.drawChart();
  }

  getChartType(): ChartType {
    return this.chartType;
  }

  setTitle(title: string) {
    const titleElement = this._shadowRoot.querySelector('[data-title]');
    if (titleElement) {
      titleElement.textContent = title;
    }
  }

  getTitle(): string {
    const titleElement = this._shadowRoot.querySelector('[data-title]');
    return titleElement?.textContent || '';
  }

  private emitDataChangeEvent() {
    this.dispatchEvent(
      new CustomEvent('data-change', {
        detail: { data: this.data, chartType: this.chartType },
        bubbles: true,
        composed: true,
      })
    );
  }
}

// Register the custom element
if (!customElements.get('ui-chart')) {
  customElements.define('ui-chart', ChartComponent);
}
