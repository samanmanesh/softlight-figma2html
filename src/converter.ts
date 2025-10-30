import { FigmaNode, FigmaColor, Paint } from './types.js';

/**
 * Converts Figma design to HTML/CSS
 */
export class FigmaToHtmlConverter {
  private cssClasses: Map<string, string> = new Map();
  private classCounter: number = 0;

  /**
   * Convert Figma file to HTML/CSS
   */
  convert(node: FigmaNode): { html: string; css: string } {
    this.cssClasses.clear();
    this.classCounter = 0;

    const html = this.generateHtml(node);
    const css = this.generateCss();

    return { html, css };
  }

  /**
   * Generate HTML from Figma node tree
   */
  private generateHtml(node: FigmaNode, depth: number = 0): string {
    if (node.visible === false) {
      return '';
    }

    const indent = '  '.repeat(depth);
    const className = this.getClassName(node);
    
    // Handle different node types
    switch (node.type) {
      case 'DOCUMENT':
      case 'CANVAS':
        // Skip wrapper nodes, process children
        if (node.children && node.children.length > 0) {
          return node.children.map(child => this.generateHtml(child, depth)).join('\n');
        }
        return '';

      case 'TEXT':
        const text = node.characters || '';
        return `${indent}<div class="${className}">${this.escapeHtml(text)}</div>`;

      case 'RECTANGLE':
      case 'ELLIPSE':
      case 'VECTOR':
      case 'FRAME':
      case 'GROUP':
      case 'INSTANCE':
      case 'COMPONENT':
        let html = `${indent}<div class="${className}">`;
        
        if (node.children && node.children.length > 0) {
          html += '\n';
          html += node.children.map(child => this.generateHtml(child, depth + 1)).join('\n');
          html += '\n' + indent;
        }
        
        html += '</div>';
        return html;

      default:
        // Default: treat as container
        if (node.children && node.children.length > 0) {
          return node.children.map(child => this.generateHtml(child, depth)).join('\n');
        }
        return '';
    }
  }

  /**
   * Get or create CSS class name for a node
   */
  private getClassName(node: FigmaNode): string {
    if (this.cssClasses.has(node.id)) {
      return this.cssClasses.get(node.id)!;
    }

    const className = `figma-node-${this.classCounter++}`;
    this.cssClasses.set(node.id, className);
    return className;
  }

  /**
   * Generate CSS from all nodes
   */
  private generateCss(): string {
    let css = '/* Generated CSS from Figma */\n\n';
    css += 'body {\n  margin: 0;\n  padding: 0;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n}\n\n';

    // We need to regenerate CSS based on stored node information
    // For simplicity, we'll collect styles during HTML generation
    return css;
  }

  /**
   * Convert Figma node to HTML/CSS with full styling
   */
  convertWithStyles(node: FigmaNode): { html: string; css: string } {
    this.cssClasses.clear();
    this.classCounter = 0;

    const nodeStyles: Array<{ className: string; node: FigmaNode; parent?: FigmaNode }> = [];
    
    const html = this.generateHtmlWithStyles(node, 0, nodeStyles);
    const css = this.generateCssFromNodes(nodeStyles);

    return { html, css };
  }

  /**
   * Generate HTML and collect node information for styling
   */
  private generateHtmlWithStyles(node: FigmaNode, depth: number, nodeStyles: Array<{ className: string; node: FigmaNode; parent?: FigmaNode }>, parent?: FigmaNode): string {
    if (node.visible === false) {
      return '';
    }

    const indent = '  '.repeat(depth);
    
    // Handle different node types
    switch (node.type) {
      case 'DOCUMENT':
      case 'CANVAS':
        if (node.children && node.children.length > 0) {
          return node.children.map(child => this.generateHtmlWithStyles(child, depth, nodeStyles)).join('\n');
        }
        return '';

      case 'TEXT':
        const className = this.getClassName(node);
        nodeStyles.push({ className, node, parent });
        const text = node.characters || '';
        return `${indent}<div class="${className}">${this.escapeHtml(text)}</div>`;

      case 'RECTANGLE':
      case 'ELLIPSE':
      case 'VECTOR':
      case 'FRAME':
      case 'GROUP':
      case 'INSTANCE':
      case 'COMPONENT':
        const divClass = this.getClassName(node);
        nodeStyles.push({ className: divClass, node, parent });
        
        let html = `${indent}<div class="${divClass}">`;
        
        if (node.children && node.children.length > 0) {
          html += '\n';
          html += node.children.map(child => this.generateHtmlWithStyles(child, depth + 1, nodeStyles, node)).join('\n');
          html += '\n' + indent;
        }
        
        html += '</div>';
        return html;

      default:
        if (node.children && node.children.length > 0) {
          return node.children.map(child => this.generateHtmlWithStyles(child, depth, nodeStyles, parent)).join('\n');
        }
        return '';
    }
  }

