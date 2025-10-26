# Technical Deep Dive: Rendering Pipeline Breakdown

## 1. TEXT RENDERING ISSUE (80% of problem)

### Current Implementation
```rust
// File: cortex-browser-env/src/render.rs:120-138
fn render_text(dt: &mut DrawTarget, layout: &Layout, text: &str) {
    if !text.is_empty() && layout.width > 0.0 && layout.height > 0.0 {
        let source = Source::Solid(SolidSource::from_unpremultiplied_argb(255, 0, 0, 0));
        let options = DrawOptions::new();
        
        // Draw placeholder rectangle instead of actual text
        dt.fill_rect(
            layout.x + 2.0,
            layout.y + 2.0,
            (layout.width - 4.0).max(0.0),
            (layout.font_size - 2.0).max(0.0),  // height = font_size - 2px
            &source,
            &options,
        );
    }
}
```

### What's Wrong
1. **NO FONT LOADING**: No font files are loaded
2. **NO GLYPH RENDERING**: No character shapes are rendered
3. **PLACEHOLDER ONLY**: Just draws a small rectangle
4. **BLACK ONLY**: Always renders as black (0, 0, 0)
5. **IGNORES TEXT COLOR**: CSS color property never consulted

### Example: "Contact Form" Text
Input:
```
text = "Contact Form"
layout.x = some_x
layout.y = some_y
layout.width = 980.0
layout.height = 100.0
layout.font_size = 16.0
```

Current Output:
```
Rectangle drawn:
  x = some_x + 2
  y = some_y + 2
  width = 976.0
  height = 14.0  // 16 - 2
  color = black
```

Result: A thin black line that looks like a text underline, NOT readable text

### What's Needed
```rust
fn render_text(dt: &mut DrawTarget, layout: &Layout, text: &str, color: &str) {
    // 1. Load font file (embedded or system)
    let font = load_font("/path/to/font.ttf")?;
    
    // 2. Create text layout with proper positioning
    let text_layout = TextLayout::new()
        .font(&font)
        .font_size(layout.font_size)
        .text(text)
        .color(parse_color(color));
    
    // 3. Draw each glyph at calculated positions
    for glyph in text_layout.glyphs() {
        draw_glyph(dt, glyph);
    }
}
```

---

## 2. CUSTOM ELEMENT PARSING BUG (10% of problem)

### Current Parser Code
```rust
// File: cortex-browser-env/src/parser.rs:66-76
fn consume_tag_name(chars: &mut Peekable<Chars>) -> String {
    let mut name = String::new();
    while let Some(&c) = chars.peek() {
        if c.is_alphanumeric() {  // <-- ONLY allows: a-z, A-Z, 0-9
            name.push(chars.next().unwrap());
        } else {
            break;  // <-- Stops at ANY non-alphanumeric character
        }
    }
    name
}
```

### Parsing Trace for `<ui-text-input>`
```
Input: "<ui-text-input id="username">"
         ^^
         Position: at 'u' of "ui-text-input"

Loop 1: c = 'u', is_alphanumeric = true, name = "u"
Loop 2: c = 'i', is_alphanumeric = true, name = "ui"
Loop 3: c = '-', is_alphanumeric = FALSE, BREAK

Result: tag_name = "ui"  (WRONG! Should be "ui-text-input")
```

### What Happens Next
After consuming `"ui"` as tag name:
```
1. Current position: at '-'
2. Parser expects attributes or '>'
3. Sees '-' and gets confused
4. Attributes consumed as attributes of wrong element
5. "text-input" text gets parsed as unexpected text content
6. Element structure is corrupted
```

### The Fix (5-minute change)
```rust
fn consume_tag_name(chars: &mut Peekable<Chars>) -> String {
    let mut name = String::new();
    while let Some(&c) = chars.peek() {
        // Allow alphanumeric AND hyphens (for custom elements)
        if c.is_alphanumeric() || c == '-' {
            name.push(chars.next().unwrap());
        } else {
            break;
        }
    }
    name
}
```

Now: `<ui-text-input>` parses as tag_name = `"ui-text-input"` ✓

---

## 3. ELEMENT ATTRIBUTES NOT RENDERED (5% of problem)

### The Issue
Input elements store text in **attributes**, not as **TextNode children**:
```html
<input type="text" placeholder="Enter username" value="John">
```

DOM Structure:
```
Element: input
  ├─ attribute: type = "text"
  ├─ attribute: placeholder = "Enter username"
  ├─ attribute: value = "John"
  └─ children: [] (EMPTY - no TextNode children)
```

