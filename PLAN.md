# Implementation Plan: Cortex Browser Engine - MVP Completion

**Objective:** Make the Cortex browser engine visually functional by completing the rendering subsystem.

**Timeline:** 12-16 hours of focused development

**Success Criteria:**
- [ ] All 164 existing tests still pass
- [ ] Screenshots show readable text content
- [ ] Colors and styling applied correctly
- [ ] Custom elements parse and render properly
- [ ] Visual regression tests validate output

---

## Phase 1: Quick Wins (30 minutes - Unblocks 50% of issues)

### 1.1 Fix Custom Element Tag Parsing ⚡ HIGHEST PRIORITY
**File:** `cortex-browser-env/src/parser.rs`

**Problem:** Tag names only accept alphanumeric characters, breaking custom elements like `<ui-text-input>`.

**Current Code (Lines 66-76):**
```rust
fn consume_tag_name(html: &str, pos: &mut usize) -> String {
    let mut name = String::new();
    while pos < html.len() && html[pos..].chars().next().unwrap().is_alphanumeric() {
        name.push(html[pos..].chars().next().unwrap());
        pos += 1;
    }
    name
}
```

**Fix:**
```rust
fn consume_tag_name(html: &str, pos: &mut usize) -> String {
    let mut name = String::new();
    while pos < html.len() {
        let ch = html[pos..].chars().next().unwrap();
        if ch.is_alphanumeric() || ch == '-' || ch == ':' {
            name.push(ch);
            pos += 1;
        } else {
            break;
        }
    }
    name
}
```

**Impact:** Fixes parsing of all custom element names with hyphens or colons.

**Time Estimate:** 5 minutes

---

## Phase 2: Font Rendering Foundation (3-4 hours - Unblocks 80% of visual output)

This is the critical path item. Everything else depends on text being visible.

### 2.1 Add `fontdue` Crate Dependency
**File:** `cortex-browser-env/Cargo.toml`

**Action:** Add to dependencies:
```toml
fontdue = "0.8"
```

**Rationale:**
- Pure Rust font rasterizer (no system dependencies)
- Stable, well-maintained crate
- Similar performance to rusttype
- Good documentation and examples

**Time Estimate:** 5 minutes

### 2.2 Implement Font Manager Module
**File:** `cortex-browser-env/src/fonts.rs` (NEW FILE)

**Responsibilities:**
1. Load system fonts (or embedded fallback font)
2. Cache parsed fonts for reuse
3. Provide glyph rasterization API

**Implementation Outline:**
```rust
use fontdue::Font;

pub struct FontManager {
    fonts: HashMap<String, Font>,
    default_font: Font,
}

impl FontManager {
    pub fn new() -> Result<Self, Error> {
        // Load default monospace font
        let default_font = Font::from_bytes(
            include_bytes!("../assets/DejaVuSansMono.ttf"),
            Default::default()
        )?;

        Ok(FontManager {
            fonts: HashMap::new(),
            default_font,
        })
    }

    pub fn rasterize_glyph(&self, character: char, size: f32) -> (Vec<u8>, (u32, u32)) {
        self.default_font.rasterize(character, size)
    }
}
```

**Subtasks:**
1. Define FontManager struct and methods
2. Implement font loading from embedded binary
3. Implement glyph rasterization wrapper
4. Add error handling

**Time Estimate:** 1 hour

### 2.3 Integrate Font Rendering into Render Pipeline
**File:** `cortex-browser-env/src/render.rs`

**Current Code (Lines 120-138):**
```rust
fn render_text(text: &str, x: f32, y: f32, paint: &Paint) {
    canvas.fill_rect(Rect::from_xywh(x, y, 14.0, 14.0).unwrap(), paint);
}
```

