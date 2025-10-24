export interface AccordionItem {
  id: string;
  label: string;
  content: string;
  disabled?: boolean;
}

export interface AccordionState {
  items: AccordionItem[];
  openItems: Set<string>;
  allowMultiple: boolean;
  disabled: boolean;
}

export interface IAccordionElement extends HTMLElement {
  items: AccordionItem[];
  openItems: Set<string>;
  allowMultiple: boolean;
  disabled: boolean;
  openItem(id: string): void;
  closeItem(id: string): void;
  toggleItem(id: string): void;
  closeAll(): void;
  addItem(item: AccordionItem): void;
  removeItem(id: string): void;
}
