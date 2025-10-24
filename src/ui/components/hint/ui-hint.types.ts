export interface HintState {
  text?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}

export interface IHintElement extends HTMLElement {
  text?: string;
  type?: 'info' | 'warning' | 'error' | 'success';
}
