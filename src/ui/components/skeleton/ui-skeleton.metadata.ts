import { ComponentMetadata } from '../../metadata.js';

export const uiSkeletonMetadata: ComponentMetadata = {
  tag: 'ui-skeleton',
  name: 'Skeleton',
  category: 'Feedback',
  description:
    'A loading placeholder component that mimics the shape and size of content being loaded. Supports text, circle, and rectangle variants with optional pulse animation. Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'variant',
      type: "'text' | 'circle' | 'rectangle'",
      default: "'text'",
      description: 'Shape of the skeleton placeholder',
      isAttribute: true,
    },
    {
      name: 'width',
      type: 'string',
      description: 'Width of the skeleton (CSS value)',
      isAttribute: true,
    },
    {
      name: 'height',
      type: 'string',
      description: 'Height of the skeleton (CSS value)',
      isAttribute: true,
    },
    {
      name: 'animating',
      type: 'boolean',
      default: 'true',
      description: 'Enable pulse animation',
      isAttribute: false,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-surface-light',
      description: 'Background color of skeleton',
      default: '#e9ecef',
    },
  ],
  examples: [
    {
      title: 'Text Skeleton',
      code: `<ui-skeleton></ui-skeleton>`,
      description: 'Text-like skeleton placeholder',
    },
    {
      title: 'Circle Avatar Skeleton',
      code: `<ui-skeleton variant="circle" width="48px" height="48px"></ui-skeleton>`,
      description: 'Avatar-sized circular skeleton',
    },
    {
      title: 'Rectangle Image Skeleton',
      code: `<ui-skeleton variant="rectangle" width="100%" height="300px"></ui-skeleton>`,
      description: 'Image-sized skeleton placeholder',
    },
    {
      title: 'Static Skeleton',
      code: `<ui-skeleton></ui-skeleton>\n<script>\nconst skeleton = document.querySelector('ui-skeleton');\nskeleton.animating = false;\n</script>`,
      description: 'Non-animated skeleton placeholder',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-skeleton',
};
