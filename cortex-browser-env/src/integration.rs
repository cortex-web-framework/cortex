/// Phase 7: Integration Testing - Component Testing with Rust Browser
///
/// This module implements integration tests for verifying that UI components
/// render correctly in the Rust headless browser environment. It tests:
/// - Component rendering and DOM structure
/// - Property access and manipulation
/// - Element querying with CSS selectors
/// - Visual regression testing (screenshots)
/// - Error handling and edge cases

use crate::parser;
use crate::layout;
use crate::render::render_document;
use crate::query::query_selector;
use crate::element::ElementRef;
use crate::error::{TestResult, TestSummary};

/// Test configuration for component integration testing
#[derive(Debug, Clone)]
pub struct ComponentTestConfig {
    pub name: String,
    pub html: String,
    pub expected_element: String,
    pub expected_classes: Vec<String>,
    pub viewport_width: f64,
    pub viewport_height: f64,
}

impl ComponentTestConfig {
    /// Create a new component test configuration
    pub fn new(name: &str, html: &str, expected_element: &str) -> Self {
        ComponentTestConfig {
            name: name.to_string(),
            html: html.to_string(),
            expected_element: expected_element.to_string(),
            expected_classes: Vec::new(),
            viewport_width: 1280.0,
            viewport_height: 720.0,
        }
    }

    /// Add expected CSS classes to verify
    pub fn with_classes(mut self, classes: Vec<&str>) -> Self {
        self.expected_classes = classes.iter().map(|c| c.to_string()).collect();
        self
    }

    /// Set custom viewport dimensions
    pub fn with_viewport(mut self, width: f64, height: f64) -> Self {
        self.viewport_width = width;
        self.viewport_height = height;
        self
    }
}

/// Render and test a component in the browser
pub fn test_component(config: ComponentTestConfig) -> TestResult {
    // Parse the component HTML
    let mut document = parser::parse_html(&config.html);

    // Calculate layout
    layout::calculate_layout(&mut document, config.viewport_width as f32, config.viewport_height as f32);

    // Render the component to a DrawTarget
    let _draw_target = render_document(
        &document,
        config.viewport_width as i32,
        config.viewport_height as i32,
    );

    // Query for the expected element
    match query_selector(&document, &config.expected_element) {
        Ok(Some(element_idx)) => {
            // Verify element exists
            let element_ref = ElementRef {
                index: element_idx,
            };

            // Verify classes if specified
            if !config.expected_classes.is_empty() {
                let class_str = element_ref
                    .get_attribute(&document, "class")
                    .unwrap_or_default();
                let has_all_classes = config
                    .expected_classes
                    .iter()
                    .all(|cls| class_str.contains(cls));

                if has_all_classes {
                    TestResult::success(
                        &config.name,
                        "Component rendered with correct classes",
                    )
                } else {
                    TestResult::failure_string(
                        &config.name,
                        "Component missing expected CSS classes",
                    )
                }
            } else {
                TestResult::success(
                    &config.name,
                    "Component rendered successfully",
                )
            }
        }
        Ok(None) => TestResult::failure_string(
            &config.name,
            &format!("Expected element '{}' not found", config.expected_element),
        ),
        Err(e) => TestResult::failure_string(
            &config.name,
            &format!("Query failed: {}", e),
        ),
    }
}

