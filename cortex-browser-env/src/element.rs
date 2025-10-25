/// Element Property and Method API
/// Provides typed access to element properties and methods

use crate::dom::{Document, NodeType, NodeData};

/// Element reference wrapping a node index
#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub struct ElementRef {
    pub index: usize,
}

impl ElementRef {
    /// Create a new element reference
    pub fn new(index: usize) -> Self {
        ElementRef { index }
    }

    /// Get an attribute value by name
    pub fn get_attribute(&self, document: &Document, name: &str) -> Option<String> {
        document.get_attribute(self.index, name).cloned()
    }

    /// Set an attribute
    pub fn set_attribute(&self, document: &mut Document, name: &str, value: &str) {
        document.set_attribute(self.index, name, value);
    }

    /// Remove an attribute
    pub fn remove_attribute(&self, document: &mut Document, name: &str) {
        if let Some(node) = document.get_node_mut(self.index) {
            if let Some(NodeData::Element(element)) = &mut node.data {
                element.attributes.remove(name);
            }
        }
    }

    /// Check if an attribute exists
    pub fn has_attribute(&self, document: &Document, name: &str) -> bool {
        self.get_attribute(document, name).is_some()
    }

    /// Get the element's tag name
    pub fn tag_name(&self, document: &Document) -> Option<String> {
        if let Some(node) = document.get_node(self.index) {
            if let Some(NodeData::Element(element)) = &node.data {
                return Some(element.tag_name.clone());
            }
        }
        None
    }

    /// Get the element's id attribute
    pub fn id(&self, document: &Document) -> Option<String> {
        self.get_attribute(document, "id")
    }

    /// Set the element's id attribute
    pub fn set_id(&self, document: &mut Document, value: &str) {
        self.set_attribute(document, "id", value);
    }

    /// Get the element's class attribute
    pub fn class_name(&self, document: &Document) -> Option<String> {
        self.get_attribute(document, "class")
    }

    /// Set the element's class attribute
    pub fn set_class_name(&self, document: &mut Document, value: &str) {
        self.set_attribute(document, "class", value);
    }

    /// Get the element's value attribute (for form elements)
    pub fn value(&self, document: &Document) -> Option<String> {
        self.get_attribute(document, "value")
    }

    /// Set the element's value attribute
    pub fn set_value(&self, document: &mut Document, value: &str) {
        self.set_attribute(document, "value", value);
    }

    /// Get the element's placeholder attribute
    pub fn placeholder(&self, document: &Document) -> Option<String> {
        self.get_attribute(document, "placeholder")
    }

    /// Set the element's placeholder attribute
    pub fn set_placeholder(&self, document: &mut Document, value: &str) {
        self.set_attribute(document, "placeholder", value);
    }

    /// Check if the element has the disabled attribute
    pub fn disabled(&self, document: &Document) -> bool {
        self.has_attribute(document, "disabled")
    }

    /// Set or remove the disabled attribute
    pub fn set_disabled(&self, document: &mut Document, disabled: bool) {
        if disabled {
            self.set_attribute(document, "disabled", "");
        } else {
            self.remove_attribute(document, "disabled");
        }
    }

    /// Get the element's type attribute (for form elements)
    pub fn type_attr(&self, document: &Document) -> Option<String> {
        self.get_attribute(document, "type")
    }

    /// Set the element's type attribute
    pub fn set_type(&self, document: &mut Document, value: &str) {
        self.set_attribute(document, "type", value);
    }

    /// Get the element's data-* attributes
    pub fn data(&self, document: &Document, key: &str) -> Option<String> {
        let attr_name = format!("data-{}", key);
        self.get_attribute(document, &attr_name)
    }

    /// Set a data-* attribute
    pub fn set_data(&self, document: &mut Document, key: &str, value: &str) {
        let attr_name = format!("data-{}", key);
        self.set_attribute(document, &attr_name, value);
    }

    /// Get all attributes as a map
    pub fn attributes(&self, document: &Document) -> Option<std::collections::HashMap<String, String>> {
        if let Some(node) = document.get_node(self.index) {
            if let Some(NodeData::Element(element)) = &node.data {
                return Some(element.attributes.clone());
            }
        }
        None
    }

    /// Check if this element is valid
    pub fn is_valid(&self, document: &Document) -> bool {
        if let Some(node) = document.get_node(self.index) {
            return node.node_type == NodeType::Element;
        }
        false
    }
}

