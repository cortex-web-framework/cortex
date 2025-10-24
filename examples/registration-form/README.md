# Multi-step Registration Form Example

A complete, production-ready multi-step registration form built with Web Components and pure TypeScript. **Zero external dependencies** - no frameworks, no libraries, just standard browser APIs.

## Features

- 🚀 **3-step form** with email, password, and profile sections
- ✅ **Real-time validation** using custom validation utilities
- 🎯 **Progress indicator** showing current step and completion status
- 💾 **Form data persistence** across step navigation
- 🎨 **Beautiful UI** with smooth animations and transitions
- ♿ **Accessible** with proper labels, error messages, and keyboard support
- 📱 **Responsive design** works on all screen sizes
- 🧪 **Comprehensive test suite** with 20+ test cases

## TDD Approach

This example was built using Test-Driven Development (TDD):

1. **Tests First** - Wrote comprehensive tests before implementation
2. **Validation Rules** - Tests define exactly what the form should do
3. **Incremental Building** - Implementation passes tests step by step

### Test Coverage

- Form navigation (next/previous buttons)
- Email validation at step 1
- Password strength validation at step 2
- Password confirmation matching
- Form data persistence across steps
- Progress indicator updates
- Error message display and clearing
- Event emission on submission
- Form reset functionality

## Component API

### Usage

```html
<ui-registration-form id="myForm"></ui-registration-form>

<script type="module">
  const form = document.getElementById('myForm');

  // Listen for form submission
  form.addEventListener('formSubmit', (event) => {
    const data = event.detail;
    console.log('Submitted data:', data);
    // {
    //   email: 'user@example.com',
    //   password: 'SecurePass123!',
    //   confirmPassword: 'SecurePass123!',
    //   firstName: 'John',
    //   lastName: 'Doe'
    // }
  });
</script>
```

### Public Methods

```typescript
// Get current form data
form.getFormData(): Partial<FormData>

// Reset form to initial state
form.reset(): void
```

### Events

- **formSubmit** - Fired when form is successfully submitted
  - Detail: Object containing all form fields

## Validation Rules

### Step 1: Email
- Required field
- Must be valid email format (RFC 5322 simplified)

### Step 2: Password
- Minimum 8 characters
- At least one uppercase letter
- At least one number
- At least one special character
- Must match confirmation password

### Step 3: Profile
- Optional fields
- First name and last name

## Implementation Details

### Files

- **ui-registration-form.ts** - Main Web Component implementation
- **registration-form.test.ts** - Comprehensive test suite
- **index.html** - Demo page with styling and instructions

### Built With

- **Web Components** - Standard browser API for custom elements
- **Shadow DOM** - Encapsulation of component styles and structure
- **TypeScript** - Type-safe implementation
- **Custom Validation Utils** - `validateEmail()` and `validatePassword()` from `src/utils/`

### Key Techniques

1. **Shadow DOM Encapsulation** - Styles don't leak outside component
2. **State Management** - Internal `formData` object tracks user input
3. **Step Navigation** - Logic prevents moving forward with validation errors
4. **Event Delegation** - Single listener for all form inputs
5. **CSS Animations** - Smooth transitions between steps
6. **Custom Events** - Data passed via `CustomEvent` with `detail` property

## Validation Flow

```
User Input
    ↓
Real-time Data Update (input event)
    ↓
Next Button Click
    ↓
Validate Current Step
    ↓
Errors? → Display Messages → Stop
    ↓
No Errors → Move to Next Step → Update UI
    ↓
Last Step? → Show Submit Button
    ↓
Submit → Emit formSubmit Event
```

## Browser Compatibility

- Chrome 67+
- Firefox 63+
- Safari 10.1+
- Edge 79+
- Modern mobile browsers

## Running Tests

```bash
# Run all tests
npx tsx tests/index.ts

# Run specific test file
npx tsx tests/registration-form.test.ts
```

## Styling Customization

The component uses CSS custom properties and Shadow DOM, making it easy to style:

```css
ui-registration-form {
  /* Customize if needed via CSS variables in future versions */
}
```

Currently, all styling is encapsulated in Shadow DOM for maximum portability.

## Performance

- **No external dependencies** - Smaller bundle size
- **Zero framework overhead** - Runs directly on browser APIs
- **Efficient event handling** - Single event listener for all inputs
- **Optimized validation** - No debouncing needed, runs on demand

## Accessibility

- ✓ Proper `<label>` elements for all inputs
- ✓ Clear error messages
- ✓ Keyboard navigation (Tab, Enter, Shift+Tab)
- ✓ Focus management
- ✓ Semantic HTML structure
- ✓ ARIA attributes (can be enhanced further)

## Future Enhancements

- [ ] Add ARIA labels for screen readers
- [ ] Support for optional fields with custom validation
- [ ] Save form progress to localStorage
- [ ] Multi-language error messages
- [ ] Server-side validation integration
- [ ] Async validation (email availability check)

## Related Components

- **ui-button** - Reusable button component
- **ui-input** - Form input component
- **ui-validation** - Validation utilities
- **ui-progress** - Progress indicator component

## License

MIT
