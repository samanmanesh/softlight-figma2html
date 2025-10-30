import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { FigmaClient } from './figmaClient.js';
import { FigmaToHtmlConverter } from './converter.js';

// Load .env file
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Extract Figma file key from URL or use as-is if already a key
 */
function extractFileKey(input: string): string {
  // Check if it's a full URL (handles both /file/ and /design/ URLs)
  const urlMatch = input.match(/figma\.com\/(?:file|design)\/([a-zA-Z0-9]+)/);
  if (urlMatch) {
    return urlMatch[1];
  }
  // Otherwise assume it's already a file key
  return input;
}

/**
 * Main function to convert Figma file to HTML/CSS
 */
async function main() {
  try {
    console.log('🎨 Figma to HTML/CSS Converter\n');

    // Get file key from CLI argument
    const fileInput = process.argv[2];
    if (!fileInput) {
      console.error('❌ Error: Please provide a Figma file URL or file key as an argument');
      console.error('\nUsage:');
      console.error('  npm start <figma-file-url-or-key>');
      console.error('\nExamples:');
      console.error('  npm start https://www.figma.com/file/ABC123/My-Design');
      console.error('  npm start ABC123');
      process.exit(1);
    }

    const figmaFileKey = extractFileKey(fileInput);
    console.log(`📋 File Key: ${figmaFileKey}\n`);

    // Get access token from environment
    const accessToken = process.env.FIGMA_ACCESS_TOKEN;
    
    // Validate access token
    if (!accessToken || accessToken === 'your_token_here') {
      console.error('❌ Error: Please set your FIGMA_ACCESS_TOKEN in .env file');
      console.error('\n1. Edit .env file in the project root');
      console.error('2. Add your token: FIGMA_ACCESS_TOKEN=figd_your_token_here');
      console.error('3. Get token from: https://www.figma.com/settings');
      process.exit(1);
    }

    console.log('📥 Fetching Figma file...');
    const client = new FigmaClient(accessToken);
    const figmaFile = await client.getFile(figmaFileKey);
    
    console.log(`✅ Successfully fetched: ${figmaFile.name}`);
    console.log(`   Last modified: ${figmaFile.lastModified}`);
    console.log(`   Schema version: ${figmaFile.schemaVersion}\n`);

    console.log('🔄 Converting to HTML/CSS...');
    const converter = new FigmaToHtmlConverter();
    const { html, css } = converter.convertWithStyles(figmaFile.document);

    // Create output directory
    const outputDir = path.resolve('./output');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    // Write HTML file
    const htmlContent = generateFullHtml(figmaFile.name, html, css);
    const htmlPath = path.join(outputDir, 'index.html');
    fs.writeFileSync(htmlPath, htmlContent);
    console.log(`✅ Generated: ${htmlPath}`);

    // Write separate CSS file
    const cssPath = path.join(outputDir, 'styles.css');
    fs.writeFileSync(cssPath, css);
    console.log(`✅ Generated: ${cssPath}`);

    console.log('\n✨ Conversion complete!');
    console.log(`📂 Open ${htmlPath} in your browser to view the result.`);

  } catch (error) {
    console.error('❌ Error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

/**
 * Generate complete HTML document
 */
function generateFullHtml(title: string, bodyHtml: string, css: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
  <style>
${css}
  </style>
</head>
<body>
${bodyHtml}
</body>
</html>`;
}

// Run the converter
main();

