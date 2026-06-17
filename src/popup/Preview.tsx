import React, { useState, useEffect } from 'react';
import { Copy, Check, Download, Sparkles, MousePointer, BookOpen, ChevronDown } from 'lucide-react';
import { copyToClipboard } from '../utils/clipboard';
import { estimateTokens, getTokenWarning } from '../utils/tokenizer';

interface PreviewProps {
  title: string;
  url: string;
  markdown: string;
  onMarkdownChange: (newMd: string) => void;
  onStartSelection: () => void;
  onToggleReaderMode: () => void;
  showToast: (msg: string) => void;
}

export const Preview: React.FC<PreviewProps> = ({
  title,
  url,
  markdown,
  onMarkdownChange,
  onStartSelection,
  onToggleReaderMode,
  showToast
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [showAiDropdown, setShowAiDropdown] = useState<boolean>(false);
  
  // Calculate tokens and words
  const tokenCount = estimateTokens(markdown);
  const wordCount = markdown.trim() === '' ? 0 : markdown.trim().split(/\s+/).length;
  const warning = getTokenWarning(tokenCount);

  // Copy timeout
  useEffect(() => {
    if (copied) {
      const timer = setTimeout(() => setCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [copied]);

  const handleCopy = async () => {
    const success = await copyToClipboard(markdown);
    if (success) {
      setCopied(true);
      showToast('✓ Markdown copied to clipboard!');
    } else {
      showToast('❌ Copy failed.');
    }
  };

  const handleAiExport = async (aiType: 'chatgpt' | 'claude' | 'gemini') => {
    let formattedText = '';
    
    switch (aiType) {
      case 'chatgpt':
        formattedText = `You are an AI assistant. Here is the webpage content from "${title}" (${url}) in Markdown format. Please analyze and use it as context:\n---\n${markdown}\n---`;
        break;
      case 'claude':
        formattedText = `Please review the following webpage content from "${title}" (${url}) to answer subsequent questions.\n<webpage_content>\n${markdown}\n</webpage_content>`;
        break;
      case 'gemini':
        formattedText = `Here is the extracted content from "${title}" (${url}). Use this Markdown for reference:\n${markdown}`;
        break;
    }

    const success = await copyToClipboard(formattedText);
    if (success) {
      showToast(`✓ Copied for ${aiType === 'chatgpt' ? 'ChatGPT' : aiType === 'claude' ? 'Claude' : 'Gemini'}!`);
    } else {
      showToast('❌ Export failed.');
    }
    setShowAiDropdown(false);
  };

  const handleDownload = () => {
    try {
      // Clean filename from illegal characters
      const cleanTitle = title.replace(/[\\/:*?"<>|]/g, '').trim().substring(0, 100) || 'document';
      const filename = `${cleanTitle}.md`;
      
      const blob = new Blob([markdown], { type: 'text/markdown;charset=utf-8;' });
      const blobUrl = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = blobUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      
      // Cleanup
      document.body.removeChild(a);
      URL.revokeObjectURL(blobUrl);
      showToast('✓ Markdown file downloaded!');
    } catch (error) {
      console.error('Download failed:', error);
      showToast('❌ Download failed.');
    }
  };

  return (
    <div className="preview-container">
      {/* Scrollable text area for markdown review */}
      <div className="editor-wrapper">
        <textarea
          className="markdown-textarea"
          value={markdown}
          onChange={(e) => onMarkdownChange(e.target.value)}
          placeholder="No markdown content loaded yet. Open a web page and try again!"
          spellCheck={false}
        />
      </div>

      {/* Warning message if too large */}
      {warning && (
        <div className="stat-badge warning" style={{ margin: '0 0 0.5rem 0', display: 'block', textAlign: 'center' }}>
          {warning}
        </div>
      )}

      {/* Toolbar Controls */}
      <div className="toolbar">
        <div className="stats-group">
          <div className="stat-badge">{wordCount.toLocaleString()} words</div>
          <div className={`stat-badge ${tokenCount > 15000 ? 'warning' : ''}`}>
            ~{tokenCount.toLocaleString()} tokens
          </div>
        </div>

        <div className="actions-row">
          {/* Reader Mode Toggle */}
          <button 
            className="btn-icon" 
            onClick={onToggleReaderMode} 
            title="Toggle Clean Reader Mode in Page"
          >
            <BookOpen size={16} />
          </button>

          {/* Selection mode toggle */}
          <button 
            className="btn-icon" 
            onClick={onStartSelection} 
            title="Select Specific Part of Page"
          >
            <MousePointer size={16} />
          </button>

          {/* Copy Button */}
          <button className="btn-icon" onClick={handleCopy} title="Copy to Clipboard">
            {copied ? <Check size={16} style={{ color: 'var(--success)' }} /> : <Copy size={16} />}
          </button>

          {/* Download Button */}
          <button className="btn-icon" onClick={handleDownload} title="Download Markdown (.md)">
            <Download size={16} />
          </button>

          {/* AI Export Dropup Menu */}
          <div className="export-dropdown">
            <button 
              className="btn-primary" 
              onClick={() => setShowAiDropdown(!showAiDropdown)}
              title="Copy formatted for AI models"
            >
              <Sparkles size={14} style={{ marginRight: '4px' }} />
              Export
              <ChevronDown size={12} style={{ marginLeft: '4px' }} />
            </button>

            {showAiDropdown && (
              <div className="dropdown-menu">
                <button className="dropdown-item" onClick={() => handleAiExport('chatgpt')}>
                  <span>🧠</span> ChatGPT
                </button>
                <button className="dropdown-item" onClick={() => handleAiExport('claude')}>
                  <span>🎭</span> Claude
                </button>
                <button className="dropdown-item" onClick={() => handleAiExport('gemini')}>
                  <span>✨</span> Gemini
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
