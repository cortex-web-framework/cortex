use raqote::{DrawTarget, Source, SolidSource, DrawOptions};
use super::dom::{Document, Layout, NodeData, ElementData};
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
                // Check parent element tag for styling
                render_text_with_styling(dt, layout, text, node_idx, document);
            } else if let NodeData::Element(elem) = data {
                // Render element attributes as text (label, placeholder, value, etc.)
                render_element_text(dt, layout, elem);
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

/// Render text with styling based on parent element
fn render_text_with_styling(
    dt: &mut DrawTarget,
    layout: &Layout,
    text: &str,
    node_idx: usize,
    document: &Document,
) {
    // Determine parent element type for styling
    let mut parent_tag = "";
    for (_i, node) in document.nodes.iter().enumerate() {
        if node.children.contains(&node_idx) {
            if let Some(NodeData::Element(elem)) = &node.data {
                parent_tag = &elem.tag_name;
            }
            break;
        }
    }

    // Apply styling based on parent tag
    match parent_tag {
        "h1" => render_heading_text(dt, layout, text, 1.8),  // 80% larger
        "h2" => render_heading_text(dt, layout, text, 1.6),  // 60% larger
        "h3" => render_heading_text(dt, layout, text, 1.4),  // 40% larger
        _ => render_text(dt, layout, text),                  // Normal text
    }
}

/// Render heading text with larger font size
fn render_heading_text(dt: &mut DrawTarget, layout: &Layout, text: &str, scale: f32) {
    if text.is_empty() || layout.width <= 0.0 || layout.height <= 0.0 {
        return;
    }

    let char_width = 14.0 * scale;
    let char_height = 22.0 * scale;
    let line_height = char_height + 8.0;

    let text_source = Source::Solid(SolidSource::from_unpremultiplied_argb(255, 40, 40, 40)); // Dark gray for headings
    let text_options = DrawOptions::new();

    let mut x = layout.x + 8.0;
    let mut y = layout.y + 8.0;

    for ch in text.chars() {
        if ch == '\n' {
            x = layout.x + 8.0;
            y += line_height;
            continue;
        }

        if x + char_width > layout.x + layout.width - 4.0 {
            x = layout.x + 8.0;
            y += line_height;
        }

        if y + char_height > layout.y + layout.height - 2.0 {
            break;
        }

        draw_simple_char(dt, ch, x, y, char_width, char_height, &text_source, &text_options);

        x += char_width;
    }
}

/// Render text content as visible readable characters
fn render_text(dt: &mut DrawTarget, layout: &Layout, text: &str) {
    if text.is_empty() || layout.width <= 0.0 || layout.height <= 0.0 {
        return;
    }

    let char_width = 14.0;  // MUCH LARGER for better readability
    let char_height = 22.0;  // MUCH LARGER for better readability
    let line_height = char_height + 6.0;

    let text_source = Source::Solid(SolidSource::from_unpremultiplied_argb(255, 0, 0, 0)); // Black text
    let text_options = DrawOptions::new();

    let mut x = layout.x + 6.0;
    let mut y = layout.y + 6.0;

    // Simple bitmap-style text rendering with MUCH LARGER CHARACTERS
    for ch in text.chars() {
        if ch == '\n' {
            x = layout.x + 6.0;
            y += line_height;
            continue;
        }

        if x + char_width > layout.x + layout.width - 4.0 {
            x = layout.x + 6.0;
            y += line_height;
        }

        if y + char_height > layout.y + layout.height - 2.0 {
            break;
        }

        // Draw simple character outlines (boxes with internal structure)
        draw_simple_char(dt, ch, x, y, char_width, char_height, &text_source, &text_options);

        x += char_width;
    }
}

/// Draw a character with actual readable bitmap patterns
fn draw_simple_char(
    dt: &mut DrawTarget,
    ch: char,
    x: f32,
    y: f32,
    width: f32,
    height: f32,
    source: &Source,
    options: &DrawOptions,
) {
    let px = width / 12.0;  // LARGER GRID - 12x18 pixels instead of 8x12
    let py = height / 18.0;

    // Helper macro to draw a pixel at grid position
    macro_rules! draw_px {
        ($x:expr, $y:expr) => {{
            let px_x = x + ($x as f32) * px;
            let px_y = y + ($y as f32) * py;
            if px_x >= x && px_y >= y && px_x < x + width && px_y < y + height {
                dt.fill_rect(px_x, px_y, px * 0.9, py * 0.9, source, options);
            }
        }};
    }

    match ch {
        // Uppercase letters
        'A' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 6); }
        }
        'B' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
        }
        'C' => {
            for row in 0..12 { draw_px!(2, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 11); }
        }
        'D' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 11); }
        }
        'E' => {
            for row in 0..12 { draw_px!(2, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
        }
        'F' => {
            for row in 0..12 { draw_px!(2, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); }
        }
        'G' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 11); }
            draw_px!(5, 6);
        }
        'H' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 6); }
        }
        'I' => {
            for row in 0..12 { draw_px!(3, row); }
            for col in 2..=4 { draw_px!(col, 0); draw_px!(col, 11); }
        }
        'L' => {
            for row in 0..12 { draw_px!(2, row); }
            for col in 2..=5 { draw_px!(col, 11); }
        }
        'M' => {
            for row in 0..12 { draw_px!(1, row); draw_px!(7, row); }
            draw_px!(3, 2); draw_px!(5, 2);
            draw_px!(4, 3);
        }
        'N' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            draw_px!(3, 2); draw_px!(4, 3); draw_px!(4, 4);
        }
        'O' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 11); }
        }
        'P' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); }
        }
        'R' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); }
            draw_px!(5, 7); draw_px!(5, 8); draw_px!(5, 9);
        }
        'S' => {
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
            draw_px!(2, 3); draw_px!(5, 3); draw_px!(5, 9); draw_px!(2, 9);
        }
        'T' => {
            for col in 1..=6 { draw_px!(col, 0); }
            for row in 0..12 { draw_px!(3, row); }
        }
        'U' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 11); }
        }
        'V' => {
            draw_px!(2, 0); draw_px!(5, 0);
            draw_px!(3, 4); draw_px!(4, 4);
            draw_px!(3, 8); draw_px!(4, 8);
        }
        'W' => {
            for row in 0..12 { draw_px!(1, row); draw_px!(7, row); }
            draw_px!(3, 6); draw_px!(4, 6); draw_px!(5, 6);
        }
        'X' => {
            draw_px!(2, 0); draw_px!(5, 0);
            draw_px!(3, 4); draw_px!(4, 4);
            draw_px!(2, 11); draw_px!(5, 11);
        }
        'Y' => {
            draw_px!(2, 0); draw_px!(5, 0);
            draw_px!(3, 3); draw_px!(4, 3);
            for row in 3..12 { draw_px!(3, row); }
        }
        'Z' => {
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 11); }
            for row in 1..11 { draw_px!(2 + (11 - row) / 2, row); }
        }

        // Lowercase letters (simplified)
        'a'..='z' => {
            // Simple filled rectangle for lowercase
            let px_w = width * 0.7;
            let px_h = height * 0.6;
            dt.fill_rect(x + width * 0.15, y + height * 0.2, px_w, px_h, source, options);
        }

        // Numbers
        '0' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 11); }
        }
        '1' => {
            for row in 0..12 { draw_px!(3, row); }
            draw_px!(2, 1);
        }
        '2' => {
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
            draw_px!(5, 3); draw_px!(2, 9);
        }
        '3' => {
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
            draw_px!(5, 3); draw_px!(5, 9);
        }
        '4' => {
            draw_px!(2, 0); draw_px!(5, 0);
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 6); }
        }
        '5' => {
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
            draw_px!(2, 3); draw_px!(5, 9);
        }
        '6' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
        }
        '7' => {
            for col in 2..=5 { draw_px!(col, 0); }
            for row in 0..12 { draw_px!(5, row); }
        }
        '8' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
        }
        '9' => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 6); draw_px!(col, 11); }
        }

        // Symbols
        '[' | '{' | '(' => {
            for row in 0..12 { draw_px!(4, row); }
            for col in 2..=4 { draw_px!(col, 0); draw_px!(col, 11); }
        }
        ']' | '}' | ')' => {
            for row in 0..12 { draw_px!(3, row); }
            for col in 3..=5 { draw_px!(col, 0); draw_px!(col, 11); }
        }
        '-' | '_' => {
            for col in 2..=5 { draw_px!(col, 6); }
        }
        '.' | ',' => {
            draw_px!(3, 10); draw_px!(3, 11);
        }
        ':' => {
            draw_px!(3, 3); draw_px!(3, 9);
        }
        ' ' => {
            // Space - do nothing
        }

        // Default: draw a box
        _ => {
            for row in 0..12 { draw_px!(2, row); draw_px!(5, row); }
            for col in 2..=5 { draw_px!(col, 0); draw_px!(col, 11); }
        }
    }
}

