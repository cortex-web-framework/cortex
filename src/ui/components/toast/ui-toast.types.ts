export type ToastType = 'info' | 'success' | 'warning' | 'error';

export interface ToastState {
  message?: string;
  toastType: ToastType;
  visible: boolean;
  autoHide: boolean;
  duration: number;
}

export interface IToastElement extends HTMLElement {
  message?: string;
  toastType: ToastType;
  visible: boolean;
  autoHide: boolean;
  duration: number;
  show(): void;
  hide(): void;
}
