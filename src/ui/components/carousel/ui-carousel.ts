/**
 * ui-carousel: An image carousel component.
 */

import { ICarouselElement, CarouselState, CarouselItem } from './ui-carousel.types.js';

class UiCarousel extends HTMLElement implements ICarouselElement {
  private shadowRootInternal: ShadowRoot;
  private autoPlayTimer: ReturnType<typeof setInterval> | null = null;

  private state: CarouselState = {
    items: [],
    currentIndex: 0,
    autoPlay: false,
    interval: 5000,
    showControls: true,
  };

  static get observedAttributes(): string[] {
    return ['currentIndex', 'autoPlay', 'interval', 'showControls'];
  }

  constructor() {
    super();
    this.shadowRootInternal = this.attachShadow({ mode: 'open' });
  }

  connectedCallback(): void {
    this.render();
    if (this.state.autoPlay) this.startAutoPlay();
  }

  disconnectCallback(): void {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
  }

  attributeChangedCallback(name: string, oldValue: string | null, newValue: string | null): void {
    if (oldValue === newValue) return;
    switch (name) {
      case 'currentIndex':
        this.state.currentIndex = parseInt(newValue || '0', 10);
        break;
      case 'autoPlay':
        this.state.autoPlay = newValue === 'true';
        break;
      case 'interval':
        this.state.interval = parseInt(newValue || '5000', 10);
        break;
      case 'showControls':
        this.state.showControls = newValue !== 'false';
        break;
    }
    this.render();
  }

  get items(): CarouselItem[] {
    return this.state.items;
  }

  set items(val: CarouselItem[]) {
    this.state.items = val;
    this.render();
  }

  get currentIndex(): number {
    return this.state.currentIndex;
  }

  set currentIndex(val: number) {
    this.state.currentIndex = val;
    this.setAttribute('currentIndex', val.toString());
    this.render();
  }

  get autoPlay(): boolean {
    return this.state.autoPlay;
  }

  set autoPlay(val: boolean) {
    this.state.autoPlay = val;
    if (val) this.startAutoPlay();
    else this.stopAutoPlay();
  }

  get interval(): number {
    return this.state.interval;
  }

  set interval(val: number) {
    this.state.interval = val;
  }

  get showControls(): boolean {
    return this.state.showControls;
  }

  set showControls(val: boolean) {
    this.state.showControls = val;
    this.render();
  }

  next(): void {
    this.state.currentIndex = (this.state.currentIndex + 1) % this.state.items.length;
    this.render();
  }

  prev(): void {
    this.state.currentIndex =
      (this.state.currentIndex - 1 + this.state.items.length) % this.state.items.length;
    this.render();
  }

  goTo(index: number): void {
    this.state.currentIndex = Math.max(0, Math.min(index, this.state.items.length - 1));
    this.render();
  }

  private startAutoPlay(): void {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
    this.autoPlayTimer = setInterval(() => this.next(), this.state.interval);
  }

  private stopAutoPlay(): void {
    if (this.autoPlayTimer) clearInterval(this.autoPlayTimer);
  }

  private getStyles(): string {
    return `
      :host { display: block; }
      .carousel { position: relative; background: #000; color: #fff; }
      .carousel-item { display: none; text-align: center; }
      .carousel-item.active { display: block; }
      .carousel-item img { width: 100%; height: 300px; object-fit: cover; }
      .carousel-controls { position: absolute; bottom: 20px; left: 50%; transform: translateX(-50%); display: flex; gap: 10px; }
      .carousel-btn { background: rgba(255,255,255,0.5); border: none; padding: 10px 15px; cursor: pointer; border-radius: 4px; }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const itemsHtml = this.state.items
      .map(
        (item, i) =>
          `<div class="carousel-item ${i === this.state.currentIndex ? 'active' : ''}">
            ${item.src ? `<img src="${item.src}" alt="${item.altText || ''}">` : ''}
          </div>`
      )
      .join('');

    const controlsHtml = this.state.showControls
      ? `<div class="carousel-controls">
          <button class="carousel-btn">←</button>
          <button class="carousel-btn">→</button>
        </div>`
      : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="carousel">
        ${itemsHtml}
        ${controlsHtml}
      </div>
    `;

    const btns = this.shadowRoot?.querySelectorAll('.carousel-btn');
    if (btns) {
      btns[0].addEventListener('click', () => this.prev());
      btns[1].addEventListener('click', () => this.next());
    }
  }
}

customElements.define('ui-carousel', UiCarousel);

declare global {
  interface HTMLElementTagNameMap {
    'ui-carousel': UiCarousel;
  }
}

export { UiCarousel };
