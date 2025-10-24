export interface TimelineItem {
  id?: string;
  title?: string;
  description?: string;
  timestamp?: string;
  status?: 'pending' | 'completed' | 'error';
  icon?: string;
}

export interface TimelineState {
  items: TimelineItem[];
  orientation: 'vertical' | 'horizontal';
}

export interface ITimelineElement extends HTMLElement {
  items: TimelineItem[];
  orientation: 'vertical' | 'horizontal';
  addItem(item: TimelineItem): void;
  removeItem(id: string): void;
}
