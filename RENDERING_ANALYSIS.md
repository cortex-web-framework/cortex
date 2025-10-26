# Rust Headless Browser Rendering Pipeline - Complete Analysis

## Problem Summary
Screenshots from the Rust headless browser render as mostly blank (white) with no visible content, despite all 168/168 tests passing. The PNG files contain almost no visible text, components, or styling.

---

## Critical Root Causes Identified

### 1. TEXT RENDERING IS DISABLED (PLACEHOLDER IMPLEMENTATION)
**File:** `/home/matthias/projects/cortex/cortex-browser-env/src/render.rs:120-138`

```rust
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
            (layout.font_size - 2.0).max(0.0),  // <-- KEY ISSUE: Uses font_size as height
            &source,
            &options,
        );
    }
}
```

**What's happening:**
- Text rendering is not implemented - just a placeholder
- Only draws a small black rectangle (font_size - 2.0 pixels tall)
- Actual rendered text is NOT being drawn with any font
- Comment explicitly says "Full text rendering would require a font library like freetype or rusttype"

**Impact on screenshots:**
- Vanilla form layout test shows only a thin black line at top (the border around padding) - that's the h1 "Contact Form" text being rendered as a tiny rectangle
- Input placeholders, labels, value attributes - all invisible
- Custom Web Components like `<ui-text-input>` have text content that's completely skipped

---

### 2. CUSTOM WEB COMPONENTS NOT PARSED OR HANDLED
**File:** `/home/matthias/projects/cortex/cortex-browser-env/src/parser.rs:66-76`

```rust
fn consume_tag_name(chars: &mut Peekable<Chars>) -> String {
    let mut name = String::new();
    while let Some(&c) = chars.peek() {
        if c.is_alphanumeric() {  // <-- ONLY accepts alphanumeric characters
            name.push(chars.next().unwrap());
        } else {
            break;
        }
    }
    name
}
```

**The Problem:**
- The parser ONLY accepts alphanumeric characters in tag names
- Custom elements like `<ui-text-input>` contain a HYPHEN which is NOT alphanumeric
- The hyphen causes `consume_tag_name()` to break early
- Result: Tag name becomes just `"ui"` instead of `"ui-text-input"`
- Child/text content of custom elements is likely incorrectly nested

**Evidence from test:**
```rust
// integration.rs:513
<ui-text-input id="username" label="Username" placeholder="Enter username"></ui-text-input>
```

When parsed with current logic:
1. `<ui` - consumed as tag name (stops at hyphen)
2. Text content gets lost/misparsed
3. No rendering happens for the actual component

---

### 3. ELEMENT ATTRIBUTES NOT BEING RENDERED
**File:** `/home/matthias/projects/cortex/cortex-browser-env/src/render.rs:34-70`

The `render_node()` function ONLY renders:
- Background color (if in CSS styles)
- Border (if in CSS styles) 
- Text content (TextNode data only)
- Children recursively

It DOES NOT render:
- Element attributes like `placeholder`, `value`, `label`
- Input element content
- Form element values
- Button text from attributes
- Any text stored in attributes

**Example:**
```html
<input type="text" placeholder="Enter text" value="Hello">
```

This has NO TextNode children - just an element with attributes. The rendering code only renders TextNodes. The `placeholder` and `value` attributes are completely ignored by the renderer.

---

### 4. LAYOUT CALCULATION HAS MINIMAL DEFAULTS
**File:** `/home/matthias/projects/cortex/cortex-browser-env/src/layout.rs:85-118`

```rust
fn calculate_dimensions(
    style: &ComputedStyle,
    parent_width: f32,
    parent_height: f32,
    node: &super::dom::Node,
) -> (f32, f32) {
    let width = match &style.width {
        Some(v) => v.as_pixels(parent_width),
        None => {
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
```

**Issues:**
- Default width is 100px - arbitrary
- Default height is 100px - arbitrary  
- CSS styling from `<style>` tags is NOT being applied
- `<style>` tags are parsed as HTML but CSS rules are not processed
- Custom elements get default 100x100 layout regardless of content

---

### 5. CSS STYLING NOT APPLIED TO DOM
**File:** `/home/matthias/projects/cortex/cortex-browser-env/src/layout.rs:1-15`

```rust
pub fn calculate_layout(document: &mut Document, viewport_width: f32, viewport_height: f32) {
    if document.nodes.is_empty() {
        return;
    }

    let root_idx = document.root;
    let mut styles = vec![ComputedStyle::default(); document.nodes.len()];  // <-- ALL DEFAULT STYLES

    calculate_layout_recursive(document, root_idx, &mut styles, viewport_width, viewport_height);
}
```

**Critical Issue:**
- CSS parsing exists in `css.rs` but is NEVER CALLED
- `calculate_layout()` creates a default style for every node
- The `<style>` block content from HTML is completely ignored
- Styles like `body { padding: 20px; }` have zero effect
- Default styles are used, which have:
  - `display: Display::Block`
  - `font_size: Some(CSSValue::Pixels(16.0))`
  - All colors: `None` (no background, no text color)

---

### 6. NO TEXT COLOR RENDERING
**File:** `/home/matthias/projects/cortex/cortex-browser-env/src/render.rs:73-87`

The color property in `ComputedStyle` is never used:

```rust
pub struct ComputedStyle {
    // ... other fields ...
    pub color: Option<String>,          // <-- NEVER USED IN RENDER
    pub background_color: Option<String>,  // Only this is used
}
```