// ============================================================================
// TESTS (RED PHASE - TDD)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    // ========================================================================
    // ATTRIBUTE OPERATIONS
    // ========================================================================

    #[test]
    fn test_set_and_get_attribute() {
        // Given: A document with an element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We set an attribute
        elem_ref.set_attribute(&mut doc, "data-test", "value123");

        // Then: We should be able to retrieve it
        assert_eq!(elem_ref.get_attribute(&doc, "data-test"), Some("value123".to_string()));
    }

    #[test]
    fn test_has_attribute() {
        // Given: An element with an attribute
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);
        elem_ref.set_attribute(&mut doc, "type", "text");

        // When: We check for the attribute
        let has_it = elem_ref.has_attribute(&doc, "type");

        // Then: Should return true
        assert!(has_it);
    }

    #[test]
    fn test_has_attribute_missing() {
        // Given: An element without an attribute
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We check for a missing attribute
        let has_it = elem_ref.has_attribute(&doc, "nonexistent");

        // Then: Should return false
        assert!(!has_it);
    }

    #[test]
    fn test_remove_attribute() {
        // Given: An element with an attribute
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);
        elem_ref.set_attribute(&mut doc, "data-test", "value");

        // When: We remove the attribute
        elem_ref.remove_attribute(&mut doc, "data-test");

        // Then: It should be gone
        assert!(!elem_ref.has_attribute(&doc, "data-test"));
    }

    #[test]
    fn test_multiple_attributes() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We set multiple attributes
        elem_ref.set_attribute(&mut doc, "type", "text");
        elem_ref.set_attribute(&mut doc, "placeholder", "Enter text");
        elem_ref.set_attribute(&mut doc, "id", "myinput");

        // Then: All should be retrievable
        assert_eq!(elem_ref.get_attribute(&doc, "type"), Some("text".to_string()));
        assert_eq!(elem_ref.get_attribute(&doc, "placeholder"), Some("Enter text".to_string()));
        assert_eq!(elem_ref.get_attribute(&doc, "id"), Some("myinput".to_string()));
    }

    // ========================================================================
    // ELEMENT PROPERTIES
    // ========================================================================

    #[test]
    fn test_id_property() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We set the ID
        elem_ref.set_id(&mut doc, "myid");

        // Then: We should retrieve it
        assert_eq!(elem_ref.id(&doc), Some("myid".to_string()));
    }

    #[test]
    fn test_class_name_property() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We set the class name
        elem_ref.set_class_name(&mut doc, "button primary");

        // Then: We should retrieve it
        assert_eq!(elem_ref.class_name(&doc), Some("button primary".to_string()));
    }

    #[test]
    fn test_value_property() {
        // Given: An input element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, input);

        let input_ref = ElementRef::new(input);

        // When: We set the value
        input_ref.set_value(&mut doc, "Hello World");

        // Then: We should retrieve it
        assert_eq!(input_ref.value(&doc), Some("Hello World".to_string()));
    }

    #[test]
    fn test_placeholder_property() {
        // Given: An input element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, input);

        let input_ref = ElementRef::new(input);

        // When: We set the placeholder
        input_ref.set_placeholder(&mut doc, "Enter your name");

        // Then: We should retrieve it
        assert_eq!(input_ref.placeholder(&doc), Some("Enter your name".to_string()));
    }

    #[test]
    fn test_type_property() {
        // Given: An input element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, input);

        let input_ref = ElementRef::new(input);

        // When: We set the type
        input_ref.set_type(&mut doc, "password");

        // Then: We should retrieve it
        assert_eq!(input_ref.type_attr(&doc), Some("password".to_string()));
    }

    #[test]
    fn test_disabled_property() {
        // Given: An input element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, input);

        let input_ref = ElementRef::new(input);

        // When: We set disabled to true
        input_ref.set_disabled(&mut doc, true);

        // Then: Disabled should be true
        assert!(input_ref.disabled(&doc));
    }

    #[test]
    fn test_disabled_property_false() {
        // Given: A disabled input
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, input);

        let input_ref = ElementRef::new(input);
        input_ref.set_disabled(&mut doc, true);

        // When: We disable it
        input_ref.set_disabled(&mut doc, false);

        // Then: It should not be disabled
        assert!(!input_ref.disabled(&doc));
    }

    // ========================================================================
    // DATA ATTRIBUTES
    // ========================================================================

    #[test]
    fn test_data_attribute_get_set() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We set a data attribute
        elem_ref.set_data(&mut doc, "userId", "12345");

        // Then: We should retrieve it
        assert_eq!(elem_ref.data(&doc, "userId"), Some("12345".to_string()));
    }

    #[test]
    fn test_data_attribute_missing() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We query a missing data attribute
        let result = elem_ref.data(&doc, "missing");

        // Then: Should return None
        assert_eq!(result, None);
    }

    // ========================================================================
    // TAG NAME
    // ========================================================================

    #[test]
    fn test_tag_name() {
        // Given: An element with a tag name
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, input);

        let input_ref = ElementRef::new(input);

        // When: We get the tag name
        let tag = input_ref.tag_name(&doc);

        // Then: Should be "input"
        assert_eq!(tag, Some("input".to_string()));
    }

    #[test]
    fn test_tag_name_document_node() {
        // Given: The document node (not an element)
        let doc = Document::new();
        let doc_ref = ElementRef::new(0);

        // When: We try to get tag name of document
        let tag = doc_ref.tag_name(&doc);

        // Then: Should return None
        assert_eq!(tag, None);
    }

    // ========================================================================
    // ATTRIBUTES MAP
    // ========================================================================

    #[test]
    fn test_get_all_attributes() {
        // Given: An element with multiple attributes
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);
        elem_ref.set_attribute(&mut doc, "type", "text");
        elem_ref.set_attribute(&mut doc, "id", "myinput");
        elem_ref.set_attribute(&mut doc, "class", "form-control");

        // When: We get all attributes
        let attrs = elem_ref.attributes(&doc);

        // Then: Should have all attributes
        assert!(attrs.is_some());
        let attrs = attrs.unwrap();
        assert_eq!(attrs.get("type").map(|s| s.as_str()), Some("text"));
        assert_eq!(attrs.get("id").map(|s| s.as_str()), Some("myinput"));
        assert_eq!(attrs.get("class").map(|s| s.as_str()), Some("form-control"));
    }

    #[test]
    fn test_is_valid_element() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We check if it's valid
        let valid = elem_ref.is_valid(&doc);

        // Then: Should be true
        assert!(valid);
    }

    #[test]
    fn test_is_valid_invalid_index() {
        // Given: A document
        let doc = Document::new();
        let elem_ref = ElementRef::new(9999);

        // When: We check validity of non-existent index
        let valid = elem_ref.is_valid(&doc);

        // Then: Should be false
        assert!(!valid);
    }

    // ========================================================================
    // EDGE CASES
    // ========================================================================

    #[test]
    fn test_empty_attribute_value() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input = doc.create_element("input");
        doc.append_child(0, html);
        doc.append_child(html, input);

        let input_ref = ElementRef::new(input);

        // When: We set an empty attribute value
        input_ref.set_attribute(&mut doc, "data-empty", "");

        // Then: Should still be retrievable
        assert_eq!(input_ref.get_attribute(&doc, "data-empty"), Some("".to_string()));
    }

    #[test]
    fn test_attribute_with_special_characters() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We set an attribute with special characters
        elem_ref.set_attribute(&mut doc, "data-json", "{\"key\": \"value\"}");

        // Then: Should preserve special characters
        assert_eq!(
            elem_ref.get_attribute(&doc, "data-json"),
            Some("{\"key\": \"value\"}".to_string())
        );
    }

    #[test]
    fn test_element_ref_clone() {
        // Given: An element reference
        let elem_ref = ElementRef::new(42);

        // When: We clone it
        let cloned = elem_ref.clone();

        // Then: Both should refer to the same element
        assert_eq!(elem_ref, cloned);
        assert_eq!(elem_ref.index, cloned.index);
    }

    #[test]
    fn test_attribute_overwrite() {
        // Given: An element with an attribute
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);
        elem_ref.set_attribute(&mut doc, "data-value", "first");

        // When: We overwrite it
        elem_ref.set_attribute(&mut doc, "data-value", "second");

        // Then: Should have the new value
        assert_eq!(elem_ref.get_attribute(&doc, "data-value"), Some("second".to_string()));
    }

    #[test]
    fn test_case_sensitive_attribute_names() {
        // Given: An element
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");
        doc.append_child(0, html);
        doc.append_child(html, elem);

        let elem_ref = ElementRef::new(elem);

        // When: We set attributes with different cases
        elem_ref.set_attribute(&mut doc, "dataTest", "value1");
        elem_ref.set_attribute(&mut doc, "datatest", "value2");

        // Then: They should be separate attributes
        assert_eq!(elem_ref.get_attribute(&doc, "dataTest"), Some("value1".to_string()));
        assert_eq!(elem_ref.get_attribute(&doc, "datatest"), Some("value2".to_string()));
    }
}
