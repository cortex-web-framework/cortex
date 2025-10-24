export interface TableColumn {
  key: string;
  label: string;
  width?: string;
  sortable?: boolean;
}

export interface TableRow {
  id: string;
  [key: string]: string | number | boolean;
}

export interface TableState {
  columns: TableColumn[];
  rows: TableRow[];
  sortKey?: string;
  sortDesc?: boolean;
}

export interface ITableElement extends HTMLElement {
  columns: TableColumn[];
  rows: TableRow[];
  sortKey?: string;
  sortDesc?: boolean;
}
