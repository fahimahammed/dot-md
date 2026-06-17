import TurndownService from 'turndown';

// Initialize Turndown service with clean configuration
const turndownService = new TurndownService({
  headingStyle: 'atx',
  hr: '---',
  bulletListMarker: '*',
  codeBlockStyle: 'fenced',
  fence: '```',
  emDelimiter: '*',
  strongDelimiter: '**',
  linkStyle: 'inlined'
});

// Rule for code blocks that preserves programming language classes
turndownService.addRule('fencedCodeBlock', {
  filter: (node) => {
    return (
      node.nodeName === 'PRE' &&
      node.firstChild !== null &&
      node.firstChild.nodeName === 'CODE'
    );
  },
  replacement: (_content, node) => {
    const codeEl = node.firstChild as HTMLElement;
    const className = codeEl.className || '';
    const langMatch = className.match(/language-([a-zA-Z0-9+-]+)/) || className.match(/lang-([a-zA-Z0-9+-]+)/);
    const language = langMatch ? langMatch[1] : '';
    
    // Get text content and trim trailing spaces
    const code = codeEl.textContent || '';
    return `\n\n\`\`\`${language}\n${code.trim()}\n\`\`\`\n\n`;
  }
});

// Rule to convert HTML tables to Markdown tables
turndownService.addRule('markdownTable', {
  filter: 'table',
  replacement: (_content, node) => {
    const table = node as HTMLTableElement;
    const rows = Array.from(table.rows);
    if (rows.length === 0) return '';

    let markdownTable = '\n\n';
    
    // Extract all rows
    const mdRows = rows.map(row => {
      const cells = Array.from(row.cells);
      const mdCells = cells.map(cell => {
        // Replace newlines within cell content to preserve row shape
        return (cell.textContent || '').replace(/\r?\n|\r/g, ' ').trim();
      });
      return `| ${mdCells.join(' | ')} |`;
    });

    if (mdRows.length > 0) {
      // Header row
      markdownTable += mdRows[0] + '\n';

      // Insert separator line
      const headerCellCount = Array.from(rows[0].cells).length;
      const separator = `| ${Array(headerCellCount).fill('---').join(' | ')} |`;
      markdownTable += separator + '\n';

      // Remaining data rows
      for (let i = 1; i < mdRows.length; i++) {
        markdownTable += mdRows[i] + '\n';
      }
    }

    markdownTable += '\n';
    return markdownTable;
  }
});

// Helper rule to ignore/strip out unwanted scripts, styles and frame elements
turndownService.addRule('ignoreUnwanted', {
  filter: ['script', 'style', 'noscript', 'iframe', 'canvas', 'svg', 'embed'] as any,
  replacement: () => ''
});

/**
 * Converts HTML string to clean Markdown.
 */
export function htmlToMarkdown(html: string): string {
  try {
    return turndownService.turndown(html);
  } catch (error) {
    console.error('Error converting HTML to Markdown:', error);
    return '';
  }
}
