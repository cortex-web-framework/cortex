#!/usr/bin/env ts-node
/**
 * Build script for generating UI component documentation.
 * Generates static HTML documentation from component metadata.
 *
 * Usage: npm run build:docs
 * Output: dist/docs/index.html
 */

import { writeFileSync, mkdirSync } from 'fs';
import { dirname } from 'path';
import { fileURLToPath } from 'url';
import { registerAllComponents, globalRegistry } from '../src/ui/registry.js';
import { generateDocumentation } from '../src/ui/doc-generator.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const outputPath = `${__dirname}/../dist/docs/index.html`;

async function generateDocs(): Promise<void> {
  try {
    console.log('📚 Generating component documentation...');

    // Register all component metadata
    registerAllComponents();
    const componentCount = globalRegistry.size();

    // Generate HTML documentation
    const html = generateDocumentation(globalRegistry);

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
