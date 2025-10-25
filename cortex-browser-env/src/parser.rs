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
        // Allow alphanumeric, hyphens, and underscores for custom elements (e.g., ui-text-input)
        if c.is_alphanumeric() || c == '-' || c == '_' {
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
