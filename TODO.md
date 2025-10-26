# TODO: Headless Rust-Browser-Testtool

Dies ist die detaillierte Aufgabenliste, die aus dem `PLAN.md` abgeleitet wurde. Jede Aufgabe ist mit relevanten Kategorien gekennzeichnet.

### Meilenstein 1: Statischer Content-Parser

- [ ] `[parser][test]` Test-Infrastruktur für den HTML-Parser aufsetzen und einen fehlschlagenden Test für die DOM-Struktur-Prüfung schreiben.
- [ ] `[parser]` HTML-Parser mit `html5ever` implementieren, um eine DOM-Tree-Datenstruktur zu erzeugen.
- [ ] `[parser][test]` Test-Infrastruktur für die CSS-Engine aufsetzen und einen fehlschlagenden Test für die Regel-Interpretation schreiben.
- [ ] `[parser]` CSS-Engine mit `stylo` implementieren, um ein CSSOM zu erzeugen.
- [ ] `[parser][test]` Einen fehlschlagenden Integrationstest schreiben, der einen "Styled Tree" aus einem DOM-Tree und einem CSSOM erzeugt.
- [ ] `[parser]` Logik implementieren, um die CSS-Kaskade und Selektoren auf den DOM-Tree anzuwenden und den "Styled Tree" zu erstellen.

### Meilenstein 2: Layout-Kalkulator

- [ ] `[layout][test]` Einen fehlschlagenden TDD-Test für die Layout-Engine schreiben, der korrekte Bounding Boxes für ein einfaches Block-Layout prüft.
- [ ] `[layout]` Das `taffy`-Crate in das Projekt integrieren.
- [ ] `[layout]` Logik implementieren, um den "Styled Tree" in einen `taffy`-Layout-Tree umzuwandeln.
- [ ] `[layout]` Die Layout-Berechnung mit `taffy` aufrufen und den resultierenden Layout-Tree speichern.
- [ ] `[layout][test]` Weitere fehlschlagende TDD-Tests für komplexe Layouts (Flexbox, Grid) hinzufügen.
- [ ] `[layout]` Die Logik erweitern, um Flexbox- und Grid-Eigenschaften korrekt an `taffy` zu übergeben.

### Meilenstein 3: Headless Pixel-Renderer

- [ ] `[rendering][test]` Einen fehlschlagenden "Golden Master"-Test schreiben, der einen gerenderten Layout-Tree mit einem Master-PNG vergleicht.
- [ ] `[rendering]` CPU-basierte Rendering-Engine mit `tiny-skia` implementieren, um Layout-Boxen zu zeichnen.
- [ ] `[rendering]` Das `fontdue`-Crate integrieren, um Textinhalte zu rendern.
- [ ] `[rendering]` Das `image`-Crate verwenden, um den Pixel-Buffer als PNG-Datei zu kodieren und zu speichern.
- [ ] `[rendering][test]` Weitere "Golden Master"-Tests für komplexere visuelle Szenarien hinzufügen.

### Meilenstein 4: JavaScript-Runtime-Integration

- [ ] `[javascript][test]` Einen fehlschlagenden TDD-Test für die DOM-Manipulation aus einem `<script>`-Tag heraus schreiben.
- [ ] `[javascript]` Das `deno_core`-Crate integrieren und eine `JsRuntime`-Instanz initialisieren.
- [ ] `[javascript][dom]` Rust-zu-JS-Bindings ("Ops") für die DOM-Manipulation implementieren (z.B. `getElementById`).
-_ `[javascript]` Den `deno_core`-Event-Loop in den Haupt-Event-Loop des Browsers integrieren.
- [ ] `[javascript][test]` Einen fehlschlagenden TDD-Test für die DOM-Event-Behandlung (z.B. `onclick`) schreiben.
- [ ] `[javascript][dom]` Die Event-Dispatching-Logik vom DOM zur JS-Runtime implementieren.

### Meilenstein 5: Interaktivität & Logische Verifizierung

- [ ] `[network][test]` Einen fehlschlagenden TDD-Test für die `Fetch` API schreiben.
- [ ] `[network]` Die `Fetch` API implementieren, indem `deno_core` mit der `reqwest`-Netzwerkschicht verbunden wird.
- [ ] `[api]` Die öffentliche API des Test-Tools definieren und implementieren (z.B. `browser.load_url()`).
- [ ] `[verification][test]` Einen vollständigen, fehlschlagenden End-to-End-TDD-Test für die logische Verifizierung (DOM -> Layout -> Screenshot -> OCR) schreiben.
- [ ] `[verification]` Das logische Verifizierungssystem mit `tesseract` implementieren.
- [ ] `[verification][test]` Einen fehlschlagenden TDD-Test für die visuelle Regression (Pixel-Diff) mit `image-compare` aufsetzen und implementieren.
