export interface PaginationState {
  currentPage: number;
  totalPages: number;
  maxVisiblePages: number;
  disabled: boolean;
  showFirstLast: boolean;
}

export interface IPaginationElement extends HTMLElement {
  currentPage: number;
  totalPages: number;
  maxVisiblePages: number;
  disabled: boolean;
  showFirstLast: boolean;
  goToPage(page: number): void;
  nextPage(): void;
  previousPage(): void;
}