**Updated Implementation:**
```rust
fn render_text(
    text: &str,
    x: f32,
    y: f32,
    size: f32,
    color: Color,
    canvas: &mut Canvas,
    fonts: &FontManager,
) {
    let paint = Paint::from_color(color);
    let mut current_x = x;

    for ch in text.chars() {
        let (glyph_bitmap, (width, height)) = fonts.rasterize_glyph(ch, size);

        // Draw glyph bitmap to canvas
        draw_glyph_bitmap(
            canvas,
            &glyph_bitmap,
            current_x,
            y,
            width as f32,
            height as f32,
            &paint,
        );

        current_x += (width as f32) * 0.6; // Approximate character advance
    }
}
```

**Key Changes:**
1. Accept font size parameter
2. Accept color parameter
3. Accept FontManager reference
4. Loop through characters
5. Rasterize each glyph
6. Draw each glyph bitmap to canvas

**Subtasks:**
1. Modify render_text signature
2. Implement glyph rasterization loop
3. Implement bitmap-to-canvas drawing
4. Add character spacing logic
5. Update all render_text callsites

**Time Estimate:** 1.5 hours

### 2.4 Create Embedded Font Asset
**File:** `cortex-browser-env/assets/DejaVuSansMono.ttf`

**Action:** Include a TTF font file in the project.

**Options:**
1. Use DejaVu Sans Mono (public domain, included in most Linux distros)
2. Embed in Cargo.toml as binary data using `include_bytes!`

**Time Estimate:** 15 minutes

### 2.5 Update Main Rendering Function
**File:** `cortex-browser-env/src/render.rs:main()`

**Change:** Initialize FontManager before rendering:
```rust
pub fn render_to_png(dom: &Element) -> Result<Vec<u8>> {
    let font_manager = FontManager::new()?;  // NEW

    // ... existing code ...

    render_node(&dom, 0.0, 0.0, &mut canvas, &font_manager);

    // ... existing code ...
}
```

**Time Estimate:** 15 minutes

---

## Phase 3: CSS Integration (1-2 hours - Unblocks colors and spacing)

### 3.1 Wire CSS Parser into Layout Engine
**File:** `cortex-browser-env/src/layout.rs`

**Current Code (Lines 1-15):**
```rust
fn calculate_layout(dom: &Element, viewport_width: f32) -> LayoutTree {
    let default_style = Style::default();

    let layout = Style {
        width: Some(100.0),
        height: Some(100.0),
        ..default_style
    };
}
```

**Updated Implementation:**
```rust
fn calculate_layout(dom: &Element, viewport_width: f32) -> LayoutTree {
    // Parse CSS from <style> elements
    let stylesheets = extract_stylesheets(dom);

    // Create resolved styles
    let computed_styles = compute_styles(dom, &stylesheets);

    // Apply to Taffy layout
    let mut taffy = Taffy::new();
    let layout = build_layout_tree(dom, &computed_styles, &mut taffy, None)?;

    taffy.compute_layout(layout, Size {
        width: AvailableSpace::Definite(viewport_width),
        height: AvailableSpace::MaxContent,
    })?;

    Ok(LayoutResult {
        tree: layout,
        taffy,
    })
}
```

**Subtasks:**
1. Create `extract_stylesheets()` function
2. Create `compute_styles()` function to apply CSS rules to DOM nodes
3. Refactor style application to use computed styles instead of defaults
4. Map CSS values to Taffy style properties

**Time Estimate:** 1 hour

### 3.2 Extract and Apply Stylesheet Colors
**File:** `cortex-browser-env/src/css.rs`

**Enhancement:** Ensure color parsing is used in rendering:

1. Parse color from CSS rules
2. Store in computed styles
3. Pass color to render_text() function

**Time Estimate:** 30 minutes

---

## Phase 4: Attribute Rendering (1-2 hours - Unblocks form inputs and labels)

### 4.1 Extract Attributes for Rendering
**File:** `cortex-browser-env/src/render.rs`

**Current Code (Lines 34-70):**
```rust
fn render_node(node: &Node, x: f32, y: f32) {
    match node {
        Node::Element(elem) => {
            // Only renders children
            for child in &elem.children {
                render_node(child, x, y);
            }
        }
    }
}
```

