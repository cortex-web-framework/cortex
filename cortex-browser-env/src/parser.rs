use super::dom::{Document, Node, NodeType, ElementData, NodeData};
use std::collections::HashMap;
use std::iter::Peekable;
use std::str::Chars;

pub fn parse_html(html: &str) -> Document {
    let mut document = Document::new();
    let mut current_parent_idx: Option<usize> = Some(document.root);

    let mut chars = html.chars().peekable();

    while let Some(&c) = chars.peek() {
        match c {
            '<' => {
                chars.next(); // Consume '<'
                // Start of a tag
                if chars.peek() == Some(&'/') {
                    // End tag
                    chars.next(); // Consume '/'
                    let tag_name = consume_tag_name(&mut chars);
                    // Pop current_parent_idx if it matches the end tag
                    if let Some(parent_idx) = current_parent_idx {
                        if let Some(Node { node_type: NodeType::Element, data: Some(NodeData::Element(ElementData { tag_name: current_tag, .. })), .. }) = document.get_node(parent_idx) {
                            if current_tag == &tag_name {
                                current_parent_idx = document.get_node(parent_idx).unwrap().parent;
                            }
                        }
                    }
                    consume_until(&mut chars, '>');
                    chars.next(); // Consume '>'
                } else {
                    // Start tag
                    let tag_name = consume_tag_name(&mut chars);
                    let attributes = consume_attributes(&mut chars);
                    consume_until(&mut chars, '>');
                    chars.next(); // Consume '>'

                    let new_element_idx = document.create_element(&tag_name);
                    for (attr_name, attr_value) in attributes {
                        document.set_attribute(new_element_idx, &attr_name, &attr_value);
                    }

                    if let Some(parent_idx) = current_parent_idx {
                        document.append_child(parent_idx, new_element_idx);
                    }
                    current_parent_idx = Some(new_element_idx);
                }
            }
            _ => {
                // Text content
                let text_content = consume_text(&mut chars);
                if !text_content.trim().is_empty() {
                    let new_text_node_idx = document.create_text_node(&text_content);

                    if let Some(parent_idx) = current_parent_idx {
                        document.append_child(parent_idx, new_text_node_idx);
                    }
                }
            }
        }
    }

    document
}

fn consume_tag_name(chars: &mut Peekable<Chars>) -> String {
    let mut name = String::new();
    while let Some(&c) = chars.peek() {
        // Allow alphanumeric, hyphens, underscores, and colons for custom elements
        // Examples: ui-text-input, my:component, custom-element_v2
        if c.is_alphanumeric() || c == '-' || c == '_' || c == ':' {
            name.push(chars.next().unwrap());
        } else {
            break;
        }
    }
    name
}

fn consume_attributes(chars: &mut Peekable<Chars>) -> HashMap<String, String> {
    let mut attributes = HashMap::new();
    while let Some(&c) = chars.peek() {
        if c.is_whitespace() {
            chars.next();
        } else if c == '>' || c == '/' {
            break;
        } else {
            let attr_name = consume_attr_name(chars);
            consume_until(chars, '=');
            chars.next(); // Consume '=' 
            let attr_value = consume_attr_value(chars);
            attributes.insert(attr_name, attr_value);
        }
    }
    attributes
}

fn consume_attr_name(chars: &mut Peekable<Chars>) -> String {
    let mut name = String::new();
    while let Some(&c) = chars.peek() {
        if c.is_alphanumeric() || c == '-' {
            name.push(chars.next().unwrap());
        } else {
            break;
        }
    }
    name
}

fn consume_attr_value(chars: &mut Peekable<Chars>) -> String {
    let mut value = String::new();
    let quote_char = if chars.peek() == Some(&'\'') || chars.peek() == Some(&'"') {
        chars.next().unwrap()
    } else {
        '\0' // No quote
    };

    while let Some(&c) = chars.peek() {
        if quote_char != '\0' && c == quote_char {
            chars.next(); // Consume closing quote
            break;
        } else if quote_char == '\0' && (c.is_whitespace() || c == '>') {
            break;
        } else {
            value.push(chars.next().unwrap());
        }
    }
    value
}

fn consume_text(chars: &mut Peekable<Chars>) -> String {
    let mut text = String::new();
    while let Some(&c) = chars.peek() {
        if c == '<' {
            break;
        }
        text.push(chars.next().unwrap());
    }
    text
}

fn consume_until(chars: &mut Peekable<Chars>, target: char) {
    while let Some(&c) = chars.peek() {
        if c == target {
            break;
        }
        chars.next();
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::dom::{NodeData, NodeType};

    #[test]
    fn test_parse_simple_html() {
        let html = "<html><body><h1>Hello</h1></body></html>";
        let document = parse_html(html);

        // Document root is node 0
        let root_node = document.get_node(document.root).unwrap();
        assert_eq!(root_node.children.len(), 1);

        // Get <html> element (should be the first and only child of the document)
        let html_node_idx = root_node.children[0];
        let html_node = document.get_node(html_node_idx).unwrap();
        if let Some(NodeData::Element(data)) = &html_node.data {
            assert_eq!(data.tag_name, "html");
        } else {
            panic!("HTML node should be an element");
        }
        assert_eq!(html_node.children.len(), 1);
        assert_eq!(html_node.parent, Some(document.root));

        // Get <body> element
        let body_node_idx = html_node.children[0];
        let body_node = document.get_node(body_node_idx).unwrap();
        if let Some(NodeData::Element(data)) = &body_node.data {
            assert_eq!(data.tag_name, "body");
        } else {
            panic!("Body node should be an element");
        }
        assert_eq!(body_node.children.len(), 1);
        assert_eq!(body_node.parent, Some(html_node_idx));

        // Get <h1> element
        let h1_node_idx = body_node.children[0];
        let h1_node = document.get_node(h1_node_idx).unwrap();
        if let Some(NodeData::Element(data)) = &h1_node.data {
            assert_eq!(data.tag_name, "h1");
        } else {
            panic!("H1 node should be an element");
        }
        assert_eq!(h1_node.children.len(), 1);
        assert_eq!(h1_node.parent, Some(body_node_idx));

        // Get text node
        let text_node_idx = h1_node.children[0];
        let text_node = document.get_node(text_node_idx).unwrap();
        if let Some(NodeData::Text(text)) = &text_node.data {
            assert_eq!(text, "Hello");
        } else {
            panic!("Text node should contain text");
        }
        assert_eq!(text_node.children.len(), 0);
        assert_eq!(text_node.parent, Some(h1_node_idx));
    }
}
