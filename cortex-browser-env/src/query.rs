/// DOM Query Methods - querySelector and querySelectorAll
/// Implements CSS selector matching for DOM elements

use crate::dom::{Document, NodeType, NodeData};

/// Simple CSS Selector representation
#[derive(Debug, Clone, PartialEq)]
pub enum Selector {
    Element(String),                    // div, span, p, etc.
    Id(String),                         // #myid
    Class(String),                      // .myclass
    Attribute(String, String),          // [attr="value"]
    AttributeExists(String),            // [attr]
    Descendant(Box<Selector>, Box<Selector>), // parent descendant
    Child(Box<Selector>, Box<Selector>), // parent > child
}

/// Query result for a single element
pub struct QueryResult {
    pub node_index: usize,
}

/// Parse a simple CSS selector (basic support for tag, #id, .class, [attr])
pub fn parse_selector(selector: &str) -> Result<Selector, String> {
    let selector = selector.trim();

    if selector.is_empty() {
        return Err("Empty selector".to_string());
    }

    // Handle ID selector (#id)
    if selector.starts_with('#') {
        let id = selector[1..].to_string();
        return Ok(Selector::Id(id));
    }

    // Handle class selector (.class)
    if selector.starts_with('.') {
        let class = selector[1..].to_string();
        return Ok(Selector::Class(class));
    }

    // Handle attribute selector ([attr="value"] or [attr])
    if selector.starts_with('[') && selector.ends_with(']') {
        let content = &selector[1..selector.len()-1];
        if let Some(eq_pos) = content.find('=') {
            let attr = content[..eq_pos].trim().to_string();
            let value_part = &content[eq_pos+1..].trim();
            let value = if value_part.starts_with('"') && value_part.ends_with('"') {
                value_part[1..value_part.len()-1].to_string()
            } else if value_part.starts_with('\'') && value_part.ends_with('\'') {
                value_part[1..value_part.len()-1].to_string()
            } else {
                value_part.to_string()
            };
            return Ok(Selector::Attribute(attr, value));
        } else {
            return Ok(Selector::AttributeExists(content.to_string()));
        }
    }

    // Handle element/tag selector
    Ok(Selector::Element(selector.to_string()))
}

/// Check if a node matches a selector
fn matches_selector(document: &Document, node_idx: usize, selector: &Selector) -> bool {
    let node = match document.get_node(node_idx) {
        Some(n) => n,
        None => return false,
    };

    // Only elements can match selectors
    if node.node_type != NodeType::Element {
        return false;
    }

    let element_data = match &node.data {
        Some(NodeData::Element(e)) => e,
        _ => return false,
    };

    match selector {
        Selector::Element(tag) => {
            element_data.tag_name.to_lowercase() == tag.to_lowercase()
        },
        Selector::Id(id) => {
            element_data.attributes.get("id").map(|v| v == id).unwrap_or(false)
        },
        Selector::Class(class) => {
            if let Some(classes) = element_data.attributes.get("class") {
                classes.split_whitespace().any(|c| c == class)
            } else {
                false
            }
        },
        Selector::Attribute(attr, value) => {
            element_data.attributes.get(attr).map(|v| v == value).unwrap_or(false)
        },
        Selector::AttributeExists(attr) => {
            element_data.attributes.contains_key(attr)
        },
        Selector::Descendant(_, _) | Selector::Child(_, _) => {
            // Handled in the tree traversal
            false
        }
    }
}

/// Find all elements matching a selector in the document
pub fn query_selector_all(document: &Document, selector: &str) -> Result<Vec<usize>, String> {
    let parsed = parse_selector(selector)?;
    let mut results = Vec::new();

    // Start searching from document root
    fn search_recursive(
        document: &Document,
        node_idx: usize,
        selector: &Selector,
        results: &mut Vec<usize>,
    ) {
        let node = match document.get_node(node_idx) {
            Some(n) => n,
            None => return,
        };

        // Check if this node matches
        if matches_selector(document, node_idx, selector) {
            results.push(node_idx);
        }

        // Recursively search children
        for child_idx in &node.children {
            search_recursive(document, *child_idx, selector, results);
        }
    }

    // Start from root (skip the document node itself)
    if let Some(root_node) = document.get_node(0) {
        for child_idx in &root_node.children {
            search_recursive(document, *child_idx, &parsed, &mut results);
        }
    }

    Ok(results)
}

/// Find the first element matching a selector
pub fn query_selector(document: &Document, selector: &str) -> Result<Option<usize>, String> {
    let results = query_selector_all(document, selector)?;
    Ok(results.first().copied())
}

// ============================================================================
// TESTS (RED PHASE - TDD)
// ============================================================================

#[cfg(test)]
mod tests {
    use super::*;

