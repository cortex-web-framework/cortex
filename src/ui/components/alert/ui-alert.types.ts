export type AlertType = 'success' | 'error' | 'warning' | 'info';

export interface AlertState {
  type: AlertType;
  dismissible: boolean;
  visible: boolean;
  message?: string;
}

export interface IAlertElement extends HTMLElement {
  type: AlertType;
  dismissible: boolean;
  visible: boolean;
  message?: string;
  dismiss(): void;
  show(): void;
  hide(): void;
}
