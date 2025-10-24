#!/usr/bin/env node
/**
 * Build script for generating UI component documentation.
 * Generates static HTML documentation from component metadata.
 *
 * Usage: node scripts/build-docs.js
 * Output: dist/docs/index.html
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';
import { registerAllComponents, globalRegistry } from '../dist/ui/registry.js';
import { generateDocumentation } from '../dist/ui/doc-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function generateDocs() {
  try {
    console.log('📚 Generating component documentation...');

    // Register all component metadata
    registerAllComponents();
    const componentCount = globalRegistry.size();

    // Generate HTML documentation
    const html = generateDocumentation(globalRegistry);

    // Determine output path
    const outputPath = join(__dirname, '../dist/docs/index.html');

    // Ensure output directory exists
    mkdirSync(dirname(outputPath), { recursive: true });

    // Write HTML file
    writeFileSync(outputPath, html, 'utf-8');

    console.log(`✅ Documentation generated successfully!`);
    console.log(`   📄 Output: ${outputPath}`);
    console.log(`   📦 Components documented: ${componentCount}`);
  } catch (error) {
    console.error('❌ Failed to generate documentation:', error);
    process.exit(1);
  }
}

generateDocs();
