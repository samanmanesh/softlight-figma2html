import { Config } from './types.js';

// Configuration
export const config: Config = {
  // Get your personal access token from: https://www.figma.com/settings
  // Store this in .env file: FIGMA_ACCESS_TOKEN=your_token
  figmaAccessToken: process.env['FIGMA_ACCESS_TOKEN'] || '',
  
  // File key is now passed as CLI argument
  figmaFileKey: '',
  
  // Output directory for generated HTML/CSS
  outputDir: './output'
};

