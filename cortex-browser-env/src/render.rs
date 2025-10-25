use raqote::{DrawTarget, Source, SolidSource, DrawOptions};
use super::dom::{Document, Layout, NodeData};
use super::css::ComputedStyle;

/// Render a document to a DrawTarget at the specified dimensions (headless)
pub fn render_document(
    document: &Document,
    width: i32,
    height: i32,
) -> DrawTarget {
    let mut dt = DrawTarget::new(width, height);
    let options = DrawOptions::new();

    // Fill background with white
    dt.fill_rect(
        0.0,
        0.0,
        width as f32,
        height as f32,
        &Source::Solid(SolidSource::from_unpremultiplied_argb(255, 255, 255, 255)),
        &options,
    );

    // Render root element
    if !document.nodes.is_empty() {
        let root_idx = document.root;
        let default_styles = vec![ComputedStyle::default(); document.nodes.len()];
        render_node(&mut dt, document, root_idx, &default_styles);
    }

    dt
}

/// Recursively render a node and its children
fn render_node(
    dt: &mut DrawTarget,
    document: &Document,
    node_idx: usize,
    styles: &[ComputedStyle],
) {
    let node = &document.nodes[node_idx];
    let options = DrawOptions::new();

    if let Some(ref layout) = node.layout {
        // Render background
        if let Some(style) = styles.get(node_idx) {
            if let Some(ref bg_color) = style.background_color {
                render_background(dt, layout, bg_color);
            }

            // Render border
            if let Some(ref border_color) = style.border_color {
                render_border(dt, layout, border_color);
            }
        }

        // Render text content
        if let Some(ref data) = node.data {
            if let NodeData::Text(text) = data {
                render_text(dt, layout, text);
            }
        }
    }

    // Recursively render children
    let children = document.nodes[node_idx].children.clone();
    for child_idx in children {
        render_node(dt, document, child_idx, styles);
    }
}

/// Render element background with solid color
fn render_background(dt: &mut DrawTarget, layout: &Layout, color: &str) {
    let argb = parse_color_to_argb(color);
    let (a, r, g, b) = argb_to_components(argb);
    let source = Source::Solid(SolidSource::from_unpremultiplied_argb(a, r, g, b));
    let options = DrawOptions::new();

    dt.fill_rect(
        layout.x,
        layout.y,
        layout.width,
        layout.height,
        &source,
        &options,
    );
}

/// Render element border
fn render_border(dt: &mut DrawTarget, layout: &Layout, color: &str) {
    if layout.border_width <= 0.0 {
        return;
    }

    let argb = parse_color_to_argb(color);
    let (a, r, g, b) = argb_to_components(argb);
    let source = Source::Solid(SolidSource::from_unpremultiplied_argb(a, r, g, b));

    // Draw border by drawing filled rectangles for each edge
    let options = DrawOptions::new();
    let border_width = layout.border_width;
    let x = layout.x;
    let y = layout.y;
    let w = layout.width;
    let h = layout.height;

    // Top border
    dt.fill_rect(x, y, w, border_width, &source, &options);

    // Right border
    dt.fill_rect(x + w - border_width, y, border_width, h, &source, &options);

    // Bottom border
    dt.fill_rect(x, y + h - border_width, w, border_width, &source, &options);

    // Left border
    dt.fill_rect(x, y, border_width, h, &source, &options);
}

/// Render text content (simplified - just placeholder for now)
fn render_text(dt: &mut DrawTarget, layout: &Layout, text: &str) {
    // For now, we'll just draw a small indicator that text would be here
    // Full text rendering would require a font library like freetype or rusttype
    if !text.is_empty() && layout.width > 0.0 && layout.height > 0.0 {
        // Draw a simple rectangle to indicate text presence
        let source = Source::Solid(SolidSource::from_unpremultiplied_argb(255, 0, 0, 0));
        let options = DrawOptions::new();

        dt.fill_rect(
            layout.x + 2.0,
            layout.y + 2.0,
            (layout.width - 4.0).max(0.0),
            (layout.font_size - 2.0).max(0.0),
            &source,
            &options,
        );
    }
}

