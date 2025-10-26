use std::collections::HashMap;
use super::dom::Display;

#[derive(Debug)]
pub struct StyleSheet {
    pub rules: Vec<Rule>,
}

#[derive(Debug)]
pub struct Rule {
    pub selectors: Vec<String>,
    pub declarations: HashMap<String, String>,
}

#[derive(Debug, Clone, PartialEq)]
pub struct ComputedStyle {
    pub width: Option<CSSValue>,
    pub height: Option<CSSValue>,
    pub padding_top: Option<CSSValue>,
    pub padding_right: Option<CSSValue>,
    pub padding_bottom: Option<CSSValue>,
    pub padding_left: Option<CSSValue>,
    pub margin_top: Option<CSSValue>,
    pub margin_right: Option<CSSValue>,
    pub margin_bottom: Option<CSSValue>,
    pub margin_left: Option<CSSValue>,
    pub border_width: Option<CSSValue>,
    pub border_color: Option<String>,
    pub display: Display,
    pub font_size: Option<CSSValue>,
    pub color: Option<String>,
    pub background_color: Option<String>,
}

#[derive(Debug, Clone, PartialEq)]
pub enum CSSValue {
    Pixels(f32),
    Percentage(f32),
    Auto,
    Inherit,
}

impl CSSValue {
    pub fn as_pixels(&self, reference: f32) -> f32 {
        match self {
            CSSValue::Pixels(px) => *px,
            CSSValue::Percentage(pct) => reference * (pct / 100.0),
            CSSValue::Auto => 0.0,
            CSSValue::Inherit => 0.0,
        }
    }
}

impl Default for ComputedStyle {
    fn default() -> Self {
        ComputedStyle {
            width: None,
            height: None,
            padding_top: None,
            padding_right: None,
            padding_bottom: None,
            padding_left: None,
            margin_top: None,
            margin_right: None,
            margin_bottom: None,
            margin_left: None,
            border_width: None,
            border_color: None,
            display: Display::Block,
            font_size: Some(CSSValue::Pixels(16.0)),
            color: None,
            background_color: None,
        }
    }
}

pub fn parse_css(css: &str) -> StyleSheet {
    // Very basic CSS parser for now
    // This will be expanded as needed

    let mut rules = Vec::new();
    let mut chars = css.chars().peekable();

    while let Some(&c) = chars.peek() {
        if c.is_whitespace() {
            chars.next();
            continue;
        }

        // Parse selectors
        let selectors = consume_selectors(&mut chars);
        if selectors.is_empty() {
            break; // No more selectors, end parsing
        }

        // Consume '{'
        consume_until(&mut chars, '{');
        chars.next(); // Consume '{'

        // Parse declarations
        let declarations = consume_declarations(&mut chars);

        // Consume '}'
        consume_until(&mut chars, '}');
        chars.next(); // Consume '}'

        rules.push(Rule {
            selectors,
            declarations,
        });
    }

    StyleSheet {
        rules,
    }
}

fn consume_selectors(chars: &mut std::iter::Peekable<std::str::Chars>) -> Vec<String> {
    let mut selectors = Vec::new();
    let mut current_selector = String::new();

    while let Some(&c) = chars.peek() {
        if c == '{' {
            break;
        } else if c == ',' {
            selectors.push(current_selector.trim().to_string());
            current_selector = String::new();
            chars.next(); // Consume ','
        } else {
            current_selector.push(chars.next().unwrap());
        }
    }

    if !current_selector.trim().is_empty() {
        selectors.push(current_selector.trim().to_string());
    }
    selectors
}

fn consume_declarations(chars: &mut std::iter::Peekable<std::str::Chars>) -> HashMap<String, String> {
    let mut declarations = HashMap::new();
    while let Some(&c) = chars.peek() {
        if c.is_whitespace() {
            chars.next();
            continue;
        }
        if c == '}' {
            break;
        }

        let property = consume_property(chars);
        consume_until(chars, ':');
        chars.next(); // Consume ':'
        let value = consume_value(chars);
        consume_until(chars, ';');
        chars.next(); // Consume ';'

        declarations.insert(property, value);
    }
    declarations
}

fn consume_property(chars: &mut std::iter::Peekable<std::str::Chars>) -> String {
    let mut property = String::new();
    while let Some(&c) = chars.peek() {
        if c.is_whitespace() || c == ':' {
            break;
        }
        property.push(chars.next().unwrap());
    }
    property.trim().to_string()
}

fn consume_value(chars: &mut std::iter::Peekable<std::str::Chars>) -> String {
    let mut value = String::new();
    while let Some(&c) = chars.peek() {
        if c == ';' || c == '}' {
            break;
        }
        value.push(chars.next().unwrap());
    }
    value.trim().to_string()
}

fn consume_until(chars: &mut std::iter::Peekable<std::str::Chars>, target: char) {
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
    use maplit::hashmap;

    #[test]
    fn test_parse_simple_css() {
        let css = "h1 { color: red; font-size: 16px; }";
        let stylesheet = parse_css(css);

        assert_eq!(stylesheet.rules.len(), 1);
        let rule = &stylesheet.rules[0];

        assert_eq!(rule.selectors, vec!["h1"]);
        assert_eq!(rule.declarations, hashmap!{
            "color".to_string() => "red".to_string(),
            "font-size".to_string() => "16px".to_string(),
        });
    }
}