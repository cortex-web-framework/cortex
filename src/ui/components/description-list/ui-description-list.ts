import { IDescriptionListElement, DescriptionItem, DescriptionListState } from './ui-description-list.types.js';

class UiDescriptionList extends HTMLElement implements IDescriptionListElement {
  private state: DescriptionListState = { items: [], bordered: false };
  private sr: ShadowRoot;

  static get observedAttributes() {
    return ['bordered'];
  }

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _: string | null, val: string | null) {
    if (name === 'bordered') this.state.bordered = val !== null;
    this.render();
  }

  get items() {
    return this.state.items;
  }

  set items(val: DescriptionItem[]) {
    this.state.items = val;
    this.render();
  }

  get bordered() {
    return this.state.bordered;
  }

  set bordered(val: boolean) {
    this.state.bordered = val;
    if (val) this.setAttribute('bordered', '');
    else this.removeAttribute('bordered');
    this.render();
  }

  private render() {
    const itemsHtml = this.state.items
      .map(
        (item) => `<div class="item ${this.state.bordered ? 'bordered' : ''}"><dt>${item.term}</dt><dd>${item.description}</dd></div>`
      )
      .join('');
    this.sr.innerHTML = `<style>:host{display:block}dl{margin:0;padding:0}.item{padding:12px 0}.item.bordered{padding:12px;border-bottom:1px solid #ddd}.item:last-child.bordered{border-bottom:none}dt{font-weight:bold;color:#333}dd{margin:4px 0 0 0;color:#666}</style><dl>${itemsHtml}</dl>`;
  }
}

customElements.define('ui-description-list', UiDescriptionList);

declare global {
  interface HTMLElementTagNameMap {
    'ui-description-list': UiDescriptionList;
  }
}

export { UiDescriptionList };
