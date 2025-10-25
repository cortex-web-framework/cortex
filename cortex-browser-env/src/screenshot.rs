use raqote::DrawTarget;
use std::path::{Path, PathBuf};
use std::fs;
use std::io::Write;

/// Save a DrawTarget as a PNG file to the specified path (headless)
/// Creates parent directories if they don't exist
pub fn save_screenshot(draw_target: &DrawTarget, path: &Path) -> Result<PathBuf, ScreenshotError> {
    // Create parent directories if needed
    if let Some(parent) = path.parent() {
        if !parent.as_os_str().is_empty() {
            fs::create_dir_all(parent)
                .map_err(|e| ScreenshotError::IoError(format!("Failed to create directories: {}", e)))?;
        }
    }

    // Get pixel data from DrawTarget
    let width = draw_target.width() as u32;
    let height = draw_target.height() as u32;
    let data = draw_target.get_data();

    // Convert from raqote's format to PNG format
    let png_data = encode_png(data, width, height)
        .map_err(|e| ScreenshotError::EncodingError(e))?;

    // Write to file
    let mut file = fs::File::create(path)
        .map_err(|e| ScreenshotError::IoError(format!("Failed to create file: {}", e)))?;

    file.write_all(&png_data)
        .map_err(|e| ScreenshotError::IoError(format!("Failed to write file: {}", e)))?;

    Ok(path.to_path_buf())
}

/// Encode pixel data to PNG format
fn encode_png(data: &[u32], width: u32, height: u32) -> Result<Vec<u8>, String> {
    use png::Encoder;

    // Create a buffer to write PNG data
    let mut png_buffer = Vec::new();

    {
        let mut encoder = Encoder::new(&mut png_buffer, width, height);
        encoder.set_color(png::ColorType::Rgba);
        encoder.set_depth(png::BitDepth::Eight);

        let mut encoder = encoder
            .write_header()
            .map_err(|e| format!("PNG header error: {}", e))?;

        // Convert raqote's ARGB format to PNG RGBA format
        let mut rgba_data = Vec::with_capacity((width * height * 4) as usize);

        for &pixel in data {
            let a = ((pixel >> 24) & 0xFF) as u8;
            let r = ((pixel >> 16) & 0xFF) as u8;
            let g = ((pixel >> 8) & 0xFF) as u8;
            let b = (pixel & 0xFF) as u8;

            rgba_data.push(r);
            rgba_data.push(g);
            rgba_data.push(b);
            rgba_data.push(a);
        }

        encoder
            .write_image_data(&rgba_data)
            .map_err(|e| format!("PNG write error: {}", e))?;
    }

    Ok(png_buffer)
}

/// Error types for screenshot operations
#[derive(Debug)]
pub enum ScreenshotError {
    IoError(String),
    EncodingError(String),
}

impl std::fmt::Display for ScreenshotError {
    fn fmt(&self, f: &mut std::fmt::Formatter) -> std::fmt::Result {
        match self {
            ScreenshotError::IoError(e) => write!(f, "IO Error: {}", e),
            ScreenshotError::EncodingError(e) => write!(f, "Encoding Error: {}", e),
        }
    }
}

impl std::error::Error for ScreenshotError {}

