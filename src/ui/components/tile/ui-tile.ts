import { ITileElement, TileState } from './ui-tile.types.js';

class UiTile extends HTMLElement implements ITileElement {
  private state: TileState = { title: '' };
  private sr: ShadowRoot;

  static get observedAttributes() {
    return ['image-url', 'title', 'description', 'href'];
  }

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  attributeChangedCallback(name: string, _: string | null, val: string | null) {
    if (name === 'image-url') this.state.imageUrl = val || undefined;
    if (name === 'title') this.state.title = val || '';
    if (name === 'description') this.state.description = val || undefined;
    if (name === 'href') this.state.href = val || undefined;
    this.render();
  }

  get imageUrl() {
    return this.state.imageUrl;
  }

  set imageUrl(val: string | undefined) {
    this.state.imageUrl = val;
    if (val) this.setAttribute('image-url', val);
    else this.removeAttribute('image-url');
    this.render();
  }

  get title(): string {
    return this.state.title;
  }

  set title(val: string) {
    this.state.title = val;
    if (val) this.setAttribute('title', val);
    else this.removeAttribute('title');
    this.render();
  }

  get description() {
    return this.state.description;
  }

  set description(val: string | undefined) {
    this.state.description = val;
    if (val) this.setAttribute('description', val);
    else this.removeAttribute('description');
    this.render();
  }

  get href() {
    return this.state.href;
  }

  set href(val: string | undefined) {
    this.state.href = val;
    if (val) this.setAttribute('href', val);
    else this.removeAttribute('href');
    this.render();
  }

  private render() {
    const Wrapper = this.state.href ? 'a' : 'div';
    this.sr.innerHTML = `<style>:host{display:inline-block}${Wrapper}{display:flex;flex-direction:column;height:100%;text-decoration:none;color:inherit;border:1px solid #ddd;border-radius:8px;overflow:hidden;background:white;transition:all 0.3s}${Wrapper}:hover{box-shadow:0 4px 12px rgba(0,0,0,0.1);transform:translateY(-2px)}.image{width:100%;height:160px;object-fit:cover;background:#f0f0f0}.content{padding:16px;flex:1;display:flex;flex-direction:column}.title{font-weight:bold;margin-bottom:8px;color:#333}.description{font-size:12px;color:#666;flex:1}</style><${Wrapper} ${this.state.href ? `href="${this.state.href}"` : ''}>${this.state.imageUrl ? `<img class="image" src="${this.state.imageUrl}" alt="${this.state.title || ''}">` : ''}<div class="content">${this.state.title ? `<div class="title">${this.state.title}</div>` : ''}<div class="description">${this.state.description || ''}</div></div></${Wrapper}>`;
  }
}

customElements.define('ui-tile', UiTile);

declare global {
  interface HTMLElementTagNameMap {
    'ui-tile': UiTile;
  }
}

export { UiTile };