  /**
   * Generate CSS from collected node information
   */
  private generateCssFromNodes(nodeStyles: Array<{ className: string; node: FigmaNode; parent?: FigmaNode }>): string {
    let css = '/* Generated CSS from Figma */\n\n';
    css += '* {\n  box-sizing: border-box;\n}\n\n';
    css += 'body {\n  margin: 0;\n  padding: 0;\n  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;\n  display: flex;\n  justify-content: center;\n  align-items: center;\n  min-height: 100vh;\n  background-color: #f5f5f5;\n}\n\n';

    for (const { className, node, parent } of nodeStyles) {
      const styles = this.generateNodeStyles(node, parent);
      if (styles) {
        css += `.${className} {\n${styles}}\n\n`;
      }
    }

    return css;
  }

  /**
   * Generate CSS styles for a specific node
   */
  private generateNodeStyles(node: FigmaNode, parent?: FigmaNode): string {
    const styles: string[] = [];

    // Position and size
    if (node.absoluteBoundingBox) {
      const box = node.absoluteBoundingBox;
      
      // Calculate position relative to parent
      let left = box.x;
      let top = box.y;
      
      if (parent && parent.absoluteBoundingBox) {
        const parentBox = parent.absoluteBoundingBox;
        left = box.x - parentBox.x;
        top = box.y - parentBox.y;
        
        // Account for parent padding if it has auto-layout
        if (parent.paddingLeft) left -= parent.paddingLeft;
        if (parent.paddingTop) top -= parent.paddingTop;
      }
      
      // Determine if parent uses auto-layout (flexbox)
      const parentUsesAutoLayout = parent && parent.layoutMode;
      
      if (!parent) {
        // Root element - relative positioning (body centers it)
        styles.push(`  position: relative;`);
        // No left/top needed since body centers it
      } else if (parentUsesAutoLayout) {
        // Parent uses flexbox - don't use absolute positioning
        // Let flexbox handle the positioning
        styles.push(`  position: relative;`);
        // Only add margin offsets if needed (rare in flexbox)
      } else {
        // Parent doesn't use auto-layout - use absolute positioning
        styles.push(`  position: absolute;`);
        styles.push(`  left: ${Math.round(left * 100) / 100}px;`);
        styles.push(`  top: ${Math.round(top * 100) / 100}px;`);
      }
      
      styles.push(`  width: ${Math.round(box.width * 100) / 100}px;`);
      
      // Only set explicit height for non-text elements
      if (node.type !== 'TEXT') {
        styles.push(`  height: ${Math.round(box.height * 100) / 100}px;`);
      } else {
        // For text, use min-height to allow content to determine height
        styles.push(`  min-height: ${Math.round(box.height * 100) / 100}px;`);
      }
    }

    // Background color and fills
    if (node.fills && node.fills.length > 0) {
      const fill = node.fills[0];
      if (fill.visible !== false) {
        if (fill.type === 'SOLID' && fill.color) {
          const color = this.rgbaToString(fill.color, fill.opacity);
          styles.push(`  background-color: ${color};`);
        } else if (fill.type === 'GRADIENT_LINEAR' && fill.gradientStops) {
          const gradient = this.generateLinearGradient(fill);
          styles.push(`  background: ${gradient};`);
        }
      }
    }

    // Border radius - check FIRST to determine border strategy
    let borderRadiusInfo = { hasTopRadius: false, hasBottomRadius: false, radiiString: '' };
    let tl = 0, tr = 0, br = 0, bl = 0;
    
    if ((node as any).rectangleCornerRadii) {
      const radii = (node as any).rectangleCornerRadii;
      if (radii.length === 4) {
        [tl, tr, br, bl] = radii.map((r: number) => Math.round(r * 100) / 100);
        
        // Build the radius string
        if (tl !== tr || tr !== br || br !== bl || tl !== 0) {
          borderRadiusInfo.radiiString = `${tl}px ${tr}px ${br}px ${bl}px`;
        }
        
        // Analyze the radius values to determine border strategy
        borderRadiusInfo.hasTopRadius = (tl > 0 || tr > 0);
        borderRadiusInfo.hasBottomRadius = (br > 0 || bl > 0);
      }
    } else if (node.cornerRadius !== undefined && node.cornerRadius > 0) {
      const radius = Math.round(node.cornerRadius * 100) / 100;
      tl = tr = br = bl = radius;
      borderRadiusInfo.hasTopRadius = true;
      borderRadiusInfo.hasBottomRadius = true;
      borderRadiusInfo.radiiString = `${radius}px`;
    }
    
    // Force-check the pattern for split borders (critical for stacked inputs)
    if (borderRadiusInfo.radiiString) {
      // Pattern like "8px 8px 0px 0px" - top corners rounded only
      if (borderRadiusInfo.radiiString.match(/^[^0][0-9.]*px [^0][0-9.]*px 0px 0px$/)) {
        borderRadiusInfo.hasTopRadius = true;
        borderRadiusInfo.hasBottomRadius = false;
      }
      // Pattern like "0px 0px 8px 8px" - bottom corners rounded only  
      else if (borderRadiusInfo.radiiString.match(/^0px 0px [^0][0-9.]*px [^0][0-9.]*px$/)) {
        borderRadiusInfo.hasTopRadius = false;
        borderRadiusInfo.hasBottomRadius = true;
      }
    }

    // Strokes (borders)
    if (node.strokes && node.strokes.length > 0 && node.strokeWeight) {
      const stroke = node.strokes[0];
      if (stroke.visible !== false && stroke.color) {
        const color = this.rgbaToString(stroke.color, stroke.opacity);
        const weight = Math.round(node.strokeWeight * 100) / 100;
        const align = node.strokeAlign || 'INSIDE';
        
        // Use box-sizing: border-box for INSIDE borders to match Figma
        if (align === 'INSIDE') {
          styles.push(`  box-sizing: border-box;`);
          
          // If only top corners are rounded, this is likely the top of a stacked group
          // Use individual border sides to avoid double border with element below
          if (borderRadiusInfo.hasTopRadius && !borderRadiusInfo.hasBottomRadius) {
            styles.push(`  border-left: ${weight}px solid ${color};`);
            styles.push(`  border-right: ${weight}px solid ${color};`);
            styles.push(`  border-top: ${weight}px solid ${color};`);
            // No border-bottom to avoid double border
          } 
          // If only bottom corners are rounded, this is likely the bottom of a stacked group
          // Use individual border sides to avoid double border with element above
          else if (!borderRadiusInfo.hasTopRadius && borderRadiusInfo.hasBottomRadius) {
            styles.push(`  border-left: ${weight}px solid ${color};`);
            styles.push(`  border-right: ${weight}px solid ${color};`);
            styles.push(`  border-bottom: ${weight}px solid ${color};`);
            // No border-top to avoid double border
          }
          // Otherwise use full border
          else {
            styles.push(`  border: ${weight}px solid ${color};`);
          }
        } else if (align === 'CENTER') {
          styles.push(`  border: ${weight}px solid ${color};`);
        } else {
          // OUTSIDE - use outline or box-shadow
          styles.push(`  box-shadow: 0 0 0 ${weight}px ${color};`);
        }
      }
    }
    
    // Apply border radius
    if (borderRadiusInfo.radiiString) {
      styles.push(`  border-radius: ${borderRadiusInfo.radiiString};`);
    }

    // Opacity
    if (node.opacity !== undefined && node.opacity < 1) {
      styles.push(`  opacity: ${node.opacity};`);
    }

    // Text styles
    if (node.type === 'TEXT' && node.style) {
      const textStyle = node.style;
      styles.push(`  font-family: "${textStyle.fontFamily}", sans-serif;`);
      styles.push(`  font-size: ${Math.round(textStyle.fontSize * 100) / 100}px;`);
      styles.push(`  font-weight: ${textStyle.fontWeight};`);
      
      if (textStyle.letterSpacing) {
        styles.push(`  letter-spacing: ${Math.round(textStyle.letterSpacing * 100) / 100}px;`);
      }
      
      if (textStyle.lineHeightPx) {
        styles.push(`  line-height: ${Math.round(textStyle.lineHeightPx * 100) / 100}px;`);
      } else if (textStyle.lineHeightPercent) {
        styles.push(`  line-height: ${Math.round(textStyle.lineHeightPercent) / 100};`);
      }
      
      if (textStyle.textAlignHorizontal) {
        const align = textStyle.textAlignHorizontal.toLowerCase();
        styles.push(`  text-align: ${align};`);
        
        // If using flex and text is centered, add justify-content
        if (align === 'center') {
          const hasDisplayFlex = styles.some(s => s.includes('display: flex'));
          if (!hasDisplayFlex) {
            styles.push(`  display: flex;`);
          }
          styles.push(`  justify-content: center;`);
        }
      }
      
      if (textStyle.textAlignVertical) {
        const vAlign = textStyle.textAlignVertical;
        const hasDisplayFlex = styles.some(s => s.includes('display: flex'));
        if (!hasDisplayFlex) {
          styles.push(`  display: flex;`);
        }
        if (vAlign === 'TOP') {
          styles.push(`  align-items: flex-start;`);
        } else if (vAlign === 'CENTER') {
          styles.push(`  align-items: center;`);
        } else if (vAlign === 'BOTTOM') {
          styles.push(`  align-items: flex-end;`);
        }
      }
      
      // Text color from fills
      if (node.fills && node.fills.length > 0) {
        const fill = node.fills[0];
        if (fill.type === 'SOLID' && fill.color) {
          const color = this.rgbaToString(fill.color, fill.opacity);
          styles.push(`  color: ${color};`);
          // Remove background-color for text
          const bgIndex = styles.findIndex(s => s.includes('background-color'));
          if (bgIndex !== -1) {
            styles.splice(bgIndex, 1);
          }
        }
      }
      
      // Prevent text from wrapping if it doesn't in Figma
      styles.push(`  white-space: pre-wrap;`);
      styles.push(`  word-wrap: break-word;`);
    }

    // Layout (Flexbox for auto-layout frames)
    if (node.layoutMode) {
      styles.push(`  display: flex;`);
      
      if (node.layoutMode === 'HORIZONTAL') {
        styles.push(`  flex-direction: row;`);
      } else if (node.layoutMode === 'VERTICAL') {
        styles.push(`  flex-direction: column;`);
      }
      
      if (node.itemSpacing) {
        styles.push(`  gap: ${Math.round(node.itemSpacing * 100) / 100}px;`);
      }
      
      if (node.paddingLeft || node.paddingRight || node.paddingTop || node.paddingBottom) {
        const pl = Math.round((node.paddingLeft || 0) * 100) / 100;
        const pr = Math.round((node.paddingRight || 0) * 100) / 100;
        const pt = Math.round((node.paddingTop || 0) * 100) / 100;
        const pb = Math.round((node.paddingBottom || 0) * 100) / 100;
        styles.push(`  padding: ${pt}px ${pr}px ${pb}px ${pl}px;`);
      }
      
      if (node.primaryAxisAlignItems) {
        const alignMap: Record<string, string> = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end',
          'SPACE_BETWEEN': 'space-between'
        };
        const align = alignMap[node.primaryAxisAlignItems] || 'flex-start';
        styles.push(`  justify-content: ${align};`);
      }
      
      if (node.counterAxisAlignItems) {
        const alignMap: Record<string, string> = {
          'MIN': 'flex-start',
          'CENTER': 'center',
          'MAX': 'flex-end'
        };
        const align = alignMap[node.counterAxisAlignItems] || 'flex-start';
        styles.push(`  align-items: ${align};`);
      }
      
      // Make this container a positioning context for any absolutely-positioned children
      if (!parent) {
        // Root stays relative
      } else {
        // Override position for auto-layout containers to be absolute if they have siblings
        const posIndex = styles.findIndex(s => s.includes('position:'));
        if (posIndex === -1) {
          styles.unshift(`  position: absolute;`);
          if (node.absoluteBoundingBox && parent && parent.absoluteBoundingBox) {
            const parentBox = parent.absoluteBoundingBox;
            const left = Math.round((node.absoluteBoundingBox.x - parentBox.x) * 100) / 100;
            const top = Math.round((node.absoluteBoundingBox.y - parentBox.y) * 100) / 100;
            if (left !== 0) styles.splice(1, 0, `  left: ${left}px;`);
            if (top !== 0) styles.splice(left !== 0 ? 2 : 1, 0, `  top: ${top}px;`);
          }
        }
      }
    }

