/**
 * Accordion Showcase Generator
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

import { AccordionShowcaseConfig, ACCORDION_SHOWCASE_CONFIG } from './accordion-showcase-types';

export class AccordionShowcaseGenerator {
  private config: AccordionShowcaseConfig;

  constructor(config: AccordionShowcaseConfig = ACCORDION_SHOWCASE_CONFIG) {
    this.config = config;
  }

  generateBasicShowcase(): string {
    const basicConfig = this.config.basic;
    return this.generateShowcaseHTML(basicConfig);
  }

  generateMultipleShowcase(): string {
    const multipleConfig = this.config.multiple;
    return this.generateShowcaseHTML(multipleConfig);
  }

  generateDisabledShowcase(): string {
    const disabledConfig = this.config.disabled;
    return this.generateShowcaseHTML(disabledConfig);
  }

  generateAllShowcases(): string {
    return `
      ${this.generateBasicShowcase()}
      ${this.generateMultipleShowcase()}
      ${this.generateDisabledShowcase()}
    `;
  }

  private generateShowcaseHTML(props: typeof ACCORDION_SHOWCASE_CONFIG.basic): string {
    const itemsHTML = props.items
      .map(item => `
        <div slot="item" data-id="${this.escapeHtml(item.id)}" data-label="${this.escapeHtml(item.label)}"${item.disabled ? ' data-disabled="true"' : ''}>
          <div slot="content">${this.escapeHtml(item.content)}</div>
        </div>
      `)
      .join('');

    const allowMultipleAttr = props.allowMultiple ? ' allowMultiple' : '';
    const disabledAttr = props.disabled ? ' disabled' : '';

    return `<div class="component-card">
  <h3>${this.escapeHtml(props.title || 'Accordion')}</h3>
  <div class="example vertical">
    <ui-accordion${allowMultipleAttr}${disabledAttr}>
      ${itemsHTML}
    </ui-accordion>
  </div>
</div>`;
  }

  private escapeHtml(text: string): string {
    if (!text) return '';
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  generateDocumentationHTML(): string {
    return `
      <!-- ACCORDION COMPONENTS -->
      <div class="section-title">📋 Accordion & Collapsible</div>
      
      ${this.generateAllShowcases()}
    `;
  }
}

// Export a default instance
export const accordionShowcaseGenerator = new AccordionShowcaseGenerator();