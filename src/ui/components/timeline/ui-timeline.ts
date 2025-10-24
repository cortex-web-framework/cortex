/**
 * ui-timeline: A timeline/process flow component.
 */

import { ITimelineElement, TimelineState, TimelineItem } from './ui-timeline.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiTimeline extends HTMLElement implements ITimelineElement {
  private shadowRootInternal: ShadowRoot;

  private state: TimelineState = {
    items: [],
    orientation: 'vertical',
  };

  static get observedAttributes(): string[] {
    return ['orientation'];
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
      case 'orientation':
        if (['vertical', 'horizontal'].includes(newValue || '')) {
          this.state.orientation = newValue as 'vertical' | 'horizontal';
        }
        break;
    }

    this.render();
  }

  get items(): TimelineItem[] {
    return this.state.items;
  }

  set items(val: TimelineItem[]) {
    this.state.items = val;
    this.render();
  }

  get orientation(): 'vertical' | 'horizontal' {
    return this.state.orientation;
  }

  set orientation(val: 'vertical' | 'horizontal') {
    this.state.orientation = val;
    this.setAttribute('orientation', val);
    this.render();
  }

  addItem(item: TimelineItem): void {
    this.state.items.push(item);
    this.render();
  }

  removeItem(id: string): void {
    this.state.items = this.state.items.filter((item) => item.id !== id);
    this.render();
  }

  private getStyles(): string {
    const flexDir = this.state.orientation === 'vertical' ? 'column' : 'row';
    const textColor = themeManager.getColor('TEXT') || '#333';

    return `
      :host {
        display: block;
      }

      .timeline {
        display: flex;
        flex-direction: ${flexDir};
        gap: 20px;
      }

      .timeline-item {
        display: flex;
        align-items: flex-start;
        gap: 16px;
      }

      .timeline-dot {
        width: 20px;
        height: 20px;
        border-radius: 50%;
        background: #ddd;
        flex-shrink: 0;
        border: 3px solid white;
        box-shadow: 0 0 0 2px #999;
      }

      .timeline-dot.completed {
        background: #28a745;
        box-shadow: 0 0 0 2px #28a745;
      }

      .timeline-dot.error {
        background: #dc3545;
        box-shadow: 0 0 0 2px #dc3545;
      }

      .timeline-content {
        flex: 1;
      }

      .timeline-title {
        font-weight: 600;
        color: ${textColor};
        margin-bottom: 4px;
      }

      .timeline-description {
        font-size: 13px;
        color: #999;
      }

      .timeline-timestamp {
        font-size: 12px;
        color: #999;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const itemsHtml = this.state.items
      .map(
        (item) => `
      <div class="timeline-item">
        <div class="timeline-dot ${item.status || 'pending'}"></div>
        <div class="timeline-content">
          ${item.title ? `<div class="timeline-title">${item.title}</div>` : ''}
          ${item.description ? `<div class="timeline-description">${item.description}</div>` : ''}
          ${item.timestamp ? `<div class="timeline-timestamp">${item.timestamp}</div>` : ''}
        </div>
      </div>
    `
      )
      .join('');

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="timeline">
        ${itemsHtml}
      </div>
    `;
  }
}

customElements.define('ui-timeline', UiTimeline);

declare global {
  interface HTMLElementTagNameMap {
    'ui-timeline': UiTimeline;
  }
}

export { UiTimeline };
