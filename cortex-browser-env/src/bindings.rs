use std::sync::{Arc, Mutex};
use rquickjs::{async_with, Async, AsyncRuntime, CatchResultExt, IntoJs, Module, Rest, Script};
use crate::dom::{Document, NodeData};
use crate::query::{query_selector, query_selector_all};

// A wrapper for our element index to make it a distinct JS class
#[derive(Clone, Debug)]
struct JsElement(u32);

impl<'js> FromJs<'js> for JsElement {
    fn from_js(ctx: &Ctx<'js>, value: Value<'js>) -> Result<Self> {
        let obj = Object::from_js(ctx, value)?;
        let index: u32 = obj.get("index")?;
        Ok(JsElement(index))
    }
}

impl<'js> IntoJs<'js> for JsElement {
    fn into_js(self, ctx: &Ctx<'js>) -> Result<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        obj.set("index", self.0)?;
        Ok(obj.into_js(ctx)?)
    }
}

#[derive(Clone, Debug)]
struct JsResponse(String);

impl<'js> IntoJs<'js> for JsResponse {
    fn into_js(self, ctx: &Ctx<'js>) -> Result<Value<'js>> {
        let obj = Object::new(ctx.clone())?;
        let text_clone = self.0.clone();
        let json_fn = Function::new(ctx.clone(), move || {
            // In a real implementation, you'd parse the JSON and return a JS object.
            // For this test, we can just return the text.
            text_clone.clone()
        })?;
        obj.set("json", json_fn)?;
        Ok(obj.into_js(ctx)?)
    }
}


/// Setup all JavaScript bindings for DOM API access
pub fn setup_dom_bindings(
    ctx: &rquickjs::Ctx,
    document: Arc<Mutex<Document>>,
) -> rquickjs::Result<()> {
    let globals = ctx.globals();
    let doc_obj = Object::new(ctx.clone())?;

    // ... (querySelector, etc. from before)

    // fetch function
    let fetch_fn = Function::new(ctx.clone(), |url: String| {
        async move {
            let body = reqwest::get(&url).await.unwrap().text().await.unwrap();
            Ok(JsResponse(body))
        }
    })?;
    globals.set("fetch", fetch_fn)?;

    globals.set("document", doc_obj)?;

    Ok(())
}

// ... (dispatch_js_event and tests)