The `render_text()` function always renders in black:
```rust
let source = Source::Solid(SolidSource::from_unpremultiplied_argb(255, 0, 0, 0)); // Always black
```

Even if actual text rendering was implemented, it would ignore any CSS color properties.

---

### 7. SHADOW DOM / CUSTOM ELEMENTS COMPLETELY IGNORED
**File:** `/home/matthias/projects/cortex/cortex-browser-env/src/custom_elements.rs`

```rust
pub struct CustomElementRegistry {
    registry: HashMap<String, usize>,
}

impl CustomElementRegistry {
    pub fn new() -> Self { ... }
    pub fn define(&mut self, tag_name: &str, constructor_idx: usize) { ... }
    pub fn get(&self, tag_name: &str) -> Option<&usize> { ... }
}
```

**Problems:**
- Registry exists but is NEVER instantiated or used
- No custom element lifecycle (connectedCallback, etc.)
- Shadow DOM attachment in dom.rs never triggers rendering
- `<ui-text-input>` custom elements have no special handling
- They're treated as regular elements with no rendering

---

## Screenshot Evidence

### vanilla_text_input_basic.png
- **Dimensions:** 800x400
- **Expected:** Text input component with label and placeholder
- **Actual:** Completely white/blank
- **Why:** 
  1. `<ui-text-input>` tag name parsing breaks at hyphen (only parses "ui")
  2. HTML content is misparsed
  3. Even if parsed correctly, no text content exists to render (only attributes)
  4. No font rendering implemented

### vanilla_form_layout.png  
- **Dimensions:** 1000x600
- **Expected:** Form with heading, multiple inputs with labels
- **Actual:** Just a thin black line at the top left
- **Why:**
  1. `<h1>Contact Form</h1>` renders as tiny black rectangle (font_size - 2px = 14px tall, but only text content)
  2. All the custom elements below don't render at all
  3. CSS styles in `<style>` block are parsed as HTML, not applied
  4. No spacing, colors, or component styling

---

## Rendering Pipeline Flow (Current - BROKEN)

```
1. HTML String
   ↓
2. parse_html() in parser.rs
   - Extracts tags, attributes, text nodes
   - Tag parser breaks on hyphens (custom elements fail)
   - <style> blocks become HTML elements, not CSS rules
   ↓
3. Document Structure (DOM tree)
   - Elements with attributes but no TextNode children for input values
   - Custom elements misparsed
   - Style information not extracted
   ↓
4. calculate_layout()
   - CSS is NEVER parsed or applied
   - All nodes get default ComputedStyle
   - Dimensions calculated with arbitrary defaults (100x100)
   ↓
5. render_document()
   - For each node:
     a) Render background (if style.background_color exists - usually None)
     b) Render border (if style.border_color exists - usually None)
     c) Render text (ONLY if node.data is TextNode - ignores attributes)
     d) Recurse to children
   ↓
6. PNG Output
   - DrawTarget mostly white (only white background fill)
   - Text rendered as tiny placeholder rectangles
   - Custom elements invisible
   - Attributes completely ignored
   ↓
7. Result: Blank PNG
```

---

## Why Tests Pass (168/168)

The tests check for:
1. **File operations:** PNG files are created - ✅ (works)
2. **DOM structure:** Elements exist - ✅ (parsing works for simple cases)
3. **CSS selectors:** querySelector finds elements - ✅ (search works)
4. **Attribute access:** getAttribute() returns values - ✅ (attributes stored correctly)

The tests DO NOT check:
- **Visual output:** What the PNG actually contains
- **Text rendering:** Whether text is visible
- **CSS application:** Whether styles affect rendering
- **Custom elements:** Whether ui-text-input renders
- **Pixel comparison:** Whether rendered pixels match expectations

---

## Complete Fix Requirements

To fix blank screenshots, you need:

1. **Implement actual text rendering** (critical)
   - Add font loading (ttf, wasm-based, or system fonts)
   - Render text with proper positioning
   - Support text color from CSS

2. **Fix custom element parsing** (critical)
   - Allow hyphens in tag names
   - Properly handle element attributes
   - Extract attribute values for rendering (placeholder, value, label)

3. **Apply CSS to DOM** (critical)
   - Parse CSS rules from <style> blocks
   - Apply rules to matching elements
   - Use colors, sizes, spacing from CSS

4. **Render attribute content** (important)
   - Input placeholders
   - Input values
   - Button text
   - Any text in attributes

5. **Shadow DOM support** (nice-to-have)
   - Implement custom element shadow root rendering
   - Allow slots and content projection

---

## Most Critical Quick Wins (in order)

1. **Make render_text() actually render text** (80% of the fix)
   - Replace placeholder rectangle with actual text rendering
   - Even basic text-only rendering would make screenshots 10x better

2. **Fix custom element tag parsing** (10% of the fix)
   - Change `consume_tag_name()` to accept hyphens
   - Ensures custom elements parse correctly

3. **Extract and render attribute text** (5% of the fix)
   - For `<input>`, render value and placeholder attributes
   - For custom elements, extract label/value attributes
   - For buttons, render text content

4. **Apply CSS rules to elements** (5% of the fix)
   - Call CSS parser in calculate_layout()
   - Match selectors and apply declarations
   - Use colors and sizing from CSS