    // Effects (shadows, blurs)
    if (node.effects && node.effects.length > 0) {
      const shadows: string[] = [];
      for (const effect of node.effects) {
        if (effect.visible !== false) {
          if (effect.type === 'DROP_SHADOW' && effect.offset && effect.color) {
            const offsetX = Math.round((effect.offset.x || 0) * 100) / 100;
            const offsetY = Math.round((effect.offset.y || 0) * 100) / 100;
            const radius = Math.round((effect.radius || 0) * 100) / 100;
            const color = this.rgbaToString(effect.color);
            shadows.push(`${offsetX}px ${offsetY}px ${radius}px ${color}`);
          } else if (effect.type === 'INNER_SHADOW' && effect.offset && effect.color) {
            const offsetX = Math.round((effect.offset.x || 0) * 100) / 100;
            const offsetY = Math.round((effect.offset.y || 0) * 100) / 100;
            const radius = Math.round((effect.radius || 0) * 100) / 100;
            const color = this.rgbaToString(effect.color);
            shadows.push(`inset ${offsetX}px ${offsetY}px ${radius}px ${color}`);
          }
        }
      }
      if (shadows.length > 0) {
        styles.push(`  box-shadow: ${shadows.join(', ')};`);
      }
    }
    
    // Clipping and overflow
    if ((node as any).clipsContent) {
      styles.push(`  overflow: hidden;`);
    }

