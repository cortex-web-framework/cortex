import { ITableElement, TableColumn, TableRow, TableState } from './ui-table.types.js';

class UiTable extends HTMLElement implements ITableElement {
  private state: TableState = { columns: [], rows: [] };
  private sr: ShadowRoot;

  constructor() {
    super();
    this.sr = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
  }

  get columns() {
    return this.state.columns;
  }

  set columns(val: TableColumn[]) {
    this.state.columns = val;
    this.render();
  }

  get rows() {
    return this.state.rows;
  }

  set rows(val: TableRow[]) {
    this.state.rows = val;
    this.render();
  }

  get sortKey() {
    return this.state.sortKey;
  }

  set sortKey(val: string | undefined) {
    this.state.sortKey = val;
    this.render();
  }

  get sortDesc() {
    return this.state.sortDesc;
  }

  set sortDesc(val: boolean | undefined) {
    this.state.sortDesc = val;
    this.render();
  }

  private getSortedRows() {
    if (!this.state.sortKey) return this.state.rows;
    const sorted = [...this.state.rows].sort((a, b) => {
      const aVal = a[this.state.sortKey!];
      const bVal = b[this.state.sortKey!];
      if (aVal < bVal) return this.state.sortDesc ? 1 : -1;
      if (aVal > bVal) return this.state.sortDesc ? -1 : 1;
      return 0;
    });
    return sorted;
  }

  private render() {
    const headerHtml = this.state.columns.map((col) => `<th style="width:${col.width || 'auto'}">${col.label}${col.sortable ? '<span class="sortable">↕</span>' : ''}</th>`).join('');
    const rowsHtml = this.getSortedRows()
      .map(
        (row) =>
          `<tr>${this.state.columns
            .map((col) => `<td>${row[col.key] !== undefined ? row[col.key] : ''}</td>`)
            .join('')}</tr>`
      )
      .join('');
    this.sr.innerHTML = `<style>:host{display:block;width:100%;overflow-x:auto}table{width:100%;border-collapse:collapse}th,td{padding:12px;text-align:left;border-bottom:1px solid #ddd}th{background:#f5f5f5;font-weight:bold}th.sortable:hover{cursor:pointer;background:#eee}.sortable{margin-left:4px;opacity:0.6}</style><table><thead><tr>${headerHtml}</tr></thead><tbody>${rowsHtml}</tbody></table>`;
    this.setupListeners();
  }

  private setupListeners() {
    const headers = this.sr.querySelectorAll('th');
    headers.forEach((h, idx) => {
      const col = this.state.columns[idx];
      if (col?.sortable) {
        h.style.cursor = 'pointer';
        h.addEventListener('click', () => {
          const isSameCol = this.state.sortKey === col.key;
          this.state.sortKey = col.key;
          this.state.sortDesc = isSameCol ? !this.state.sortDesc : false;
          this.render();
        });
      }
    });
  }
}

customElements.define('ui-table', UiTable);

declare global {
  interface HTMLElementTagNameMap {
    'ui-table': UiTable;
  }
}

export { UiTable };
