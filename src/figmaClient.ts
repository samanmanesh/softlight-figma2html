import fetch from 'node-fetch';
import { FigmaFile } from './types.js';

/**
 * Figma API client for fetching file data
 */
export class FigmaClient {
  private accessToken: string;
  private baseUrl: string = 'https://api.figma.com/v1';

  constructor(accessToken: string) {
    this.accessToken = accessToken;
  }

  /**
   * Fetch a Figma file by its key
   */
  async getFile(fileKey: string): Promise<FigmaFile> {
    const url = `${this.baseUrl}/files/${fileKey}`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': this.accessToken
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch Figma file: ${response.status} ${response.statusText}`);
    }

    return await response.json() as FigmaFile;
  }

  /**
   * Get image URLs for specific nodes
   */
  async getImages(fileKey: string, nodeIds: string[], options: { format?: string; scale?: number } = {}): Promise<any> {
    const ids = nodeIds.join(',');
    const format = options.format || 'png';
    const scale = options.scale || 1;
    
    const url = `${this.baseUrl}/images/${fileKey}?ids=${ids}&format=${format}&scale=${scale}`;
    const response = await fetch(url, {
      headers: {
        'X-Figma-Token': this.accessToken
      }
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch images: ${response.status} ${response.statusText}`);
    }

    return await response.json();
  }
}

