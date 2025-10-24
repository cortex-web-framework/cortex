export interface MenuItem {
  label: string;
  value: string;
  disabled?: boolean;
  icon?: string;
}

export interface MenuState {
  open: boolean;
  items: MenuItem[];
  selectedValue?: string;
}

export interface IMenuElement extends HTMLElement {
  open: boolean;
  items: MenuItem[];
  selectedValue?: string;
}