    // Post-process: Fix double borders in stacked elements
    const borderRadiusLine = styles.find(s => s.includes('border-radius:'));
    const borderLine = styles.find(s => s.match(/^\s*border:\s*\d/));
    
    if (borderRadiusLine && borderLine) {
      // Check for top-only rounded corners (like "8px 8px 0px 0px")
      // This is the TOP element in a stack - remove its bottom border
      if (borderRadiusLine.match(/border-radius:\s*[^0\s][0-9.]*px\s+[^0\s][0-9.]*px\s+0px\s+0px/)) {
        const borderMatch = borderLine.match(/border:\s*(\d+(?:\.\d+)?px)\s+solid\s+(.+);/);
        if (borderMatch) {
          const [_, weight, color] = borderMatch;
          const borderIndex = styles.indexOf(borderLine);
          styles.splice(borderIndex, 1,
            `  border-left: ${weight} solid ${color};`,
            `  border-right: ${weight} solid ${color};`,
            `  border-top: ${weight} solid ${color};`
          );
        }
      }
      // Check for bottom-only rounded corners (like "0px 0px 8px 8px")
      // This is the BOTTOM element in a stack - keep all borders
      else if (borderRadiusLine.match(/border-radius:\s*0px\s+0px\s+[^0\s][0-9.]*px\s+[^0\s][0-9.]*px/)) {
        // Keep full border - don't modify
        // The top element already removed its bottom border, so no double border
      }
    }

