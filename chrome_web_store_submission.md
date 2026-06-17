# 🛒 Chrome Web Store Submission Details

এই ফাইলে গুগল ক্রোম ওয়েব স্টোরে এক্সটেনশনটি আপলোড এবং সাবমিট করার জন্য সমস্ত প্রয়োজনীয় বিবরণ (ইংরেজি লিস্টিং টেক্সট, অনুমতির যৌক্তিকতা এবং প্রাইভেসি পলিসি) সুন্দরভাবে গুছিয়ে দেওয়া হয়েছে। আপনি সরাসরি এখান থেকে কপি করে ক্রোম ডেভেলপার কনসোলে পেস্ট করতে পারেন।

---

## 📋 1. Store Listing Metadata (স্টোর লিস্টিং বিবরণ)

### 📌 Title (এক্সটেনশনের নাম)
* **Text**: `dot-md - Web to Clean Markdown`
* *সীমা: সর্বোচ্চ ৪৫ অক্ষরের মধ্যে।*

### 📌 Single-Line Summary (সংক্ষিপ্ত বিবরণ)
* **Text**: `Convert any webpage into clean, structured Markdown. One-click copy, custom element selection, token estimation, and offline reader mode.`
* *সীমা: সর্বোচ্চ ১৫০ অক্ষরের মধ্যে।*

### 📌 Detailed Description (বিস্তারিত বিবরণ)
* **Text (নিচের বক্সের অংশটুকু সম্পূর্ণ কপি করে স্টোরে পেস্ট করুন)**:
```text
dot-md is a lightweight, developer-first Chrome extension that extracts readable content from any webpage and instantly converts it into clean, well-formatted Markdown. Perfect for developers, technical writers, researchers, and AI workflows (LLMs context preparation).

🚀 CORE FEATURES:
1. Full Page Extraction: Strip away ads, sidebars, cookie banners, navigation menus, and footers in one click, leaving only the core content.
2. Custom Selection Mode: Inspect and capture specific DOM elements or sections of a webpage. Avoid clutter and convert only what you select.
3. Clean Reader Mode: Focus on reading with a fullscreen reading modal isolated inside a Shadow DOM. Includes adjustable themes (Light, Sepia, Dark) and customizable text sizes.
4. AI Export Wrappers: Instantly copy optimized formats tailored for ChatGPT, Claude, and Gemini with page title, source URL, and clean Markdown structure.
5. Token & Word Estimation: Get live token and word metrics. Displays amber warnings for large pages exceeding 15,000 tokens to save LLM context windows.
6. Offline History: Keeps track of your last 10 conversions locally for quick retrieval, copying, or exporting.

🛠️ PREMIUM DESIGN:
Features a sleek, glassmorphic dark-theme UI with responsive micro-animations, custom scrollbars, and fluid transitions designed to fit modern developer workflows.

🔒 100% PRIVACY FIRST:
All HTML processing, readability scraping, and Markdown conversions are executed 100% locally inside your browser. No external API calls are made, no tracking scripts are injected, and no webpage content is ever sent to remote servers. Fully works offline.
```

---

## 🔑 2. Permissions Justifications (অনুমতির যৌক্তিকতা)
গুগল ক্রোম টিম রিভিউ করার সময় এক্সটেনশনের ব্যবহৃত প্রতিটি পারমিশনের কারণ জানতে চায়। নিচের কপি-পেস্ট বিবরণগুলো কনসোলে ব্যবহার করুন:

### 🔹 activeTab
* **Justification**: `Used to retrieve the active tab's HTML source content when the user explicitly triggers the extension popup. This is required to run the Readability parser locally on the webpage.`

### 🔹 scripting
* **Justification**: `Required to dynamically inject the content script into active tabs to run the element selection inspector picker overlay and render the fullscreen reader mode component.`

### 🔹 storage
* **Justification**: `Used to store the user's local preference configurations (default AI format, link style) and a cached list of the last 10 converted markdown pages (history) inside chrome.storage.local.`

---

## 🔒 3. Privacy Policy (গোপনীয়তা নীতি)
ডেভেলপার ড্যাশবোর্ডের **Privacy** ট্যাবে নিচের তথ্যগুলো সিলেক্ট করুন:

1. **Single-Purpose Declaration**: "The single purpose of dot-md is to extract readable text content from webpage documents and convert them into clean Markdown format for LLM contexts, documentation, or offline notes."
2. **User Data Usage**:
   - আপনি কোনো ইউজার ডেটা সংগ্রহ বা ট্রান্সমিট করছেন না তা নিশ্চিত করতে **"No User Data Collection"** ডিক্লেয়ারেশন বক্সে ক্লিক করুন।
3. **Privacy Text**:
   ```text
   dot-md values your privacy. The extension does not collect, store, transmit, or share any user data, browsing history, or webpage content to external servers or third parties. All operations, including HTML parsing, reading optimization, and markdown rendering, are computed locally on the user's computer within the Google Chrome browser context.
   ```

---

## 🖼️ 4. Asset Checklist (প্রয়োজনীয় ছবির বিবরণ)

এক্সটেনশন সাবমিট করার সময় আপনাকে নিচের গ্রাফিক্সগুলো আপলোড করতে হবে:

1. **Extension Icon** (১টি):
   * রুট ডিরেক্টরির `dist/icons/icon128.png` ফাইলটি আপলোড করুন (১২৮x১২৮ সাইজ)।
2. **Store Screenshots** (কমপক্ষে ২টি):
   * সাইজ: ১২৮০x৮০০ বা ৬৪০x৪০০ পিক্সেল (PNG ফরম্যাট)।
   * *পরামর্শ: একটি স্ক্রিনশটে প্রিভিউ প্যানেল ও এআই এক্সপোর্ট বাটন এবং অন্যটিতে ব্রাউজারের ভেতর চলাকালীন সিলেকশন বা রিডার মোডের ভিউ স্ক্রিনশট নিন।*
3. **Promotional Tile** (১টি):
   * সাইজ: ৪৪০x২৮০ পিক্সেল (PNG ফরম্যাট)।
   * *পরামর্শ: আপনার প্রজেক্টের লোগো এবং সংক্ষেপে "Web to Markdown" ট্যাগলাইন সহ একটি আকর্ষণীয় ব্যানার ইমেজ ব্যবহার করুন।*
