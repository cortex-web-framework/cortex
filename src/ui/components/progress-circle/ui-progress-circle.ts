/**
 * ui-progress-circle: A circular progress indicator.
 */

import { IProgressCircleElement, ProgressCircleState } from './ui-progress-circle.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiProgressCircle extends HTMLElement implements IProgressCircleElement {
  private shadowRootInternal: ShadowRoot;

  private state: ProgressCircleState = {
    value: 0,
    maxValue: 100,
    size: 100,
    strokeWidth: 4,
    color: undefined,
    showLabel: true,
  };

  static get observedAttributes(): string[] {
    return ['value', 'maxValue', 'size', 'strokeWidth', 'color', 'showLabel'];
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
      case 'value':
        this.state.value = parseInt(newValue || '0', 10);
        break;
      case 'maxValue':
        this.state.maxValue = parseInt(newValue || '100', 10);
        break;
      case 'size':
        this.state.size = parseInt(newValue || '100', 10);
        break;
      case 'strokeWidth':
        this.state.strokeWidth = parseInt(newValue || '4', 10);
        break;
      case 'color':
        this.state.color = newValue ?? undefined;
        break;
      case 'showLabel':
        this.state.showLabel = newValue !== 'false';
        break;
    }

    this.render();
  }

  get value(): number {
    return this.state.value;
  }

  set value(val: number) {
    this.state.value = val;
    this.setAttribute('value', val.toString());
    this.render();
  }

  get maxValue(): number {
    return this.state.maxValue;
  }

  set maxValue(val: number) {
    this.state.maxValue = val;
    this.setAttribute('maxValue', val.toString());
    this.render();
  }

  get size(): number {
    return this.state.size;
  }

  set size(val: number) {
    this.state.size = val;
    this.setAttribute('size', val.toString());
    this.render();
  }

  get strokeWidth(): number {
    return this.state.strokeWidth;
  }

  set strokeWidth(val: number) {
    this.state.strokeWidth = val;
    this.setAttribute('strokeWidth', val.toString());
    this.render();
  }

  get color(): string | undefined {
    return this.state.color;
  }

  set color(val: string | undefined) {
    this.state.color = val;
    if (val) this.setAttribute('color', val);
    else this.removeAttribute('color');
    this.render();
  }

  get showLabel(): boolean {
    return this.state.showLabel;
  }

  set showLabel(val: boolean) {
    this.state.showLabel = val;
    if (!val) this.setAttribute('showLabel', 'false');
    else this.removeAttribute('showLabel');
    this.render();
  }

  private getColor(): string {
    if (this.state.color) return this.state.color;
    const percent = (this.state.value / this.state.maxValue) * 100;
    if (percent < 33) return themeManager.getColor('ERROR') || '#dc3545';
    if (percent < 66) return themeManager.getColor('WARNING') || '#ffc107';
    return themeManager.getColor('SUCCESS') || '#28a745';
  }

  private getCircumference(): number {
    const radius = (this.state.size - this.state.strokeWidth) / 2;
    return 2 * Math.PI * radius;
  }

  private getStrokeDashoffset(): number {
    const circumference = this.getCircumference();
    const percent = this.state.value / this.state.maxValue;
    return circumference * (1 - percent);
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const radius = (this.state.size - this.state.strokeWidth) / 2;
    const cx = this.state.size / 2;
    const cy = this.state.size / 2;
    const percent = Math.round((this.state.value / this.state.maxValue) * 100);
    const color = this.getColor();
    const circumference = this.getCircumference();
    const strokeDashoffset = this.getStrokeDashoffset();

    const labelHtml = this.state.showLabel
      ? `<text x="${cx}" y="${cy}" text-anchor="middle" dy="0.3em" font-size="20" font-weight="bold" fill="${color}">${percent}%</text>`
      : '';

    this.shadowRootInternal.innerHTML = `
      <svg width="${this.state.size}" height="${this.state.size}" style="transform: rotate(-90deg)">
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="#eee" stroke-width="${this.state.strokeWidth}"/>
        <circle cx="${cx}" cy="${cy}" r="${radius}" fill="none" stroke="${color}" stroke-width="${this.state.strokeWidth}"
                stroke-dasharray="${circumference}" stroke-dashoffset="${strokeDashoffset}" stroke-linecap="round"
                style="transition: stroke-dashoffset 0.3s ease;"/>
        ${labelHtml}
      </svg>
    `;
  }
}

customElements.define('ui-progress-circle', UiProgressCircle);

declare global {
  interface HTMLElementTagNameMap {
    'ui-progress-circle': UiProgressCircle;
  }
}

export { UiProgressCircle };
