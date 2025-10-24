/**
 * ui-date-picker: A calendar-based date selection component.
 */

import { DatePickerState, IDatePickerElement, DateRange } from './ui-date-picker.types.js';
import { themeManager } from '../../theme/theme-manager.js';

class UiDatePicker extends HTMLElement implements IDatePickerElement {
  private shadowRootInternal: ShadowRoot;
  private inputElement: HTMLInputElement | null = null;

  private state: DatePickerState = {
    value: null,
    min: null,
    max: null,
    disabledDates: [],
    name: '',
    required: false,
    disabled: false,
    range: false,
    isOpen: false,
    currentMonth: new Date(),
    isValid: true,
  };

  static get observedAttributes(): string[] {
    return ['value', 'min', 'max', 'label', 'name', 'required', 'disabled', 'range'];
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
      case 'value':
        if (newValue) {
          this.state.value = new Date(newValue);
        }
        break;
      case 'min':
        this.state.min = newValue ? new Date(newValue) : null;
        break;
      case 'max':
        this.state.max = newValue ? new Date(newValue) : null;
        break;
      case 'label':
        this.state.label = newValue ?? undefined;
        break;
      case 'name':
        this.state.name = newValue ?? '';
        break;
      case 'required':
        this.state.required = newValue !== null;
        break;
      case 'disabled':
        this.state.disabled = newValue !== null;
        break;
      case 'range':
        this.state.range = newValue !== null;
        break;
    }

