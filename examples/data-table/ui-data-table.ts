/**
 * Sortable Data Table Component
 * Web Component with pagination, sorting, filtering, and row selection
 * NO external dependencies - pure TypeScript
 */

interface TableColumn {
  key: string;
  label: string;
  sortable?: boolean;
  type?: 'string' | 'number' | 'date';
}

interface SortState {
  column: string | null;
  direction: 'asc' | 'desc';
}

interface PaginationState {
  currentPage: number;
  pageSize: number;
}

// Sample data - can be replaced with real data
const SAMPLE_DATA = [
  { id: 1, name: 'Alice Johnson', email: 'alice@example.com', status: 'Active', joinDate: '2023-01-15' },
  { id: 2, name: 'Bob Smith', email: 'bob@example.com', status: 'Active', joinDate: '2023-02-20' },
  { id: 3, name: 'Carol White', email: 'carol@example.com', status: 'Inactive', joinDate: '2023-03-10' },
  { id: 4, name: 'David Brown', email: 'david@example.com', status: 'Active', joinDate: '2023-04-05' },
  { id: 5, name: 'Eve Davis', email: 'eve@example.com', status: 'Active', joinDate: '2023-05-12' },
  { id: 6, name: 'Frank Miller', email: 'frank@example.com', status: 'Inactive', joinDate: '2023-06-18' },
  { id: 7, name: 'Grace Wilson', email: 'grace@example.com', status: 'Active', joinDate: '2023-07-22' },
  { id: 8, name: 'Henry Moore', email: 'henry@example.com', status: 'Active', joinDate: '2023-08-30' },
  { id: 9, name: 'Iris Taylor', email: 'iris@example.com', status: 'Active', joinDate: '2023-09-14' },
  { id: 10, name: 'Jack Anderson', email: 'jack@example.com', status: 'Inactive', joinDate: '2023-10-25' },
  { id: 11, name: 'Karen Thomas', email: 'karen@example.com', status: 'Active', joinDate: '2023-11-05' },
  { id: 12, name: 'Leo Jackson', email: 'leo@example.com', status: 'Active', joinDate: '2023-12-01' },
];

const COLUMNS: TableColumn[] = [
  { key: 'name', label: 'Name', sortable: true, type: 'string' },
  { key: 'email', label: 'Email', sortable: true, type: 'string' },
  { key: 'status', label: 'Status', sortable: true, type: 'string' },
  { key: 'joinDate', label: 'Join Date', sortable: true, type: 'date' },
];

