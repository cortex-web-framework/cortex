use super::dom::{Document, Layout, Display, NodeType};
use super::css::ComputedStyle;

/// Calculate layout for all nodes in the document using the box model
/// This walks the DOM tree and computes layout dimensions based on CSS styles
pub fn calculate_layout(document: &mut Document, viewport_width: f32, viewport_height: f32) {
    if document.nodes.is_empty() {
        return;
    }

    let root_idx = document.root;
    let mut styles = vec![ComputedStyle::default(); document.nodes.len()];

    calculate_layout_recursive(document, root_idx, &mut styles, viewport_width, viewport_height);
}

fn calculate_layout_recursive(
    document: &mut Document,
    node_idx: usize,
    styles: &mut [ComputedStyle],
    parent_width: f32,
    parent_height: f32,
) {
    let node = &document.nodes[node_idx];
    let style = &styles[node_idx];

    // Calculate dimensions
    let (width, height) = calculate_dimensions(
        style,
        parent_width,
        parent_height,
        node,
    );

    // Get box model values with defaults
    let padding_top = style.padding_top.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);
    let padding_right = style.padding_right.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);
    let padding_bottom = style.padding_bottom.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);
    let padding_left = style.padding_left.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);

    let margin_top = style.margin_top.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);
    let margin_right = style.margin_right.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);
    let margin_bottom = style.margin_bottom.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);
    let margin_left = style.margin_left.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);

    let border_width = style.border_width.as_ref().map(|v| v.as_pixels(parent_width)).unwrap_or(0.0);

    // Calculate content area
    let content_width = (width - padding_left - padding_right - (2.0 * border_width)).max(0.0);
    let content_height = (height - padding_top - padding_bottom - (2.0 * border_width)).max(0.0);

    // Calculate font size
    let font_size = style.font_size.as_ref().map(|v| v.as_pixels(16.0)).unwrap_or(16.0);

    // Create layout struct
    let layout = Layout {
        x: margin_left,
        y: margin_top,
        width,
        height,
        content_width,
        content_height,
        padding_top,
        padding_right,
        padding_bottom,
        padding_left,
        margin_top,
        margin_right,
        margin_bottom,
        margin_left,
        border_width,
        font_size,
        display: style.display.clone(),
    };

    document.nodes[node_idx].layout = Some(layout);

    // Recursively layout children
    if style.display == Display::Flex {
        layout_flex_children(document, node_idx, styles, content_width, content_height);
    } else {
        let children = document.nodes[node_idx].children.clone();
        for child_idx in children {
            calculate_layout_recursive(document, child_idx, styles, content_width, content_height);
        }
    }
}

fn layout_flex_children(
    document: &mut Document,
    node_idx: usize,
    styles: &mut [ComputedStyle],
    parent_width: f32,
    parent_height: f32,
) {
    let node = &document.nodes[node_idx].clone();
    let mut current_x = 0.0;

    for &child_idx in &node.children {
        // First, calculate the child's own layout
        calculate_layout_recursive(document, child_idx, styles, parent_width, parent_height);

        // Now, adjust its position based on flex layout
        if let Some(child_layout) = document.nodes[child_idx].layout.as_mut() {
            child_layout.x = current_x;
            current_x += child_layout.width;
        }
    }
}

fn calculate_dimensions(
    style: &ComputedStyle,
    parent_width: f32,
    parent_height: f32,
    node: &super::dom::Node,
) -> (f32, f32) {
    let width = match &style.width {
        Some(v) => v.as_pixels(parent_width),
        None => {
            // Default: use parent width or minimum
            match style.display {
                Display::Block => parent_width.max(100.0),
                Display::Inline | Display::InlineBlock => 100.0,
                _ => 100.0,
            }
        }
    };

    let height = match &style.height {
        Some(v) => v.as_pixels(parent_height),
        None => {
            // Calculate height based on content
            match &node.node_type {
                NodeType::Text => {
                    let font_size = style.font_size.as_ref().map(|v| v.as_pixels(16.0)).unwrap_or(16.0);
                    font_size * 1.5 // Line height
                }
                _ => 100.0, // Default height
            }
        }
    };

    (width, height)
}