// ============================================================================
// TESTS (RED PHASE - TDD)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    // ========================================================================
    // TEXT INPUT COMPONENT TESTS
    // ========================================================================

    #[test]
    fn test_text_input_renders() {
        let html = r#"
            <html>
              <body>
                <input type="text" id="test-input" placeholder="Enter text">
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("text-input", html, "#test-input");
        let result = test_component(config);

        assert!(result.passed);
        assert_eq!(result.name, "text-input");
    }

    #[test]
    fn test_text_input_with_value() {
        let html = r#"
            <html>
              <body>
                <input type="text" id="test-input" value="Hello World" placeholder="Enter text">
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("text-input-value", html, "#test-input");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_text_input_with_label() {
        let html = r#"
            <html>
              <body>
                <label for="test-input">Username</label>
                <input type="text" id="test-input" placeholder="Enter username">
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("text-input-label", html, "label");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_button_component() {
        let html = r#"
            <html>
              <body>
                <button class="btn btn-primary">Click Me</button>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("button", html, "button")
            .with_classes(vec!["btn", "btn-primary"]);
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_card_component() {
        let html = r#"
            <html>
              <body>
                <div class="card">
                  <div class="card-header">Title</div>
                  <div class="card-body">Content</div>
                </div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("card", html, ".card");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_badge_component() {
        let html = r#"
            <html>
              <body>
                <span class="badge badge-success">Active</span>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("badge", html, ".badge")
            .with_classes(vec!["badge", "badge-success"]);
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_checkbox_component() {
        let html = r#"
            <html>
              <body>
                <input type="checkbox" id="cb" class="checkbox">
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("checkbox", html, "#cb");
        let result = test_component(config);

        assert!(result.passed);
    }

    // ========================================================================
    // COMPONENT LAYOUT TESTS
    // ========================================================================

    #[test]
    fn test_component_with_padding() {
        let html = r#"
            <html>
              <head>
                <style>
                  .container {
                    padding: 20px;
                  }
                </style>
              </head>
              <body>
                <div class="container">Content</div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("container-padding", html, ".container");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_component_with_margin() {
        let html = r#"
            <html>
              <head>
                <style>
                  .item {
                    margin: 10px;
                  }
                </style>
              </head>
              <body>
                <div class="item">Item</div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("item-margin", html, ".item");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_component_with_border() {
        let html = r#"
            <html>
              <head>
                <style>
                  .box {
                    border: 1px solid #333;
                  }
                </style>
              </head>
              <body>
                <div class="box">Box</div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("box-border", html, ".box");
        let result = test_component(config);

        assert!(result.passed);
    }

    // ========================================================================
    // COMPLEX COMPONENT TESTS
    // ========================================================================

    #[test]
    fn test_form_group_component() {
        let html = r#"
            <html>
              <body>
                <div class="form-group">
                  <label for="email">Email</label>
                  <input type="email" id="email" class="form-control">
                </div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("form-group", html, ".form-group");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_alert_component() {
        let html = r#"
            <html>
              <body>
                <div class="alert alert-warning">
                  <strong>Warning:</strong> This is important
                </div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("alert", html, ".alert")
            .with_classes(vec!["alert", "alert-warning"]);
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_list_component() {
        let html = r#"
            <html>
              <body>
                <ul class="list">
                  <li>Item 1</li>
                  <li>Item 2</li>
                  <li>Item 3</li>
                </ul>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("list", html, ".list");
        let result = test_component(config);

        assert!(result.passed);
    }

    // ========================================================================
    // EDGE CASES
    // ========================================================================

    #[test]
    fn test_empty_component() {
        let html = r#"
            <html>
              <body>
                <div id="empty"></div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("empty-div", html, "#empty");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_nested_components() {
        let html = r#"
            <html>
              <body>
                <div class="outer">
                  <div class="middle">
                    <div class="inner">Content</div>
                  </div>
                </div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("nested", html, ".outer");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_multiple_classes() {
        let html = r#"
            <html>
              <body>
                <div class="container row col-12 px-3">Content</div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("multi-class", html, ".container");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_component_with_attributes() {
        let html = r#"
            <html>
              <body>
                <input type="text" id="user" name="username" placeholder="Enter name" disabled>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("input-attrs", html, "#user");
        let result = test_component(config);

        assert!(result.passed);
    }

    #[test]
    fn test_custom_viewport() {
        let html = r#"
            <html>
              <body>
                <div class="responsive">Content</div>
              </body>
            </html>
        "#;

        let config = ComponentTestConfig::new("responsive", html, ".responsive")
            .with_viewport(768.0, 1024.0);
        let result = test_component(config);

        assert!(result.passed);
    }

    // ========================================================================
    // INTEGRATION TEST SUMMARY
    // ========================================================================

    #[test]
    fn test_component_integration_summary() {
        // This test generates a summary of all component tests
        let components = vec![
            ComponentTestConfig::new("test1", "<html><body><div class='test'>Test</div></body></html>", ".test"),
            ComponentTestConfig::new("test2", "<html><body><button>Click</button></body></html>", "button"),
            ComponentTestConfig::new("test3", "<html><body><input type='text'></body></html>", "input"),
        ];

        let mut summary = TestSummary::new();
        for config in components {
            let result = test_component(config);
            summary.add_result(result);
        }

        assert_eq!(summary.total, 3);
        assert_eq!(summary.passed, 3);
        assert_eq!(summary.failed, 0);
        assert_eq!(summary.exit_code(), 0);
    }
}

// ============================================================================
// VANILLA WEB COMPONENTS TESTS (Zero Dependencies)
// ============================================================================

#[cfg(test)]
mod vanilla_components {
    use crate::{parser, layout, render, screenshot};
    use std::path::Path;

    #[test]
    fn test_vanilla_ui_text_input_basic() {
        let html = r#"
            <html>
            <body>
                <ui-text-input id="username" label="Username" placeholder="Enter username"></ui-text-input>
            </body>
            </html>
        "#;

        let mut document = parser::parse_html(html);
        layout::calculate_layout(&mut document, 800.0, 400.0);
        let draw_target = render::render_document(&document, 800, 400);

        let screenshot_result = screenshot::save_screenshot(
            &draw_target,
            Path::new("/tmp/vanilla_text_input_basic.png")
        );

        assert!(screenshot_result.is_ok());
    }

    #[test]
    fn test_vanilla_multiple_input_types() {
        let html = r#"
            <html>
            <body>
                <ui-text-input label="Text" type="text"></ui-text-input>
                <ui-text-input label="Email" type="email"></ui-text-input>
                <ui-text-input label="Password" type="password"></ui-text-input>
            </body>
            </html>
        "#;

        let mut document = parser::parse_html(html);
        layout::calculate_layout(&mut document, 800.0, 400.0);
        let draw_target = render::render_document(&document, 800, 400);

        let screenshot_result = screenshot::save_screenshot(
            &draw_target,
            Path::new("/tmp/vanilla_input_types.png")
        );

        assert!(screenshot_result.is_ok());
    }

    #[test]
    fn test_vanilla_disabled_field() {
        let html = r#"
            <html>
            <body>
                <ui-text-input label="Enabled" value="Can type"></ui-text-input>
                <ui-text-input label="Disabled" value="Cannot type" disabled></ui-text-input>
            </body>
            </html>
        "#;

        let mut document = parser::parse_html(html);
        layout::calculate_layout(&mut document, 800.0, 400.0);
        let draw_target = render::render_document(&document, 800, 400);

        let screenshot_result = screenshot::save_screenshot(
            &draw_target,
            Path::new("/tmp/vanilla_disabled.png")
        );

        assert!(screenshot_result.is_ok());
    }

    #[test]
    fn test_vanilla_form_layout() {
        let html = r#"
            <html>
            <head>
                <style>
                    body { padding: 20px; font-family: Arial; }
                    h1 { color: #333; }
                    ui-text-input { display: block; margin-bottom: 20px; }
                </style>
            </head>
            <body>
                <h1>Contact Form</h1>
                <ui-text-input label="Name" placeholder="Your name"></ui-text-input>
                <ui-text-input label="Email" type="email" placeholder="your@email.com"></ui-text-input>
                <ui-text-input label="Phone" type="tel" placeholder="+1 (555) 000-0000"></ui-text-input>
            </body>
            </html>
        "#;

        let mut document = parser::parse_html(html);
        layout::calculate_layout(&mut document, 1000.0, 600.0);
        let draw_target = render::render_document(&document, 1000, 600);

        let screenshot_result = screenshot::save_screenshot(
            &draw_target,
            Path::new("/tmp/vanilla_form_layout.png")
        );

        assert!(screenshot_result.is_ok());
    }
}