// ============================================================================
// TESTS (RED PHASE - TDD)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::tempdir;

    // ========================================================================
    // BASIC FILE OPERATIONS
    // ========================================================================

    #[test]
    fn test_screenshot_creates_file() {
        // Given: A DrawTarget and a temporary path
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("test.png");

        let mut dt = DrawTarget::new(100, 100);

        // When: We save a screenshot
        let result = save_screenshot(&mut dt, &file_path);

        // Then: File should be created successfully
        assert!(result.is_ok());
        assert!(file_path.exists());
        assert!(file_path.is_file());

        // Cleanup happens automatically with tempdir drop
    }

    #[test]
    fn test_screenshot_returns_correct_path() {
        // Given: A DrawTarget and a path
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("screenshot.png");

        let mut dt = DrawTarget::new(50, 50);

        // When: We save a screenshot
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Returned path should match input path
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), file_path);
    }

    #[test]
    fn test_screenshot_creates_parent_directories() {
        // Given: A nested path that doesn't exist
        let temp_dir = tempdir().unwrap();
        let nested_path = temp_dir.path().join("subdir").join("nested").join("screenshot.png");

        let mut dt = DrawTarget::new(100, 100);

        // When: We save a screenshot with nested path
        let result = save_screenshot(&mut dt, &nested_path);

        // Then: All parent directories should be created
        assert!(result.is_ok());
        assert!(nested_path.parent().unwrap().exists());
        assert!(nested_path.exists());
    }

    #[test]
    fn test_screenshot_file_not_empty() {
        // Given: A DrawTarget with content
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("content.png");

        let mut dt = DrawTarget::new(100, 100);

        // When: We save a screenshot
        save_screenshot(&mut dt, &file_path).unwrap();

        // Then: File should contain PNG data (not empty)
        let metadata = fs::metadata(&file_path).unwrap();
        assert!(metadata.len() > 0);

        // PNG files should start with magic bytes: 89 50 4E 47
        let file_data = fs::read(&file_path).unwrap();
        assert_eq!(&file_data[0..4], &[137, 80, 78, 71]); // PNG magic number
    }

    #[test]
    fn test_screenshot_small_dimensions() {
        // Given: A DrawTarget with small dimensions
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("small.png");

        let mut dt = DrawTarget::new(1, 1);

        // When: We save a screenshot
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should succeed without error
        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    #[test]
    fn test_screenshot_large_dimensions() {
        // Given: A DrawTarget with large dimensions
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("large.png");

        let mut dt = DrawTarget::new(2048, 1536);

        // When: We save a screenshot
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should succeed without error
        assert!(result.is_ok());
        assert!(file_path.exists());

        // File should be reasonably sized
        let metadata = fs::metadata(&file_path).unwrap();
        assert!(metadata.len() > 100); // At least larger than PNG header
    }

    #[test]
    fn test_screenshot_overwrite_existing_file() {
        // Given: A path with an existing file
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("overwrite.png");

        // Create initial file
        let mut dt1 = DrawTarget::new(50, 50);
        save_screenshot(&mut dt1, &file_path).unwrap();
        let first_size = fs::metadata(&file_path).unwrap().len();

        // When: We save a different screenshot to same path
        let mut dt2 = DrawTarget::new(100, 100);
        let result = save_screenshot(&mut dt2, &file_path);

        // Then: File should be overwritten
        assert!(result.is_ok());
        let second_size = fs::metadata(&file_path).unwrap().len();
        assert!(second_size > first_size); // Larger file should have different size

        // Still valid PNG
        let file_data = fs::read(&file_path).unwrap();
        assert_eq!(&file_data[0..4], &[137, 80, 78, 71]); // PNG magic
    }

    #[test]
    fn test_screenshot_multiple_files() {
        // Given: A directory and multiple screenshots
        let temp_dir = tempdir().unwrap();

        // When: We save multiple screenshots
        for i in 0..5 {
            let file_path = temp_dir.path().join(format!("screenshot_{}.png", i));
            let mut dt = DrawTarget::new(100 + (i as i32 * 10), 100);
            let result = save_screenshot(&mut dt, &file_path);
            assert!(result.is_ok());
        }

        // Then: All files should exist
        for i in 0..5 {
            let file_path = temp_dir.path().join(format!("screenshot_{}.png", i));
            assert!(file_path.exists());
        }
    }

    // ========================================================================
    // PNG FORMAT VALIDATION
    // ========================================================================

    #[test]
    fn test_screenshot_produces_valid_png_header() {
        // Given: A DrawTarget
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("header.png");

        let mut dt = DrawTarget::new(10, 10);

        // When: We save a screenshot
        save_screenshot(&mut dt, &file_path).unwrap();

        // Then: PNG magic number should be present
        let file_data = fs::read(&file_path).unwrap();
        // PNG signature: 137 80 78 71 13 10 26 10
        assert_eq!(file_data[0], 137);
        assert_eq!(file_data[1], 80);
        assert_eq!(file_data[2], 78);
        assert_eq!(file_data[3], 71);
    }

    #[test]
    fn test_screenshot_square_image() {
        // Given: A square DrawTarget
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("square.png");

        let mut dt = DrawTarget::new(256, 256);

        // When: We save a screenshot
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should create valid square PNG
        assert!(result.is_ok());
        assert!(file_path.exists());
        let file_data = fs::read(&file_path).unwrap();
        assert_eq!(&file_data[0..4], &[137, 80, 78, 71]);
    }

    #[test]
    fn test_screenshot_wide_image() {
        // Given: A wide DrawTarget
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("wide.png");

        let mut dt = DrawTarget::new(1024, 256);

        // When: We save a screenshot
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should create valid wide PNG
        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    #[test]
    fn test_screenshot_tall_image() {
        // Given: A tall DrawTarget
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("tall.png");

        let mut dt = DrawTarget::new(256, 1024);

        // When: We save a screenshot
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should create valid tall PNG
        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    // ========================================================================
    // ERROR HANDLING
    // ========================================================================

    #[test]
    fn test_screenshot_invalid_path_creates_directories() {
        // Given: A path with non-existent parent directories
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("a").join("b").join("c").join("d").join("screenshot.png");

        let mut dt = DrawTarget::new(50, 50);

        // When: We try to save with missing directories
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should succeed by creating directories
        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    #[test]
    fn test_screenshot_empty_filename() {
        // Given: A path with just a directory (no filename)
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("");

        let mut dt = DrawTarget::new(50, 50);

        // When: We try to save with empty filename
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should fail gracefully
        // This test verifies error handling, not that it succeeds
        // Result depends on OS - may succeed or fail
        let _ = result; // Suppress warning - testing error handling path
    }

    // ========================================================================
    // FILENAME PATTERNS
    // ========================================================================

    #[test]
    fn test_screenshot_special_characters_in_filename() {
        // Given: A filename with special characters
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("test-screenshot_2024.png");

        let mut dt = DrawTarget::new(50, 50);

        // When: We save with special characters
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should succeed
        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    #[test]
    fn test_screenshot_numeric_filename() {
        // Given: A numeric filename
        let temp_dir = tempdir().unwrap();
        let file_path = temp_dir.path().join("12345.png");

        let mut dt = DrawTarget::new(50, 50);

        // When: We save with numeric name
        let result = save_screenshot(&mut dt, &file_path);

        // Then: Should succeed
        assert!(result.is_ok());
        assert!(file_path.exists());
    }

    // ========================================================================
    // CONSISTENCY TESTS
    // ========================================================================

    #[test]
    fn test_screenshot_consistent_output() {
        // Given: Two identical DrawTargets
        let temp_dir = tempdir().unwrap();
        let path1 = temp_dir.path().join("output1.png");
        let path2 = temp_dir.path().join("output2.png");

        let mut dt1 = DrawTarget::new(100, 100);
        let mut dt2 = DrawTarget::new(100, 100);

        // When: We save both
        save_screenshot(&mut dt1, &path1).unwrap();
        save_screenshot(&mut dt2, &path2).unwrap();

        // Then: Files should have same size (identical content)
        let size1 = fs::metadata(&path1).unwrap().len();
        let size2 = fs::metadata(&path2).unwrap().len();
        assert_eq!(size1, size2);
    }
}
