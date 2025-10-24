export interface TabItem {
  id: string;
  label: string;
  disabled?: boolean;
}

export interface TabsState {
  tabs: TabItem[];
  activeTabId: string | null;
  variant: 'default' | 'pills' | 'underline';
  disabled: boolean;
}

export interface ITabsElement extends HTMLElement {
  tabs: TabItem[];
  activeTabId: string | null;
  variant: 'default' | 'pills' | 'underline';
  disabled: boolean;
  selectTab(id: string): void;
  addTab(tab: TabItem): void;
  removeTab(id: string): void;
}
