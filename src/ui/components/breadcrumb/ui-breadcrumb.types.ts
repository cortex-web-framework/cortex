export interface BreadcrumbItem {
  label: string;
  href?: string;
  disabled?: boolean;
  current?: boolean;
}

export interface BreadcrumbState {
  items: BreadcrumbItem[];
  disabled: boolean;
  separator: string;
}

export interface IBreadcrumbElement extends HTMLElement {
  items: BreadcrumbItem[];
  disabled: boolean;
  separator: string;
  addItem(item: BreadcrumbItem): void;
  removeItem(index: number): void;
  setCurrentItem(index: number): void;
}
