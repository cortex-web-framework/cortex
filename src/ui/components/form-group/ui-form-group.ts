import { IFormGroupElement, FormGroupState } from './ui-form-group.types.js';

class UiFormGroup extends HTMLElement implements IFormGroupElement {
  private state: FormGroupState = { required: false, disabled: false };
  private sr: ShadowRoot;

  static get observedAttributes() {
    return ['label', 'required', 'disabled', 'error'];
  }

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _: string | null, val: string | null) {
    if (name === 'label') this.state.label = val || undefined;
    if (name === 'required') this.state.required = val !== null;
    if (name === 'disabled') this.state.disabled = val !== null;
    if (name === 'error') this.state.error = val || undefined;
    this.render();
  }

  get label() {
    return this.state.label;
  }

  set label(val: string | undefined) {
    this.state.label = val;
    if (val) this.setAttribute('label', val);
    else this.removeAttribute('label');
    this.render();
  }

  get required() {
    return this.state.required;
  }

  set required(val: boolean) {
    this.state.required = val;
    if (val) this.setAttribute('required', '');
    else this.removeAttribute('required');
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

  get error() {
    return this.state.error;
  }

  set error(val: string | undefined) {
    this.state.error = val;
    if (val) this.setAttribute('error', val);
    else this.removeAttribute('error');
    this.render();
  }

  private render() {
    this.sr.innerHTML = `<style>:host{display:block;margin-bottom:16px}label{display:block;margin-bottom:4px;font-weight:500;color:#333}label.required::after{content:' *';color:#dc3545}label.disabled{opacity:0.6}.control{margin-bottom:4px}::slotted(*:disabled){opacity:0.6}.error{margin-top:4px;font-size:12px;color:#dc3545}.hint{margin-top:4px;font-size:12px;color:#666}</style>${this.state.label ? `<label class="${this.state.required ? 'required' : ''} ${this.state.disabled ? 'disabled' : ''}">${this.state.label}</label>` : ''}<div class="control"><slot></slot></div>${this.state.error ? `<div class="error">${this.state.error}</div>` : ''}`;
  }
}

customElements.define('ui-form-group', UiFormGroup);

declare global {
  interface HTMLElementTagNameMap {
    'ui-form-group': UiFormGroup;
  }
}

export { UiFormGroup };
