import { IMenuElement, MenuItem, MenuState } from './ui-menu.types.js';

class UiMenu extends HTMLElement implements IMenuElement {
  private state: MenuState = { open: false, items: [] };
  private sr: ShadowRoot;

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  get open() {
    return this.state.open;
  }

  set open(val: boolean) {
    this.state.open = val;
    this.render();
  }

  get items() {
    return this.state.items;
  }

  set items(val: MenuItem[]) {
    this.state.items = val;
    this.render();
  }

  get selectedValue() {
    return this.state.selectedValue;
  }

  set selectedValue(val: string | undefined) {
    this.state.selectedValue = val;
    this.render();
  }

  private render() {
    const menuClass = this.state.open ? 'menu open' : 'menu';
    const itemsHtml = this.state.items.map((item) => `<div class="item ${item.disabled ? 'disabled' : ''} ${item.value === this.state.selectedValue ? 'selected' : ''}" data-value="${item.value}">${item.icon ? `<span class="icon">${item.icon}</span>` : ''}<span>${item.label}</span></div>`).join('');
    this.sr.innerHTML = `<style>:host{display:inline-block;position:relative}.trigger{padding:8px 12px;background:#f0f0f0;border:1px solid #ccc;border-radius:4px;cursor:pointer;user-select:none}.trigger:hover{background:#e8e8e8}.menu{position:absolute;top:100%;left:0;background:white;border:1px solid #ccc;border-radius:4px;box-shadow:0 2px 8px rgba(0,0,0,0.1);min-width:150px;max-height:0;overflow:hidden;transition:max-height 0.3s}.menu.open{max-height:500px}.item{padding:8px 12px;cursor:pointer;user-select:none}.item:hover:not(.disabled){background:#f5f5f5}.item.disabled{color:#999;cursor:not-allowed}.item.selected{background:#e3f2fd;color:#1976d2}.icon{margin-right:8px}</style><div class="trigger">Menu</div><div class="${menuClass}">${itemsHtml}</div>`;
    this.setupListeners();
  }

  private setupListeners() {
    const trigger = this.sr.querySelector('.trigger');
    const items = this.sr.querySelectorAll('.item:not(.disabled)');
    trigger?.addEventListener('click', () => {
      this.open = !this.open;
    });
    items.forEach((item) => {
      item.addEventListener('click', () => {
        this.selectedValue = item.getAttribute('data-value') || undefined;
        this.open = false;
        this.dispatchEvent(new CustomEvent('change', { detail: { value: this.selectedValue } }));
      });
    });
  }
}

customElements.define('ui-menu', UiMenu);

declare global {
  interface HTMLElementTagNameMap {
    'ui-menu': UiMenu;
  }
}

export { UiMenu };