/// Convert ARGB u32 to (a, r, g, b) tuple for raqote
fn argb_to_components(argb: u32) -> (u8, u8, u8, u8) {
    let a = ((argb >> 24) & 0xff) as u8;
    let r = ((argb >> 16) & 0xff) as u8;
    let g = ((argb >> 8) & 0xff) as u8;
    let b = (argb & 0xff) as u8;
    (a, r, g, b)
}

/// Parse CSS color string to ARGB format
fn parse_color_to_argb(color: &str) -> u32 {
    let color = color.trim().to_lowercase();

    // Handle rgb(r, g, b) format
    if color.starts_with("rgb(") && color.ends_with(")") {
        let inner = &color[4..color.len() - 1];
        let parts: Vec<&str> = inner.split(',').collect();
        if parts.len() >= 3 {
            if let (Ok(r), Ok(g), Ok(b)) = (
                parts[0].trim().parse::<u8>(),
                parts[1].trim().parse::<u8>(),
                parts[2].trim().parse::<u8>(),
            ) {
                return ((r as u32) << 16) | ((g as u32) << 8) | (b as u32) | 0xff000000;
            }
        }
    }

    // Handle hex color #RRGGBB -> 0xFFRRGGBB (ARGB format)
    if color.starts_with("#") && color.len() == 7 {
        if let Ok(hex) = u32::from_str_radix(&color[1..], 16) {
            // hex is 0xRRGGBB, convert to 0xFFRRGGBB (add alpha = 255)
            let r = (hex >> 16) & 0xFF;
            let g = (hex >> 8) & 0xFF;
            let b = hex & 0xFF;
            return 0xFF000000 | (r << 16) | (g << 8) | b;
        }
    }

    // Named colors
    match color.as_str() {
        "black" => 0xff000000,
        "white" => 0xffffffff,
        "red" => 0xffff0000,
        "green" => 0xff008000,
        "blue" => 0xff0000ff,
        "yellow" => 0xffffff00,
        "cyan" => 0xff00ffff,
        "magenta" => 0xffff00ff,
        "gray" | "grey" => 0xff808080,
        _ => 0xff000000, // Default to black
    }
}

