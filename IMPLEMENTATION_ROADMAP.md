# Implementation Roadmap: Complete Rust Test Browser with TDD

## Overview

Complete the Rust-based test browser (`cortex-browser-env`) with **full TDD approach** to enable:
1. ✅ Test function serialization & execution
2. ✅ Headless rendering (no visible window)
3. ✅ Screenshot capture to PNG
4. ✅ DOM API exposure (querySelector, properties, methods)
5. ✅ Visual regression testing (Phase 2)

---

## Current State vs. End State

### Current State (70% Complete)
```
HAVE:
✅ HTML parser (147 lines)
✅ DOM tree structure (188 lines)
✅ CSS parser (128 lines)
✅ JavaScript engine (rquickjs, 262 lines)
✅ Basic exposed APIs (customFixture, customExpect, reportTestResult)

MISSING:
❌ Test function serialization (TypeScript → JavaScript string)
❌ Layout calculation (CSS → element dimensions)
❌ DOM rendering (layout → pixels)
❌ Screenshot capture (pixels → PNG file)
❌ querySelector / querySelectorAll
❌ Element property access (.value, .placeholder, etc.)
```

### End State (100% Complete)
```
HAVE:
✅ Full functional test execution
✅ Headless rendering with real output
✅ Screenshot capture to PNG
✅ Full DOM API (querySelector, properties, methods)
✅ All 5 components passing with visual verification
✅ Ready to unblock 47 pending components

RESULT:
✅ 169 tests passing functionally
✅ 5 components visually verified
✅ 47 components ready for development
```

---

## Implementation Phases Summary

| Phase | Task | Duration | Status |
|-------|------|----------|--------|
| 0 | Decision & Planning | 1-2h | 🔄 IN PROGRESS |
| 1 | Layout Engine | 2-3d | ⏳ PENDING |
| 2 | Rendering Engine | 2-3d | ⏳ PENDING |
| 3 | Screenshot Capture | 1-2d | ⏳ PENDING |
| 4 | Test Serialization | 3-5d | ⏳ PENDING |
| 5 | DOM API Enhancement | 2-3d | ⏳ PENDING |
| 6 | Error Handling | 1d | ⏳ PENDING |
| 7 | Integration & Verification | 2-3d | ⏳ PENDING |
| **TOTAL** | **Complete Rust Browser** | **2-3 weeks** | 🎯 GOAL |

---

## Key Design Decisions

### 1. TDD Approach Throughout
- Every feature starts with Red phase (failing tests)
- Green phase implements the minimum to pass
- Refactor phase improves code quality
- This ensures correctness and maintainability

### 2. Headless Operation
- No visible window (uses raqote for rendering, not a window library)
- Screenshots save to `/test-output/` directory
- User never sees intermediate rendering
- Perfect for CI/CD pipelines

### 3. Full DOM API
- querySelector and properties exactly match browser
- Tests written for real DOM use, not custom APIs
- Unblocks remaining 47 components
- Enables standard Web Component testing

### 4. AST-Based Test Serialization
- Extracts actual test code from TypeScript
- Preserves variable scoping and logic
- Future-proof for complex tests
- Aligns with existing industry standards

---

## Success Metrics

After completing this roadmap:

✅ **Functional Verification**
- 169 tests passing with real assertions
- Zero dummy results
- Proper error reporting and stack traces

✅ **Visual Verification**
- 5 components with visual screenshots
- Screenshots match expected output
- Baselines created for regression testing

✅ **Development Unblocked**
- 47 pending components ready to start
- Text Input component complete
- Rendering pipeline fully functional

---

## Next Steps

1. ✅ Create comprehensive test specs (DONE)
2. ✅ Design rendering architecture (DONE)
3. 🔄 **CONFIRM SERIALIZATION APPROACH**
4. 📅 Start Phase 1: Layout Engine TDD
5. 📅 Progress through phases systematically
6. 🎯 Complete Text Input & verify all 5 components
7. 🚀 Unblock 47 pending components

---

**Full detailed phase documentation** available in `RENDERING_ARCHITECTURE.md`
