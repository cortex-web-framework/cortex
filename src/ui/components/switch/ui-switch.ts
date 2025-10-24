import { ISwitchElement, SwitchState } from './ui-switch.types.js';

class UiSwitch extends HTMLElement implements ISwitchElement {
  private state: SwitchState = { checked: false, disabled: false };
  private shadowRootInternal: ShadowRoot;

  static get observedAttributes() {
    return ['checked', 'disabled'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _: string | null, val: string | null) {
    if (name === 'checked') this.state.checked = val !== null;
    if (name === 'disabled') this.state.disabled = val !== null;
    this.render();
  }

  get checked() {
    return this.state.checked;
  }

  set checked(val: boolean) {
    this.state.checked = val;
    if (val) this.setAttribute('checked', '');
    else this.removeAttribute('checked');
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
    const bg = this.state.checked ? '#4CAF50' : '#ccc';
    const left = this.state.checked ? '20px' : '0';
    this.shadowRootInternal.innerHTML = `
      <style>
        :host { display: inline-block; }
        .switch { width: 40px; height: 20px; background: ${bg}; border-radius: 10px; cursor: ${this.state.disabled ? 'not-allowed' : 'pointer'}; position: relative; }
        .toggle { width: 16px; height: 16px; background: white; border-radius: 50%; position: absolute; top: 2px; left: ${left}; transition: 0.3s; }
      </style>
      <div class="switch"><div class="toggle"></div></div>
    `;
    if (!this.state.disabled) {
      this.shadowRootInternal.querySelector('.switch')?.addEventListener('click', () => {
        this.checked = !this.checked;
      });
    }
  }
}

customElements.define('ui-switch', UiSwitch);

declare global {
  interface HTMLElementTagNameMap {
    'ui-switch': UiSwitch;
  }
}

export { UiSwitch };
