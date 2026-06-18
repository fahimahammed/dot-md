import { Readability } from '@mozilla/readability';

// --- State Variables ---
let isSelectionModeActive = false;
let hoverOverlay: HTMLDivElement | null = null;
let selectedElement: HTMLElement | null = null;

// --- Listeners for Messages from Popup ---
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'EXTRACT_PAGE') {
    sendResponse({
      html: document.documentElement.outerHTML,
      title: document.title,
      url: window.location.href
    });
  }

  else if (message.type === 'START_SELECTION') {
    startSelectionMode();
    sendResponse({ success: true });
  }

  else if (message.type === 'TOGGLE_READER_MODE') {
    const closed = toggleReaderMode();
    sendResponse({ success: true, closed });
  }

  return true;
});


// 1. Selection Mode Implementation

function startSelectionMode() {
  if (isSelectionModeActive) return;
  isSelectionModeActive = true;

  // Create highlight overlay
  hoverOverlay = document.createElement('div');
  hoverOverlay.id = 'dot-md-selection-overlay';
  hoverOverlay.style.position = 'fixed';
  hoverOverlay.style.pointerEvents = 'none';
  hoverOverlay.style.border = '2px dashed #8b5cf6'; // Indigo border
  hoverOverlay.style.backgroundColor = 'rgba(139, 92, 246, 0.15)';
  hoverOverlay.style.borderRadius = '4px';
  hoverOverlay.style.zIndex = '99999999';
  hoverOverlay.style.boxShadow = '0 0 10px rgba(139, 92, 246, 0.4)';
  hoverOverlay.style.transition = 'all 0.1s ease-out';
  hoverOverlay.style.display = 'none';
  document.body.appendChild(hoverOverlay);

  // Add event listeners
  document.addEventListener('mouseover', handleMouseOver, true);
  document.addEventListener('mouseout', handleMouseOut, true);
  document.addEventListener('click', handleSelectionClick, true);
  document.addEventListener('keydown', handleKeyDown, true);

  // Show a notification banner/overlay
  showToast('🎯 Selection Mode Active. Hover & click to convert an element. Esc to cancel.', 4000);
}

function stopSelectionMode() {
  if (!isSelectionModeActive) return;
  isSelectionModeActive = false;

  // Remove overlay
  if (hoverOverlay && hoverOverlay.parentNode) {
    hoverOverlay.parentNode.removeChild(hoverOverlay);
  }
  hoverOverlay = null;
  selectedElement = null;

  // Remove event listeners
  document.removeEventListener('mouseover', handleMouseOver, true);
  document.removeEventListener('mouseout', handleMouseOut, true);
  document.removeEventListener('click', handleSelectionClick, true);
  document.removeEventListener('keydown', handleKeyDown, true);
}

function handleMouseOver(e: MouseEvent) {
  if (!isSelectionModeActive || !hoverOverlay) return;

  const target = e.target as HTMLElement;
  // Ignore our own overlays or basic container wrappers
  if (target === document.body || target === document.documentElement || target.id === 'dot-md-selection-overlay') {
    return;
  }

  selectedElement = target;
  const rect = target.getBoundingClientRect();

  hoverOverlay.style.top = `${rect.top}px`;
  hoverOverlay.style.left = `${rect.left}px`;
  hoverOverlay.style.width = `${rect.width}px`;
  hoverOverlay.style.height = `${rect.height}px`;
  hoverOverlay.style.display = 'block';
}

function handleMouseOut(_e: MouseEvent) {
  if (!isSelectionModeActive || !hoverOverlay) return;
  hoverOverlay.style.display = 'none';
}

function handleSelectionClick(e: MouseEvent) {
  if (!isSelectionModeActive || !selectedElement) return;

  e.preventDefault();
  e.stopPropagation();

  const elementHtml = selectedElement.outerHTML;
  const pageTitle = document.title;
  const pageUrl = window.location.href;

  // Send the selected HTML to the background service worker
  chrome.runtime.sendMessage({
    type: 'SELECTION_MADE',
    html: elementHtml,
    title: pageTitle,
    url: pageUrl
  }, (response) => {
    if (response && response.success) {
      showToast('🎉 Content captured! Click the dot-md extension icon to view.', 5000);
    } else {
      showToast('❌ Failed to capture selection.', 3000);
    }
  });

  stopSelectionMode();
}

function handleKeyDown(e: KeyboardEvent) {
  if (e.key === 'Escape') {
    stopSelectionMode();
    showToast('Selection mode cancelled.', 2000);
  }
}


//  2. Clean Reader Mode Implementation

let readerContainer: HTMLDivElement | null = null;

