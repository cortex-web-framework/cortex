import { ComponentMetadata } from '../../metadata.js';

export const uiStatMetadata: ComponentMetadata = {
  tag: 'ui-stat',
  name: 'Stat',
  category: 'Display',
  description: 'A statistic display component for showing metrics with optional trend indicators. Perfect for dashboards and KPI displays.',
  since: '1.0.0',
  props: [
    {
      name: 'label',
      type: 'string | undefined',
      description: 'Label above the value',
      isAttribute: true,
    },
    {
      name: 'value',
      type: 'string | undefined',
      description: 'Main value to display',
      isAttribute: true,
    },
    {
      name: 'description',
      type: 'string | undefined',
      description: 'Additional description text',
      isAttribute: true,
    },
    {
      name: 'icon',
      type: 'string | undefined',
      description: 'Icon emoji',
      isAttribute: true,
    },
    {
      name: 'trend',
      type: "'up' | 'down' | 'neutral'",
      description: 'Trend direction',
      isAttribute: true,
    },
    {
      name: 'trendValue',
      type: 'string | undefined',
      description: 'Trend percentage/value',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [],
  examples: [
    {
      title: 'Revenue Stat',
      code: `<ui-stat label="Revenue" value="$12,500" icon="💰" trend="up" trendValue="+12%"></ui-stat>`,
      description: 'Revenue metric with uptrend',
    },
    {
      title: 'Users Stat',
      code: `<ui-stat label="Users" value="8,429" icon="👥" trend="down" trendValue="-3%"></ui-stat>`,
      description: 'User count with downtrend',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-stat',
};
