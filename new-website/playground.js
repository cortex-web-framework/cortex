const codeEditor = CodeMirror.fromTextArea(document.getElementById('code'), {
  mode: 'javascript',
  lineNumbers: true,
});

const previewFrame = document.getElementById('preview-frame');

function updatePreview() {
  const code = codeEditor.getValue();
  const html = `
    <html>
      <head>
        <script type="module">
          try {
            // This is a simplified way to execute the code. A real implementation would need a bundler.
            const transformedCode = code.replace(/import\s+(.*)\s+from\s+['"]cortex['"];/, 'const $1 = window.Cortex;');
            const script = document.createElement('script');
            script.innerHTML = transformedCode;
            document.body.appendChild(script);
          } catch (error) {
            console.error(error);
            document.body.innerHTML = `<pre>${error.message}</pre>`;
          }
        </script>
      </head>
      <body>
        <div id="root"></div>
      </body>
    </html>
  `;

  previewFrame.srcdoc = html;
}

codeEditor.on('change', updatePreview);

// Initial preview
updatePreview();
