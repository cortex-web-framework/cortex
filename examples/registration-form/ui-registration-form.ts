/**
 * Multi-step Registration Form Component
 * Web Component with TypeScript - NO external dependencies
 */

import * as utils from '../../src/utils/index.js';

interface FormData {
  email: string;
  password: string;
  confirmPassword: string;
  firstName: string;
  lastName: string;
}

interface ValidationError {
  [key: string]: string | null;
}

export class RegistrationForm extends HTMLElement {
  private currentStep: number = 1;
  private formData: Partial<FormData> = {};
  private errors: ValidationError = {};
  private shadowRoot: ShadowRoot;

  constructor() {
    super();
    this.shadowRoot = this.attachShadow({ mode: 'open' });
  }

  connectedCallback() {
    this.render();
    this.setupEventListeners();
  }

  private render() {
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
          max-width: 600px;
          margin: 0 auto;
        }

        .form-container {
          background: white;
          border-radius: 8px;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }

        .progress-container {
          display: flex;
          gap: 1rem;
          padding: 2rem;
          background: #f5f5f5;
          border-bottom: 1px solid #e0e0e0;
        }

        .progress-step {
          flex: 1;
          height: 4px;
          background: #e0e0e0;
          border-radius: 2px;
          position: relative;
        }

        .progress-step.active {
          background: #4CAF50;
        }

        .progress-step.completed {
          background: #4CAF50;
        }

        .step-content {
          padding: 2rem;
          display: none;
        }

        .step-content.active {
          display: block;
          animation: fadeIn 0.3s ease-in;
        }

        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .form-group {
          margin-bottom: 1.5rem;
        }

        label {
          display: block;
          margin-bottom: 0.5rem;
          font-weight: 500;
          color: #333;
        }

        input {
          width: 100%;
          padding: 0.75rem;
          border: 1px solid #ddd;
          border-radius: 4px;
          font-size: 1rem;
          box-sizing: border-box;
          transition: border-color 0.2s;
        }

        input:focus {
          outline: none;
          border-color: #4CAF50;
          box-shadow: 0 0 0 3px rgba(76, 175, 80, 0.1);
        }

        input.error {
          border-color: #f44336;
        }

        .error-message {
          color: #f44336;
          font-size: 0.875rem;
          margin-top: 0.25rem;
          display: none;
        }

        .error-message.show {
          display: block;
        }

        .button-group {
          display: flex;
          gap: 1rem;
          justify-content: space-between;
          padding: 2rem;
          background: #f5f5f5;
          border-top: 1px solid #e0e0e0;
        }

        button {
          padding: 0.75rem 1.5rem;
          border: none;
          border-radius: 4px;
          font-size: 1rem;
          font-weight: 500;
          cursor: pointer;
          transition: background-color 0.2s;
        }

        button[data-action="prev"] {
          background: #f5f5f5;
          color: #333;
          border: 1px solid #ddd;
        }

        button[data-action="prev"]:hover {
          background: #eeeeee;
        }

        button[data-action="prev"]:disabled,
        button[data-action="prev"].hidden {
          opacity: 0;
          pointer-events: none;
        }

        button[data-action="next"],
        button[data-action="submit"] {
          background: #4CAF50;
          color: white;
        }

        button[data-action="next"]:hover,
        button[data-action="submit"]:hover {
          background: #45a049;
        }

        button[data-action="submit"] {
          flex: 1;
        }