**Updated Implementation:**
```rust
fn render_node(
    node: &Node,
    x: f32,
    y: f32,
    canvas: &mut Canvas,
    fonts: &FontManager,
) {
    match node {
        Node::Element(elem) => {
            // Render element's own content
            render_element_content(elem, x, y, canvas, fonts);

            // Render children
            for child in &elem.children {
                render_node(child, x, y, canvas, fonts);
            }
        }
        Node::Text(text) => {
            render_text(text, x, y, 14.0, Color::BLACK, canvas, fonts);
        }
    }
}
```

### 4.2 Implement Element Content Extraction
**File:** `cortex-browser-env/src/render.rs`

**New Function:**
```rust
fn render_element_content(
    elem: &Element,
    x: f32,
    y: f32,
    canvas: &mut Canvas,
    fonts: &FontManager,
) {
    match elem.tag_name.as_str() {
        "input" => {
            // Render placeholder or value
            if let Some(placeholder) = elem.get_attribute("placeholder") {
                render_text(&placeholder, x, y, 12.0, Color::GRAY, canvas, fonts);
            }
            if let Some(value) = elem.get_attribute("value") {
                render_text(&value, x, y, 12.0, Color::BLACK, canvas, fonts);
            }
        }
        _ if elem.tag_name.contains('-') => {
            // Custom element: render label attribute
            if let Some(label) = elem.get_attribute("label") {
                render_text(&label, x + 5.0, y + 5.0, 12.0, Color::BLACK, canvas, fonts);
            }
        }
        _ => {
            // No special attribute rendering
        }
    }
}
```

**Subtasks:**
1. Handle input elements (value, placeholder)
2. Handle custom elements (label, other attributes)
3. Handle select/textarea elements
4. Test attribute visibility

**Time Estimate:** 1 hour

---

## Phase 5: Visual Testing Framework (2-3 hours - Validates everything works)

### 5.1 Enhance Screenshot Comparison Tests
**File:** `cortex-browser-env/tests/visual_regression.rs` (ENHANCE)

**Current Approach:** Basic golden master comparison

**Enhancements:**
1. Add text visibility verification
2. Add color verification
3. Add element position verification

**Test Template:**
```rust
#[test]
fn test_custom_element_rendering() {
    let html = r#"
        <div style="width: 300px; height: 100px;">
            <ui-text-input label="Name"></ui-text-input>
        </div>
    "#;

    let dom = parse_html(html).expect("Parse failed");
    let screenshot = render_to_png(&dom).expect("Render failed");

    // Verify screenshot is not blank
    assert!(!is_blank_image(&screenshot), "Screenshot is completely blank");

    // Verify text is visible
    assert_text_visible(&screenshot, "Name");

    // Compare to golden master (allow 5% diff tolerance)
    let golden = include_bytes!("golden/custom_element.png");
    let diff = compare_images(&screenshot, golden);
    assert!(diff < 5.0, "Screenshot differs by {}%", diff);
}
```

**Subtasks:**
1. Create image comparison utility
2. Create text visibility checker (basic OCR or pattern matching)
3. Create golden master screenshots
4. Write comprehensive test cases

**Time Estimate:** 2-3 hours

### 5.2 Generate Golden Master Baseline
**Action:** Run tests after implementation to generate reference images

**Files to Create:**
- `cortex-browser-env/tests/golden/` directory
- Reference screenshots for each test case

---

## Phase 6: Integration & Validation (1 hour)

### 6.1 Run Full Test Suite
```bash
cd cortex-browser-env
cargo test --all
```

**Expected:** All 164 tests pass + new visual tests pass

### 6.2 Generate Sample Screenshots
```bash
cargo run --example render_form
cargo run --example render_custom_elements
```

**Validate:** Screenshots show readable text, colors, and layouts

### 6.3 Update Documentation
- [ ] Update RENDERING_QUICK_SUMMARY.md with "FIXED" status
- [ ] Add screenshots to README.md
- [ ] Update IMPLEMENTATION_SPEC.md

---

## Critical Dependencies & Ordering

**MUST DO IN THIS ORDER:**

