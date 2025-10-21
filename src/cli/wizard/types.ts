/**
 * Interactive Wizard Types
 * Zero dependencies, strictest TypeScript configuration
 */

/**
 * Wizard step types
 */
export type WizardStepType = 'input' | 'password' | 'select' | 'multiSelect' | 'confirm' | 'number' | 'email' | 'url';

/**
 * Wizard step validation result
 */
export interface WizardValidationResult {
  readonly valid: boolean;
  readonly message?: string;
}

/**
 * Wizard step configuration
 */
export interface WizardStep {
  readonly id: string;
  readonly title: string;
  readonly description?: string;
  readonly type: WizardStepType;
  readonly prompt: string;
  readonly required?: boolean;
  readonly defaultValue?: unknown;
  readonly choices?: readonly string[];
  readonly validate?: (value: unknown) => boolean | WizardValidationResult;
  readonly transform?: (value: unknown) => unknown;
  readonly execute?: (value: unknown, context: Record<string, unknown>) => Promise<unknown>;
  readonly condition?: (context: Record<string, unknown>) => boolean;
}

/**
 * Wizard configuration
 */
export interface WizardConfig {
  readonly title: string;
  readonly description: string;
  readonly steps: readonly WizardStep[];
  readonly onComplete?: (results: Record<string, unknown>) => Promise<void>;
  readonly onCancel?: () => Promise<void>;
  readonly onError?: (error: Error) => Promise<void>;
}

/**
 * Wizard execution context
 */
export interface WizardContext {
  readonly stepIndex: number;
  readonly results: Record<string, unknown>;
  readonly errors: Record<string, string>;
  readonly isComplete: boolean;
  readonly isCancelled: boolean;
}

/**
 * Wizard execution result
 */
export interface WizardResult {
  readonly success: boolean;
  readonly results: Record<string, unknown>;
  readonly errors: Record<string, string>;
  readonly cancelled: boolean;
}

/**
 * Terminal configuration
 */
export interface TerminalConfig {
  readonly width: number;
  readonly height: number;
  readonly colors: boolean;
  readonly animations: boolean;
  readonly theme?: 'default' | 'dark' | 'light';
}

/**
 * Animation configuration
 */
export interface AnimationConfig {
  readonly duration: number;
  readonly frames: readonly string[];
  readonly loop: boolean;
}

/**
 * Menu configuration
 */
export interface MenuConfig {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly options: readonly string[];
  readonly selectedIndex: number;
  readonly multiSelect: boolean;
  readonly selectedIndices: readonly number[];
}

/**
 * Progress bar configuration
 */
export interface ProgressBarConfig {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly progress: number; // 0.0 to 1.0
  readonly label?: string;
  readonly showPercentage: boolean;
}

/**
 * Table configuration
 */
export interface TableConfig {
  readonly x: number;
  readonly y: number;
  readonly data: readonly (readonly string[])[];
  readonly headers?: readonly string[];
  readonly columnWidths?: readonly number[];
  readonly border: boolean;
  readonly headerStyle?: 'bold' | 'underline' | 'normal';
}

/**
 * Box configuration
 */
export interface BoxConfig {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly title?: string;
  readonly borderStyle: 'single' | 'double' | 'rounded';
  readonly fill: boolean;
}

/**
 * Spinner configuration
 */
export interface SpinnerConfig {
  readonly x: number;
  readonly y: number;
  readonly frame: number;
  readonly style: 'dots' | 'bars' | 'arrows' | 'clock';
}

/**
 * Banner configuration
 */
export interface BannerConfig {
  readonly text: string;
  readonly style: 'block' | 'outline' | 'shadow' | '3d';
  readonly color: 'default' | 'red' | 'green' | 'blue' | 'yellow' | 'magenta' | 'cyan';
  readonly animation?: 'none' | 'fade' | 'slide' | 'typewriter';
}

/**
 * Wizard event types
 */
export type WizardEventType = 'step-start' | 'step-complete' | 'step-error' | 'wizard-complete' | 'wizard-cancel' | 'wizard-error';

/**
 * Wizard event
 */
export interface WizardEvent {
  readonly type: WizardEventType;
  readonly stepId?: string;
  readonly data?: unknown;
  readonly timestamp: number;
}

/**
 * Wizard event handler
 */
export type WizardEventHandler = (event: WizardEvent) => void | Promise<void>;