/**
 * ui-stat: A statistic display component.
 */

import { IStatElement, StatState } from './ui-stat.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiStat extends HTMLElement implements IStatElement {
  private shadowRootInternal: ShadowRoot;

  private state: StatState = {
    label: undefined,
    value: undefined,
    description: undefined,
    icon: undefined,
    trend: undefined,
    trendValue: undefined,
  };

  static get observedAttributes(): string[] {
    return ['label', 'value', 'description', 'icon', 'trend', 'trendValue'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;

    switch (name) {
      case 'label':
        this.state.label = newValue ?? undefined;
        break;
      case 'value':
        this.state.value = newValue ?? undefined;
        break;
      case 'description':
        this.state.description = newValue ?? undefined;
        break;
      case 'icon':
        this.state.icon = newValue ?? undefined;
        break;
      case 'trend':
        if (['up', 'down', 'neutral'].includes(newValue || '')) {
          this.state.trend = newValue as 'up' | 'down' | 'neutral';
        }
        break;
      case 'trendValue':
        this.state.trendValue = newValue ?? undefined;
        break;
    }

    this.render();
  }

  get label(): string | undefined {
    return this.state.label;
  }

  set label(val: string | undefined) {
    this.state.label = val;
    if (val) this.setAttribute('label', val);
    else this.removeAttribute('label');
    this.render();
  }

  get value(): string | undefined {
    return this.state.value;
  }

  set value(val: string | undefined) {
    this.state.value = val;
    if (val) this.setAttribute('value', val);
    else this.removeAttribute('value');
    this.render();
  }

  get description(): string | undefined {
    return this.state.description;
  }

  set description(val: string | undefined) {
    this.state.description = val;
    if (val) this.setAttribute('description', val);
    else this.removeAttribute('description');
    this.render();
  }

  get icon(): string | undefined {
    return this.state.icon;
  }

  set icon(val: string | undefined) {
    this.state.icon = val;
    if (val) this.setAttribute('icon', val);
    else this.removeAttribute('icon');
    this.render();
  }

  get trend(): 'up' | 'down' | 'neutral' | undefined {
    return this.state.trend;
  }

  set trend(val: 'up' | 'down' | 'neutral' | undefined) {
    this.state.trend = val;
    if (val) this.setAttribute('trend', val);
    else this.removeAttribute('trend');
    this.render();
  }

  get trendValue(): string | undefined {
    return this.state.trendValue;
  }

  set trendValue(val: string | undefined) {
    this.state.trendValue = val;
    if (val) this.setAttribute('trendValue', val);
    else this.removeAttribute('trendValue');
    this.render();
  }

  private getTrendColor(): string {
    const colors: Record<string, string> = {
      up: themeManager.getColor('SUCCESS') || '#28a745',
      down: themeManager.getColor('ERROR') || '#dc3545',
      neutral: themeManager.getColor('TEXT_LIGHT') || '#999',
    };
    return colors[this.state.trend || 'neutral'];
  }

  private getTrendIcon(): string {
    const icons: Record<string, string> = {
      up: '📈',
      down: '📉',
      neutral: '→',
    };
    return icons[this.state.trend || 'neutral'];
  }

  private getStyles(): string {
    const textColor = themeManager.getColor('TEXT') || '#333';
    const textLightColor = themeManager.getColor('TEXT_LIGHT') || '#999';

    return `
      :host {
        display: block;
      }

      .stat-card {
        padding: 24px;
        background: #fff;
        border-radius: 8px;
        border: 1px solid #eee;
      }

      .stat-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 12px;
      }

      .stat-icon {
        font-size: 24px;
      }

      .stat-trend {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 14px;
        font-weight: 600;
        color: ${this.getTrendColor()};
      }

      .stat-label {
        font-size: 12px;
        color: ${textLightColor};
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 4px;
      }

      .stat-value {
        font-size: 28px;
        font-weight: 700;
        color: ${textColor};
        margin-bottom: 8px;
      }

      .stat-description {
        font-size: 13px;
        color: ${textLightColor};
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const iconHtml = this.state.icon ? `<div class="stat-icon">${this.state.icon}</div>` : '';
    const trendHtml = this.state.trend
      ? `<div class="stat-trend">${this.getTrendIcon()} ${this.state.trendValue || ''}</div>`
      : '';
    const labelHtml = this.state.label ? `<div class="stat-label">${this.state.label}</div>` : '';
    const valueHtml = this.state.value ? `<div class="stat-value">${this.state.value}</div>` : '';
    const descriptionHtml = this.state.description
      ? `<div class="stat-description">${this.state.description}</div>`
      : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="stat-card">
        <div class="stat-header">
          ${iconHtml}
          ${trendHtml}
        </div>
        ${labelHtml}
        ${valueHtml}
        ${descriptionHtml}
      </div>
    `;
  }
}

customElements.define('ui-stat', UiStat);

declare global {
  interface HTMLElementTagNameMap {
    'ui-stat': UiStat;
  }
}

export { UiStat };