/// Render element attributes as visible text (label, placeholder, value, etc.)
fn render_element_text(dt: &mut DrawTarget, layout: &Layout, elem: &ElementData) {
    if layout.width <= 0.0 || layout.height <= 0.0 {
        return;
    }

    // Draw input field border for ui-* custom elements
    if elem.tag_name.contains("-") {
        let is_disabled = elem.attributes.contains_key("disabled");

        let border_color = if is_disabled {
            Source::Solid(SolidSource::from_unpremultiplied_argb(255, 180, 180, 180)) // Lighter gray for disabled
        } else {
            Source::Solid(SolidSource::from_unpremultiplied_argb(255, 100, 100, 100)) // Gray border
        };

        let bg_color = if is_disabled {
            Source::Solid(SolidSource::from_unpremultiplied_argb(255, 230, 230, 230)) // Darker gray for disabled
        } else {
            Source::Solid(SolidSource::from_unpremultiplied_argb(255, 245, 245, 245)) // Very light gray for enabled
        };

        let options = DrawOptions::new();

        // Draw border
        let border_width = 2.0;
        dt.fill_rect(layout.x, layout.y, layout.width, border_width, &border_color, &options);
        dt.fill_rect(layout.x, layout.y + layout.height - border_width, layout.width, border_width, &border_color, &options);
        dt.fill_rect(layout.x, layout.y, border_width, layout.height, &border_color, &options);
        dt.fill_rect(layout.x + layout.width - border_width, layout.y, border_width, layout.height, &border_color, &options);

        // Draw background
        dt.fill_rect(layout.x + border_width, layout.y + border_width,
                    layout.width - border_width * 2.0,
                    layout.height - border_width * 2.0,
                    &bg_color, &options);
    }

    let char_width = 14.0;  // MUCH LARGER
    let char_height = 22.0;  // MUCH LARGER
    let line_height = char_height + 6.0;

    let is_disabled_text = elem.attributes.contains_key("disabled");
    let text_source = if is_disabled_text {
        Source::Solid(SolidSource::from_unpremultiplied_argb(255, 150, 150, 150)) // Light gray for disabled text
    } else {
        Source::Solid(SolidSource::from_unpremultiplied_argb(255, 0, 0, 0)) // Black text
    };
    let text_options = DrawOptions::new();

    // Prioritize rendering these attributes in order
    let text_attrs = vec!["label", "placeholder", "value", "text"];
    let mut rendered_text = String::new();

    for attr_name in text_attrs {
        if let Some(attr_value) = elem.attributes.get(attr_name) {
            rendered_text = attr_value.clone();
            break;
        }
    }

    // Also add tag name indicator for custom elements
    if elem.tag_name.contains("-") {
        rendered_text.insert_str(0, &format!("[{}] ", elem.tag_name));
    }

    if rendered_text.is_empty() {
        return;
    }

    let mut x = layout.x + 8.0;
    let mut y = layout.y + 6.0;

    // Draw text using simple character rendering with LARGER chars
    for ch in rendered_text.chars() {
        if ch == '\n' {
            x = layout.x + 8.0;
            y += line_height;
            continue;
        }

        if x + char_width > layout.x + layout.width - 4.0 {
            x = layout.x + 8.0;
            y += line_height;
        }

        if y + char_height > layout.y + layout.height - 2.0 {
            break;
        }

        draw_simple_char(dt, ch, x, y, char_width, char_height, &text_source, &text_options);

        x += char_width;
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
    use std::fs;
    use std::path::Path;

    // ======================================================================== 
    // GOLDEN MASTER TEST
    // ======================================================================== 

    #[test]
    fn test_golden_master_simple_box() {
        let golden_master_path = "tests/golden_masters/simple_box.png";
        let temp_dir = tempfile::tempdir().unwrap();
        let output_path = temp_dir.path().join("simple_box.png");

        // Given: A document with a simple styled box
        let mut doc = Document::new();
        let elem_idx = doc.create_element("div");
        doc.append_child(doc.root, elem_idx);
        doc.nodes[elem_idx].layout = Some(Layout {
            x: 10.0, y: 10.0, width: 100.0, height: 50.0,
            ..Default::default()
        });
        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[elem_idx].background_color = Some("red".to_string());

        // When: We render it
        let mut dt = DrawTarget::new(200, 100);
        render_node(&mut dt, &doc, doc.root, &styles);
        dt.write_png(output_path.to_str().unwrap()).unwrap();

        // Then: The output should match the golden master
        let (master_data, output_data) = load_or_create_golden_master(golden_master_path, &output_path);
        assert_eq!(master_data, output_data, "Rendered output does not match the golden master.");
    }

    #[test]
    fn test_golden_master_flexbox() {
        let golden_master_path = "tests/golden_masters/flexbox.png";
        let temp_dir = tempfile::tempdir().unwrap();
        let output_path = temp_dir.path().join("flexbox.png");

        // Given: A document with a flexbox layout
        let mut doc = Document::new();
        let container_idx = doc.create_element("div");
        let child1_idx = doc.create_element("div");
        let child2_idx = doc.create_element("div");
        doc.append_child(doc.root, container_idx);
        doc.append_child(container_idx, child1_idx);
        doc.append_child(container_idx, child2_idx);

        let mut styles = vec![ComputedStyle::default(); doc.nodes.len()];
        styles[container_idx].display = super::super::dom::Display::Flex;
        styles[child1_idx].width = Some(super::super::css::CSSValue::Pixels(50.0));
        styles[child1_idx].height = Some(super::super::css::CSSValue::Pixels(50.0));
        styles[child1_idx].background_color = Some("blue".to_string());
        styles[child2_idx].width = Some(super::super::css::CSSValue::Pixels(50.0));
        styles[child2_idx].height = Some(super::super::css::CSSValue::Pixels(50.0));
        styles[child2_idx].background_color = Some("green".to_string());

        // When: We calculate layout and render it
        super::super::layout::calculate_layout(&mut doc, 200.0, 100.0);
        let mut dt = DrawTarget::new(200, 100);
        render_node(&mut dt, &doc, doc.root, &styles);
        dt.write_png(output_path.to_str().unwrap()).unwrap();

        // Then: The output should match the golden master
        let (master_data, output_data) = load_or_create_golden_master(golden_master_path, &output_path);
        assert_eq!(master_data, output_data, "Rendered flexbox output does not match the golden master.");
    }

    fn load_or_create_golden_master(master_path: &str, current_output_path: &Path) -> (Vec<u8>, Vec<u8>) {
        let output_data = fs::read(current_output_path).unwrap();
        if let Ok(master_data) = fs::read(master_path) {
            (master_data, output_data)
        } else {
            // Golden master doesn't exist, create it.
            fs::create_dir_all(Path::new(master_path).parent().unwrap()).unwrap();
            fs::write(master_path, &output_data).unwrap();
            (output_data.clone(), output_data)
        }
    }


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