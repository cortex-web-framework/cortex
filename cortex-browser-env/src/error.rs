/// Error Handling and Reporting System
/// Provides structured error types, stack traces, and exit codes

use std::fmt;

/// Error type for browser operations
#[derive(Debug, Clone, PartialEq)]
pub enum BrowserError {
    ParseError(String),
    LayoutError(String),
    RenderError(String),
    ScreenshotError(String),
    DOMError(String),
    QueryError(String),
    ElementError(String),
    JavaScriptError(String, Option<String>), // message, optional stack trace
    InvalidOperationError(String),
    NotFoundError(String),
}

impl fmt::Display for BrowserError {
    fn fmt(&self, f: &mut fmt::Formatter) -> fmt::Result {
        match self {
            BrowserError::ParseError(msg) => write!(f, "Parse Error: {}", msg),
            BrowserError::LayoutError(msg) => write!(f, "Layout Error: {}", msg),
            BrowserError::RenderError(msg) => write!(f, "Render Error: {}", msg),
            BrowserError::ScreenshotError(msg) => write!(f, "Screenshot Error: {}", msg),
            BrowserError::DOMError(msg) => write!(f, "DOM Error: {}", msg),
            BrowserError::QueryError(msg) => write!(f, "Query Error: {}", msg),
            BrowserError::ElementError(msg) => write!(f, "Element Error: {}", msg),
            BrowserError::JavaScriptError(msg, _stack) => {
                write!(f, "JavaScript Error: {}", msg)
            }
            BrowserError::InvalidOperationError(msg) => {
                write!(f, "Invalid Operation: {}", msg)
            }
            BrowserError::NotFoundError(msg) => write!(f, "Not Found: {}", msg),
        }
    }
}

impl std::error::Error for BrowserError {}

/// Test result representing success or failure
#[derive(Debug, Clone, PartialEq)]
pub struct TestResult {
    pub name: String,
    pub passed: bool,
    pub message: String,
    pub error: Option<BrowserError>,
}

impl TestResult {
    /// Create a successful test result
    pub fn success(name: &str, message: &str) -> Self {
        TestResult {
            name: name.to_string(),
            passed: true,
            message: message.to_string(),
            error: None,
        }
    }

    /// Create a failed test result
    pub fn failure(name: &str, message: &str, error: BrowserError) -> Self {
        TestResult {
            name: name.to_string(),
            passed: false,
            message: message.to_string(),
            error: Some(error),
        }
    }

    /// Create a failed test result from a string error message
    pub fn failure_string(name: &str, message: &str) -> Self {
        TestResult {
            name: name.to_string(),
            passed: false,
            message: message.to_string(),
            error: Some(BrowserError::InvalidOperationError(message.to_string())),
        }
    }

    /// Get the exit code for this result (0 = success, 1 = failure)
    pub fn exit_code(&self) -> i32 {
        if self.passed { 0 } else { 1 }
    }
}

/// Test summary for a batch of tests
#[derive(Debug, Clone)]
pub struct TestSummary {
    pub total: usize,
    pub passed: usize,
    pub failed: usize,
    pub results: Vec<TestResult>,
}

impl TestSummary {
    /// Create an empty summary
    pub fn new() -> Self {
        TestSummary {
            total: 0,
            passed: 0,
            failed: 0,
            results: Vec::new(),
        }
    }

    /// Add a test result to the summary
    pub fn add_result(&mut self, result: TestResult) {
        if result.passed {
            self.passed += 1;
        } else {
            self.failed += 1;
        }
        self.total += 1;
        self.results.push(result);
    }

    /// Get the overall exit code (0 = all passed, 1 = any failed)
    pub fn exit_code(&self) -> i32 {
        if self.failed > 0 { 1 } else { 0 }
    }

