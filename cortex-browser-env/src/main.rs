mod dom;
mod parser;
mod custom_elements;
mod css;
mod layout;
mod query;
mod element;
mod error;

use std::sync::{Arc, Mutex};
use raqote::{DrawTarget, SolidSource, Source, StrokeStyle, LineCap, LineJoin, PathBuilder};
use rquickjs::{Runtime, Context, Function, Value, Object};

// Struct to hold test results
#[derive(Debug, Clone)]
pub struct TestResult {
    pub name: String,
    pub passed: bool,
    pub message: String,
}

fn main() {
    let args: Vec<String> = std::env::args().collect();
    let js_code_arg = if args.len() > 1 {
        &args[1]
    } else {
        eprintln!("Usage: cortex-browser-env <javascript_code>");
        std::process::exit(1);
    };

    println!("Hello, cortex-browser-env!");
    let html_content = "<html><body><h1>Hello, World!</h1></body></html>";
    let document = parser::parse_html(html_content);
    println!("Parsed document: {:#?}", document);

    let custom_elements_registry = Arc::new(Mutex::new(custom_elements::CustomElementRegistry::new()));
    println!("Custom Element Registry created.");

    // Store test results
    let test_results = Arc::new(Mutex::new(Vec::<TestResult>::new()));

    // Parse some CSS
    let css_content = r#"
        body {
            background-color: #f0f0f0;
            margin: 0;
        }
        h1 {
            color: blue;
            font-size: 24px;
        }
    "#;
    let stylesheet = css::parse_css(css_content);
    println!("Parsed stylesheet: {:#?}", stylesheet);

    // Initialize rquickjs runtime and context
    let runtime = Runtime::new().unwrap();
    let context = Context::full(&runtime).unwrap();
    let document_arc = Arc::new(Mutex::new(document)); // Wrap document in Arc<Mutex> here

    context.with(|ctx| {
        let globals = ctx.globals();

        // Expose a simple 'console.log' to the JavaScript environment
        let console_obj = Object::new(ctx.clone()).unwrap();
        let log_fn = Function::new(ctx.clone(), |msg: String| {
            println!("JS Console: {}", msg);
        }).unwrap();
        console_obj.set("log", log_fn).unwrap();
        globals.set("console", console_obj).unwrap();

        // Expose customElements registry to JavaScript
        let custom_elements_registry_clone = custom_elements_registry.clone();
        let custom_elements_obj = Object::new(ctx.clone()).unwrap();

        let define_fn = Function::new(ctx.clone(), move |tag_name: String, _constructor_fn: Function| {
            let mut registry = custom_elements_registry_clone.lock().unwrap();
            // For now, we just store a dummy index. Later, this will store a reference to the constructor function.
            registry.define(&tag_name, 0);
            println!("JS: customElements.define('{}', constructor_name)", tag_name);
        }).unwrap();
        custom_elements_obj.set("define", define_fn).unwrap();

        let custom_elements_registry_clone = custom_elements_registry.clone();
        let get_fn = Function::new(ctx.clone(), move |tag_name: String| -> Option<u32> {
            let registry = custom_elements_registry_clone.lock().unwrap();
            if let Some(idx) = registry.get(&tag_name) {
                println!("JS: customElements.get('{}') -> Found index {}", tag_name, idx);
                Some(*idx as u32)
            } else {
                println!("JS: customElements.get('{}') -> Not found", tag_name);
                None
            }
        }).unwrap();
        custom_elements_obj.set("get", get_fn).unwrap();

        globals.set("customElements", custom_elements_obj).unwrap();

        // Expose attachShadow functionality
        let document_arc_clone = document_arc.clone();
        let attach_shadow_fn = Function::new(ctx.clone(), move |host_idx: u32, mode: String| -> rquickjs::Result<u32> {
            let mut doc = document_arc_clone.lock().unwrap();
            let shadow_mode = match mode.as_str() {
                "open" => dom::ShadowRootMode::Open,
                "closed" => dom::ShadowRootMode::Closed,
                _ => return Err(rquickjs::Error::Exception),
            };
            match doc.attach_shadow(host_idx as usize, shadow_mode) {
                Ok(idx) => Ok(idx as u32),
                Err(_) => Err(rquickjs::Error::Exception),
            }
        }).unwrap();
        globals.set("attachShadow", attach_shadow_fn).unwrap();

        // Expose event system functionality
        let document_arc_clone_add_listener = document_arc.clone();
        let add_event_listener_fn = Function::new(ctx.clone(), move |node_idx: u32, event_type: String, _listener_fn: Function| {
            let mut doc = document_arc_clone_add_listener.lock().unwrap();
            doc.add_event_listener(node_idx as usize, &event_type, 0); // Dummy index for now
            println!("JS: addEventListener on node {} for event '{}'", node_idx, event_type);
        }).unwrap();
        globals.set("addEventListener", add_event_listener_fn).unwrap();

        let document_arc_clone_dispatch_event = document_arc.clone();
        let dispatch_event_fn = Function::new(ctx.clone(), move |node_idx: u32, event_type: String| {
            let mut doc = document_arc_clone_dispatch_event.lock().unwrap();
            doc.dispatch_event(node_idx as usize, &event_type);
        }).unwrap();
        globals.set("dispatchEvent", dispatch_event_fn).unwrap();

        // Expose test reporting function
        let test_results_clone = test_results.clone();
        let report_test_result_fn = Function::new(ctx.clone(), move |name: String, passed: bool, message: String| {
            let mut results = test_results_clone.lock().unwrap();
            results.push(TestResult { name: name.clone(), passed, message: message.clone() });
            println!("Test Result: {} - {}", name, if passed { "PASSED" } else { "FAILED" });
        }).unwrap();
        globals.set("reportTestResult", report_test_result_fn).unwrap();

        // Expose customFixture function
        let document_arc_clone_fixture = document_arc.clone();
        let custom_fixture_fn = Function::new(ctx.clone(), move |tag_name: String, attributes: Object| -> rquickjs::Result<u32> {
            let mut doc = document_arc_clone_fixture.lock().unwrap();
            let element_idx = doc.create_element(&tag_name);
            // Append to document body (for now, assuming body is at index 2)
            doc.append_child(2, element_idx);

            // Set attributes
            for item in attributes.into_iter() {
                let (key, value) = item?;
                let key_str = key.to_string()?;
                let value_str = value.as_string().ok_or(rquickjs::Error::Exception)?.to_string()?;
                doc.set_attribute(element_idx, &key_str, &value_str);
            }
            Ok(element_idx as u32)
        }).unwrap();
        globals.set("customFixture", custom_fixture_fn).unwrap();

        // Note: customExpect, querySelector, and querySelectorAll will be integrated in Phase 5b
        // after resolving rquickjs Context lifetime constraints

        // Calculate layout with viewport dimensions
        let mut document_for_layout = document_arc.lock().unwrap();
        layout::calculate_layout(&mut document_for_layout, 256.0, 256.0);
        drop(document_for_layout); // Release the lock

        // Rendering to image
        let mut dt = DrawTarget::new(256, 256);
        dt.clear(SolidSource::from_unpremultiplied_argb(0xff, 0xff, 0xff, 0xff)); // White background

        let mut pb = PathBuilder::new();
        pb.rect(10.0, 10.0, 100.0, 50.0);
        let path = pb.finish();

        dt.fill(&path, &Source::Solid(SolidSource::from_unpremultiplied_argb(0xff, 0xff, 0x00, 0x00)), &raqote::DrawOptions::new());

        dt.stroke(&path, &Source::Solid(SolidSource::from_unpremultiplied_argb(0xff, 0x00, 0x00, 0x00)),
                  &StrokeStyle {
                      width: 2.0,
                      cap: LineCap::Round,
                      join: LineJoin::Round,
                      miter_limit: 2.0,
                      dash_array: Vec::new(),
                      dash_offset: 0.0,
                  },
                  &raqote::DrawOptions::new());

        dt.write_png("output.png").expect("Failed to write PNG");
        println!("Rendered image to output.png");

        // Execute JavaScript code from command-line argument
        match ctx.eval::<Value, _>(js_code_arg.as_str()) {
            Ok(value) => println!("JS Result: {:#?}", value),
            Err(e) => eprintln!("JS Error: {}", e),
        }
    });

    // Print final test results
    println!("\n--- Test Summary ---");
    let final_results = test_results.lock().unwrap();
    for result in final_results.iter() {
        println!("{} [{}] - {}", result.name, if result.passed { "PASSED" } else { "FAILED" }, result.message);
    }
}