    // ========================================================================
    // SELECTOR PARSING
    // ========================================================================

    #[test]
    fn test_parse_element_selector() {
        let result = parse_selector("div");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Selector::Element("div".to_string()));
    }

    #[test]
    fn test_parse_element_selector_case_insensitive() {
        let result = parse_selector("DIV");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Selector::Element("DIV".to_string()));
    }

    #[test]
    fn test_parse_id_selector() {
        let result = parse_selector("#myid");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Selector::Id("myid".to_string()));
    }

    #[test]
    fn test_parse_class_selector() {
        let result = parse_selector(".myclass");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Selector::Class("myclass".to_string()));
    }

    #[test]
    fn test_parse_attribute_selector_with_value() {
        let result = parse_selector("[type=\"text\"]");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Selector::Attribute("type".to_string(), "text".to_string()));
    }

    #[test]
    fn test_parse_attribute_selector_with_single_quotes() {
        let result = parse_selector("[type='text']");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Selector::Attribute("type".to_string(), "text".to_string()));
    }

    #[test]
    fn test_parse_attribute_selector_exists() {
        let result = parse_selector("[disabled]");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Selector::AttributeExists("disabled".to_string()));
    }

    #[test]
    fn test_parse_empty_selector() {
        let result = parse_selector("");
        assert!(result.is_err());
    }

    #[test]
    fn test_parse_selector_with_whitespace() {
        let result = parse_selector("  div  ");
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Selector::Element("div".to_string()));
    }

    // ========================================================================
    // QUERY SELECTOR ALL
    // ========================================================================

    #[test]
    fn test_query_selector_all_finds_elements_by_tag() {
        // Given: A document with multiple elements
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let body = doc.create_element("body");
        let div1 = doc.create_element("div");
        let div2 = doc.create_element("div");
        let p = doc.create_element("p");

        doc.append_child(0, html);
        doc.append_child(html, body);
        doc.append_child(body, div1);
        doc.append_child(body, div2);
        doc.append_child(body, p);

        // When: We query for all divs
        let result = query_selector_all(&doc, "div");

        // Then: Should find both divs
        assert!(result.is_ok());
        let divs = result.unwrap();
        assert_eq!(divs.len(), 2);
        assert!(divs.contains(&div1));
        assert!(divs.contains(&div2));
    }

    #[test]
    fn test_query_selector_all_finds_nested_elements() {
        // Given: A nested DOM structure
        let mut doc = Document::new();
        let root = doc.create_element("div");
        let nested = doc.create_element("div");
        let deeply_nested = doc.create_element("div");

        doc.append_child(0, root);
        doc.append_child(root, nested);
        doc.append_child(nested, deeply_nested);

        // When: We query for all divs
        let result = query_selector_all(&doc, "div");

        // Then: Should find all three divs
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 3);
    }

    #[test]
    fn test_query_selector_all_by_id() {
        // Given: A document with elements having IDs
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem1 = doc.create_element("div");
        let elem2 = doc.create_element("div");

        doc.append_child(0, html);
        doc.append_child(html, elem1);
        doc.append_child(html, elem2);
        doc.set_attribute(elem1, "id", "target");
        doc.set_attribute(elem2, "id", "other");

        // When: We query for elements by ID
        let result = query_selector_all(&doc, "#target");

        // Then: Should find the matching element
        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0], elem1);
    }

    #[test]
    fn test_query_selector_all_by_class() {
        // Given: A document with elements having classes
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem1 = doc.create_element("div");
        let elem2 = doc.create_element("div");
        let elem3 = doc.create_element("span");

        doc.append_child(0, html);
        doc.append_child(html, elem1);
        doc.append_child(html, elem2);
        doc.append_child(html, elem3);
        doc.set_attribute(elem1, "class", "highlight");
        doc.set_attribute(elem2, "class", "highlight");
        doc.set_attribute(elem3, "class", "other");

        // When: We query for elements by class
        let result = query_selector_all(&doc, ".highlight");

        // Then: Should find both highlighted elements
        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 2);
        assert!(results.contains(&elem1));
        assert!(results.contains(&elem2));
    }

    #[test]
    fn test_query_selector_all_by_class_with_multiple_classes() {
        // Given: An element with multiple classes
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");

        doc.append_child(0, html);
        doc.append_child(html, elem);
        doc.set_attribute(elem, "class", "highlight active");

        // When: We query for one of the classes
        let result = query_selector_all(&doc, ".highlight");

        // Then: Should find the element
        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0], elem);
    }

    #[test]
    fn test_query_selector_all_by_attribute() {
        // Given: A document with elements having attributes
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input1 = doc.create_element("input");
        let input2 = doc.create_element("input");

        doc.append_child(0, html);
        doc.append_child(html, input1);
        doc.append_child(html, input2);
        doc.set_attribute(input1, "type", "text");
        doc.set_attribute(input2, "type", "checkbox");

        // When: We query by attribute
        let result = query_selector_all(&doc, "[type=\"text\"]");

        // Then: Should find matching element
        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0], input1);
    }

    #[test]
    fn test_query_selector_all_by_attribute_exists() {
        // Given: Elements with and without an attribute
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input1 = doc.create_element("input");
        let input2 = doc.create_element("input");

        doc.append_child(0, html);
        doc.append_child(html, input1);
        doc.append_child(html, input2);
        doc.set_attribute(input1, "disabled", "");

        // When: We query for elements with the disabled attribute
        let result = query_selector_all(&doc, "[disabled]");

        // Then: Should find only the disabled element
        assert!(result.is_ok());
        let results = result.unwrap();
        assert_eq!(results.len(), 1);
        assert_eq!(results[0], input1);
    }

    #[test]
    fn test_query_selector_all_returns_empty_when_no_matches() {
        // Given: A document
        let mut doc = Document::new();
        let html = doc.create_element("html");
        doc.append_child(0, html);

        // When: We query for non-existent elements
        let result = query_selector_all(&doc, ".nonexistent");

        // Then: Should return empty vector
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 0);
    }

    #[test]
    fn test_query_selector_all_case_insensitive_tags() {
        // Given: Elements with uppercase tags
        let mut doc = Document::new();
        let html = doc.create_element("HTML");
        let body = doc.create_element("BODY");
        let div = doc.create_element("DIV");

        doc.append_child(0, html);
        doc.append_child(html, body);
        doc.append_child(body, div);

        // When: We query with lowercase
        let result = query_selector_all(&doc, "div");

        // Then: Should find the uppercase DIV
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 1);
    }

    // ========================================================================
    // QUERY SELECTOR (First Match)
    // ========================================================================

    #[test]
    fn test_query_selector_returns_first_match() {
        // Given: Multiple matching elements
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let div1 = doc.create_element("div");
        let div2 = doc.create_element("div");

        doc.append_child(0, html);
        doc.append_child(html, div1);
        doc.append_child(html, div2);

        // When: We query for div
        let result = query_selector(&doc, "div");

        // Then: Should return the first div
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Some(div1));
    }

    #[test]
    fn test_query_selector_returns_none_when_no_match() {
        // Given: A document
        let mut doc = Document::new();
        let html = doc.create_element("html");
        doc.append_child(0, html);

        // When: We query for non-existent element
        let result = query_selector(&doc, ".nonexistent");

        // Then: Should return None
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), None);
    }

    #[test]
    fn test_query_selector_by_id_returns_first() {
        // Given: A document with an element having an ID
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");

        doc.append_child(0, html);
        doc.append_child(html, elem);
        doc.set_attribute(elem, "id", "myid");

        // When: We query by ID
        let result = query_selector(&doc, "#myid");

        // Then: Should find the element
        assert!(result.is_ok());
        assert_eq!(result.unwrap(), Some(elem));
    }

    // ========================================================================
    // EDGE CASES
    // ========================================================================

    #[test]
    fn test_empty_document() {
        // Given: An empty document (just the document node)
        let doc = Document::new();

        // When: We query
        let result = query_selector_all(&doc, "div");

        // Then: Should return empty
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 0);
    }

    #[test]
    fn test_query_text_nodes_not_matched() {
        // Given: A document with text nodes
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let text = doc.create_text_node("Hello");

        doc.append_child(0, html);
        doc.append_child(html, text);

        // When: We query for elements
        let result = query_selector_all(&doc, "div");

        // Then: Text nodes should not be matched
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 0);
    }

    #[test]
    fn test_query_with_special_characters_in_attribute() {
        // Given: An element with special characters in attribute
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let input = doc.create_element("input");

        doc.append_child(0, html);
        doc.append_child(html, input);
        doc.set_attribute(input, "data-test", "value-with-dashes");

        // When: We query by attribute with dashes
        let result = query_selector_all(&doc, "[data-test=\"value-with-dashes\"]");

        // Then: Should find the element
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 1);
    }

    #[test]
    fn test_query_multiple_classes_in_selector() {
        // Given: An element with multiple classes
        let mut doc = Document::new();
        let html = doc.create_element("html");
        let elem = doc.create_element("div");

        doc.append_child(0, html);
        doc.append_child(html, elem);
        doc.set_attribute(elem, "class", "button primary");

        // When: We query for .primary
        let result = query_selector_all(&doc, ".primary");

        // Then: Should find the element
        assert!(result.is_ok());
        assert_eq!(result.unwrap().len(), 1);
    }
}