### Current Rendering Code
```rust
// File: cortex-browser-env/src/render.rs:34-70
fn render_node(dt: &mut DrawTarget, document: &Document, node_idx: usize, styles: &[ComputedStyle]) {
    let node = &document.nodes[node_idx];
    
    if let Some(ref layout) = node.layout {
        // ... render background and border ...
        
        // Render text content - ONLY if node has TextNode data
        if let Some(ref data) = node.data {
            if let NodeData::Text(text) = data {  // <-- Only renders TextNodes
                render_text(dt, layout, text);
            }
        }
    }
    
    // Render children
    let children = document.nodes[node_idx].children.clone();
    for child_idx in children {
        render_node(dt, document, child_idx, styles);
    }
}
```

### Why Input Elements Don't Render
1. Input element's `node.data` is `NodeData::Element(...)`, not `NodeData::Text(...)`
2. The text content is in attributes, not in `node.data`
3. `render_node()` only checks `if let NodeData::Text(text)`
4. Attributes are completely ignored in rendering
5. Result: Input shows no text

### What's Needed
```rust
fn render_node(dt: &mut DrawTarget, document: &Document, node_idx: usize, styles: &[ComputedStyle]) {
    let node = &document.nodes[node_idx];
    
    if let Some(ref layout) = node.layout {
        // ... render background and border ...
        
        // Render text content from TextNodes
        if let Some(ref data) = node.data {
            if let NodeData::Text(text) = data {
                render_text(dt, layout, text);
            } else if let NodeData::Element(elem) = data {
                // NEW: Render text from element attributes
                match elem.tag_name.as_str() {
                    "input" => {
                        // Render placeholder and value
                        if let Some(placeholder) = elem.attributes.get("placeholder") {
                            render_text(dt, layout, placeholder);
                        }
                        if let Some(value) = elem.attributes.get("value") {
                            render_text(dt, layout, value);
                        }
                    }
                    "ui-text-input" => {
                        // Render label and placeholder from attributes
                        if let Some(label) = elem.attributes.get("label") {
                            render_text(dt, layout, label);
                        }
                        if let Some(placeholder) = elem.attributes.get("placeholder") {
                            render_text(dt, layout, placeholder);
                        }
                    }
                    _ => {}
                }
            }
        }
    }
    
    // Render children
    let children = document.nodes[node_idx].children.clone();
    for child_idx in children {
        render_node(dt, document, child_idx, styles);
    }
}
```

---

## 4. CSS NOT APPLIED TO DOM (5% of problem)

### The Problem
```rust
// File: cortex-browser-env/src/layout.rs:1-15
pub fn calculate_layout(document: &mut Document, viewport_width: f32, viewport_height: f32) {
    let root_idx = document.root;
    
    // Creates default style for EVERY node - CSS NEVER CONSULTED
    let mut styles = vec![ComputedStyle::default(); document.nodes.len()];
    
    calculate_layout_recursive(document, root_idx, &mut styles, viewport_width, viewport_height);
}
```

### CSS Parser Exists But Unused
```rust
// File: cortex-browser-env/src/css.rs:77-116
pub fn parse_css(css: &str) -> StyleSheet {
    // This function exists and works
    // But is NEVER CALLED by calculate_layout()
}
```

### What Should Happen
```
Input HTML:
<style>
    h1 { color: #333; margin-bottom: 20px; }
    body { padding: 20px; }
    ui-text-input { display: block; margin-bottom: 20px; }
</style>
<h1>Contact Form</h1>
<body>...</body>
<ui-text-input label="Name"></ui-text-input>
```

Current Flow:
1. HTML parsed → DOM created with all elements
2. `calculate_layout()` called
3. All nodes get default styles (no CSS parsing)
4. Layout uses arbitrary defaults (100x100)
5. Colors, spacing, sizing from CSS ignored

Correct Flow:
1. HTML parsed → DOM created
2. `calculate_layout()` called
3. **Extract `<style>` content**
4. **Parse CSS rules** with `css::parse_css()`
5. **Match selectors** against DOM elements
6. **Apply declarations** to ComputedStyle
7. Layout uses CSS values
8. Colors, spacing, sizing from CSS applied