        .step-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 1rem;
          color: #333;
        }

        .step-description {
          color: #666;
          margin-bottom: 1.5rem;
        }
      </style>

      <div class="form-container">
        <div class="progress-container">
          <div class="progress-step active" data-progress-step="1"></div>
          <div class="progress-step" data-progress-step="2"></div>
          <div class="progress-step" data-progress-step="3"></div>
        </div>

        <form>
          <!-- Step 1: Email -->
          <div class="step-content active" data-step="1">
            <h2 class="step-title">Create Account</h2>
            <p class="step-description">Enter your email address to get started</p>

            <div class="form-group">
              <label for="email">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                placeholder="you@example.com"
                required
              />
              <div class="error-message" data-error="email"></div>
            </div>
          </div>

          <!-- Step 2: Password -->
          <div class="step-content" data-step="2">
            <h2 class="step-title">Set Password</h2>
            <p class="step-description">Create a strong password for your account</p>

            <div class="form-group">
              <label for="password">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                placeholder="At least 8 characters"
                required
              />
              <div class="error-message" data-error="password"></div>
            </div>

            <div class="form-group">
              <label for="confirmPassword">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                placeholder="Re-enter your password"
                required
              />
              <div class="error-message" data-error="confirmPassword"></div>
            </div>
          </div>

          <!-- Step 3: Profile -->
          <div class="step-content" data-step="3">
            <h2 class="step-title">Complete Profile</h2>
            <p class="step-description">Tell us a bit about yourself</p>

            <div class="form-group">
              <label for="firstName">First Name</label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                placeholder="John"
              />
              <div class="error-message" data-error="firstName"></div>
            </div>

            <div class="form-group">
              <label for="lastName">Last Name</label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                placeholder="Doe"
              />
              <div class="error-message" data-error="lastName"></div>
            </div>
          </div>
        </form>

        <div class="button-group">
          <button type="button" data-action="prev" class="hidden">Previous</button>
          <button type="button" data-action="next">Next</button>
          <button type="button" data-action="submit" style="display: none;">Register</button>
        </div>
      </div>
    `;
  }

  private setupEventListeners() {
    const prevBtn = this.shadowRoot.querySelector('[data-action="prev"]') as HTMLButtonElement;
    const nextBtn = this.shadowRoot.querySelector('[data-action="next"]') as HTMLButtonElement;
    const submitBtn = this.shadowRoot.querySelector('[data-action="submit"]') as HTMLButtonElement;
    const form = this.shadowRoot.querySelector('form') as HTMLFormElement;

    // Get all inputs
    const inputs = this.shadowRoot.querySelectorAll('input');

    // Update form data when inputs change
    inputs.forEach((input) => {
      input.addEventListener('input', (e) => {
        const target = e.target as HTMLInputElement;
        this.formData[target.name as keyof FormData] = target.value;
        this.clearError(target.name);
      });
    });

    // Previous button
    prevBtn.addEventListener('click', () => this.previousStep());

    // Next button
    nextBtn.addEventListener('click', () => this.nextStep());

    // Submit button
    submitBtn.addEventListener('click', () => this.submit());

    // Allow form submission with Enter key on last step
    form.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' && this.currentStep === 3) {
        e.preventDefault();
        this.submit();
      }
    });
  }

  private validateStep(step: number): boolean {
    this.errors = {};

    if (step === 1) {
      return this.validateStep1();
    } else if (step === 2) {
      return this.validateStep2();
    } else if (step === 3) {
      return this.validateStep3();
    }

    return true;
  }

  private validateStep1(): boolean {
    const email = this.formData.email || '';

    if (!email) {
      this.setError('email', 'Email is required');
      return false;
    }

    if (!utils.validateEmail(email)) {
      this.setError('email', 'Please enter a valid email address');
      return false;
    }

    return true;
  }

  private validateStep2(): boolean {
    const password = this.formData.password || '';
    const confirmPassword = this.formData.confirmPassword || '';

    const passwordError = utils.validatePassword(password);
    if (passwordError) {
      this.setError('password', passwordError);
      return false;
    }

    if (password !== confirmPassword) {
      this.setError('confirmPassword', 'Passwords do not match');
      return false;
    }

    return true;
  }

  private validateStep3(): boolean {
    // Profile step is optional, but validate if provided
    return true;
  }

  private nextStep() {
    if (!this.validateStep(this.currentStep)) {
      this.displayErrors();
      return;
    }

    if (this.currentStep < 3) {
      this.currentStep++;
      this.updateUI();
    }
  }

  private previousStep() {
    if (this.currentStep > 1) {
      this.currentStep--;
      this.updateUI();
    }
  }

  private submit() {
    if (!this.validateStep(this.currentStep)) {
      this.displayErrors();
      return;
    }

    // Emit custom event with form data
    this.dispatchEvent(
      new CustomEvent('formSubmit', {
        detail: this.formData,
        bubbles: true,
        composed: true,
      })
    );
  }

  private updateUI() {
    // Update step content visibility
    const steps = this.shadowRoot.querySelectorAll('.step-content');
    steps.forEach((step, index) => {
      if (index + 1 === this.currentStep) {
        step.classList.add('active');
      } else {
        step.classList.remove('active');
      }
    });

    // Update progress indicator
    const progressSteps = this.shadowRoot.querySelectorAll('.progress-step');
    progressSteps.forEach((step, index) => {
      if (index + 1 === this.currentStep) {
        step.classList.add('active');
        step.classList.remove('completed');
      } else if (index + 1 < this.currentStep) {
        step.classList.add('completed');
        step.classList.remove('active');
      } else {
        step.classList.remove('active', 'completed');
      }
    });

    // Update button visibility
    const prevBtn = this.shadowRoot.querySelector('[data-action="prev"]') as HTMLButtonElement;
    const nextBtn = this.shadowRoot.querySelector('[data-action="next"]') as HTMLButtonElement;
    const submitBtn = this.shadowRoot.querySelector('[data-action="submit"]') as HTMLButtonElement;

    if (this.currentStep === 1) {
      prevBtn.classList.add('hidden');
    } else {
      prevBtn.classList.remove('hidden');
    }

    if (this.currentStep === 3) {
      nextBtn.style.display = 'none';
      submitBtn.style.display = 'block';
    } else {
      nextBtn.style.display = 'block';
      submitBtn.style.display = 'none';
    }

    // Restore form data in inputs
    this.restoreFormData();

    // Clear errors when moving to new step
    this.clearAllErrors();
  }

  private restoreFormData() {
    const inputs = this.shadowRoot.querySelectorAll('input');
    inputs.forEach((input) => {
      const value = this.formData[input.name as keyof FormData];
      if (value) {
        input.value = value;
      }
    });
  }

  private setError(field: string, message: string) {
    this.errors[field] = message;
    const errorEl = this.shadowRoot.querySelector(`[data-error="${field}"]`) as HTMLElement;
    if (errorEl) {
      errorEl.textContent = message;
      errorEl.classList.add('show');
    }

    const input = this.shadowRoot.querySelector(`[name="${field}"]`) as HTMLInputElement;
    if (input) {
      input.classList.add('error');
    }
  }

  private clearError(field: string) {
    const errorEl = this.shadowRoot.querySelector(`[data-error="${field}"]`) as HTMLElement;
    if (errorEl) {
      errorEl.textContent = '';
      errorEl.classList.remove('show');
    }

    const input = this.shadowRoot.querySelector(`[name="${field}"]`) as HTMLInputElement;
    if (input) {
      input.classList.remove('error');
    }
  }

  private clearAllErrors() {
    const errorEls = this.shadowRoot.querySelectorAll('.error-message');
    errorEls.forEach((el) => {
      el.textContent = '';
      el.classList.remove('show');
    });

    const inputs = this.shadowRoot.querySelectorAll('input');
    inputs.forEach((input) => {
      input.classList.remove('error');
    });
  }

  private displayErrors() {
    Object.entries(this.errors).forEach(([field, message]) => {
      if (message) {
        this.setError(field, message);
      }
    });
  }

  // Public method to get form data
  getFormData(): Partial<FormData> {
    return { ...this.formData };
  }

  // Public method to reset form
  reset() {
    this.currentStep = 1;
    this.formData = {};
    this.errors = {};
    this.shadowRoot.querySelectorAll('input').forEach((input) => {
      input.value = '';
    });
    this.clearAllErrors();
    this.updateUI();
  }
}

// Register the custom element
if (!customElements.get('ui-registration-form')) {
  customElements.define('ui-registration-form', RegistrationForm);
}
