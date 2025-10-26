# Blank Screenshots - Root Causes at a Glance

## The 7 Critical Issues

### 1. TEXT RENDERING IS A STUB (MOST CRITICAL - 80% OF THE PROBLEM)
```
render.rs:121 - fn render_text()
└─ Only draws a tiny placeholder rectangle
└─ NEVER actually renders text with fonts
└─ Comment says: "Full text rendering would require a font library like freetype or rusttype"
└─ Result: h1 "Contact Form" renders as 14px tall black line, all other text INVISIBLE
```

### 2. CUSTOM ELEMENTS BREAK PARSING (VERY CRITICAL)
```
parser.rs:66 - fn consume_tag_name()
└─ Only accepts alphanumeric characters
└─ <ui-text-input> breaks at the hyphen
└─ Parses as tag "ui" instead of "ui-text-input"
└─ Everything after hyphen becomes misparsed
└─ Result: Custom components don't render at all
```

### 3. ELEMENT ATTRIBUTES NOT RENDERED
```
render.rs:34 - fn render_node()
└─ ONLY renders TextNode data
└─ Ignores element attributes completely
└─ Input placeholder="..." → not rendered
└─ Input value="..." → not rendered
└─ Custom element label="..." → not rendered
└─ Result: Form inputs show no text whatsoever
```

### 4. CSS IS NEVER APPLIED
```
layout.rs:6 - fn calculate_layout()
└─ Creates default styles for all nodes
└─ CSS parser in css.rs exists but is NEVER CALLED
└─ <style> blocks are parsed as HTML, not CSS
└─ color, background, spacing all ignored
└─ Result: No colors, no spacing, arbitrary 100x100 default sizing
```

### 5. NO ACTUAL FONT LOADING
```
render.rs:121 - fn render_text()
└─ No font files are loaded
└─ No font library integration (no rusttype, no freetype)
└─ Even basic text rendering is missing
└─ Result: Text completely invisible except as tiny placeholder box
```

### 6. TEXT COLOR NEVER USED
```
css.rs:31 - pub color: Option<String>
└─ Color property exists but never used in rendering
└─ render_text() always hardcodes black
└─ Even if text was rendered, color CSS would be ignored
```

### 7. CUSTOM ELEMENT REGISTRY NOT USED
```
custom_elements.rs - CustomElementRegistry
└─ Registry defined but never instantiated
└─ No lifecycle methods
└─ No shadow DOM rendering
└─ Custom elements treated as regular elements with no special behavior
```

---

## Visual Proof

### What We Expect (left) vs What We Get (right)

```
EXPECTED:
┌─────────────────────────────────┐
│ Contact Form                    │  <- Title text visible
│                                 │
│ [Enter name________]  Name      │  <- Labels and inputs
│ [your@email.com____]  Email     │
│ [+1 (555) 000-0000]  Phone      │
│                                 │
└─────────────────────────────────┘

ACTUAL:
┌─────────────────────────────────┐
│ ▊ (14px tall black line)        │  <- h1 text as placeholder rect
│                                 │
│                                 │  <- custom elements invisible
│                                 │     (parsing breaks at hyphen)
│                                 │
└─────────────────────────────────┘
```

---

## The Test Paradox

✅ **168/168 tests PASS** because tests check:
- File creation (works)
- DOM structure (parsing works for simple tags)
- CSS selectors (querySelector works)
- Attribute storage (getAttribute works)

❌ **Screenshots are BLANK** because:
- Tests DON'T check visual output
- Tests DON'T check if pixels are visible
- Tests DON'T check text rendering
- Tests DON'T check CSS application

---

## Priority Fix Order

### MUST FIX (Blocking visual output)
1. **Implement text rendering** (80% fix)
   - Add font library integration
   - Render actual text glyphs, not placeholder boxes

2. **Fix tag name parsing** (10% fix)
   - Allow hyphens in tag names
   - This alone fixes custom element parsing

3. **Extract and render attributes** (5% fix)
   - For inputs: render value and placeholder
   - For custom elements: render label attributes

### SHOULD FIX (Unlocks styling)
4. **Apply CSS rules** (5% fix)
   - Call CSS parser in calculate_layout()
   - Apply colors and sizing

### NICE TO HAVE
5. **Shadow DOM support** (future)
   - Custom element lifecycle
   - Slot rendering

---

## Code Locations Reference

| File | Issue | Lines |
|------|-------|-------|
| `render.rs` | Text rendering stub | 120-138 |
| `parser.rs` | Tag parsing breaks on hyphen | 66-76 |
| `render.rs` | Attributes not rendered | 34-70 |
| `layout.rs` | CSS never applied | 1-15 |
| `css.rs` | Color unused | 31 |
| `custom_elements.rs` | Registry unused | 1-22 |
| `layout.rs` | Arbitrary defaults | 85-118 |

---

## Expected Timeline to Fix

- **Text rendering (hardest):** 2-4 hours (need font library)
- **Tag parsing (easiest):** 5 minutes (change `is_alphanumeric()` to allow hyphen)
- **Attribute rendering (medium):** 1-2 hours (extract attrs, render them)
- **CSS application (medium):** 1-2 hours (call parser, apply rules)

**Total to basic working screenshots: 4-8 hours**

---

## What's Actually Rendering Today

In vanilla_form_layout.png (1000x600):
- White background (✅ renders correctly)
- One thin black line at top-left (~14px tall, ~980px wide)
  - This is the h1 "Contact Form" rendered as a placeholder rectangle
  - It's invisible because it's just a line, not actual text
- Everything else: nothing (custom elements invisible due to parsing failure)