    this.render();
  }

  get value(): Date | DateRange | null {
    return this.state.value;
  }

  set value(val: Date | DateRange | null) {
    this.state.value = val;
    if (val instanceof Date) {
      this.state.currentMonth = new Date(val.getFullYear(), val.getMonth(), 1);
      this.setAttribute('value', val.toISOString().split('T')[0]);
    } else if (val && typeof val === 'object' && 'start' in val) {
      this.state.currentMonth = new Date(val.start.getFullYear(), val.start.getMonth(), 1);
    } else {
      this.removeAttribute('value');
    }
    this.render();

    this.dispatchEvent(
      new CustomEvent('change', {
        detail: { value: val },
        bubbles: true,
        composed: true,
      })
    );
  }

  get min(): Date | null {
    return this.state.min;
  }

  set min(val: Date | null) {
    this.state.min = val;
    if (val) {
      this.setAttribute('min', val.toISOString().split('T')[0]);
    } else {
      this.removeAttribute('min');
    }
    this.render();
  }

  get max(): Date | null {
    return this.state.max;
  }

  set max(val: Date | null) {
    this.state.max = val;
    if (val) {
      this.setAttribute('max', val.toISOString().split('T')[0]);
    } else {
      this.removeAttribute('max');
    }
    this.render();
  }

  get disabledDates(): Date[] {
    return this.state.disabledDates;
  }

  set disabledDates(val: Date[]) {
    this.state.disabledDates = val;
    this.render();
  }

  get label(): string | undefined {
    return this.state.label;
  }

  set label(val: string | undefined) {
    this.state.label = val;
    if (val) {
      this.setAttribute('label', val);
    } else {
      this.removeAttribute('label');
    }
    this.render();
  }

  get name(): string {
    return this.state.name;
  }

  set name(val: string) {
    this.state.name = val;
    this.setAttribute('name', val);
  }

  get required(): boolean {
    return this.state.required;
  }

  set required(val: boolean) {
    this.state.required = val;
    if (val) {
      this.setAttribute('required', '');
    } else {
      this.removeAttribute('required');
    }
    this.render();
  }

  get disabled(): boolean {
    return this.state.disabled;
  }

  set disabled(val: boolean) {
    this.state.disabled = val;
    if (val) {
      this.setAttribute('disabled', '');
    } else {
      this.removeAttribute('disabled');
    }
    this.render();
  }

  get range(): boolean {
    return this.state.range;
  }

  set range(val: boolean) {
    this.state.range = val;
    if (val) {
      this.setAttribute('range', '');
    } else {
      this.removeAttribute('range');
    }
    this.render();
  }

  get isOpen(): boolean {
    return this.state.isOpen;
  }

  get validationMessage(): string {
    if (this.state.isValid) return '';
    if (this.state.required && !this.state.value) {
      return 'Please select a date.';
    }
    return 'Invalid date selection.';
  }

  open(): void {
    this.state.isOpen = true;
    this.render();
    this.dispatchEvent(
      new CustomEvent('open', {
        bubbles: true,
        composed: true,
      })
    );
  }

  close(): void {
    this.state.isOpen = false;
    this.render();
    this.dispatchEvent(
      new CustomEvent('close', {
        bubbles: true,
        composed: true,
      })
    );
  }

  toggle(): void {
    if (this.state.isOpen) {
      this.close();
    } else {
      this.open();
    }
  }

  focus(): void {
    this.inputElement?.focus();
  }

  blur(): void {
    this.inputElement?.blur();
  }

  checkValidity(): boolean {
    this.validate();
    return this.state.isValid;
  }

  reset(): void {
    this.value = null;
  }

  private validate(): void {
    if (this.state.required && !this.state.value) {
      this.state.isValid = false;
      return;
    }

    if (this.state.value instanceof Date) {
      if (this.state.min && this.state.value < this.state.min) {
        this.state.isValid = false;
        return;
      }
      if (this.state.max && this.state.value > this.state.max) {
        this.state.isValid = false;
        return;
      }
    }

    this.state.isValid = true;
  }

  private isDateDisabled(date: Date): boolean {
    return this.state.disabledDates.some(
      (d) =>
        d.getFullYear() === date.getFullYear() &&
        d.getMonth() === date.getMonth() &&
        d.getDate() === date.getDate()
    );
  }

  private isDateInRange(date: Date, min: Date | null, max: Date | null): boolean {
    if (min && date < min) return false;
    if (max && date > max) return false;
    return true;
  }

  private getDaysInMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  }

  private getFirstDayOfMonth(date: Date): number {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  }

  private generateCalendarDays(): (number | null)[] {
    const firstDay = this.getFirstDayOfMonth(this.state.currentMonth);
    const daysInMonth = this.getDaysInMonth(this.state.currentMonth);
    const days: (number | null)[] = Array(firstDay).fill(null);

    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i);
    }

    return days;
  }

  private formatDate(date: Date): string {
    const months = [
      'January',
      'February',
      'March',
      'April',
      'May',
      'June',
      'July',
      'August',
      'September',
      'October',
      'November',
      'December',
    ];
    return `${months[date.getMonth()]} ${date.getFullYear()}`;
  }

  private getStyles(): string {
    return `
      :host {
        display: block;
      }

      .picker-wrapper {
        display: flex;
        flex-direction: column;
        gap: ${themeManager.getSpacing('SM')};
      }

      label {
        font-weight: 600;
        font-size: ${themeManager.getFontSize('SM')};
        color: ${themeManager.getColor('TEXT') || '#333'};
      }

      .input-group {
        position: relative;
      }

      input {
        width: 100%;
        padding: ${themeManager.getSpacing('MD')} ${themeManager.getSpacing('LG')};
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        font-size: ${themeManager.getFontSize('MD')};
        cursor: pointer;
      }

      input:focus {
        outline: none;
        border-color: ${themeManager.getColor('PRIMARY') || '#007bff'};
        box-shadow: 0 0 0 3px rgba(0, 123, 255, 0.25);
      }

      .calendar-popup {
        display: ${this.state.isOpen ? 'block' : 'none'};
        position: absolute;
        top: 100%;
        left: 0;
        background: white;
        border: 1px solid ${themeManager.getColor('BORDER') || '#ddd'};
        border-radius: ${themeManager.getBorderRadius('MD') || '4px'};
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 1000;
        padding: ${themeManager.getSpacing('MD')};
        min-width: 300px;
      }

      .calendar-header {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: ${themeManager.getSpacing('MD')};
        font-weight: 600;
      }

      .calendar-header button {
        background: none;
        border: none;
        padding: ${themeManager.getSpacing('SM')};
        cursor: pointer;
        font-size: 18px;
      }

      .calendar-header button:hover {
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
        border-radius: 4px;
      }

      [role="grid"] {
        display: grid;
        grid-template-columns: repeat(7, 1fr);
        gap: 4px;
        margin-bottom: ${themeManager.getSpacing('MD')};
      }

      .day-name {
        text-align: center;
        font-weight: 600;
        font-size: ${themeManager.getFontSize('XS')};
        color: ${themeManager.getColor('TEXT_LIGHT') || '#666'};
        padding: 4px;
      }

      [role="gridcell"] {
        aspect-ratio: 1;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 4px;
        cursor: pointer;
        border-radius: 4px;
        border: 1px solid transparent;
        transition: all 0.2s;
      }

      [role="gridcell"]:hover:not([aria-disabled="true"]) {
        background: ${themeManager.getColor('BACKGROUND_LIGHT') || '#f5f5f5'};
      }

      [role="gridcell"][aria-selected="true"] {
        background: ${themeManager.getColor('PRIMARY') || '#007bff'};
        color: white;
        font-weight: 600;
      }

      [role="gridcell"][aria-disabled="true"] {
        color: ${themeManager.getColor('TEXT_LIGHT') || '#ccc'};
        cursor: not-allowed;
        opacity: 0.5;
      }
    `;
  }

  private render(): void {
    if (!this.shadowRootInternal) return;

    const labelId = `label-${Math.random().toString(36).substr(2, 9)}`;
    const days = this.generateCalendarDays();
    const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

    const dayGrid = days
      .map((day) => {
        if (day === null) {
          return `<div class="day-name"></div>`;
        }

        const cellDate = new Date(
          this.state.currentMonth.getFullYear(),
          this.state.currentMonth.getMonth(),
          day
        );

        const isSelected =
          this.state.value instanceof Date &&
          this.state.value.toDateString() === cellDate.toDateString();

        const isDisabled =
          this.isDateDisabled(cellDate) ||
          !this.isDateInRange(cellDate, this.state.min, this.state.max) ||
          this.state.disabled;

        return `
          <button
            role="gridcell"
            aria-selected="${isSelected}"
            aria-disabled="${isDisabled}"
            data-date="${cellDate.toISOString()}"
            ${isDisabled ? 'disabled' : ''}
          >
            ${day}
          </button>
        `;
      })
      .join('');

    const dateDisplay =
      this.state.value instanceof Date
        ? this.state.value.toISOString().split('T')[0]
        : '';

    this.shadowRootInternal.innerHTML = `
      <style>${this.getStyles()}</style>
      <div class="picker-wrapper">
        ${this.state.label ? `<label id="${labelId}">${this.state.label}${this.state.required ? '<span style="color: red;">*</span>' : ''}</label>` : ''}
        <div class="input-group">
          <input
            type="text"
            value="${dateDisplay}"
            placeholder="Select a date..."
            ${this.state.disabled ? 'disabled' : ''}
            aria-labelledby="${this.state.label ? labelId : ''}"
            readonly
          >
          <div class="calendar-popup">
            <div class="calendar-header">
              <button aria-label="Previous month">‹</button>
              <div>${this.formatDate(this.state.currentMonth)}</div>
              <button aria-label="Next month">›</button>
            </div>
            <div role="grid">
              ${dayNames.map((name) => `<div class="day-name">${name}</div>`).join('')}
              ${dayGrid}
            </div>
          </div>
        </div>
      </div>
    `;

    this.inputElement = this.shadowRootInternal.querySelector('input');

    // Setup event listeners
    this.inputElement?.addEventListener('click', () => {
      if (!this.state.disabled) {
        this.toggle();
      }
    });

    const buttons = this.shadowRootInternal.querySelectorAll(
      '.calendar-header button'
    );
    buttons?.[0]?.addEventListener('click', () => {
      this.state.currentMonth = new Date(
        this.state.currentMonth.getFullYear(),
        this.state.currentMonth.getMonth() - 1,
        1
      );
      this.render();
    });

    buttons?.[1]?.addEventListener('click', () => {
      this.state.currentMonth = new Date(
        this.state.currentMonth.getFullYear(),
        this.state.currentMonth.getMonth() + 1,
        1
      );
      this.render();
    });

    const cells = this.shadowRootInternal.querySelectorAll('[role="gridcell"]');
    cells.forEach((cell) => {
      if ((cell as HTMLElement).getAttribute('aria-disabled') !== 'true') {
        cell.addEventListener('click', () => {
          const dateStr = (cell as HTMLElement).getAttribute('data-date');
          if (dateStr) {
            this.value = new Date(dateStr);
            this.close();
          }
        });
      }
    });

    document.addEventListener('click', (e) => {
      if (this.state.isOpen && !this.contains(e.target as Node)) {
        this.close();
      }
    });
  }
}

customElements.define('ui-date-picker', UiDatePicker);

declare global {
  interface HTMLElementTagNameMap {
    'ui-date-picker': UiDatePicker;
  }
}

export { UiDatePicker };
