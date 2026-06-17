import React, { useState, useEffect } from 'react';
import { Preview } from './Preview';
import { parseHtml } from '../utils/readability';
import { htmlToMarkdown } from '../utils/markdown';
import { History, Settings, FileText, Trash2, AlertTriangle } from 'lucide-react';

interface HistoryItem {
  id: string;
  title: string;
  url: string;
  markdown: string;
  timestamp: number;
}

interface CapturedSelection {
  html: string;
  title: string;
  url: string;
  timestamp: number;
}

type TabType = 'preview' | 'history' | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('preview');

  // Page state
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [title, setTitle] = useState<string>('');
  const [url, setUrl] = useState<string>('');
  const [markdown, setMarkdown] = useState<string>('');

  // History and selection state
  const [historyList, setHistoryList] = useState<HistoryItem[]>([]);
  const [capturedSelection, setCapturedSelection] = useState<CapturedSelection | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Settings preferences
  const [defaultAi, setDefaultAi] = useState<string>('chatgpt');
  const [linkStyle, setLinkStyle] = useState<string>('inlined');

  // Load extension state on startup
  useEffect(() => {
    loadHistory();
    checkCapturedSelection();
    loadSettings();
    extractActiveTabContent();
  }, []);

  // Show dynamic toast overlay inside Popup
  const showToast = (message: string) => {
    setToastMessage(message);
    setTimeout(() => setToastMessage(null), 2500);
  };

  const checkCapturedSelection = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['capturedSelection'], (res) => {
        if (res.capturedSelection) {
          setCapturedSelection(res.capturedSelection);
        }
      });
    }
  };

  const loadHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['history'], (res) => {
        if (res.history) {
          setHistoryList(res.history);
        }
      });
    }
  };

  const loadSettings = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['settings'], (res) => {
        if (res.settings) {
          if (res.settings.defaultAiExport) setDefaultAi(res.settings.defaultAiExport);
          if (res.settings.linkStyle) setLinkStyle(res.settings.linkStyle);
        }
      });
    }
  };

  const handleSettingsChange = (key: string, value: string) => {
    if (key === 'defaultAi') {
      setDefaultAi(value);
    } else if (key === 'linkStyle') {
      setLinkStyle(value);
    }

    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['settings'], (res) => {
        const currentSettings = res.settings || {};
        const updatedSettings = {
          ...currentSettings,
          [key === 'defaultAi' ? 'defaultAiExport' : 'linkStyle']: value
        };
        chrome.storage.local.set({ settings: updatedSettings }, () => {
          showToast('✓ Settings updated.');
        });
      });
    } else {
      showToast('✓ Settings updated.');
    }
  };

  const saveToHistory = (newTitle: string, newUrl: string, md: string) => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get(['history'], (res) => {
        const currentHistory: HistoryItem[] = res.history || [];

        // Remove existing item with same URL to avoid duplicate lists
        const filteredHistory = currentHistory.filter(item => item.url !== newUrl);

        const newItem: HistoryItem = {
          id: Date.now().toString(),
          title: newTitle,
          url: newUrl,
          markdown: md,
          timestamp: Date.now()
        };

        // Add to the front of list, limit to 10 items
        const updatedHistory = [newItem, ...filteredHistory].slice(0, 10);

        chrome.storage.local.set({ history: updatedHistory }, () => {
          setHistoryList(updatedHistory);
        });
      });
    }
  };

  const clearHistory = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ history: [] }, () => {
        setHistoryList([]);
        showToast('✓ History cleared successfully.');
      });
    }
  };

  const deleteHistoryItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation(); // Avoid loading the clicked item
    if (typeof chrome !== 'undefined' && chrome.storage) {
      const updatedHistory = historyList.filter(item => item.id !== id);
      chrome.storage.local.set({ history: updatedHistory }, () => {
        setHistoryList(updatedHistory);
        showToast('✓ Removed item from history.');
      });
    }
  };

  const loadHistoryItem = (item: HistoryItem) => {
    setTitle(item.title);
    setUrl(item.url);
    setMarkdown(item.markdown);
    setActiveTab('preview');
    showToast('✓ Loaded history item.');
  };

  const handleApplyCapturedSelection = () => {
    if (!capturedSelection) return;

    setLoading(true);
    setError(null);

    try {
      const parsed = parseHtml(capturedSelection.html, capturedSelection.url);
      if (parsed) {
        const md = htmlToMarkdown(parsed.content, linkStyle as 'inlined' | 'referenced');

        setTitle(capturedSelection.title + ' (Selected)');
        setUrl(capturedSelection.url);
        setMarkdown(md);

        // Save to local history
        saveToHistory(capturedSelection.title + ' (Selected)', capturedSelection.url, md);

        showToast('✓ Custom selection loaded!');
      } else {
        // Fallback: try converting direct html to markdown without readability
        const md = htmlToMarkdown(capturedSelection.html, linkStyle as 'inlined' | 'referenced');
        setTitle(capturedSelection.title + ' (Selected)');
        setUrl(capturedSelection.url);
        setMarkdown(md);
        saveToHistory(capturedSelection.title + ' (Selected)', capturedSelection.url, md);
        showToast('✓ Custom selection loaded!');
      }
    } catch (err) {
      setError('Failed to process captured selection.');
    } finally {
      setLoading(false);
      // Clear capture from storage
      handleDismissCapturedSelection();
    }
  };

  const handleDismissCapturedSelection = () => {
    setCapturedSelection(null);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove('capturedSelection');
    }
  };

  const extractActiveTabContent = async () => {
    setLoading(true);
    setError(null);

    if (typeof chrome === 'undefined' || !chrome.tabs) {
      // Mock environment (running locally in dev server)
      setTimeout(() => {
        setTitle('Example Blog Article');
        setUrl('https://example.com/blog/markdown-extraction');
        setMarkdown('# Example Blog Article\n\nThis is a mock markdown output because you are running dot-md locally outside of a Chrome Extension context. Navigate to this file in a packed extension to use it!\n\n## Subheading\n\n* List item one\n* List item two\n\n[Google Link](https://google.com)');
        setLoading(false);
      }, 1000);
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (!tab || !tab.id) {
        setError('No active tab found.');
        setLoading(false);
        return;
      }

      const tabUrl = tab.url || '';

      // Prevent running on browser system pages
      if (tabUrl.startsWith('chrome://') || tabUrl.startsWith('edge://') || tabUrl.startsWith('about:') || tabUrl.startsWith('chrome-extension://')) {
        setError('dot-md cannot extract content from browser system pages. Open a blog post, article, or documentation page and try again!');
        setLoading(false);
        return;
      }

      // Query content script
      let response;
      try {
        response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PAGE' });
      } catch (msgErr) {
        // If content script fails to respond, it might not be injected.
        // Dynamically inject the content script.
        try {
          await chrome.scripting.executeScript({
            target: { tabId: tab.id },
            files: ['contentScript.js']
          });
          // Wait briefly, then re-send message
          response = await chrome.tabs.sendMessage(tab.id, { type: 'EXTRACT_PAGE' });
        } catch (injectErr) {
          console.error('Injection failed:', injectErr);
          setError('Failed to load content extraction script on this page. Please refresh the page and try again.');
          setLoading(false);
          return;
        }
      }

      if (response && response.html) {
        const { html, title: pageTitle, url: pageUrl } = response;

        // Parse using Readability
        const parsed = parseHtml(html, pageUrl);
        if (parsed && parsed.content) {
          // Convert to markdown
          const md = htmlToMarkdown(parsed.content, linkStyle as 'inlined' | 'referenced');

          setTitle(parsed.title || pageTitle || 'Untitled');
          setUrl(pageUrl);
          setMarkdown(md);

          // Save to local history
          saveToHistory(parsed.title || pageTitle || 'Untitled', pageUrl, md);
        } else {
          // Fallback to basic html extraction if readability fails
          const md = htmlToMarkdown(html, linkStyle as 'inlined' | 'referenced');
          setTitle(pageTitle || 'Untitled');
          setUrl(pageUrl);
          setMarkdown(md);
          saveToHistory(pageTitle || 'Untitled', pageUrl, md);
        }
      } else {
        setError('Could not read content from this tab.');
      }
    } catch (err) {
      console.error('Extraction error:', err);
      setError('An error occurred during content extraction.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartSelectionMode = async () => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      showToast('Selection mode is only available in Chrome.');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'START_SELECTION' });
        // Close popup window so user can interact with the page
        window.close();
      }
    } catch (err) {
      showToast('Failed to start selection mode.');
    }
  };

  const handleToggleReaderMode = async () => {
    if (typeof chrome === 'undefined' || !chrome.tabs) {
      showToast('Reader mode is only available in Chrome.');
      return;
    }

    try {
      const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
      if (tab && tab.id) {
        await chrome.tabs.sendMessage(tab.id, { type: 'TOGGLE_READER_MODE' });
        // Close popup window so the user sees the reader overlay immediately
        window.close();
      }
    } catch (err) {
      showToast('Failed to toggle reader mode.');
    }
  };

  return (
    <div className="app-container">
      {/* Toast Alert Banner */}
      {toastMessage && <div className="popup-toast">{toastMessage}</div>}

      {/* Header bar */}
      <div className="header">
        <div className="logo-section">
          <div className="logo-dot" />
          dot-md
        </div>
        <div className="tabs">
          <button
            className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
            onClick={() => setActiveTab('preview')}
          >
            Preview
          </button>
          <button
            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            History
          </button>
          <button
            className={`tab-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            Settings
          </button>
        </div>
      </div>

      {/* Main card */}
      <div className="main-content">
        {activeTab === 'preview' && (
          <>
            {/* Show selection active block if selection capture is in storage */}
            {capturedSelection && (
              <div className="selection-active-banner">
                <div className="selection-active-title">🎯 Custom DOM Captured</div>
                <div className="selection-active-desc">
                  An element was selected from "{capturedSelection.title.substring(0, 30)}...".
                </div>
                <div className="selection-actions-row">
                  <button className="selection-action-btn" onClick={handleApplyCapturedSelection}>
                    Load Selected
                  </button>
                  <button className="selection-action-btn secondary" onClick={handleDismissCapturedSelection}>
                    Dismiss
                  </button>
                </div>
              </div>
            )}

            {loading ? (
              <div className="center-view">
                <div className="spinner" />
                <div className="center-title">Extracting Web Content...</div>
                <div className="center-desc">Stripping ads and menus, converting to clean markdown</div>
              </div>
            ) : error ? (
              <div className="center-view">
                <AlertTriangle size={32} style={{ color: 'var(--warning)', marginBottom: '0.75rem' }} />
                <div className="center-title">Unsupported Tab</div>
                <div className="center-desc" style={{ fontSize: '0.72rem' }}>{error}</div>
                <button className="btn-primary" onClick={extractActiveTabContent}>
                  Retry
                </button>
              </div>
            ) : (
              <>
                <div className="page-info">
                  <div className="page-title">{title}</div>
                  <div className="page-url">{url}</div>
                </div>
                <Preview
                  title={title}
                  url={url}
                  markdown={markdown}
                  onMarkdownChange={setMarkdown}
                  onStartSelection={handleStartSelectionMode}
                  onToggleReaderMode={handleToggleReaderMode}
                  showToast={showToast}
                />
              </>
            )}
          </>
        )}

        {activeTab === 'history' && (
          <div className="preview-container">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <History size={14} style={{ color: 'var(--accent-primary)' }} />
              Recent Conversions (Last 10)
            </h3>
            {historyList.length === 0 ? (
              <div className="center-view">
                <FileText size={32} style={{ color: 'var(--text-muted)', marginBottom: '0.75rem' }} />
                <div className="center-title">No History</div>
                <div className="center-desc">Pages you convert into Markdown will appear here.</div>
              </div>
            ) : (
              <div className="history-list">
                {historyList.map((item) => (
                  <div key={item.id} className="history-item" onClick={() => loadHistoryItem(item)}>
                    <div className="history-info">
                      <div className="history-title">{item.title}</div>
                      <div className="history-meta">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.url}
                      </div>
                    </div>
                    <div className="history-actions">
                      <button
                        className="btn-history-action delete"
                        onClick={(e) => deleteHistoryItem(item.id, e)}
                        title="Delete from history"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'settings' && (
          <div className="preview-container">
            <h3 style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <Settings size={14} style={{ color: 'var(--accent-primary)' }} />
              Extension Options
            </h3>
            <div className="settings-list">
              <div className="settings-group">
                <div className="settings-label">Preferences</div>
                <div className="settings-desc">Choose your default configurations.</div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '6px' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Default AI Model Prompt</label>
                    <select
                      className="select-premium"
                      value={defaultAi}
                      onChange={(e) => handleSettingsChange('defaultAi', e.target.value)}
                    >
                      <option value="chatgpt">ChatGPT (Default)</option>
                      <option value="claude">Claude</option>
                      <option value="gemini">Gemini</option>
                    </select>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', display: 'block', marginBottom: '3px' }}>Markdown Link Style</label>
                    <select
                      className="select-premium"
                      value={linkStyle}
                      onChange={(e) => handleSettingsChange('linkStyle', e.target.value)}
                    >
                      <option value="inlined">Inline Links [Name](url)</option>
                      <option value="referenced">Reference Links [Name][id]</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-label">🔐 Privacy Guarantee</div>
                <div className="settings-desc" style={{ lineHeight: '1.4', marginBottom: '4px' }}>
                  dot-md processes 100% of your webpage content locally inside your Google Chrome browser.
                </div>
                <div className="settings-desc" style={{ lineHeight: '1.4' }}>
                  We do not send your data to remote servers, make external API calls, or track/collect your browsing history. Your contents remain completely private and secure.
                </div>
                <div className="settings-desc" style={{ fontSize: '0.68rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Version 1.0.0 • Manifest V3 • Works Offline
                </div>
              </div>

              <div className="settings-group">
                <div className="settings-label">Local Database</div>
                <div className="settings-desc">Clear your locally cached conversion history.</div>
                <button
                  className="btn-primary"
                  onClick={clearHistory}
                  style={{ background: 'transparent', border: '1px solid var(--danger)', color: 'var(--danger)', boxShadow: 'none', marginTop: '6px' }}
                >
                  Clear History List
                </button>
              </div>

              <div className="settings-group" style={{ borderBottom: 'none', paddingBottom: '0' }}>
                <div className="settings-label">Developer Credits</div>
                <div className="settings-desc" style={{ lineHeight: '1.4', marginBottom: '4px' }}>
                  Developed by{' '}
                  <a
                    href="https://www.fahimahammed.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 600 }}
                  >
                    Fahim ahammed firoz
                  </a>
                </div>
                <div className="settings-desc">
                  Portfolio: <a href="https://www.fahimahammed.me" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--text-secondary)', textDecoration: 'underline' }}>fahimahammed.me</a>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