function toggleReaderMode(): boolean {
  if (readerContainer) {
    // Already in reader mode, close it
    document.body.style.overflow = ''; // Restore scroll
    readerContainer.parentNode?.removeChild(readerContainer);
    readerContainer = null;
    return true; // was closed
  }

  // Generate cleaned content
  const docClone = document.cloneNode(true) as Document;
  const reader = new Readability(docClone);
  const article = reader.parse();

  if (!article) {
    showToast('⚠️ Could not extract readable article from this page.', 3000);
    return false;
  }

  // Lock parent document scrolling
  document.body.style.overflow = 'hidden';

  // Create full-screen reader container
  readerContainer = document.createElement('div');
  readerContainer.id = 'dot-md-reader-container';
  readerContainer.style.position = 'fixed';
  readerContainer.style.top = '0';
  readerContainer.style.left = '0';
  readerContainer.style.width = '100vw';
  readerContainer.style.height = '100vh';
  readerContainer.style.zIndex = '2147483647';
  readerContainer.style.backgroundColor = 'transparent';
  document.body.appendChild(readerContainer);

  // Attach Shadow DOM for CSS isolation
  const shadow = readerContainer.attachShadow({ mode: 'open' });

  // Add styles and content to Shadow DOM
  const styleEl = document.createElement('style');
  styleEl.textContent = `
    :host {
      --bg-color: #fcfcf9;
      --text-color: #1a1a1a;
      --accent-color: #8b5cf6;
      --font-family: Georgia, serif;
      --font-size: 18px;
      --max-width: 700px;
      --card-bg: #ffffff;
      --border-color: #e5e7eb;
    }

    :host(.dark) {
      --bg-color: #121214;
      --text-color: #e3e3e6;
      --card-bg: #1e1e24;
      --border-color: #2e2e38;
    }

    :host(.sepia) {
      --bg-color: #f4ecd8;
      --text-color: #5b4636;
      --card-bg: #fdf6e3;
      --border-color: #e4d7ba;
    }

    .wrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: var(--bg-color);
      color: var(--text-color);
      font-family: var(--font-family);
      font-size: var(--font-size);
      line-height: 1.62;
      overflow-y: auto;
      box-sizing: border-box;
      transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Floating control bar */
    .controls {
      position: sticky;
      top: 0;
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      background-color: var(--card-bg);
      z-index: 10;
      box-shadow: 0 4px 6px -1px rgba(0,0,0,0.05);
      backdrop-filter: blur(8px);
    }

    .logo-section {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      font-family: system-ui, sans-serif;
      font-weight: 700;
      color: var(--accent-color);
    }

    .actions-group {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .btn {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-color);
      padding: 0.4rem 0.8rem;
      border-radius: 6px;
      cursor: pointer;
      font-family: system-ui, sans-serif;
      font-size: 0.85rem;
      display: flex;
      align-items: center;
      gap: 0.3rem;
      transition: all 0.2s;
    }

    .btn:hover {
      border-color: var(--accent-color);
      color: var(--accent-color);
    }

    .theme-selector, .size-selector {
      display: flex;
      border: 1px solid var(--border-color);
      border-radius: 6px;
      overflow: hidden;
    }

    .selector-btn {
      background: var(--card-bg);
      border: none;
      color: var(--text-color);
      padding: 0.4rem 0.75rem;
      cursor: pointer;
      font-family: system-ui, sans-serif;
      font-size: 0.85rem;
      transition: all 0.2s;
    }

    .selector-btn:not(:last-child) {
      border-right: 1px solid var(--border-color);
    }

    .selector-btn:hover {
      background: var(--border-color);
    }

    .selector-btn.active {
      background: var(--accent-color);
      color: white;
    }

    /* Article layout */
    .article-container {
      max-width: var(--max-width);
      margin: 0 auto;
      padding: 3rem 1.5rem 6rem 1.5rem;
      animation: fadeIn 0.4s ease-out;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .title {
      font-size: 2.5rem;
      line-height: 1.15;
      font-weight: 800;
      margin-bottom: 0.5rem;
      font-family: system-ui, sans-serif;
    }

    .metadata {
      font-family: system-ui, sans-serif;
      font-size: 0.9rem;
      color: #71717a;
      margin-bottom: 2.5rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    /* Styled content inside reader mode */
    .content h1, .content h2, .content h3, .content h4 {
      font-family: system-ui, sans-serif;
      color: var(--text-color);
      font-weight: 700;
      margin-top: 2rem;
      margin-bottom: 0.8rem;
    }
    
    .content h1 { font-size: 1.8rem; }
    .content h2 { font-size: 1.5rem; }
    .content h3 { font-size: 1.25rem; }

    .content p {
      margin-bottom: 1.5rem;
    }

    .content a {
      color: var(--accent-color);
      text-decoration: none;
      border-bottom: 1px solid rgba(139, 92, 246, 0.4);
      transition: border-color 0.2s;
    }

    .content a:hover {
      border-bottom-color: var(--accent-color);
    }

    .content img {
      max-width: 100%;
      height: auto;
      border-radius: 8px;
      margin: 1.5rem 0;
    }

    .content pre {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 8px;
      padding: 1rem;
      overflow-x: auto;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.9rem;
      margin: 1.5rem 0;
    }

    .content code {
      background-color: var(--card-bg);
      border: 1px solid var(--border-color);
      border-radius: 4px;
      padding: 0.2rem 0.4rem;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: 0.85em;
    }

    .content pre code {
      background-color: transparent;
      border: none;
      padding: 0;
      font-size: inherit;
    }

    .content blockquote {
      border-left: 4px solid var(--accent-color);
      margin: 1.5rem 0;
      padding-left: 1.25rem;
      font-style: italic;
      color: #71717a;
    }

    .content table {
      width: 100%;
      border-collapse: collapse;
      margin: 1.5rem 0;
    }

    .content th, .content td {
      border: 1px solid var(--border-color);
      padding: 0.6rem 0.8rem;
      text-align: left;
    }

    .content th {
      background-color: var(--card-bg);
    }
  `;

  const wrapper = document.createElement('div');
  wrapper.className = 'wrapper';

  // Create UI Structure
  wrapper.innerHTML = `
    <div class="controls">
      <div class="logo-section">
        <span>📖</span>
        <span>dot-md Reader</span>
      </div>
      <div class="actions-group">
        <div class="theme-selector">
          <button class="selector-btn active" data-theme="light">Light</button>
          <button class="selector-btn" data-theme="sepia">Sepia</button>
          <button class="selector-btn" data-theme="dark">Dark</button>
        </div>
        <div class="size-selector">
          <button class="selector-btn" id="size-dec">A-</button>
          <button class="selector-btn" id="size-inc">A+</button>
        </div>
        <button class="btn" id="close-reader">
          ✕ Close
        </button>
      </div>
    </div>
    <div class="article-container">
      <h1 class="title">${article.title}</h1>
      <div class="metadata">
        ${article.byline ? `<span>By ${article.byline}</span> • ` : ''}
        ${article.siteName ? `<span>${article.siteName}</span> • ` : ''}
        <span>${Math.round(article.textContent.length / 4)} tokens</span>
      </div>
      <div class="content">
        ${article.content}
      </div>
    </div>
  `;

  shadow.appendChild(styleEl);
  shadow.appendChild(wrapper);

  // Setup Event Listeners inside Shadow DOM
  const closeBtn = shadow.getElementById('close-reader');
  closeBtn?.addEventListener('click', () => {
    toggleReaderMode();
  });

  const themeBtns = shadow.querySelectorAll('.theme-selector .selector-btn');
  themeBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      themeBtns.forEach(b => b.classList.remove('active'));
      const target = e.target as HTMLButtonElement;
      target.classList.add('active');
      const theme = target.dataset.theme || 'light';

      // Update Host Class
      if (readerContainer) {
        readerContainer.className = '';
        if (theme !== 'light') {
          readerContainer.classList.add(theme);
        }
      }
    });
  });

  let currentFontSize = 18;
  const decBtn = shadow.getElementById('size-dec');
  const incBtn = shadow.getElementById('size-inc');

  decBtn?.addEventListener('click', () => {
    if (currentFontSize > 14) {
      currentFontSize -= 2;
      readerContainer?.style.setProperty('--font-size', `${currentFontSize}px`);
    }
  });

  incBtn?.addEventListener('click', () => {
    if (currentFontSize < 32) {
      currentFontSize += 2;
      readerContainer?.style.setProperty('--font-size', `${currentFontSize}px`);
    }
  });

  return false; // remains open
}


