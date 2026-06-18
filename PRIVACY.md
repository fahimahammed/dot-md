# Privacy Policy

**dot-md** values your privacy. This privacy policy describes how your information is handled when you use the **dot-md** Chrome Extension.

## 1. Zero Data Collection & Sharing

- **No Remote Servers:** The extension **does not** collect, store, transmit, or share any of your personal data, browsing history, or webpage content to external servers, API endpoints, or third parties.
- **Offline Processing:** All HTML scraping, readability processing, and Markdown conversions are executed 100% locally on your computer inside your Google Chrome browser context. 
- **No Third-Party Analytics:** We do not use any analytics services, tracking scripts, or telemetry frameworks.

## 2. Chrome Extension Permissions & Usage

To function correctly, **dot-md** requests the following permissions. Here is exactly why they are needed:

- **`activeTab`:** Used to retrieve the HTML source code of the webpage you are currently viewing *only* when you explicitly click the extension icon. It is required to run the local readability parser on the page's content.
- **`scripting`:** Required to dynamically inject content script logic for:
  - The visual overlay element highlighting inside the webpage (Custom Selection Mode).
  - Injecting and rendering the fullscreen isolated reader container (Reader Mode).
- **`storage`:** Used exclusively to store your personal user preferences (such as your chosen default AI prompt format and custom styling layout options) and your local history of the last 10 converted pages inside `chrome.storage.local`.

## 3. Data Storage

- **Local Only:** Any settings or history logs are kept inside Google Chrome's local storage (`chrome.storage.local`).
- **Clearing Data:** You can clear this history cache at any time using the trash icon in the history panel, or completely wipe it by uninstalling the extension or clearing your browser's application data.

## 4. Policy Changes

If there are updates to this privacy policy (e.g. if we add permissions to support new local features), we will update the version number of the extension and list the policy changes in this file.

## 5. Contact

If you have any questions or feedback regarding this privacy policy, feel free to contact us:
- **Email:** fahimahammed.cse@gmail.com
