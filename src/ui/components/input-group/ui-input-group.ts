import { IInputGroupElement, InputGroupState } from './ui-input-group.types.js';

class UiInputGroup extends HTMLElement implements IInputGroupElement {
  private state: InputGroupState = { disabled: false };
  private sr: ShadowRoot;

  static get observedAttributes() {
    return ['before-text', 'after-text', 'error', 'disabled'];
  }

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _: string | null, val: string | null) {
    if (name === 'before-text') this.state.beforeText = val || undefined;
    if (name === 'after-text') this.state.afterText = val || undefined;
    if (name === 'error') this.state.error = val || undefined;
    if (name === 'disabled') this.state.disabled = val !== null;
    this.render();
  }

  get beforeText() {
    return this.state.beforeText;
  }

  set beforeText(val: string | undefined) {
    this.state.beforeText = val;
    if (val) this.setAttribute('before-text', val);
    else this.removeAttribute('before-text');
    this.render();
  }

  get afterText() {
    return this.state.afterText;
  }

  set afterText(val: string | undefined) {
    this.state.afterText = val;
    if (val) this.setAttribute('after-text', val);
    else this.removeAttribute('after-text');
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
    this.sr.innerHTML = `<style>:host{display:block}.group{display:flex;margin-bottom:8px}.addon{display:flex;align-items:center;padding:8px 12px;background:#f0f0f0;border:1px solid #ccc;color:#666;font-size:14px}.addon.before{border-right:none}.addon.after{border-left:none}.input-wrapper{flex:1}::slotted(input){width:100%;padding:8px;border:1px solid #ccc;border-radius:4px}::slotted(input:disabled){background:#f9f9f9;color:#999}.error{margin-top:4px;font-size:12px;color:#dc3545}</style><div class="group">${this.state.beforeText ? `<div class="addon before">${this.state.beforeText}</div>` : ''}<div class="input-wrapper"><slot></slot></div>${this.state.afterText ? `<div class="addon after">${this.state.afterText}</div>` : ''}</div>${this.state.error ? `<div class="error">${this.state.error}</div>` : ''}`;
  }
}

customElements.define('ui-input-group', UiInputGroup);

declare global {
  interface HTMLElementTagNameMap {
    'ui-input-group': UiInputGroup;
  }
}

export { UiInputGroup };
