# Figma to HTML/CSS Converter

A simple system that converts Figma designs into HTML/CSS representations using the Figma REST API.

## Quick Start

```bash
# 1. Install
npm install

# 2. Create .env file with your Figma token
echo "FIGMA_ACCESS_TOKEN=figd_your_token_here" > .env

# 3. Run with your Figma file URL
npm start https://www.figma.com/file/YOUR_FILE_KEY/Your-Design

# 4. Open output/index.html in your browser
```

Get your Figma token from: https://www.figma.com/settings

## Features

- Fetches Figma files via the Figma REST API
- Converts Figma nodes to semantic HTML
- Generates CSS with proper styling including:
  - Layout and positioning
  - Colors and backgrounds
  - Typography
  - Borders and border radius
  - Shadows and effects
  - Gradients
  - Auto-layout (Flexbox)
  - Opacity
- Outputs ready-to-view HTML files

## Setup

### Prerequisites

- Node.js 18+ installed
- A Figma account
- A Figma file to convert

### Installation

1. Clone this repository:
```bash
git clone <your-repo-url>
cd Softlight
```

2. Install dependencies:
```bash
npm install
```

### Configuration

1. Get your Figma Personal Access Token:
   - Go to [Figma Settings](https://www.figma.com/settings)
   - Scroll to "Personal access tokens"
   - Click "Create a new personal access token"
   - Copy the token (starts with `figd_`)

2. Create a `.env` file in the project root with your token:
   ```
   FIGMA_ACCESS_TOKEN=figd_your_token_here
   ```

Note: The Figma file URL/key is passed as a command-line argument (see Usage below)

## Usage

### Run the converter:

Pass the Figma file URL or file key as an argument:

```bash
# Using full Figma URL (recommended)
npm start https://www.figma.com/file/ABC123/My-Design

# Or using just the file key
npm start ABC123
```

### Output

The converter will:
1. Fetch your Figma file
2. Convert it to HTML/CSS
3. Generate files in the `output/` directory:
   - `index.html` - Complete HTML file with embedded CSS
   - `styles.css` - Standalone CSS file

### View the result:

Open `output/index.html` in your web browser to see the converted design.

## Project Structure

```
Softlight/
├── src/
│   ├── index.ts          # Main entry point
│   ├── config.ts         # Configuration
│   ├── types.ts          # TypeScript type definitions
│   ├── figmaClient.ts    # Figma API client
│   └── converter.ts      # Figma to HTML/CSS conversion logic
├── output/               # Generated HTML/CSS files (created on first run)
├── package.json
├── tsconfig.json
└── README.md
```

## How It Works

1. **Fetch**: The `FigmaClient` fetches the Figma file data using the REST API
2. **Parse**: The converter traverses the Figma node tree
3. **Convert**: Each node is converted to HTML elements with corresponding CSS classes
4. **Style**: CSS is generated for each element with proper styling:
   - Absolute positioning for pixel-perfect layout
   - Background colors and gradients
   - Typography (font family, size, weight, spacing)
   - Borders and corner radius
   - Shadows and effects
   - Flexbox for auto-layout frames
5. **Output**: HTML and CSS are written to files

## Known Limitations

### Layout
- Uses absolute positioning for most elements, which may not be responsive
- Complex nested layouts might not translate perfectly
- Constraints (responsive behavior) are not fully implemented

### Styling
- Text overflow and clipping may not work exactly as in Figma
- Some advanced effects might not be supported:
  - Background blur
  - Layer blur
  - Inner shadows (only drop shadows are supported)
- Image fills require additional API calls (not implemented in this simple version)

### Components
- Component instances are flattened (not reusable)
- Component variants are not specially handled
- Interactive components (buttons, inputs) are rendered as static divs

### Typography
- Custom fonts are referenced but not embedded
- Font fallbacks use system fonts
- Some advanced text features (OpenType features, text decoration) may be missing

### Gradients
- Gradient angle calculation is simplified
- Radial gradients are not implemented
- Angular gradients are not supported

### Vector Graphics
- Complex vector paths are converted to divs (not SVG)
- Vector rendering may not be accurate for complex shapes

### Other
- Boolean operations on shapes are not supported
- Masks and clipping are not implemented
- Blend modes are not supported
- Rotation and transforms beyond positioning are not included

## Improvements for Production

For a production-ready system, we need to consider following improvements:

1. **Responsive Design**: Convert absolute positioning to flexible layouts
2. **Component System**: Generate reusable components (React, Vue, etc.)
3. **Asset Management**: Download and embed images, fonts, and icons
4. **SVG Support**: Convert vectors to actual SVG elements
5. **Optimization**: Minify CSS, use CSS variables, implement BEM or CSS modules
6. **Accessibility**: Add semantic HTML, ARIA labels, and keyboard navigation
7. **Testing**: Add visual regression tests
8. **CLI Options**: Add command-line arguments for configuration
9. **Error Handling**: More robust error handling and validation
10. **Caching**: Cache API responses to avoid rate limits