// ============================================================================
// TESTS (RED PHASE - TDD)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    // ========================================================================
    // BASIC RENDERING TESTS
    // ========================================================================

    #[test]
    fn test_render_creates_draw_target() {
        // Given: A simple document
        let doc = Document::new();

        // When: We render it
        let dt = render_document(&doc, 800, 600);

        // Then: DrawTarget should be created with correct dimensions
        assert_eq!(dt.width(), 800);
        assert_eq!(dt.height(), 600);
    }

    #[test]
    fn test_render_empty_document_no_panic() {
        // Given: An empty document
        let doc = Document::new();

        // When: We render it
        let dt = render_document(&doc, 800, 600);

        // Then: Should complete without panicking
        assert_eq!(dt.width(), 800);
        assert_eq!(dt.height(), 600);
    }

    #[test]
    fn test_render_small_dimensions() {
        // Given: A document with minimal dimensions
        let doc = Document::new();

        // When: We render with very small dimensions
        let dt = render_document(&doc, 1, 1);

        // Then: Should handle without error
        assert_eq!(dt.width(), 1);
        assert_eq!(dt.height(), 1);
    }

    #[test]
    fn test_render_large_dimensions() {
        // Given: A document with large dimensions
        let doc = Document::new();

        // When: We render with large dimensions
        let dt = render_document(&doc, 4096, 2160);

        // Then: Should handle without error
        assert_eq!(dt.width(), 4096);
        assert_eq!(dt.height(), 2160);
    }

    // ========================================================================
    // COLOR PARSING TESTS
    // ========================================================================

    #[test]
    fn test_parse_color_named_black() {
        let argb = parse_color_to_argb("black");
        assert_eq!(argb, 0xff000000);
    }

    #[test]
    fn test_parse_color_named_white() {
        let argb = parse_color_to_argb("white");
        assert_eq!(argb, 0xffffffff);
    }

    #[test]
    fn test_parse_color_named_red() {
        let argb = parse_color_to_argb("red");
        assert_eq!(argb, 0xffff0000);
    }

    #[test]
    fn test_parse_color_named_green() {
        let argb = parse_color_to_argb("green");
        assert_eq!(argb, 0xff008000);
    }

    #[test]
    fn test_parse_color_named_blue() {
        let argb = parse_color_to_argb("blue");
        assert_eq!(argb, 0xff0000ff);
    }

    #[test]
    fn test_parse_color_hex_format() {
        let argb = parse_color_to_argb("#ff0000");
        assert_eq!(argb, 0xffff0000); // Red
    }

    #[test]
    fn test_parse_color_hex_white() {
        let argb = parse_color_to_argb("#ffffff");
        assert_eq!(argb, 0xffffffff);
    }

    #[test]
    fn test_parse_color_hex_black() {
        let argb = parse_color_to_argb("#000000");
        assert_eq!(argb, 0xff000000);
    }

    #[test]
    fn test_parse_color_rgb_format_red() {
        let argb = parse_color_to_argb("rgb(255, 0, 0)");
        assert_eq!(argb, 0xffff0000);
    }

    #[test]
    fn test_parse_color_rgb_format_green() {
        let argb = parse_color_to_argb("rgb(0, 255, 0)");
        assert_eq!(argb, 0xff00ff00);
    }

    #[test]
    fn test_parse_color_rgb_format_blue() {
        let argb = parse_color_to_argb("rgb(0, 0, 255)");
        assert_eq!(argb, 0xff0000ff);
    }

    #[test]
    fn test_parse_color_rgb_format_white() {
        let argb = parse_color_to_argb("rgb(255, 255, 255)");
        assert_eq!(argb, 0xffffffff);
    }

    #[test]
    fn test_parse_color_rgb_with_spaces() {
        let argb = parse_color_to_argb("rgb( 255 , 0 , 0 )");
        assert_eq!(argb, 0xffff0000);
    }

    #[test]
    fn test_parse_color_case_insensitive() {
        let argb1 = parse_color_to_argb("RED");
        let argb2 = parse_color_to_argb("red");
        assert_eq!(argb1, argb2);
    }

    #[test]
    fn test_parse_color_default_invalid() {
        // Given: An invalid color string
        let argb = parse_color_to_argb("invalid-color");

        // Then: Should default to black
        assert_eq!(argb, 0xff000000);
    }

    // ========================================================================
    // BACKGROUND RENDERING TESTS
    // ========================================================================

    #[test]
    fn test_render_background_with_element() {
        // Given: A document with an element with background color
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);

        // Create layout for element
        doc.nodes[elem_idx].layout = Some(Layout {
            x: 10.0,
            y: 10.0,
            width: 100.0,
            height: 100.0,
            content_width: 100.0,
            content_height: 100.0,
            padding_top: 0.0,
            padding_right: 0.0,
            padding_bottom: 0.0,
            padding_left: 0.0,
            margin_top: 0.0,
            margin_right: 0.0,
            margin_bottom: 0.0,
            margin_left: 0.0,
            border_width: 0.0,
            font_size: 16.0,
            display: super::super::dom::Display::Block,
        });

        // Manually render with background
        let mut dt = DrawTarget::new(200, 200);
        let layout = doc.nodes[elem_idx].layout.as_ref().unwrap();
        render_background(&mut dt, layout, "red");

        // Then: Should complete without error
        assert_eq!(dt.width(), 200);
    }

    // ========================================================================
    // BORDER RENDERING TESTS
    // ========================================================================

    #[test]
    fn test_render_border_exists() {
        // Given: A layout with border
        let layout = Layout {
            x: 50.0,
            y: 50.0,
            width: 100.0,
            height: 100.0,
            content_width: 100.0,
            content_height: 100.0,
            padding_top: 0.0,
            padding_right: 0.0,
            padding_bottom: 0.0,
            padding_left: 0.0,
            margin_top: 0.0,
            margin_right: 0.0,
            margin_bottom: 0.0,
            margin_left: 0.0,
            border_width: 2.0,
            font_size: 16.0,
            display: super::super::dom::Display::Block,
        };

        // When: We render border
        let mut dt = DrawTarget::new(200, 200);
        render_border(&mut dt, &layout, "blue");

        // Then: Should complete without error
        assert_eq!(dt.width(), 200);
    }

    #[test]
    fn test_render_border_zero_width_no_panic() {
        // Given: A layout with zero border width
        let layout = Layout {
            x: 50.0,
            y: 50.0,
            width: 100.0,
            height: 100.0,
            content_width: 100.0,
            content_height: 100.0,
            padding_top: 0.0,
            padding_right: 0.0,
            padding_bottom: 0.0,
            padding_left: 0.0,
            margin_top: 0.0,
            margin_right: 0.0,
            margin_bottom: 0.0,
            margin_left: 0.0,
            border_width: 0.0,
            font_size: 16.0,
            display: super::super::dom::Display::Block,
        };

        // When: We render border
        let mut dt = DrawTarget::new(200, 200);
        render_border(&mut dt, &layout, "red");

        // Then: Should not panic
        assert_eq!(dt.width(), 200);
    }

    // ========================================================================
    // TEXT RENDERING TESTS
    // ========================================================================

    #[test]
    fn test_render_text_with_layout() {
        // Given: A layout with font size
        let layout = Layout {
            x: 10.0,
            y: 10.0,
            width: 100.0,
            height: 50.0,
            content_width: 100.0,
            content_height: 50.0,
            padding_top: 0.0,
            padding_right: 0.0,
            padding_bottom: 0.0,
            padding_left: 0.0,
            margin_top: 0.0,
            margin_right: 0.0,
            margin_bottom: 0.0,
            margin_left: 0.0,
            border_width: 0.0,
            font_size: 16.0,
            display: super::super::dom::Display::Block,
        };

        // When: We render text
        let mut dt = DrawTarget::new(200, 200);
        render_text(&mut dt, &layout, "Hello");

        // Then: Should complete without error
        assert_eq!(dt.width(), 200);
    }

    #[test]
    fn test_render_text_empty_string_no_panic() {
        // Given: A layout with empty text
        let layout = Layout {
            x: 10.0,
            y: 10.0,
            width: 100.0,
            height: 50.0,
            content_width: 100.0,
            content_height: 50.0,
            padding_top: 0.0,
            padding_right: 0.0,
            padding_bottom: 0.0,
            padding_left: 0.0,
            margin_top: 0.0,
            margin_right: 0.0,
            margin_bottom: 0.0,
            margin_left: 0.0,
            border_width: 0.0,
            font_size: 16.0,
            display: super::super::dom::Display::Block,
        };

        // When: We render empty text
        let mut dt = DrawTarget::new(200, 200);
        render_text(&mut dt, &layout, "");

        // Then: Should not panic
        assert_eq!(dt.width(), 200);
    }

    #[test]
    fn test_render_text_zero_dimension_no_panic() {
        // Given: A layout with zero dimensions
        let layout = Layout {
            x: 10.0,
            y: 10.0,
            width: 0.0,
            height: 0.0,
            content_width: 0.0,
            content_height: 0.0,
            padding_top: 0.0,
            padding_right: 0.0,
            padding_bottom: 0.0,
            padding_left: 0.0,
            margin_top: 0.0,
            margin_right: 0.0,
            margin_bottom: 0.0,
            margin_left: 0.0,
            border_width: 0.0,
            font_size: 0.0,
            display: super::super::dom::Display::Block,
        };

        // When: We render text
        let mut dt = DrawTarget::new(200, 200);
        render_text(&mut dt, &layout, "Text");

        // Then: Should not panic
        assert_eq!(dt.width(), 200);
    }
}