### Required Code Changes
```rust
pub fn calculate_layout(document: &mut Document, viewport_width: f32, viewport_height: f32) {
    let root_idx = document.root;
    
    // NEW: Extract and parse CSS
    let stylesheet = extract_and_parse_css(document);
    
    // NEW: Create styles by applying CSS rules
    let mut styles = vec![ComputedStyle::default(); document.nodes.len()];
    apply_css_rules(document, &stylesheet, &mut styles);
    
    calculate_layout_recursive(document, root_idx, &mut styles, viewport_width, viewport_height);
}

fn extract_and_parse_css(document: &Document) -> StyleSheet {
    // Find all <style> elements
    for node in &document.nodes {
        if let Some(NodeData::Element(elem)) = &node.data {
            if elem.tag_name == "style" {
                // Extract text content of style element
                // This requires walking children looking for TextNodes
                // Then parse with css::parse_css()
            }
        }
    }
}

fn apply_css_rules(document: &Document, stylesheet: &StyleSheet, styles: &mut [ComputedStyle]) {
    for (node_idx, node) in document.nodes.iter().enumerate() {
        for rule in &stylesheet.rules {
            for selector in &rule.selectors {
                if selector_matches(document, node_idx, selector) {
                    // Apply rule declarations to styles[node_idx]
                    for (property, value) in &rule.declarations {
                        apply_declaration(&mut styles[node_idx], property, value);
                    }
                }
            }
        }
    }
}
```

---

## 5. TEXT COLOR NEVER USED (Minor)

### Current Issue
```rust
// File: cortex-browser-env/src/css.rs:31
pub struct ComputedStyle {
    pub color: Option<String>,  // <-- Parsed from CSS but never used
    pub background_color: Option<String>,  // Only this one is used
}

// File: cortex-browser-env/src/render.rs:121-138
fn render_text(dt: &mut DrawTarget, layout: &Layout, text: &str) {
    // ... 
    let source = Source::Solid(SolidSource::from_unpremultiplied_argb(255, 0, 0, 0)); // Always black!
}
```

### Fix
Pass color to render_text():
```rust
fn render_text(dt: &mut DrawTarget, layout: &Layout, text: &str, color: &str) {
    let argb = parse_color_to_argb(color);
    let (a, r, g, b) = argb_to_components(argb);
    let source = Source::Solid(SolidSource::from_unpremultiplied_argb(a, r, g, b));
    // ... render with correct color
}
```

---

## 6. CUSTOM ELEMENT REGISTRY UNUSED (Minor)

### Current State
```rust
// File: cortex-browser-env/src/custom_elements.rs
pub struct CustomElementRegistry {
    registry: HashMap<String, usize>,
}
```

Registry is defined but:
- Never instantiated anywhere in codebase
- No custom element lifecycle methods
- No shadow DOM rendering
- No slot support

### Impact
Custom elements like `<ui-text-input>` are treated as regular elements with no special rendering logic.

---

## Complete Rendering Flow Diagram

### Current (Broken) Flow
```
HTML Input
    ↓
[parse_html] (BREAKS on hyphens)
    ├─ Custom elements misparsed
    └─ <style> becomes HTML element
    ↓
DOM Tree
    ├─ Elements with correct attributes
    └─ <style> content not extracted
    ↓
[calculate_layout] (No CSS parsing)
    ├─ Default ComputedStyle for all nodes
    ├─ CSS parser in css.rs never called
    └─ Arbitrary 100x100 sizing
    ↓
[render_document]
    ├─ Background: rendered (white default)
    ├─ Border: rendered if style has border_color
    ├─ Text: placeholder rectangle only
    └─ Attributes: IGNORED
    ↓
[Screenshot]
    └─ Mostly white, tiny black lines for text
```

### What Should Happen
```
HTML Input
    ↓
[parse_html] (Allow hyphens in tag names)
    ├─ Custom elements parsed correctly
    └─ <style> content stored as text
    ↓
DOM Tree
    ├─ Correct element structure
    └─ Style text extracted
    ↓
[calculate_layout] (Apply CSS parsing)
    ├─ Extract CSS from <style> nodes
    ├─ Parse CSS with css::parse_css()
    ├─ Match selectors and apply rules
    └─ Correct sizing and spacing
    ↓
[render_document]
    ├─ Background: CSS colors
    ├─ Border: CSS styling
    ├─ Text: actual glyphs with fonts
    └─ Attributes: rendered as text
    ↓
[Screenshot]
    └─ Proper component rendering with text, colors, spacing
```

---

## Summary Table

| Component | Status | File | Lines | Impact |
|-----------|--------|------|-------|--------|
| Text rendering | Stub only | render.rs | 120-138 | 80% |
| Hyphen in tags | Broken | parser.rs | 66-76 | 10% |
| Attributes rendering | Missing | render.rs | 34-70 | 5% |
| CSS application | Missing | layout.rs | 1-15 | 5% |
| Text color | Unused | css.rs | 31 | <1% |
| Element registry | Unused | custom_elements.rs | 1-22 | <1% |

