/**
 * Lightweight HTML documentation generator for Cortex UI components.
 * Generates static HTML documentation from component metadata.
 * Zero external dependencies - pure TypeScript.
 */

import { ComponentMetadata, ComponentRegistry } from './metadata.js';

/**
 * Escape HTML special characters.
 * @param text Text to escape
 * @returns Escaped HTML-safe text
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (char) => map[char] || char);
}

/**
 * Generate HTML documentation for a single component.
 * @param metadata Component metadata
 * @returns HTML string for the component
 */
export function generateComponentHTML(metadata: ComponentMetadata): string {
  const propsHtml = metadata.props
    .map(
      (prop) => `
    <tr>
      <td><code>${escapeHtml(prop.name)}</code></td>
      <td><code>${escapeHtml(prop.type)}</code></td>
      <td>${prop.default !== undefined ? escapeHtml(String(prop.default)) : 'N/A'}</td>
      <td>${prop.description ? escapeHtml(prop.description) : '—'}</td>
      <td>${prop.required ? 'Yes' : 'No'}</td>
    </tr>
  `
    )
    .join('');

  const eventsHtml = metadata.events
    .map(
      (event) => `
    <tr>
      <td><code>${escapeHtml(event.name)}</code></td>
      <td><code>${escapeHtml(event.detail)}</code></td>
      <td>${event.description ? escapeHtml(event.description) : '—'}</td>
    </tr>
  `
    )
    .join('');

  const slotsHtml = (metadata.slots ?? [])
    .map(
      (slot) => `
    <tr>
      <td><code>${escapeHtml(slot.name)}</code></td>
      <td>${slot.description ? escapeHtml(slot.description) : '—'}</td>
    </tr>
  `
    )
    .join('');

  const cssPropsHtml = (metadata.cssProps ?? [])
    .map(
      (prop) => `
    <tr>
      <td><code>${escapeHtml(prop.name)}</code></td>
      <td><code>${prop.default ? escapeHtml(prop.default) : 'N/A'}</code></td>
      <td>${prop.description ? escapeHtml(prop.description) : '—'}</td>
    </tr>
  `
    )
    .join('');

  const examplesHtml = (metadata.examples ?? [])
    .map(
      (example) => `
    <div class="example">
      <h4>${escapeHtml(example.title)}</h4>
      ${example.description ? `<p>${escapeHtml(example.description)}</p>` : ''}
      <div class="example-code">
        <pre><code>${escapeHtml(example.code)}</code></pre>
      </div>
      <div class="example-preview">
        ${example.code}
      </div>
    </div>
  `
    )
    .join('');

  return `
    <div class="component-doc">
      <h2 id="${escapeHtml(metadata.tag)}">${escapeHtml(metadata.name)}</h2>
      <p class="component-tag"><code>&lt;${escapeHtml(metadata.tag)}&gt;</code></p>
      ${metadata.category ? `<p class="component-category"><strong>Category:</strong> ${metadata.category}</p>` : ''}
      <p class="description">${escapeHtml(metadata.description)}</p>

      ${metadata.examples ? `<section class="examples"><h3>Examples</h3>${examplesHtml}</section>` : ''}

      ${metadata.props.length > 0 ? `
        <section class="props">
          <h3>Properties</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Default</th>
                <th>Description</th>
                <th>Required</th>
              </tr>
            </thead>
            <tbody>
              ${propsHtml}
            </tbody>
          </table>
        </section>
      ` : ''}

      ${metadata.events.length > 0 ? `
        <section class="events">
          <h3>Events</h3>
          <table>
            <thead>
              <tr>
                <th>Event</th>
                <th>Detail Type</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${eventsHtml}
            </tbody>
          </table>
        </section>
      ` : ''}

      ${(metadata.slots ?? []).length > 0 ? `
        <section class="slots">
          <h3>Slots</h3>
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${slotsHtml}
            </tbody>
          </table>
        </section>
      ` : ''}

      ${(metadata.cssProps ?? []).length > 0 ? `
        <section class="css-props">
          <h3>CSS Custom Properties</h3>
          <table>
            <thead>
              <tr>
                <th>Property</th>
                <th>Default</th>
                <th>Description</th>
              </tr>
            </thead>
            <tbody>
              ${cssPropsHtml}
            </tbody>
          </table>
        </section>
      ` : ''}

      ${metadata.since ? `<p class="since"><small><strong>Since:</strong> v${escapeHtml(metadata.since)}</small></p>` : ''}
    </div>
  `;
}

/**
 * Generate a complete HTML index page with all components.
 * @param registry Component registry
 * @returns Complete HTML string
 */
