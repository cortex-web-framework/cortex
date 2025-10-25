#![allow(dead_code)]

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum NodeType {
    Document,
    Element,
    Text,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum NodeData {
    Element(ElementData),
    Text(String),
}

#[derive(Debug, PartialEq, Clone)] // Removed Eq
pub struct Node {
    pub node_type: NodeType,
    pub parent: Option<usize>, // Index into a Vec<Node> for parent
    pub children: Vec<usize>,  // Indices into a Vec<Node> for children
    pub data: Option<NodeData>,
    pub shadow_root: Option<ShadowRoot>,
    pub event_listeners: std::collections::HashMap<String, Vec<usize>>, // Map event type to list of listener indices
    pub layout: Option<Layout>,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct ElementData {
    pub tag_name: String,
    pub attributes: std::collections::HashMap<String, String>,
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub struct ShadowRoot {
    pub mode: ShadowRootMode,
    pub children: Vec<usize>, // Indices into the Document's nodes for children of the shadow root
}

#[derive(Debug, PartialEq, Eq, Clone)]
pub enum ShadowRootMode {
    Open,
    Closed,
}

#[derive(Debug, PartialEq, Clone)]
pub struct Layout {
    pub x: f32,
    pub y: f32,
    pub width: f32,
    pub height: f32,
    pub content_width: f32,
    pub content_height: f32,
    pub padding_top: f32,
    pub padding_right: f32,
    pub padding_bottom: f32,
    pub padding_left: f32,
    pub margin_top: f32,
    pub margin_right: f32,
    pub margin_bottom: f32,
    pub margin_left: f32,
    pub border_width: f32,
    pub font_size: f32,
    pub display: Display,
}

#[derive(Debug, PartialEq, Clone)]
pub enum Display {
    Block,
    Inline,
    InlineBlock,
    Flex,
    Grid,
    None,
}

impl Default for Display {
    fn default() -> Self {
        Display::Block
    }
}

#[derive(Debug)]
pub struct Document {
    pub nodes: Vec<Node>,
    pub root: usize, // Index of the root element
}

impl Document {
    pub fn new() -> Self {
        let document_node = Node {
            node_type: NodeType::Document,
            parent: None,
            children: Vec::new(),
            data: None,
            shadow_root: None,
            event_listeners: std::collections::HashMap::new(),
            layout: None,
        };
        let mut nodes = Vec::new();
        nodes.push(document_node);

        Document {
            nodes,
            root: 0,
        }
    }

    pub fn create_element(&mut self, tag_name: &str) -> usize {
        let element_data = ElementData {
            tag_name: tag_name.to_string(),
            attributes: std::collections::HashMap::new(),
        };
        let node = Node {
            node_type: NodeType::Element,
            parent: None,
            children: Vec::new(),
            data: Some(NodeData::Element(element_data)),
            shadow_root: None,
            event_listeners: std::collections::HashMap::new(),
            layout: None,
        };
        let idx = self.nodes.len();
        self.nodes.push(node);
        idx
    }

    pub fn create_text_node(&mut self, text_content: &str) -> usize {
        let node = Node {
            node_type: NodeType::Text,
            parent: None,
            children: Vec::new(),
            data: Some(NodeData::Text(text_content.to_string())),
            shadow_root: None,
            event_listeners: std::collections::HashMap::new(),
            layout: None,
        };
        let idx = self.nodes.len();
        self.nodes.push(node);
        idx
    }

    pub fn append_child(&mut self, parent_idx: usize, child_idx: usize) {
        // Update parent's children
        self.nodes[parent_idx].children.push(child_idx);
        // Update child's parent
        self.nodes[child_idx].parent = Some(parent_idx);
    }

    pub fn get_node(&self, idx: usize) -> Option<&Node> {
        self.nodes.get(idx)
    }

    pub fn get_node_mut(&mut self, idx: usize) -> Option<&mut Node> {
        self.nodes.get_mut(idx)
    }

    pub fn set_attribute(&mut self, element_idx: usize, name: &str, value: &str) {
        if let Some(node) = self.nodes.get_mut(element_idx) {
            if let Some(NodeData::Element(element_data)) = &mut node.data {
                element_data.attributes.insert(name.to_string(), value.to_string());
            }
        }
    }

    pub fn get_attribute(&self, element_idx: usize, name: &str) -> Option<&String> {
        if let Some(node) = self.nodes.get(element_idx) {
            if let Some(NodeData::Element(element_data)) = &node.data {
                return element_data.attributes.get(name);
            }
        }
        None
    }

    pub fn attach_shadow(&mut self, host_idx: usize, mode: ShadowRootMode) -> Result<usize, &'static str> {
        if let Some(node) = self.nodes.get_mut(host_idx) {
            if node.node_type == NodeType::Element {
                if node.shadow_root.is_some() {
                    return Err("Shadow root already exists for this host.");
                }
                let shadow_root = ShadowRoot {
                    mode,
                    children: Vec::new(),
                };
                node.shadow_root = Some(shadow_root);
                // Return the index of the host node, as the shadow root is part of it
                Ok(host_idx)
            } else {
                Err("Cannot attach shadow root to a non-element node.")
            }
        } else {
            Err("Host node not found.")
        }
    }

    // Event System
    pub fn add_event_listener(&mut self, node_idx: usize, event_type: &str, listener_idx: usize) {
        if let Some(node) = self.nodes.get_mut(node_idx) {
            node.event_listeners.entry(event_type.to_string()).or_insert_with(Vec::new).push(listener_idx);
        }
    }

    pub fn dispatch_event(&mut self, target_idx: usize, event_type: &str) {
        let mut current_idx = Some(target_idx);
        while let Some(idx) = current_idx {
            if let Some(node) = self.nodes.get(idx) {
                if let Some(listeners) = node.event_listeners.get(event_type) {
                    // In a real browser, this would execute the JS listener callback
                    // For now, we just print that an event was dispatched
                    println!("Event '{}' dispatched on node index {}", event_type, idx);
                }
                current_idx = node.parent;
            } else {
                break;
            }
        }
    }
}
