# Component Prioritization for Cortex UI Library

**Phase:** 2.1 - 2.2
**Last Updated:** 2025-10-24
**Goal:** Develop the 15 most critical foundational components using TDD with strict TypeScript

## Priority Tier 1: Core Foundation (Essential - Required for most apps)

These components are foundational and required for building any application. They have high dependency and reuse.

### 1. **Text Input** (`ui-text-input`)
- **Category:** Basic Input Controls
- **Description:** Single-line text input field with support for placeholders, disabled state, and validation
- **Usage:** 90%+ of applications
- **Props:**
  - `value: string` - Current value
  - `placeholder: string` - Placeholder text
  - `disabled: boolean` - Disabled state
  - `readonly: boolean` - Read-only state
  - `type: string` - HTML input type (text, email, password, etc.)
  - `required: boolean` - Required field
  - `pattern: string` - Validation pattern
  - `maxLength: number` - Max character count
- **Events:**
  - `input` - On input change
  - `change` - On value commit
  - `focus` - On focus
  - `blur` - On blur

### 2. **Checkbox** (`ui-checkbox`)
- **Category:** Basic Input Controls
- **Description:** Boolean toggle input with label support
- **Usage:** 85%+ of applications
- **Props:**
  - `checked: boolean` - Checked state
  - `disabled: boolean` - Disabled state
  - `required: boolean` - Required field
  - `indeterminate: boolean` - Indeterminate state (for tri-state)
  - `value: string` - Form submission value
- **Events:**
  - `change` - On state change

### 3. **Select/Dropdown** (`ui-select`)
- **Category:** Basic Input Controls
- **Description:** Dropdown selection input with single/multiple selection support
- **Usage:** 80%+ of applications
- **Props:**
  - `options: {label: string, value: string}[]` - Option list
  - `value: string | string[]` - Selected value(s)
  - `multiple: boolean` - Allow multiple selection
  - `disabled: boolean` - Disabled state
  - `placeholder: string` - Placeholder text
  - `searchable: boolean` - Enable search
- **Events:**
  - `change` - On selection change

### 4. **Button** (`ui-button`) ✅ COMPLETED
- **Category:** Buttons & Actions
- **Description:** Customizable button with variants and sizes
- **Status:** Already implemented with metadata

### 5. **Label** (`ui-label`)
- **Category:** Forms
- **Description:** Text label for form inputs with required indicator
- **Usage:** 95%+ of applications (paired with inputs)
- **Props:**
  - `for: string` - Associated input ID
  - `required: boolean` - Show required indicator
  - `disabled: boolean` - Disabled state
- **Slots:**
  - `default` - Label text

### 6. **Form Field** (`ui-form-field`)
- **Category:** Forms
- **Description:** Wrapper for input + label + error message
- **Usage:** 70%+ of applications
- **Props:**
  - `error: string` - Error message
  - `hint: string` - Hint text
  - `required: boolean` - Required field indicator
  - `disabled: boolean` - Disabled state
- **Slots:**
  - `label` - Label content
  - `input` - Input content
  - `error` - Error content
  - `hint` - Hint content

## Priority Tier 2: Essential Inputs (High Priority - 50-80% of apps)

### 7. **Textarea** (`ui-textarea`)
- **Category:** Basic Input Controls
- **Description:** Multi-line text input
- **Props:** Similar to text input + `rows: number`, `cols: number`

### 8. **Radio Button** (`ui-radio`)
- **Category:** Basic Input Controls
- **Description:** Single-selection toggle from group
- **Props:** Similar to checkbox + `name: string` (for grouping)

### 9. **Toggle Switch** (`ui-toggle`)
- **Category:** Basic Input Controls
- **Description:** Binary on/off toggle switch
- **Props:**
  - `checked: boolean`
  - `disabled: boolean`
  - `size: 'small' | 'medium' | 'large'`

### 10. **Number Input** (`ui-number-input`)
- **Category:** Basic Input Controls
- **Description:** Input for numeric values with increment/decrement
- **Props:**
  - `value: number`
  - `min: number`, `max: number`, `step: number`
  - `disabled: boolean`

## Priority Tier 3: Display & Feedback (Important - 40-60% of apps)

### 11. **Alert** (`ui-alert`)
- **Category:** Feedback & Status
- **Description:** Alert/notification message
- **Props:**
  - `variant: 'success' | 'error' | 'warning' | 'info'`
  - `dismissible: boolean`

### 12. **Progress Bar** (`ui-progress`)
- **Category:** Data Display
- **Description:** Linear progress indicator
- **Props:**
  - `value: number` (0-100)
  - `size: 'small' | 'medium' | 'large'`

### 13. **Spinner/Loader** (`ui-spinner`)
- **Category:** Data Display
- **Description:** Loading spinner animation
- **Props:**
  - `size: 'small' | 'medium' | 'large'`
  - `color: string`

### 14. **Badge** (`ui-badge`)
- **Category:** Data Display
- **Description:** Small label/badge for status
- **Props:**
  - `variant: 'primary' | 'secondary' | 'success' | 'error' | 'warning'`

### 15. **Card** (`ui-card`)
- **Category:** Layout & Structure
- **Description:** Container component for grouped content
- **Props:**
  - `elevation: number` (shadow level)
- **Slots:**
  - `header`, `default`, `footer`

## Implementation Strategy

### Per-Component Development Cycle (TDD)

For each component (in order):

1. **Create Tests First**
   - Unit tests for component logic
   - Integration tests for DOM interaction
   - Write tests that define the expected API

2. **Define TypeScript Interfaces**
   - Strict prop types
   - Event types
   - Ensure 100% type coverage

3. **Implement Component**
   - Use Lit Web Components
   - CSS Custom Properties for theming
   - Shadow DOM for encapsulation

4. **Create Metadata**
   - Document props, events, slots, CSS properties
   - Add usage examples

5. **Run Tests**
   - All tests must pass
   - Generate documentation
   - Verify metadata

### Estimated Timeline

- **Tier 1 (5 components):** ~2-3 weeks (high quality, TDD)
- **Tier 2 (5 components):** ~2-3 weeks
- **Tier 3 (5 components):** ~2-3 weeks
- **Total for Phase 2-3:** ~6-9 weeks for 15 foundational components

After the first 15 components, the velocity should increase as patterns and utilities are established.

## Success Criteria

✅ All components have:
- Comprehensive unit tests (100%+ passing)
- Strict TypeScript interfaces (strict: true)
- Complete metadata documentation
- Working examples in generated HTML docs
- Accessibility support (WCAG 2.1 AA)
- No external dependencies (CSS-in-JS, component libs, etc.)

## Next Steps

1. ✅ Phase 1 complete: Documentation & metadata system ready
2. 🔄 Phase 2.1: Finalize this prioritization list (IN PROGRESS)
3. ⬜ Phase 2.2: Define component APIs with TypeScript
4. ⬜ Phase 3.1+: Begin TDD implementation, starting with ui-text-input