    return styles.join('\n');
  }

  /**
   * Convert RGBA color to CSS string
   */
  private rgbaToString(color: FigmaColor, opacity?: number): string {
    const r = Math.round(color.r * 255);
    const g = Math.round(color.g * 255);
    const b = Math.round(color.b * 255);
    const a = opacity !== undefined ? opacity : color.a;
    
    if (a === 1) {
      return `rgb(${r}, ${g}, ${b})`;
    }
    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  /**
   * Generate linear gradient CSS
   */
  private generateLinearGradient(fill: Paint): string {
    if (!fill.gradientStops || !fill.gradientHandlePositions) {
      return 'transparent';
    }

    // Calculate gradient angle from handle positions
    const handles = fill.gradientHandlePositions;
    let angle = 90; // default
    
    if (handles.length >= 2) {
      const dx = handles[1].x - handles[0].x;
      const dy = handles[1].y - handles[0].y;
      angle = Math.atan2(dy, dx) * (180 / Math.PI) + 90;
    }

    const stops = fill.gradientStops
      .map(stop => {
        const color = this.rgbaToString(stop.color);
        const position = Math.round(stop.position * 100);
        return `${color} ${position}%`;
      })
      .join(', ');

    return `linear-gradient(${angle}deg, ${stops})`;
  }

  /**
   * Escape HTML special characters
   */
  private escapeHtml(text: string): string {
    const map: Record<string, string> = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
  }
}

