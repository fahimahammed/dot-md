<h1 align="center">dot-md - Web to Clean Markdown</h1>

<p align="center">
  <img src="public/cover.png" alt="dot-md Cover Banner" width="600" />
</p>

<p align="center">
  <strong>Convert any webpage into clean, well-formatted, LLM-ready Markdown instantly.</strong>
</p>

<p align="center">
  <a href="https://github.com/fahimahammed/dot-md/actions">
    <img src="https://img.shields.io/github/actions/workflow/status/fahimahammed/dot-md/ci.yml?branch=main&style=flat-square&logo=github-actions&logoColor=white&color=2ea44f" alt="Build Status" />
  </a>
  <a href="https://github.com/fahimahammed/dot-md/blob/main/package.json">
    <img src="https://img.shields.io/github/package-json/v/fahimahammed/dot-md?style=flat-square&logo=git&logoColor=white&color=7C3AED" alt="Version" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/fahimahammed/dot-md?style=flat-square&logo=git&logoColor=white&color=475569" alt="MIT License" />
  </a>
</p>

<p align="center">
  <a href="LICENSE">License</a> •
  <a href="PRIVACY.md">Privacy Policy</a> •
  <a href="SECURITY.md">Security Policy</a>
</p>

---

## Summary

**dot-md** is a developer-first Chrome Extension (built with Manifest V3, React, and TypeScript) designed to instantly scrape and convert cluttered webpages into clean, structured Markdown. 

Whether you are preparing article content for LLMs (ChatGPT, Claude, Gemini), archiving research, or formatting technical documentation, **dot-md** removes cookie banners, advertisements, navigation bars, and footers, delivering only the core text and images you need.

> [!IMPORTANT]
> **100% Privacy-First & Offline:** All HTML scraping, readability processing, and Markdown generation occur entirely in your local browser environment. No telemetry, no external trackers, and no server roundtrips.

---

## Features

- **Full Page Extraction:** One-click conversion of articles, blogs, and documentation pages, using Mozilla's `@mozilla/readability` to isolate the core content.
- **Custom Selection Mode:** Focus on specific page segments. Click any page element with an interactive DOM inspector overlay to extract only that section.
- **Immersive Reader Mode:** Read distraction-free in a beautiful fullscreen modal isolated inside a browser Shadow DOM. Toggle between Light, Sepia, and Dark themes, and scale typography dynamically.
- **AI-Optimized Exporter:** Instantly copy formatted templates ready for LLM prompt context, complete with page metadata (Title, Source URL, and Content).
- **Token & Word Calculator:** Live calculations of words and LLM tokens. Displays warning overlays when context length exceeds 15,000 tokens to help manage prompt budgets.
- **Local Session History:** A slide-out History panel storing your last 10 processed pages for fast offline reuse, retrieval, and re-export.
- **Premium UI/UX:** Sleek glassmorphic panel design, responsive micro-animations, customizable dark theme, and fluid transitions.

---

## Installation Guide

Follow these steps to build and load the extension locally in your Google Chrome browser:

1. **Clone the Repository:**
   ```bash
   git clone https://github.com/fahimahammed/dot-md.git
   cd dot-md
   ```

2. **Install Dependencies & Build the Project:**
   ```bash
   npm install
   npm run build
   ```
   *This will compile the extension assets and generate a **`dist`** folder in the root directory.*

3. **Load the Extension in Google Chrome:**
   * Open your Chrome browser and type **`chrome://extensions/`** in the URL search bar.
   * Turn on **Developer mode** using the toggle switch located in the top-right corner of the page.
   * Click the **Load unpacked** button in the top-left corner.
   * Navigate to and select the **`dist`** folder inside your cloned `dot-md` project directory.

4. **Verify Installation:**
   * The **dot-md** extension icon will now appear in your extension toolbar. Pin it for quick access, then navigate to any article and click the icon to begin converting!

---

## Development Installation Guide

Follow these steps to set up the project locally for development or customization.

### Prerequisites
- Node.js (v22.0.0 or higher recommended)
- npm (v9.0.0 or higher)

### 1. Clone & Install Dependencies
```bash
git clone https://github.com/fahimahammed/dot-md.git
cd dot-md
npm install
```

### 2. Available NPM Scripts
Run these commands from the root directory of the project:

| Command | Description |
| :--- | :--- |
| `npm run dev` | Runs the Vite dev server locally for interface/popup prototyping. |
| `npm run build` | Compiles files, bundles assets into `dist/`, and archives the output as `dist.zip`. |
| `npm run tsc` | Validates TypeScript configuration and checks for type safety compile issues. |

### 3. Understanding the Build System
Running `npm run build` triggers `node build.js`. This custom build script:
- Compiles the React UI popup, content scripts, and background service workers via Vite.
- Copies extension icons, configuration manifests, and assets to the output `/dist` folder.
- Compresses the contents of the `/dist` directory into **`dist.zip`** in the repository root directory. This ZIP archive is ready for upload to the Chrome Web Store Developer Console.

---

## Testing Procedures

To verify everything operates correctly:

1. **Full Extraction:** Open an article or document on dev.to or Wikipedia, click the extension icon, and verify the Markdown preview matches the content.
2. **Selection Mode:** Click the selector cursor icon in the popup. Move your cursor on the host webpage to see dashed hover highlights, select a container, and click **Load Selected** inside the popup's top banner alert.
3. **Reader Mode:** Open the reading viewer (book icon). Change text themes and sizes, then verify it closes gracefully.
4. **LLM Copying:** Click the **Export** dropdown and copy to Claude/ChatGPT format. Verify page metadata is included.

---

## Project Architecture

```txt
dot-md/
├── src/
│   ├── background/      # Chrome background service workers
│   ├── content/         # Page DOM selectors, highlighter overlay & reader mode component
│   ├── popup/           # React popup panel, Markdown previews, export utilities & history
│   ├── utils/           # Scrapers, readability parsing & turndown conversion logic
│   └── manifest.json    # Chrome Extension Manifest V3 configuration
├── public/              # Static icons and image assets
├── build.js             # Automated compilation and ZIP packaging script
├── vite.config.ts       # Vite configuration file
└── tsconfig.json        # TypeScript configuration file
```

---

## Privacy and Local Processing

**dot-md** respect user privacy.
- **No Remote Calls:** No remote APIs, analytics endpoints, or database endpoints are queried.
- **100% Offline:** Conversion and processing functions are completely offline.
- **Data Persistence:** Settings preferences and conversion histories are saved exclusively in Chrome's local storage (`chrome.storage.local`) and never leave your machine.

---

## License

This project is licensed under the terms of the MIT License. You are free to modify, distribute, and build upon this project for both personal and commercial applications. For full terms, refer to the [LICENSE](LICENSE) file.
