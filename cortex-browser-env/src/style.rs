use crate::css::{CSSValue, ComputedStyle, StyleSheet, Rule};
use crate::dom::{Document, Node, NodeData, NodeType};
use std::collections::HashMap;

#[derive(Debug, PartialEq)]
pub struct StyledNode<'a> {
    pub node: &'a Node,
    pub specified_values: ComputedStyle,
    pub children: Vec<StyledNode<'a>>,
}

// Returns true if a node matches a simple selector.
fn matches(node: &Node, selector: &str) -> bool {
    if let Some(NodeData::Element(element_data)) = &node.data {
        // Check for tag name match
        if element_data.tag_name == selector {
            return true;
        }
        // Check for class match
        if let Some(class_attr) = element_data.attributes.get("class") {
            if class_attr.split_whitespace().any(|c| format!(".{}", c) == selector) {
                return true;
            }
        }
        // Check for ID match
        if let Some(id_attr) = element_data.attributes.get("id") {
            if format!("#{}", id_attr) == selector {
                return true;
            }
        }
    }
    false
}

// Apply styles to a single node.
fn specified_values(node: &Node, stylesheet: &StyleSheet) -> ComputedStyle {
    let mut style = ComputedStyle::default();
    let mut matched_rules = Vec::new();

    for rule in &stylesheet.rules {
        for selector in &rule.selectors {
            if matches(node, selector) {
                matched_rules.push(rule);
                break; // Move to next rule once one selector matches
            }
        }
    }

    // Simple specificity: last rule wins.
    matched_rules.sort_by_key(|r| r.selectors.join(",")); // Not a real specificity sort, but stable
    for rule in matched_rules {
        for (property, value) in &rule.declarations {
            match property.as_str() {
                "color" => style.color = Some(value.clone()),
                // Add other property handlers here...
                _ => ()
            }
        }
    }

    style
}


pub fn style_tree<'a>(
    document: &'a Document,
    node_idx: usize,
    stylesheet: &'a StyleSheet,
) -> StyledNode<'a> {
    let node = document.get_node(node_idx).unwrap();
    let specified = specified_values(node, stylesheet);
    let children = node.children.iter().map(|child_idx| style_tree(document, *child_idx, stylesheet)).collect();

    StyledNode {
        node,
        specified_values: specified,
        children,
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::parser::{parse_html};
    use crate::css::{parse_css};

    #[test]
    fn test_style_simple_tree() {
        let html = "<html><body><p>Hello</p></body></html>";
        let document = parse_html(html);

        let css = "p { color: red; } h1 { color: blue; }";
        let stylesheet = parse_css(css);

        let styled_root = style_tree(&document, document.root, &stylesheet);

        // html -> body -> p
        let p_node_styled = &styled_root.children[0].children[0].children[0];
        
        if let Some(NodeData::Element(data)) = &p_node_styled.node.data {
            assert_eq!(data.tag_name, "p");
        } else {
            panic!("Expected p element");
        }

        assert_eq!(p_node_styled.specified_values.color, Some("red".to_string()));
    }
}
