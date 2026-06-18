// ===== Service worker for dot-md Chrome Extension ====

chrome.runtime.onInstalled.addListener(() => {
  console.log('dot-md Chrome Extension installed.');
  // Initialize default options in storage only if they do not exist to avoid overwriting user preferences on update
  chrome.storage.local.get(['history', 'settings'], (result) => {
    const updates: Record<string, any> = {};
    if (!result.history) {
      updates.history = [];
    }
    if (!result.settings) {
      updates.settings = {
        defaultAiExport: 'chatgpt',
        theme: 'dark'
      };
    }
    if (Object.keys(updates).length > 0) {
      chrome.storage.local.set(updates);
    }
  });
});

// Listener for messages from content scripts or popup
chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  if (message.type === 'SELECTION_MADE') {
    const { html, title, url } = message;

    // Store captured DOM selection in local storage
    chrome.storage.local.set({
      capturedSelection: {
        html,
        title,
        url,
        timestamp: Date.now()
      }
    }, () => {
      console.log('Selection saved successfully.');
      sendResponse({ success: true });
    });

    return true; // Keeps the message channel open for async sendResponse
  }
});
