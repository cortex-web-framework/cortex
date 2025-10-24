/**
 * TypeScript Types for Accordion Showcase
 * Zero Dependencies - Super Clean Code - Strict TypeScript
 */

export interface AccordionShowcaseItem {
  readonly id: string;
  readonly label: string;
  readonly content: string;
  readonly disabled?: boolean;
}

export interface AccordionShowcaseProps {
  readonly items: readonly AccordionShowcaseItem[];
  readonly allowMultiple?: boolean;
  readonly disabled?: boolean;
  readonly title?: string;
  readonly description?: string;
}

export interface AccordionShowcaseConfig {
  readonly basic: AccordionShowcaseProps;
  readonly multiple: AccordionShowcaseProps;
  readonly disabled: AccordionShowcaseProps;
}

export const ACCORDION_SHOWCASE_CONFIG: AccordionShowcaseConfig = {
  basic: {
    title: 'Accordion',
    description: 'Basic accordion with single item selection',
    items: [
      {
        id: 'item1',
        label: 'First Item',
        content: 'This is the first accordion item content. It can contain any HTML content.',
        disabled: false
      },
      {
        id: 'item2',
        label: 'Second Item',
        content: 'This is the second accordion item content. You can put forms, images, or any other content here.',
        disabled: false
      },
      {
        id: 'item3',
        label: 'Third Item',
        content: 'This is a disabled accordion item that cannot be opened.',
        disabled: true
      }
    ],
    allowMultiple: false,
    disabled: false
  },
  multiple: {
    title: 'Accordion with Multiple Open',
    description: 'Accordion that allows multiple items to be open simultaneously',
    items: [
      {
        id: 'multi1',
        label: 'Multiple Item 1',
        content: 'This accordion allows multiple items to be open simultaneously.',
        disabled: false
      },
      {
        id: 'multi2',
        label: 'Multiple Item 2',
        content: 'You can open both this item and the previous one at the same time.',
        disabled: false
      },
      {
        id: 'multi3',
        label: 'Multiple Item 3',
        content: 'All three items can be open at once when allowMultiple is enabled.',
        disabled: false
      }
    ],
    allowMultiple: true,
    disabled: false
  },
  disabled: {
    title: 'Disabled Accordion',
    description: 'Accordion that is completely disabled',
    items: [
      {
        id: 'disabled1',
        label: 'Disabled Item 1',
        content: 'This accordion is completely disabled.',
        disabled: false
      },
      {
        id: 'disabled2',
        label: 'Disabled Item 2',
        content: 'None of the items can be opened.',
        disabled: false
      }
    ],
    allowMultiple: false,
    disabled: true
  }
} as const;