export function generateIndexHTML(registry: ComponentRegistry): string {
  const components = registry.list();
  const categories = registry.getCategories();

  const categoryHtml = categories
    .map((category) => {
      const categoryComponents = registry.listByCategory(category);
      const componentsListHtml = categoryComponents
        .map(
          (meta) => `
        <div class="component-link">
          <a href="#${escapeHtml(meta.tag)}">${escapeHtml(meta.name)}</a>
          <p class="component-desc">${escapeHtml(meta.description)}</p>
        </div>
      `
        )
        .join('');

      return `
      <div class="category">
        <h3>${category}</h3>
        <div class="components-list">
          ${componentsListHtml}
        </div>
      </div>
    `;
    })
    .join('');

  const componentsHtml = components.map((meta) => generateComponentHTML(meta)).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cortex UI Components (${components.length} components)</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }

    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
      color: #333;
      background: #f5f5f5;
    }

    header {
      background: #1a1a1a;
      color: white;
      padding: 2rem;
      text-align: center;
    }

    header h1 {
      font-size: 2.5rem;
      margin-bottom: 0.5rem;
    }

    header p {
      font-size: 1.1rem;
      opacity: 0.9;
    }

    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 2rem;
    }

    nav {
      background: white;
      padding: 2rem;
      margin-bottom: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    nav h2 {
      font-size: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .category {
      margin-bottom: 2rem;
    }

    .category h3 {
      font-size: 1.2rem;
      margin-bottom: 1rem;
      color: #007bff;
    }

    .components-list {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
      gap: 1rem;
    }

    .component-link {
      padding: 1rem;
      background: #f9f9f9;
      border: 1px solid #e0e0e0;
      border-radius: 6px;
      text-decoration: none;
      transition: all 0.2s;
    }

    .component-link a {
      color: #007bff;
      text-decoration: none;
      font-weight: 600;
      font-size: 1.1rem;
    }

    .component-link a:hover {
      color: #0056b3;
      text-decoration: underline;
    }

    .component-desc {
      margin-top: 0.5rem;
      color: #666;
      font-size: 0.9rem;
    }

    .documentation {
      background: white;
      padding: 2rem;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }

    .component-doc {
      margin-bottom: 3rem;
      padding-bottom: 2rem;
      border-bottom: 2px solid #e0e0e0;
    }

    .component-doc:last-child {
      border-bottom: none;
    }

    .component-doc h2 {
      font-size: 2rem;
      margin-bottom: 0.5rem;
    }

    .component-tag {
      color: #666;
      font-size: 0.95rem;
    }

    .component-category {
      color: #007bff;
      font-size: 0.95rem;
    }

    .description {
      margin: 1rem 0;
      font-size: 1.05rem;
      color: #555;
    }

    section {
      margin: 2rem 0;
    }

    section h3 {
      font-size: 1.3rem;
      margin-bottom: 1rem;
      color: #333;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 1rem 0;
      font-size: 0.95rem;
    }

    thead {
      background: #f0f0f0;
    }

    th {
      padding: 0.75rem;
      text-align: left;
      font-weight: 600;
      border: 1px solid #ddd;
    }

    td {
      padding: 0.75rem;
      border: 1px solid #ddd;
    }

    code {
      background: #f5f5f5;
      padding: 0.2rem 0.4rem;
      border-radius: 3px;
      font-family: 'Courier New', Courier, monospace;
      font-size: 0.9em;
    }

    .examples {
      background: #f9f9f9;
      padding: 1.5rem;
      border-radius: 6px;
      border-left: 4px solid #007bff;
    }

    .example {
      margin-bottom: 1.5rem;
    }

    .example h4 {
      margin-bottom: 0.5rem;
      color: #333;
    }

    .example-code {
      background: #f0f0f0;
      padding: 1rem;
      border-radius: 4px;
      overflow-x: auto;
      margin: 0.5rem 0;
    }

    .example-code code {
      background: none;
      padding: 0;
      color: #333;
    }

    .example-preview {
      padding: 1rem;
      background: white;
      border: 1px solid #ddd;
      border-radius: 4px;
      margin: 0.5rem 0;
    }

    .since {
      color: #999;
      margin-top: 1rem;
    }

    footer {
      text-align: center;
      padding: 2rem;
      color: #666;
      font-size: 0.9rem;
    }

    @media (max-width: 768px) {
      .components-list {
        grid-template-columns: 1fr;
      }

      .container {
        padding: 1rem;
      }

      header h1 {
        font-size: 1.8rem;
      }
    }
  </style>
</head>
<body>
  <header>
    <h1>Cortex UI Component Library</h1>
    <p>${components.length} components documented and ready to use</p>
  </header>

  <div class="container">
    <nav>
      <h2>Components by Category</h2>
      ${categoryHtml}
    </nav>

    <div class="documentation">
      ${componentsHtml}
    </div>
  </div>

  <footer>
    <p>Generated from component metadata. Last updated: ${new Date().toISOString().split('T')[0]}</p>
  </footer>

  <script type="module">
    // Dynamically load the UI bundle so components are defined
    import('../../dist/ui/ui-bundle.js').catch(() => {
      console.log('UI bundle not yet built. Run: npm run build:ui');
    });
  </script>
</body>
</html>`;
}

/**
 * Generate documentation for all components to a file.
 * @param registry Component registry
 * @returns HTML string ready to write to file
 */
export function generateDocumentation(registry: ComponentRegistry): string {
  return generateIndexHTML(registry);
}
