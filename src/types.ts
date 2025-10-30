// Figma API types
export interface FigmaFile {
  document: FigmaNode;
  components: Record<string, FigmaComponent>;
  schemaVersion: number;
  styles: Record<string, FigmaStyle>;
  name: string;
  lastModified: string;
  thumbnailUrl: string;
  version: string;
}

export interface FigmaNode {
  id: string;
  name: string;
  type: string;
  children?: FigmaNode[];
  backgroundColor?: FigmaColor;
  absoluteBoundingBox?: BoundingBox;
  constraints?: Constraints;
  fills?: Paint[];
  strokes?: Paint[];
  strokeWeight?: number;
  strokeAlign?: string;
  cornerRadius?: number;
  characters?: string;
  style?: TypeStyle;
  effects?: Effect[];
  opacity?: number;
  layoutMode?: string;
  layoutAlign?: string;
  itemSpacing?: number;
  paddingLeft?: number;
  paddingRight?: number;
  paddingTop?: number;
  paddingBottom?: number;
  primaryAxisSizingMode?: string;
  counterAxisSizingMode?: string;
  primaryAxisAlignItems?: string;
  counterAxisAlignItems?: string;
  visible?: boolean;
}

export interface FigmaColor {
  r: number;
  g: number;
  b: number;
  a: number;
}

export interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Constraints {
  vertical: string;
  horizontal: string;
}

export interface Paint {
  type: string;
  color?: FigmaColor;
  opacity?: number;
  visible?: boolean;
  gradientHandlePositions?: Vector[];
  gradientStops?: ColorStop[];
  scaleMode?: string;
  imageRef?: string;
}

export interface Vector {
  x: number;
  y: number;
}

export interface ColorStop {
  position: number;
  color: FigmaColor;
}

export interface TypeStyle {
  fontFamily: string;
  fontPostScriptName?: string;
  fontWeight: number;
  fontSize: number;
  letterSpacing?: number;
  lineHeightPx?: number;
  lineHeightPercent?: number;
  textAlignHorizontal?: string;
  textAlignVertical?: string;
}

export interface Effect {
  type: string;
  visible?: boolean;
  radius?: number;
  color?: FigmaColor;
  offset?: Vector;
  blendMode?: string;
}

export interface FigmaComponent {
  key: string;
  name: string;
  description: string;
}

export interface FigmaStyle {
  key: string;
  name: string;
  styleType: string;
  description: string;
}

export interface Config {
  figmaAccessToken: string;
  figmaFileKey: string;
  outputDir: string;
}