1. ✅ Fix tag parsing (enables custom element tests to run)
2. ✅ Add fontdue crate (enables font rendering)
3. ✅ Implement FontManager (provides glyph service)
4. ✅ Integrate into render pipeline (makes text visible)
5. ✅ Wire CSS parser (enables colors)
6. ✅ Implement attribute rendering (makes form inputs visible)
7. ✅ Add visual tests (validates everything)

**DO NOT REORDER** - Each step depends on the previous ones.

---

## Risk Mitigation

### Risk: Font Loading Fails
**Mitigation:** Use embedded font file in binary. No system dependencies.

### Risk: Breaking Existing Tests
**Mitigation:** Keep all existing functions, only add new parameters. Use function overloads.

### Risk: Performance Degradation
**Mitigation:** Font Manager caches fonts. Glyph bitmap cache prevents re-rasterization.

### Risk: Rendering Pipeline Too Complex
**Mitigation:** Add comprehensive logging and test at each step.

---

## Success Metrics (Pass/Fail Criteria)

| Metric | Target | Current | Status |
|--------|--------|---------|--------|
| Unit tests pass | 164/164 | 164/164 | ✅ |
| Custom elements parse | 100% | 0% | ❌ |
| Text visible in screenshots | 100% | 5% | ❌ |
| Colors applied | 100% | 0% | ❌ |
| Form inputs show values | 100% | 0% | ❌ |
| Visual regression tests pass | 100% | 0% | ❌ |

---

## Time Breakdown

| Phase | Task | Hours | Cumulative |
|-------|------|-------|-----------|
| 1 | Fix tag parsing | 0.08 | 0.08 |
| 2 | Font foundation | 3.5 | 3.58 |
| 3 | CSS integration | 1.5 | 5.08 |
| 4 | Attribute rendering | 1.5 | 6.58 |
| 5 | Visual testing | 2.5 | 9.08 |
| 6 | Integration | 1.0 | 10.08 |
| **Total** | | | **~10 hours** |

(Conservative estimate with buffer: 12-16 hours)

---

## Post-MVP Enhancements (Phase 2)

Once MVP is complete, prioritize:

1. **SVG Rendering** (2-3 hours)
   - Extend rendering to handle `<svg>` elements
   - Implement path rendering

2. **CSS Grid & Advanced Layouts** (3-4 hours)
   - Full CSS Grid support
   - Improved Flexbox edge cases

3. **Shadow DOM** (4-5 hours)
   - Custom element lifecycle
   - Slot rendering

4. **Web Fonts** (2-3 hours)
   - @font-face support
   - Remote font loading

5. **OCR Verification** (2-3 hours)
   - Use tesseract for text extraction
   - Advanced visual assertion API

---

## Implementation Sequence (For Developer)

```
Week 1, Day 1:
  09:00 - 09:05: Phase 1.1 - Fix tag parsing (TEST IMMEDIATELY)
  09:05 - 09:10: Phase 2.1 - Add fontdue dependency
  09:10 - 10:10: Phase 2.2 - Implement FontManager
  10:10 - 11:30: Phase 2.3 - Integrate into render pipeline
  11:30 - 12:00: Phase 2.4 - Embed font asset
  12:00 - 13:00: LUNCH BREAK
  13:00 - 13:15: Phase 2.5 - Update main rendering function
  13:15 - 14:15: Phase 3.1 - Wire CSS parser
  14:15 - 14:45: Phase 3.2 - Extract colors
  14:45 - 15:45: Phase 4.1-4.2 - Attribute rendering
  15:45 - 18:00: Phase 5.1-5.2 - Visual testing (with breaks)

Week 1, Day 2:
  09:00 - 10:00: Phase 6 - Integration & validation
  10:00 - 10:30: Generate golden master screenshots
  10:30 - 11:00: Documentation updates
  11:00+: Buffer time / Post-MVP work
```

---

## Status Tracking

- **Document Created:** 2025-10-26
- **Status:** Implementation Ready
- **Next Steps:** Begin Phase 1 immediately

