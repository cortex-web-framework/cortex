use std::collections::HashMap;

pub struct CustomElementRegistry {
    registry: HashMap<String, usize>, // Map tag name to Node index (for now)
}

impl CustomElementRegistry {
    pub fn new() -> Self {
        CustomElementRegistry {
            registry: HashMap::new(),
        }
    }

    pub fn define(&mut self, tag_name: &str, constructor_idx: usize) {
        self.registry.insert(tag_name.to_string(), constructor_idx);
    }

    pub fn get(&self, tag_name: &str) -> Option<&usize> {
        self.registry.get(tag_name)
    }
}