//  3. Toast Helper Notification


function showToast(message: string, duration = 3000) {
  // Check if there is an existing toast, remove it
  const existingToast = document.getElementById('dot-md-toast-notice');
  if (existingToast && existingToast.parentNode) {
    existingToast.parentNode.removeChild(existingToast);
  }

  const toast = document.createElement('div');
  toast.id = 'dot-md-toast-notice';
  toast.innerText = message;

  // Style toast nicely
  toast.style.position = 'fixed';
  toast.style.bottom = '24px';
  toast.style.right = '24px';
  toast.style.backgroundColor = '#1e1b4b'; // Deep Indigo
  toast.style.color = '#f3e8ff'; // Light Purple text
  toast.style.padding = '12px 20px';
  toast.style.borderRadius = '10px';
  toast.style.boxShadow = '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.3)';
  toast.style.fontFamily = 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
  toast.style.fontSize = '14px';
  toast.style.fontWeight = '500';
  toast.style.border = '1px solid #4338ca';
  toast.style.zIndex = '2147483647';
  toast.style.opacity = '0';
  toast.style.transform = 'translateY(10px)';
  toast.style.transition = 'opacity 0.25s ease-out, transform 0.25s ease-out';

  document.body.appendChild(toast);

  // Force reflow and animate in
  setTimeout(() => {
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
  }, 10);

  // Dismiss after duration
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(10px)';
    setTimeout(() => {
      if (toast.parentNode) {
        toast.parentNode.removeChild(toast);
      }
    }, 250);
  }, duration);
}
