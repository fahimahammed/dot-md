/**
 * Copies a string to the system clipboard using the best available API.
 * Works inside popup contexts and webpage content scripts.
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    // Attempt to use modern Clipboard API
    if (navigator.clipboard && typeof navigator.clipboard.writeText === 'function') {
      await navigator.clipboard.writeText(text);
      return true;
    }

    // Fallback: legacy text area method
    const textArea = document.createElement('textarea');
    textArea.value = text;
    
    // Ensure element is offscreen and invisible
    textArea.style.position = 'fixed';
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.width = '2em';
    textArea.style.height = '2em';
    textArea.style.padding = '0';
    textArea.style.border = 'none';
    textArea.style.outline = 'none';
    textArea.style.boxShadow = 'none';
    textArea.style.background = 'transparent';
    textArea.style.opacity = '0';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    const successful = document.execCommand('copy');
    document.body.removeChild(textArea);
    
    return successful;
  } catch (error) {
    console.error('Clipboard copy failed:', error);
    return false;
  }
}
