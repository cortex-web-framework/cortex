export interface StatState {
  label?: string;
  value?: string;
  description?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}

export interface IStatElement extends HTMLElement {
  label?: string;
  value?: string;
  description?: string;
  icon?: string;
  trend?: 'up' | 'down' | 'neutral';
  trendValue?: string;
}
