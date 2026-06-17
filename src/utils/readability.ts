import { Readability } from '@mozilla/readability';

export interface ParsedArticle {
  title: string;
  content: string; // HTML content
  textContent: string;
  length: number;
  excerpt: string;
  byline: string;
  dir: string;
  siteName: string;
}

/**
 * Parses HTML string using Readability to extract the main content.
 * Runs in browser environments (popup or content script) where DOMParser is available.
 */
export function parseHtml(html: string, url?: string): ParsedArticle | null {
  try {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Resolve relative URLs using base element if url is provided
    if (url) {
      const baseEl = doc.createElement('base');
      baseEl.href = url;
      doc.head.insertBefore(baseEl, doc.head.firstChild);
    }
    
    // We clone the document because Readability modifies it in place
    const docClone = doc.cloneNode(true) as Document;
    const reader = new Readability(docClone);
    return reader.parse();
  } catch (error) {
    console.error('Error parsing HTML with Readability:', error);
    return null;
  }
}
