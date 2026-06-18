// ===== Service worker for dot-md Chrome Extension ====

chrome.runtime.onInstalled.addListener(() => {
  console.log('dot-md Chrome Extension installed.');
  // Initialize default options in storage if needed
  chrome.storage.local.set({
    history: [],
    settings: {
      defaultAiExport: 'chatgpt',
      theme: 'dark'
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
