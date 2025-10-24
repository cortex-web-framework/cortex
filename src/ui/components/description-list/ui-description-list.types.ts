export interface DescriptionItem {
  term: string;
  description: string;
}

export interface DescriptionListState {
  items: DescriptionItem[];
  bordered: boolean;
}

export interface IDescriptionListElement extends HTMLElement {
  items: DescriptionItem[];
  bordered: boolean;
}