// ============================================================================
// TESTS (RED PHASE - TDD)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use super::super::css::CSSValue;

    // ========================================================================
    // BOX MODEL TESTS
    // ========================================================================

    #[test]
    fn test_layout_creates_layout_struct() {
        // Given: A simple document with one element
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        // When: We calculate layout
        calculate_layout(&mut doc, 1024.0, 768.0);

        // Then: The element should have a layout
        let layout = doc.nodes[elem_idx].layout.as_ref();
        assert!(layout.is_some());
    }

    #[test]
    fn test_layout_calculates_element_width() {
        // Given: An element with explicit width
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        // Manually set computed style (simulating CSS application)
        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].width = Some(CSSValue::Pixels(200.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Width should be 200px
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.width, 200.0);
    }

    #[test]
    fn test_layout_calculates_element_height() {
        // Given: An element with explicit height
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].height = Some(CSSValue::Pixels(150.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Height should be 150px
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.height, 150.0);
    }

    #[test]
    fn test_layout_applies_padding() {
        // Given: An element with padding
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].width = Some(CSSValue::Pixels(200.0));
        styles[elem_idx].height = Some(CSSValue::Pixels(100.0));
        styles[elem_idx].padding_top = Some(CSSValue::Pixels(10.0));
        styles[elem_idx].padding_right = Some(CSSValue::Pixels(10.0));
        styles[elem_idx].padding_bottom = Some(CSSValue::Pixels(10.0));
        styles[elem_idx].padding_left = Some(CSSValue::Pixels(10.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Content area should be reduced by padding
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.padding_top, 10.0);
        assert_eq!(layout.padding_right, 10.0);
        assert_eq!(layout.padding_bottom, 10.0);
        assert_eq!(layout.padding_left, 10.0);
        assert_eq!(layout.content_width, 180.0); // 200 - 10 - 10
        assert_eq!(layout.content_height, 80.0);  // 100 - 10 - 10
    }

    #[test]
    fn test_layout_applies_margin() {
        // Given: An element with margin
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].margin_top = Some(CSSValue::Pixels(20.0));
        styles[elem_idx].margin_right = Some(CSSValue::Pixels(20.0));
        styles[elem_idx].margin_bottom = Some(CSSValue::Pixels(20.0));
        styles[elem_idx].margin_left = Some(CSSValue::Pixels(20.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Position should include margin offset
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.margin_top, 20.0);
        assert_eq!(layout.margin_left, 20.0);
        assert_eq!(layout.x, 20.0);
        assert_eq!(layout.y, 20.0);
    }

    #[test]
    fn test_layout_applies_border() {
        // Given: An element with border width
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].width = Some(CSSValue::Pixels(100.0));
        styles[elem_idx].height = Some(CSSValue::Pixels(100.0));
        styles[elem_idx].border_width = Some(CSSValue::Pixels(5.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Content area should account for border
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.border_width, 5.0);
        assert_eq!(layout.content_width, 90.0); // 100 - 5 - 5
        assert_eq!(layout.content_height, 90.0);
    }

    #[test]
    fn test_layout_combined_box_model() {
        // Given: An element with padding, margin, and border
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].width = Some(CSSValue::Pixels(200.0));
        styles[elem_idx].height = Some(CSSValue::Pixels(150.0));
        styles[elem_idx].padding_top = Some(CSSValue::Pixels(10.0));
        styles[elem_idx].padding_right = Some(CSSValue::Pixels(10.0));
        styles[elem_idx].padding_bottom = Some(CSSValue::Pixels(10.0));
        styles[elem_idx].padding_left = Some(CSSValue::Pixels(10.0));
        styles[elem_idx].margin_top = Some(CSSValue::Pixels(20.0));
        styles[elem_idx].margin_left = Some(CSSValue::Pixels(20.0));
        styles[elem_idx].border_width = Some(CSSValue::Pixels(2.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: All values should be correctly calculated
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.x, 20.0);      // margin_left
        assert_eq!(layout.y, 20.0);      // margin_top
        assert_eq!(layout.width, 200.0); // explicit
        assert_eq!(layout.padding_left, 10.0);
        assert_eq!(layout.border_width, 2.0);
        assert_eq!(layout.content_width, 176.0); // 200 - 10 - 10 - 2 - 2
    }

    // ========================================================================
    // TEXT AND FONT TESTS
    // ========================================================================

    #[test]
    fn test_layout_text_node_height() {
        // Given: A text node with font size
        let mut doc = Document::new();
        let text_idx = doc.create_text_node("Hello World");
        doc.append_child(doc.root, text_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[text_idx].font_size = Some(CSSValue::Pixels(16.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Height should be font_size * 1.5 (line height)
        let layout = doc.nodes[text_idx].layout.as_ref().unwrap();
        assert_eq!(layout.font_size, 16.0);
        assert_eq!(layout.height, 24.0); // 16 * 1.5
    }

    #[test]
    fn test_layout_default_font_size() {
        // Given: A text node without explicit font size
        let mut doc = Document::new();
        let text_idx = doc.create_text_node("Text");
        doc.append_child(doc.root, text_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        // Default font size is 16px from ComputedStyle::default()

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Font size should be default 16px
        let layout = doc.nodes[text_idx].layout.as_ref().unwrap();
        assert_eq!(layout.font_size, 16.0);
    }

    // ========================================================================
    // NESTED ELEMENTS AND CHILDREN TESTS
    // ========================================================================

    #[test]
    fn test_layout_nested_elements() {
        // Given: Parent and child elements
        let mut doc = Document::new();
        let parent_idx = doc.create_element("div");
        let child_idx = doc.create_element("span");
        doc.append_child(doc.root, parent_idx);
        doc.append_child(parent_idx, child_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[parent_idx].width = Some(CSSValue::Pixels(400.0));
        styles[parent_idx].height = Some(CSSValue::Pixels(300.0));
        styles[child_idx].width = Some(CSSValue::Pixels(100.0));
        styles[child_idx].height = Some(CSSValue::Pixels(50.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Both should have layouts
        let parent_layout = doc.nodes[parent_idx].layout.as_ref().unwrap();
        let child_layout = doc.nodes[child_idx].layout.as_ref().unwrap();
        assert_eq!(parent_layout.width, 400.0);
        assert_eq!(child_layout.width, 100.0);
    }

    #[test]
    fn test_layout_child_inherits_parent_content_area() {
        // Given: Parent with padding, child should layout in content area
        let mut doc = Document::new();
        let parent_idx = doc.create_element("div");
        let child_idx = doc.create_element("div");
        doc.append_child(doc.root, parent_idx);
        doc.append_child(parent_idx, child_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[parent_idx].width = Some(CSSValue::Pixels(200.0));
        styles[parent_idx].padding_top = Some(CSSValue::Pixels(20.0));
        styles[parent_idx].padding_left = Some(CSSValue::Pixels(20.0));
        styles[child_idx].width = Some(CSSValue::Pixels(100.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Child's layout should be based on parent's content area
        let parent_layout = doc.nodes[parent_idx].layout.as_ref().unwrap();
        let child_layout = doc.nodes[child_idx].layout.as_ref().unwrap();
        assert_eq!(parent_layout.content_width, 180.0); // 200 - 20 (left padding) - 0 (right)
        assert_eq!(child_layout.width, 100.0);
    }

    #[test]
    fn test_layout_multiple_children() {
        // Given: Parent with multiple children
        let mut doc = Document::new();
        let parent_idx = doc.create_element("div");
        let child1_idx = doc.create_element("span");
        let child2_idx = doc.create_element("span");
        doc.append_child(doc.root, parent_idx);
        doc.append_child(parent_idx, child1_idx);
        doc.append_child(parent_idx, child2_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[parent_idx].width = Some(CSSValue::Pixels(300.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: All children should have layouts
        assert!(doc.nodes[child1_idx].layout.is_some());
        assert!(doc.nodes[child2_idx].layout.is_some());
    }

    // ========================================================================
    // DISPLAY PROPERTY TESTS
    // ========================================================================

    #[test]
    fn test_layout_display_block() {
        // Given: An element with display: block
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].display = Display::Block;

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Display should be Block
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.display, Display::Block);
    }

    #[test]
    fn test_layout_display_inline() {
        // Given: An element with display: inline
        let mut doc = Document::new();
        let elem_idx = doc.create_element("span");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].display = Display::Inline;

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Display should be Inline
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.display, Display::Inline);
    }

    // ========================================================================
    // EDGE CASES AND VALIDATION TESTS
    // ========================================================================

    #[test]
    fn test_layout_zero_dimension_element() {
        // Given: An element with zero width
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].width = Some(CSSValue::Pixels(0.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Layout should have zero width
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert_eq!(layout.width, 0.0);
    }

    #[test]
    fn test_layout_content_width_never_negative() {
        // Given: An element with large padding exceeding width
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].width = Some(CSSValue::Pixels(50.0));
        styles[elem_idx].padding_left = Some(CSSValue::Pixels(100.0));

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Content width should not be negative
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        assert!(layout.content_width >= 0.0);
    }

    #[test]
    fn test_layout_percentage_width() {
        // Given: A child element with percentage width
        let mut doc = Document::new();
        let parent_idx = doc.create_element("div");
        let child_idx = doc.create_element("div");
        doc.append_child(doc.root, parent_idx);
        doc.append_child(parent_idx, child_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[parent_idx].width = Some(CSSValue::Pixels(400.0));
        styles[child_idx].width = Some(CSSValue::Percentage(50.0)); // 50% of 400 = 200

        // When: We calculate layout
        let root_idx = doc.root;
        calculate_layout_recursive(&mut doc, root_idx, &mut styles, 1024.0, 768.0);

        // Then: Child width should be 50% of parent width (200px)
        let child_layout = doc.nodes[child_idx].layout.as_ref().unwrap();
        assert_eq!(child_layout.width, 200.0);
    }

    #[test]
        fn test_layout_empty_document() {
            // Given: An empty document
            let mut doc = Document::new();
    
            // When: We calculate layout
            calculate_layout(&mut doc, 1024.0, 768.0);
    
            // Then: Should not panic (graceful handling)
            assert_eq!(doc.nodes.len(), 1); // Only document node
        }
    
        #[test]
        fn test_layout_flex_row() {
            // Given: A flex container with two children
            let mut doc = Document::new();
            let container_idx = doc.create_element("div");
            let child1_idx = doc.create_element("div");
            let child2_idx = doc.create_element("div");
            doc.append_child(doc.root, container_idx);
            doc.append_child(container_idx, child1_idx);
            doc.append_child(container_idx, child2_idx);
    
            let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
            styles[container_idx].display = Display::Flex;
            styles[child1_idx].width = Some(CSSValue::Pixels(100.0));
            styles[child1_idx].height = Some(CSSValue::Pixels(100.0));
            styles[child2_idx].width = Some(CSSValue::Pixels(100.0));
            styles[child2_idx].height = Some(CSSValue::Pixels(100.0));
    
            // When: We calculate layout
            calculate_layout_recursive(&mut doc, container_idx, &mut styles, 1024.0, 768.0);
    
            // Then: The second child should be positioned to the right of the first child
            let child1_layout = doc.nodes[child1_idx].layout.as_ref().unwrap();
            let child2_layout = doc.nodes[child2_idx].layout.as_ref().unwrap();
    
            assert_eq!(child1_layout.x, 0.0);
            assert_eq!(child2_layout.x, 100.0); // This will fail with the current block layout
        }
    }
    