    /// Format the summary as a human-readable string
    pub fn format_summary(&self) -> String {
        let mut output = format!(
            "Test Results: {}/{} passed, {} failed\n",
            self.passed, self.total, self.failed
        );

        if self.failed > 0 {
            output.push_str("\nFailures:\n");
            for result in &self.results {
                if !result.passed {
                    output.push_str(&format!("  ❌ {}: {}\n", result.name, result.message));
                    if let Some(ref error) = result.error {
                        output.push_str(&format!("     {}\n", error));
                    }
                }
            }
        }

        output
    }

    /// Get all passed tests
    pub fn passed_tests(&self) -> Vec<&TestResult> {
        self.results.iter().filter(|r| r.passed).collect()
    }

    /// Get all failed tests
    pub fn failed_tests(&self) -> Vec<&TestResult> {
        self.results.iter().filter(|r| !r.passed).collect()
    }
}

// ============================================================================
// TESTS (RED PHASE - TDD)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    // ========================================================================
    // ERROR TYPE CREATION AND DISPLAY
    // ========================================================================

    #[test]
    fn test_parse_error_creation() {
        // Given: An error message
        let msg = "Invalid HTML syntax";

        // When: We create a parse error
        let error = BrowserError::ParseError(msg.to_string());

        // Then: It should display correctly
        assert_eq!(error.to_string(), "Parse Error: Invalid HTML syntax");
    }

    #[test]
    fn test_layout_error_creation() {
        // Given: An error message
        let msg = "Invalid box model";

        // When: We create a layout error
        let error = BrowserError::LayoutError(msg.to_string());

        // Then: It should display correctly
        assert_eq!(error.to_string(), "Layout Error: Invalid box model");
    }

    #[test]
    fn test_render_error_creation() {
        // Given: An error message
        let msg = "DrawTarget creation failed";

        // When: We create a render error
        let error = BrowserError::RenderError(msg.to_string());

        // Then: It should display correctly
        assert_eq!(
            error.to_string(),
            "Render Error: DrawTarget creation failed"
        );
    }

    #[test]
    fn test_javascript_error_with_stack() {
        // Given: A JavaScript error with stack trace
        let msg = "undefined is not a function";
        let stack = Some("at test.js:42".to_string());

        // When: We create a JavaScript error
        let error = BrowserError::JavaScriptError(msg.to_string(), stack);

        // Then: It should display the message
        assert_eq!(error.to_string(), "JavaScript Error: undefined is not a function");
    }

    #[test]
    fn test_error_equality() {
        // Given: Two identical errors
        let error1 = BrowserError::QueryError("selector not found".to_string());
        let error2 = BrowserError::QueryError("selector not found".to_string());

        // When: We compare them
        let equal = error1 == error2;

        // Then: They should be equal
        assert!(equal);
    }

    // ========================================================================
    // TEST RESULT CREATION
    // ========================================================================

    #[test]
    fn test_create_successful_result() {
        // Given: Test metadata
        let name = "test_foo";
        let message = "All assertions passed";

        // When: We create a success result
        let result = TestResult::success(name, message);

        // Then: It should be marked as passed
        assert!(result.passed);
        assert_eq!(result.name, "test_foo");
        assert_eq!(result.message, "All assertions passed");
        assert_eq!(result.error, None);
    }

    #[test]
    fn test_create_failed_result() {
        // Given: Test metadata and error
        let name = "test_bar";
        let message = "Assertion failed";
        let error = BrowserError::ElementError("Element not found".to_string());

        // When: We create a failure result
        let result = TestResult::failure(name, message, error);

        // Then: It should be marked as failed
        assert!(!result.passed);
        assert_eq!(result.name, "test_bar");
        assert_eq!(result.message, "Assertion failed");
        assert!(result.error.is_some());
    }

    #[test]
    fn test_failed_result_from_string() {
        // Given: Test metadata
        let name = "test_baz";
        let message = "Something went wrong";

        // When: We create a failure result from string
        let result = TestResult::failure_string(name, message);

        // Then: It should be failed
        assert!(!result.passed);
        assert_eq!(result.name, "test_baz");
        assert!(result.error.is_some());
    }

    // ========================================================================
    // EXIT CODES
    // ========================================================================

    #[test]
    fn test_success_result_exit_code() {
        // Given: A successful test result
        let result = TestResult::success("test", "passed");

        // When: We get the exit code
        let code = result.exit_code();

        // Then: Should be 0
        assert_eq!(code, 0);
    }

    #[test]
    fn test_failure_result_exit_code() {
        // Given: A failed test result
        let error = BrowserError::InvalidOperationError("test failed".to_string());
        let result = TestResult::failure("test", "failed", error);

        // When: We get the exit code
        let code = result.exit_code();

        // Then: Should be 1
        assert_eq!(code, 1);
    }

    // ========================================================================
    // TEST SUMMARY
    // ========================================================================

    #[test]
    fn test_create_empty_summary() {
        // Given: Nothing
        // When: We create an empty summary
        let summary = TestSummary::new();

        // Then: It should have zero tests
        assert_eq!(summary.total, 0);
        assert_eq!(summary.passed, 0);
        assert_eq!(summary.failed, 0);
    }

    #[test]
    fn test_add_result_to_summary() {
        // Given: A summary
        let mut summary = TestSummary::new();
        let result = TestResult::success("test1", "passed");

        // When: We add a result
        summary.add_result(result);

        // Then: Counts should be updated
        assert_eq!(summary.total, 1);
        assert_eq!(summary.passed, 1);
        assert_eq!(summary.failed, 0);
    }

    #[test]
    fn test_add_failed_result_to_summary() {
        // Given: A summary
        let mut summary = TestSummary::new();
        let error = BrowserError::QueryError("failed".to_string());
        let result = TestResult::failure("test1", "failed", error);

        // When: We add a failed result
        summary.add_result(result);

        // Then: Counts should be updated correctly
        assert_eq!(summary.total, 1);
        assert_eq!(summary.passed, 0);
        assert_eq!(summary.failed, 1);
    }

    #[test]
    fn test_summary_with_mixed_results() {
        // Given: A summary
        let mut summary = TestSummary::new();

        // When: We add both passing and failing results
        summary.add_result(TestResult::success("test1", "passed"));
        summary.add_result(TestResult::failure_string("test2", "failed"));
        summary.add_result(TestResult::success("test3", "passed"));

        // Then: Counts should reflect both
        assert_eq!(summary.total, 3);
        assert_eq!(summary.passed, 2);
        assert_eq!(summary.failed, 1);
    }

    #[test]
    fn test_summary_exit_code_all_passed() {
        // Given: A summary with all passing tests
        let mut summary = TestSummary::new();
        summary.add_result(TestResult::success("test1", "passed"));
        summary.add_result(TestResult::success("test2", "passed"));

        // When: We get the exit code
        let code = summary.exit_code();

        // Then: Should be 0
        assert_eq!(code, 0);
    }

    #[test]
    fn test_summary_exit_code_with_failure() {
        // Given: A summary with at least one failure
        let mut summary = TestSummary::new();
        summary.add_result(TestResult::success("test1", "passed"));
        summary.add_result(TestResult::failure_string("test2", "failed"));

        // When: We get the exit code
        let code = summary.exit_code();

        // Then: Should be 1
        assert_eq!(code, 1);
    }

    #[test]
    fn test_summary_format() {
        // Given: A summary with mixed results
        let mut summary = TestSummary::new();
        summary.add_result(TestResult::success("test1", "passed"));
        summary.add_result(TestResult::failure_string("test2", "failed"));

        // When: We format the summary
        let formatted = summary.format_summary();

        // Then: Should contain test counts
        assert!(formatted.contains("1/2 passed"));
        assert!(formatted.contains("1 failed"));
    }

    #[test]
    fn test_passed_tests_filter() {
        // Given: A summary with mixed results
        let mut summary = TestSummary::new();
        summary.add_result(TestResult::success("test1", "passed"));
        summary.add_result(TestResult::failure_string("test2", "failed"));
        summary.add_result(TestResult::success("test3", "passed"));

        // When: We get passed tests
        let passed = summary.passed_tests();

        // Then: Should have 2 passed tests
        assert_eq!(passed.len(), 2);
        assert!(passed[0].passed);
        assert!(passed[1].passed);
    }

    #[test]
    fn test_failed_tests_filter() {
        // Given: A summary with mixed results
        let mut summary = TestSummary::new();
        summary.add_result(TestResult::success("test1", "passed"));
        summary.add_result(TestResult::failure_string("test2", "failed"));
        summary.add_result(TestResult::success("test3", "passed"));

        // When: We get failed tests
        let failed = summary.failed_tests();

        // Then: Should have 1 failed test
        assert_eq!(failed.len(), 1);
        assert!(!failed[0].passed);
    }

    // ========================================================================
    // ERROR CATEGORIZATION
    // ========================================================================

    #[test]
    fn test_all_error_types() {
        // Given: Different error types
        let errors = vec![
            BrowserError::ParseError("parse".to_string()),
            BrowserError::LayoutError("layout".to_string()),
            BrowserError::RenderError("render".to_string()),
            BrowserError::ScreenshotError("screenshot".to_string()),
            BrowserError::DOMError("dom".to_string()),
            BrowserError::QueryError("query".to_string()),
            BrowserError::ElementError("element".to_string()),
            BrowserError::JavaScriptError("js".to_string(), None),
            BrowserError::InvalidOperationError("invalid".to_string()),
            BrowserError::NotFoundError("not found".to_string()),
        ];

        // When: We iterate through them
        for error in errors {
            // Then: Each should have a string representation
            assert!(!error.to_string().is_empty());
        }
    }

    #[test]
    fn test_javascript_error_with_and_without_stack() {
        // Given: Two JavaScript errors
        let error_with_stack = BrowserError::JavaScriptError(
            "error".to_string(),
            Some("stack trace".to_string()),
        );
        let error_without_stack = BrowserError::JavaScriptError("error".to_string(), None);

        // When: We create them
        // Then: Both should be creatable
        assert_eq!(error_with_stack.to_string(), "JavaScript Error: error");
        assert_eq!(error_without_stack.to_string(), "JavaScript Error: error");
    }

    // ========================================================================
    // EDGE CASES
    // ========================================================================

    #[test]
    fn test_empty_error_message() {
        // Given: An empty error message
        let error = BrowserError::QueryError(String::new());

        // When: We display it
        let display = error.to_string();

        // Then: Should still format correctly
        assert_eq!(display, "Query Error: ");
    }

    #[test]
    fn test_very_long_error_message() {
        // Given: A very long error message
        let long_msg = "x".repeat(1000);
        let error = BrowserError::ElementError(long_msg.clone());

        // When: We create the error
        let display = error.to_string();

        // Then: Should contain the full message
        assert!(display.len() > 1000);
    }

    #[test]
    fn test_special_characters_in_error() {
        // Given: Error with special characters
        let msg = "Error with \"quotes\" and 'apostrophes' and \n newlines";
        let error = BrowserError::DOMError(msg.to_string());

        // When: We display it
        let display = error.to_string();

        // Then: Should preserve special characters
        assert!(display.contains("quotes"));
        assert!(display.contains("apostrophes"));
    }

    #[test]
    fn test_error_clone() {
        // Given: An error
        let error = BrowserError::RenderError("test error".to_string());

        // When: We clone it
        let cloned = error.clone();

        // Then: Both should be equal
        assert_eq!(error, cloned);
    }

    #[test]
    fn test_result_clone() {
        // Given: A test result
        let result = TestResult::success("test", "passed");

        // When: We clone it
        let cloned = result.clone();

        // Then: Both should be equal
        assert_eq!(result, cloned);
    }
}