export class DataTable extends HTMLElement {
  private shadowRoot: ShadowRoot;
  private allData: any[] = SAMPLE_DATA;
  private displayData: any[] = [];
  private filteredData: any[] = [];
  private columns: TableColumn[] = COLUMNS;
  private sortState: SortState = { column: null, direction: 'asc' };
  private paginationState: PaginationState = { currentPage: 1, pageSize: 10 };
  private selectedIds = new Set<number>();
  private searchTerm: string = '';

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.initializeData();
    this.render();
    this.setupEventListeners();
  }

  private initializeData() {
    this.filteredData = [...this.allData];
    this.updateDisplayData();
  }

  private render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        }

        .table-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .table-header {
          padding: 1.5rem;
          border-bottom: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 1rem;
        }

        .search-box {
          flex: 1;
          max-width: 300px;
        }

        .search-box input {
          width: 100%;
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 0.9rem;
        }

        .search-box input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        .page-size-selector {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .page-size-selector select {
          padding: 0.5rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          background: white;
          cursor: pointer;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          background: #f5f5f5;
        }

        th {
          padding: 1rem;
          text-align: left;
          font-weight: 600;
          color: #333;
          border-bottom: 2px solid #e0e0e0;
          cursor: pointer;
          user-select: none;
          white-space: nowrap;
        }

        th[data-sortable="true"]:hover {
          background: #eeeeee;
        }

        th.sorted {
          background: #e8f5e9;
          color: #2e7d32;
        }

        th input[type="checkbox"] {
          cursor: pointer;
        }

        td {
          padding: 1rem;
          border-bottom: 1px solid #f0f0f0;
        }

        tbody tr {
          transition: background-color 0.2s;
        }

        tbody tr:hover {
          background: #fafafa;
        }

        tbody tr.selected {
          background: #e8f5e9;
        }

        tbody tr input[type="checkbox"] {
          cursor: pointer;
        }

        .status {
          display: inline-block;
          padding: 0.25rem 0.75rem;
          border-radius: 12px;
          font-size: 0.85rem;
          font-weight: 500;
        }

        .status.active {
          background: #c8e6c9;
          color: #2e7d32;
        }

        .status.inactive {
          background: #ffccbc;
          color: #d84315;
        }

        .sort-indicator {
          margin-left: 0.25rem;
          font-size: 0.8rem;
        }

        .empty-state {
          padding: 3rem;
          text-align: center;
          color: #999;
        }

        .empty-state p {
          margin: 0;
          font-size: 1rem;
        }

        .pagination-container {
          padding: 1.5rem;
          border-top: 1px solid #e0e0e0;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .pagination-info {
          color: #666;
          font-size: 0.9rem;
        }

        .pagination-controls {
          display: flex;
          gap: 0.5rem;
        }

        button {
          padding: 0.5rem 1rem;
          border: 1px solid #ddd;
          background: white;
          border-radius: 4px;
          cursor: pointer;
          font-weight: 500;
          transition: all 0.2s;
        }

        button:hover:not(:disabled) {
          background: #f5f5f5;
          border-color: #999;
        }

        button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        button.primary {
          background: #4CAF50;
          color: white;
          border-color: #4CAF50;
        }

        button.primary:hover:not(:disabled) {
          background: #45a049;
        }

        @media (max-width: 768px) {
          .table-header {
            flex-direction: column;
            align-items: stretch;
          }

          .search-box {
            max-width: 100%;
          }

          .pagination-container {
            flex-direction: column;
            gap: 1rem;
          }

          table {
            font-size: 0.85rem;
          }

          th, td {
            padding: 0.75rem 0.5rem;
          }
        }
      </style>

      <div class="table-container">
        <div class="table-header">
          <div class="search-box">
            <input type="text" data-search placeholder="Search..." />
          </div>
          <div class="page-size-selector">
            <label for="pageSize">Rows per page:</label>
            <select id="pageSize" data-page-size>
              <option value="5">5</option>
              <option value="10" selected>10</option>
              <option value="25">25</option>
              <option value="50">50</option>
            </select>
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">
                <input type="checkbox" data-select-all />
              </th>
              ${this.columns.map((col) => `
                <th data-column="${col.key}" data-sortable="${col.sortable ?? false}">
                  ${col.label}
                  <span class="sort-indicator"></span>
                </th>
              `).join('')}
            </tr>
          </thead>
          <tbody></tbody>
        </table>

        <div data-empty-state style="display: none;">
          <div class="empty-state">
            <p>No data found</p>
          </div>
        </div>

        <div class="pagination-container">
          <div class="pagination-info" data-page-info>Showing 1-10 of 12</div>
          <div class="pagination-controls">
            <button type="button" data-action="prev-page" disabled>← Previous</button>
            <button type="button" data-action="next-page">Next →</button>
          </div>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    const searchInput = this.shadowRoot.querySelector('[data-search]') as HTMLInputElement;
    const pageSizeSelect = this.shadowRoot.querySelector('[data-page-size]') as HTMLSelectElement;
    const selectAllCheckbox = this.shadowRoot.querySelector('[data-select-all]') as HTMLInputElement;
    const prevBtn = this.shadowRoot.querySelector('[data-action="prev-page"]') as HTMLButtonElement;
    const nextBtn = this.shadowRoot.querySelector('[data-action="next-page"]') as HTMLButtonElement;

    // Search
    searchInput.addEventListener('input', (e) => {
      this.searchTerm = (e.target as HTMLInputElement).value.toLowerCase();
      this.filterData();
    });

    // Page size
    pageSizeSelect.addEventListener('change', (e) => {
      this.paginationState.pageSize = parseInt((e.target as HTMLSelectElement).value);
      this.paginationState.currentPage = 1;
      this.updateDisplayData();
      this.renderTable();
      this.updatePaginationControls();
    });

    // Sorting
    const headers = this.shadowRoot.querySelectorAll('th[data-sortable="true"]');
    headers.forEach((header) => {
      header.addEventListener('click', () => {
        const column = header.getAttribute('data-column');
        this.sortData(column!);
      });
    });

    // Select all
    selectAllCheckbox.addEventListener('change', (e) => {
      const checked = (e.target as HTMLInputElement).checked;
      const checkboxes = this.shadowRoot.querySelectorAll('tbody input[type="checkbox"]');
      checkboxes.forEach((cb) => {
        (cb as HTMLInputElement).checked = checked;
        const row = (cb as HTMLInputElement).closest('tr') as HTMLElement;
        const idStr = row?.getAttribute('data-id');
        if (idStr) {
          const id = parseInt(idStr);
          if (checked) {
            this.selectedIds.add(id);
            row?.classList.add('selected');
          } else {
            this.selectedIds.delete(id);
            row?.classList.remove('selected');
          }
        }
      });
      this.emitSelectionChange();
    });

    // Pagination
    prevBtn.addEventListener('click', () => {
      if (this.paginationState.currentPage > 1) {
        this.paginationState.currentPage--;
        this.updateDisplayData();
        this.renderTable();
        this.updatePaginationControls();
      }
    });

    nextBtn.addEventListener('click', () => {
      const totalPages = Math.ceil(this.filteredData.length / this.paginationState.pageSize);
      if (this.paginationState.currentPage < totalPages) {
        this.paginationState.currentPage++;
        this.updateDisplayData();
        this.renderTable();
        this.updatePaginationControls();
      }
    });
  }

  private filterData() {
    if (!this.searchTerm) {
      this.filteredData = [...this.allData];
    } else {
      this.filteredData = this.allData.filter((row) => {
        return Object.values(row).some((value) => String(value).toLowerCase().includes(this.searchTerm));
      });
    }

    // Reapply sort
    if (this.sortState.column) {
      this.sortData(this.sortState.column);
    }

    this.paginationState.currentPage = 1;
    this.updateDisplayData();
    this.renderTable();
    this.updatePaginationControls();
  }

  private sortData(column: string) {
    // Toggle sort direction if same column
    if (this.sortState.column === column) {
      this.sortState.direction = this.sortState.direction === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortState.column = column;
      this.sortState.direction = 'asc';
    }

    const columnConfig = this.columns.find((c) => c.key === column);
    const type = columnConfig?.type || 'string';

    this.filteredData.sort((a, b) => {
      let aVal = a[column];
      let bVal = b[column];

      // Type-based comparison
      if (type === 'number') {
        aVal = Number(aVal);
        bVal = Number(bVal);
      } else if (type === 'date') {
        aVal = new Date(aVal).getTime();
        bVal = new Date(bVal).getTime();
      } else {
        aVal = String(aVal).toLowerCase();
        bVal = String(bVal).toLowerCase();
      }

      if (aVal < bVal) return this.sortState.direction === 'asc' ? -1 : 1;
      if (aVal > bVal) return this.sortState.direction === 'asc' ? 1 : -1;
      return 0;
    });

    this.paginationState.currentPage = 1;
    this.updateDisplayData();
    this.renderTable();
    this.updateSortIndicators();
  }

  private updateDisplayData() {
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize;
    const end = start + this.paginationState.pageSize;
    this.displayData = this.filteredData.slice(start, end);
  }

  private renderTable() {
    const tbody = this.shadowRoot.querySelector('tbody') as HTMLTableSectionElement;
    const emptyState = this.shadowRoot.querySelector('[data-empty-state]') as HTMLElement;

    if (this.displayData.length === 0) {
      tbody.innerHTML = '';
      emptyState.style.display = 'block';
      return;
    }

    emptyState.style.display = 'none';

    tbody.innerHTML = this.displayData
      .map(
        (row) => `
      <tr data-id="${row.id}" class="${this.selectedIds.has(row.id) ? 'selected' : ''}">
        <td>
          <input type="checkbox" ${this.selectedIds.has(row.id) ? 'checked' : ''} />
        </td>
        ${this.columns
          .map((col) => {
            let value = row[col.key];

            if (col.type === 'date') {
              value = new Date(value).toLocaleDateString();
            } else if (col.key === 'status') {
              const statusClass = value.toLowerCase();
              return `<td data-type="string"><span class="status ${statusClass}">${value}</span></td>`;
            }

            return `<td data-type="${col.type || 'string'}">${value}</td>`;
          })
          .join('')}
      </tr>
    `
      )
      .join('');

    // Add row click listeners for checkbox
    const rows = tbody.querySelectorAll('tr');
    rows.forEach((row) => {
      const checkbox = row.querySelector('input[type="checkbox"]') as HTMLInputElement;
      const id = parseInt(row.getAttribute('data-id')!);

      checkbox.addEventListener('change', () => {
        if (checkbox.checked) {
          this.selectedIds.add(id);
          row.classList.add('selected');
        } else {
          this.selectedIds.delete(id);
          row.classList.remove('selected');
        }

        // Update select-all checkbox
        const selectAllCheckbox = this.shadowRoot.querySelector('[data-select-all]') as HTMLInputElement;
        const allCheckboxes = Array.from(this.shadowRoot.querySelectorAll('tbody input[type="checkbox"]')) as HTMLInputElement[];
        selectAllCheckbox.checked = allCheckboxes.every((cb) => cb.checked);

        this.emitSelectionChange();
      });
    });
  }

  private updateSortIndicators() {
    const headers = this.shadowRoot.querySelectorAll('th[data-column]');
    headers.forEach((header) => {
      const column = header.getAttribute('data-column');
      const indicator = header.querySelector('.sort-indicator') as HTMLElement;

      if (column === this.sortState.column) {
        header.classList.add('sorted');
        indicator.textContent = this.sortState.direction === 'asc' ? '▲' : '▼';
      } else {
        header.classList.remove('sorted');
        indicator.textContent = '';
      }
    });
  }

  private updatePaginationControls() {
    const prevBtn = this.shadowRoot.querySelector('[data-action="prev-page"]') as HTMLButtonElement;
    const nextBtn = this.shadowRoot.querySelector('[data-action="next-page"]') as HTMLButtonElement;
    const pageInfo = this.shadowRoot.querySelector('[data-page-info]') as HTMLElement;

    const totalPages = Math.ceil(this.filteredData.length / this.paginationState.pageSize);
    const start = (this.paginationState.currentPage - 1) * this.paginationState.pageSize + 1;
    const end = Math.min(this.paginationState.currentPage * this.paginationState.pageSize, this.filteredData.length);

    prevBtn.disabled = this.paginationState.currentPage === 1;
    nextBtn.disabled = this.paginationState.currentPage >= totalPages;

    pageInfo.textContent = `Showing ${start}-${end} of ${this.filteredData.length}`;
  }

  private emitSelectionChange() {
    this.dispatchEvent(
      new CustomEvent('selectionChange', {
        detail: { selectedIds: Array.from(this.selectedIds) },
        bubbles: true,
        composed: true,
      })
    );
  }

  // Public methods
  setData(data: any[]) {
    this.allData = data;
    this.initializeData();
    this.renderTable();
    this.updatePaginationControls();
  }

  getData() {
    return this.allData;
  }

  getSelectedData() {
    return this.allData.filter((row) => this.selectedIds.has(row.id));
  }

  clearSelection() {
    this.selectedIds.clear();
    const checkboxes = this.shadowRoot.querySelectorAll('input[type="checkbox"]');
    checkboxes.forEach((cb) => ((cb as HTMLInputElement).checked = false));
    const rows = this.shadowRoot.querySelectorAll('tbody tr');
    rows.forEach((row) => row.classList.remove('selected'));
    this.emitSelectionChange();
  }
}

// Register the custom element
if (!customElements.get('ui-data-table')) {
  customElements.define('ui-data-table', DataTable);
}
