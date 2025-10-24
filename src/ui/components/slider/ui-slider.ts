import { ISliderElement, SliderState } from './ui-slider.types.js';

class UiSlider extends HTMLElement implements ISliderElement {
  private state: SliderState = { min: 0, max: 100, step: 1, value: 50, disabled: false };
  private sr: ShadowRoot;

  static get observedAttributes() {
    return ['min', 'max', 'step', 'value', 'disabled'];
  }

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _: string | null, val: string | null) {
    if (name === 'min') this.state.min = parseInt(val || '0', 10);
    if (name === 'max') this.state.max = parseInt(val || '100', 10);
    if (name === 'step') this.state.step = parseInt(val || '1', 10);
    if (name === 'value') this.state.value = parseInt(val || '50', 10);
    if (name === 'disabled') this.state.disabled = val !== null;
    this.render();
  }

  get min() {
    return this.state.min;
  }

  set min(val: number) {
    this.state.min = val;
    this.setAttribute('min', val.toString());
    this.render();
  }

  get max() {
    return this.state.max;
  }

  set max(val: number) {
    this.state.max = val;
    this.setAttribute('max', val.toString());
    this.render();
  }

  get step() {
    return this.state.step;
  }

  set step(val: number) {
    this.state.step = val;
    this.setAttribute('step', val.toString());
    this.render();
  }

  get value() {
    return this.state.value;
  }

  set value(val: number) {
    this.state.value = val;
    this.setAttribute('value', val.toString());
    this.render();
  }

  get disabled() {
    return this.state.disabled;
  }

  set disabled(val: boolean) {
    this.state.disabled = val;
    if (val) this.setAttribute('disabled', '');
    else this.removeAttribute('disabled');
    this.render();
  }

  private render() {
    this.sr.innerHTML = `<style>:host{display:block}.container{display:flex;align-items:center;gap:12px}.slider{flex:1;height:4px;border-radius:2px;background:#ddd;outline:none;appearance:none;-webkit-appearance:none;cursor:${this.state.disabled ? 'not-allowed' : 'pointer'};opacity:${this.state.disabled ? 0.6 : 1}}.slider::-webkit-slider-thumb{appearance:none;-webkit-appearance:none;width:18px;height:18px;border-radius:50%;background:#1976d2;cursor:pointer;box-shadow:0 2px 4px rgba(0,0,0,0.2)}.slider::-moz-range-thumb{width:18px;height:18px;border-radius:50%;background:#1976d2;cursor:pointer;border:none;box-shadow:0 2px 4px rgba(0,0,0,0.2)}.value{min-width:40px;text-align:right;font-weight:bold}</style><div class="container"><input type="range" class="slider" min="${this.state.min}" max="${this.state.max}" step="${this.state.step}" value="${this.state.value}" ${this.state.disabled ? 'disabled' : ''}><div class="value">${this.state.value}</div></div>`;
    this.setupListeners();
  }

  private setupListeners() {
    const slider = this.sr.querySelector('input[type="range"]');
    if (!this.state.disabled) {
      slider?.addEventListener('input', (e) => {
        this.value = parseInt((e.target as HTMLInputElement).value, 10);
        this.dispatchEvent(new CustomEvent('change', { detail: { value: this.state.value } }));
      });
    }
  }
}

customElements.define('ui-slider', UiSlider);

declare global {
  interface HTMLElementTagNameMap {
    'ui-slider': UiSlider;
  }
}

export { UiSlider };
