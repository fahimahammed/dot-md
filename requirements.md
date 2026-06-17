# 📘 Project Requirement Document

## 🧩 Project Name: dot-md

### Tagline: Convert any webpage into clean Markdown

---

# 1. Overview

**dot-md** is a browser extension (Chrome Extension Manifest V3) that extracts readable content from any webpage and converts it into clean, structured Markdown format. The tool is designed for developers, writers, researchers, and AI users who need fast content extraction for LLMs, notes, or documentation.

---

# 2. Problem Statement

Modern webpages contain:

* Ads
* Navigation menus
* Popups
* Irrelevant UI noise

Copying useful content manually is time-consuming and inefficient, especially for AI prompt preparation.

---

# 3. Solution

dot-md automatically:

* Extracts main article/content from a webpage
* Removes noise (ads, nav, footer)
* Converts HTML → Markdown
* Provides preview and copy functionality

---

# 4. Target Users

* Developers
* Technical writers
* Students & researchers
* AI users (ChatGPT, Claude, Gemini users)
* Documentation engineers

---

# 5. Core Features (MVP)

## 5.1 Page Content Extraction

* Extract main readable content from active tab
* Remove:

  * Navigation bars
  * Sidebars
  * Ads
  * Footer sections

## 5.2 Markdown Conversion

* Convert extracted HTML into clean Markdown
* Preserve:

  * Headings
  * Lists
  * Links
  * Code blocks
  * Tables (basic support)

## 5.3 Preview Panel

* Show Markdown output in extension popup
* Scrollable preview area

## 5.4 Copy to Clipboard

* One-click copy Markdown output

## 5.5 Download Markdown File

* Download `.md` file with page title as filename

## 5.6 Basic Error Handling

* Handle empty pages
* Handle unsupported pages
* Show user-friendly error messages

---

# 6. Advanced Features (Phase 2)

## 6.1 Selection Mode

* Allow user to select specific part of page
* Convert only selected DOM to Markdown

## 6.2 Token Estimation

* Estimate LLM token usage
* Show warning for large content

## 6.3 AI Export Mode

Buttons:

* Copy for ChatGPT
* Copy for Claude
* Copy for Gemini

Output format:

* Title
* URL
* Markdown body

## 6.4 Clean Reader Mode

* Focus mode (like Medium Reader)
* Highlight only main content visually

## 6.5 History Feature

* Save last 10 converted pages locally

---

# 7. Technical Requirements

## 7.1 Extension Architecture

* Manifest V3
* TypeScript
* React (Popup UI)
* Vite (build tool)

---

## 7.2 Core Libraries

* `@mozilla/readability` → content extraction
* `turndown` → HTML to Markdown conversion
* `chrome.tabs API` → active tab access
* `clipboard API` → copy functionality

---

## 7.3 System Flow

```text
User opens webpage
        ↓
Clicks dot-md extension
        ↓
Content script extracts DOM
        ↓
Readability cleans article
        ↓
Turndown converts to Markdown
        ↓
Popup shows preview
        ↓
User copies or downloads
```

---

## 7.4 Folder Structure

```text
dot-md/
├── src/
│   ├── popup/
│   │   ├── App.tsx
│   │   ├── Preview.tsx
│   │   └── styles.css
│   │
│   ├── content/
│   │   └── contentScript.ts
│   │
│   ├── background/
│   │   └── background.ts
│   │
│   ├── utils/
│   │   ├── readability.ts
│   │   ├── markdown.ts
│   │   ├── tokenizer.ts
│   │   └── clipboard.ts
│   │
│   └── manifest.json
│
├── public/
├── package.json
├── vite.config.ts
└── README.md
```

---

# 8. UI/UX Requirements

## Popup UI Layout

### Header

* dot-md logo
* Page title

### Main Panel

* Markdown preview (scrollable)

### Actions

* Copy Markdown
* Download .md
* Toggle “Selection Mode”

---

## UI Behavior

* Instant loading spinner during extraction
* Auto-update preview after extraction
* Dark mode support (optional)

---

# 9. Permissions

Chrome extension permissions:

* `activeTab`
* `scripting`
* `clipboardWrite`
* `storage`

Optional:

* `tabs`

---

# 10. Non-Functional Requirements

* Fast extraction (< 1.5s for normal articles)
* Lightweight bundle size (< 2MB target)
* Works offline after installation
* No external API dependency (MVP)

---

# 11. Security Considerations

* No data sent to external servers
* No tracking or analytics (privacy-first)
* All processing done locally in browser

---

# 12. Future Enhancements

* AI summarization inside extension
* Notion export
* Obsidian integration
* GitHub Gist export
* Full website crawler mode
* PDF export

---

# 13. Success Criteria

The project is successful if:

* Any blog/article page converts to clean Markdown
* User can copy output in 1 click
* Noise content is effectively removed
* Works on major sites (Medium, Dev.to, blogs, docs)

---

# 14. Final Vision

dot-md will become:

> A universal “web → Markdown” bridge for developers and AI workflows.


