import { ComponentMetadata } from '../../metadata.js';

export const uiAvatarMetadata: ComponentMetadata = {
  tag: 'ui-avatar',
  name: 'Avatar',
  category: 'Display',
  description:
    'A user avatar component for displaying profile images with initials fallback. Supports multiple sizes (small, medium, large, xlarge) and shapes (circle, square, rounded). Built with Web Components for framework-agnostic use.',
  since: '1.0.0',
  props: [
    {
      name: 'src',
      type: 'string',
      description: 'URL of the avatar image',
      isAttribute: true,
    },
    {
      name: 'alt',
      type: 'string',
      description: 'Alt text for the image',
      isAttribute: true,
    },
    {
      name: 'initials',
      type: 'string',
      description: 'Fallback initials when image is not available',
      isAttribute: true,
    },
    {
      name: 'size',
      type: "'small' | 'medium' | 'large' | 'xlarge'",
      default: "'medium'",
      description: 'Size of the avatar',
      isAttribute: true,
    },
    {
      name: 'shape',
      type: "'circle' | 'square' | 'rounded'",
      default: "'circle'",
      description: 'Shape of the avatar',
      isAttribute: true,
    },
    {
      name: 'disabled',
      type: 'boolean',
      default: 'false',
      description: 'Disable the avatar',
      isAttribute: true,
    },
  ],
  events: [],
  slots: [],
  cssProps: [
    {
      name: '--ui-color-surface-light',
      description: 'Background color for initials fallback',
      default: '#e9ecef',
    },
  ],
  examples: [
    {
      title: 'Avatar with Image',
      code: `<ui-avatar src="https://example.com/user.jpg" alt="User Name"></ui-avatar>`,
      description: 'Avatar displaying an image',
    },
    {
      title: 'Avatar with Initials',
      code: `<ui-avatar initials="JD" alt="John Doe"></ui-avatar>`,
      description: 'Avatar showing initials fallback',
    },
    {
      title: 'Large Avatar',
      code: `<ui-avatar src="https://example.com/avatar.jpg" size="large"></ui-avatar>`,
      description: 'Large avatar with image',
    },
    {
      title: 'Square Avatar',
      code: `<ui-avatar initials="AB" shape="square"></ui-avatar>`,
      description: 'Square-shaped avatar',
    },
    {
      title: 'Rounded Avatar',
      code: `<ui-avatar initials="XY" shape="rounded"></ui-avatar>`,
      description: 'Rounded-corner avatar',
    },
  ],
  issueUrl: 'https://github.com/cortexproject/cortex/issues?q=label%3Aui-avatar',
};
