/// Font rendering module for Cortex browser engine
///
/// Provides font management, glyph rasterization, and caching
/// using the fontdue library for pure Rust font rendering.

use std::collections::HashMap;
use fontdue::Font;

/// Represents a rasterized glyph bitmap
#[derive(Debug, Clone)]
pub struct GlyphBitmap {
    /// Raw bitmap data (grayscale, one byte per pixel)
    pub data: Vec<u8>,
    /// Width in pixels
    pub width: usize,
    /// Height in pixels
    pub height: usize,
    /// Horizontal advance in pixels
    pub advance_width: f32,
}

/// Manages fonts and glyph rasterization
///
/// The FontManager loads a default embedded font and provides
/// efficient glyph rasterization with caching.
pub struct FontManager {
    default_font: Font,
    glyph_cache: HashMap<(char, u32), GlyphBitmap>,
}

impl FontManager {
    /// Create a new FontManager with embedded default font
    ///
    /// # Returns
    /// A new FontManager instance or an error if font loading fails
    pub fn new() -> Result<Self, String> {
        // Load embedded DejaVu Sans Mono font
        let font_data = include_bytes!("../assets/DejaVuSansMono.ttf");
        let font = Font::from_bytes(font_data.to_vec(), Default::default())
            .map_err(|e| format!("Failed to load embedded font: {}", e))?;

        Ok(FontManager {
            default_font: font,
            glyph_cache: HashMap::new(),
        })
    }

    /// Rasterize a glyph to a bitmap
    ///
    /// # Arguments
    /// * `ch` - The character to rasterize
    /// * `size_px` - Font size in pixels
    ///
    /// # Returns
    /// A GlyphBitmap or an error if rasterization fails
    pub fn rasterize_glyph(&mut self, ch: char, size_px: u32) -> Result<GlyphBitmap, String> {
        let cache_key = (ch, size_px);

        // Check cache first
        if let Some(cached) = self.glyph_cache.get(&cache_key) {
            return Ok(cached.clone());
        }

        // Rasterize the glyph
        let (metrics, bitmap) = self.default_font.rasterize(ch, size_px as f32);

        let glyph = GlyphBitmap {
            data: bitmap,
            width: metrics.width,
            height: metrics.height,
            advance_width: metrics.advance_width,
        };

        // Cache the result
        self.glyph_cache.insert(cache_key, glyph.clone());

        Ok(glyph)
    }

    /// Get the advance width for a character at a given size
    ///
    /// # Arguments
    /// * `ch` - The character
    /// * `size_px` - Font size in pixels
    ///
    /// # Returns
    /// The horizontal advance width in pixels
    pub fn char_advance(&self, ch: char, size_px: u32) -> f32 {
        let (metrics, _) = self.default_font.rasterize(ch, size_px as f32);
        metrics.advance_width
    }

    /// Get the height of a character
    ///
    /// # Arguments
    /// * `size_px` - Font size in pixels
    ///
    /// # Returns
    /// The height in pixels (typically same as font size)
    pub fn line_height(&self, size_px: u32) -> f32 {
        size_px as f32 * 1.2  // Approximate line height (120% of font size)
    }

    /// Clear the glyph cache to free memory
    ///
    /// This can be called if memory usage becomes a concern
    pub fn clear_cache(&mut self) {
        self.glyph_cache.clear();
    }

    /// Get cache statistics (for debugging)
    ///
    /// # Returns
    /// Tuple of (cached_glyphs_count, memory_usage_estimate)
    pub fn cache_stats(&self) -> (usize, usize) {
        let count = self.glyph_cache.len();
        let memory = self.glyph_cache.values()
            .map(|g| g.data.len())
            .sum::<usize>();
        (count, memory)
    }
}

impl Default for FontManager {
    fn default() -> Self {
        FontManager::new().expect("Failed to create default FontManager")
    }
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn test_font_manager_creation() {
        let fm = FontManager::new();
        assert!(fm.is_ok(), "FontManager should be created successfully");
    }

    #[test]
    fn test_glyph_rasterization() {
        let mut fm = FontManager::new().expect("Failed to create FontManager");
        let glyph = fm.rasterize_glyph('A', 16);

        assert!(glyph.is_ok(), "Glyph rasterization should succeed");

        let g = glyph.unwrap();
        assert!(g.width > 0, "Glyph width should be positive");
        assert!(g.height > 0, "Glyph height should be positive");
        assert!(!g.data.is_empty(), "Glyph data should not be empty");
    }

    #[test]
    fn test_glyph_caching() {
        let mut fm = FontManager::new().expect("Failed to create FontManager");

        let (cached_before, _) = fm.cache_stats();
        assert_eq!(cached_before, 0, "Cache should start empty");

        let _ = fm.rasterize_glyph('A', 16).unwrap();
        let (cached_after, _) = fm.cache_stats();
        assert_eq!(cached_after, 1, "Cache should contain 1 glyph");

        let _ = fm.rasterize_glyph('A', 16).unwrap();
        let (cached_after2, _) = fm.cache_stats();
        assert_eq!(cached_after2, 1, "Cache should still contain 1 glyph (no duplicates)");
    }

    #[test]
    fn test_char_advance() {
        let fm = FontManager::new().expect("Failed to create FontManager");

        let advance = fm.char_advance('A', 16);
        assert!(advance > 0.0, "Character advance should be positive");
    }

    #[test]
    fn test_line_height() {
        let fm = FontManager::new().expect("Failed to create FontManager");

        let height = fm.line_height(16);
        assert!(height > 16.0, "Line height should be greater than font size");
    }

    #[test]
    fn test_cache_clear() {
        let mut fm = FontManager::new().expect("Failed to create FontManager");

        let _ = fm.rasterize_glyph('A', 16).unwrap();
        let (cached_before, _) = fm.cache_stats();
        assert!(cached_before > 0, "Cache should have entries");

        fm.clear_cache();
        let (cached_after, _) = fm.cache_stats();
        assert_eq!(cached_after, 0, "Cache should be empty after clear");
    }

    #[test]
    fn test_unicode_support() {
        let mut fm = FontManager::new().expect("Failed to create FontManager");

        // Test various Unicode characters
        let test_chars = vec!['A', '1', ' ', '!', 'ñ', '€'];

        for ch in test_chars {
            let result = fm.rasterize_glyph(ch, 16);
            assert!(result.is_ok(), "Should support character: {}", ch);
        }
    }
}
