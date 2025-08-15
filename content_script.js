// This script runs in the context of the Goodreads website.

/**
 * Scrapes the book data from the user's shelf page.
 * @returns {Array<{title: string, author: string, genre: string}>} A list of book objects.
 */
const scrapeReadBooks = () => {
  // Only run scraper on the correct page (shelf list view)
  if (!window.location.href.includes('/review/list/')) {
    return [];
  }
  
  const books = [];
  const bookRows = document.querySelectorAll('tr.bookalike');
  
  bookRows.forEach(row => {
    const titleElement = row.querySelector('.title .value a');
    const authorElement = row.querySelector('.author .value a');
    
    if (titleElement && authorElement) {
      const title = titleElement.innerText.trim();
      const author = authorElement.innerText.trim();
      
      books.push({
        title,
        author,
        genre: 'Unknown', // Genre is not consistently available on this page
      });
    }
  });

  return books.slice(0, 20); // Limit to a reasonable number
};

// --- UI Injection Logic ---

function injectUI() {
  // Check if user is logged in (e.g., by checking for profile icon)
  const isLoggedIn = !!document.querySelector('.siteHeader__personal');
  if (!isLoggedIn) {
    return;
  }

  // Prevent double-injection
  if (document.getElementById('gr-ai-recommender-root')) {
    return;
  }

  // --- Create Styles ---
  const style = document.createElement('style');
  style.textContent = `
    #gr-ai-recommender-root {
      position: fixed;
      top: 0;
      right: 0;
      width: 820px;
      max-width: 95vw;
      height: 100vh;
      z-index: 9999;
      transform: translateX(100%);
      transition: transform 0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94);
      box-shadow: -5px 0px 20px rgba(0,0,0,0.15);
      background-color: #FDFCFB;
      display: flex;
      flex-direction: column;
    }
    #gr-ai-recommender-root.visible {
      transform: translateX(0);
    }
    #gr-ai-recommender-iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    #gr-ai-recommender-toggle {
      position: fixed;
      bottom: 25px;
      right: 25px;
      z-index: 9998;
      width: 60px;
      height: 60px;
      border-radius: 50%;
      background-color: #A47754; /* brand-primary */
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 12px rgba(0,0,0,0.2);
      transition: transform 0.2s ease-in-out, box-shadow 0.2s;
    }
    #gr-ai-recommender-toggle:hover {
        transform: scale(1.1);
        box-shadow: 0 6px 16px rgba(0,0,0,0.25);
    }
    #gr-ai-recommender-overlay {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        background-color: rgba(0,0,0,0.4);
        z-index: 9990;
        opacity: 0;
        pointer-events: none;
        transition: opacity 0.4s ease;
    }
    #gr-ai-recommender-overlay.visible {
        opacity: 1;
        pointer-events: auto;
    }
    .gr-ai-close-button {
      position: absolute;
      top: 12px;
      right: 12px;
      width: 32px;
      height: 32px;
      border: none;
      background: transparent;
      cursor: pointer;
      font-size: 28px;
      color: #382110;
      line-height: 1;
      padding: 0;
      border-radius: 50%;
      transition: background-color 0.2s;
    }
    .gr-ai-close-button:hover {
      background-color: rgba(0,0,0,0.1);
    }
  `;
  document.head.appendChild(style);

  // --- Create DOM Elements ---
  const root = document.createElement('div');
  root.id = 'gr-ai-recommender-root';

  const iframe = document.createElement('iframe');
  iframe.id = 'gr-ai-recommender-iframe';
  iframe.src = chrome.runtime.getURL('index.html');

  const closeButton = document.createElement('button');
  closeButton.innerHTML = '&times;';
  closeButton.className = 'gr-ai-close-button';
  closeButton.setAttribute('aria-label', 'Close AI Recommender');

  const toggleButton = document.createElement('button');
  toggleButton.id = 'gr-ai-recommender-toggle';
  toggleButton.setAttribute('aria-label', 'Toggle AI Recommender');
  toggleButton.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>`;
  
  const overlay = document.createElement('div');
  overlay.id = 'gr-ai-recommender-overlay';

  root.appendChild(closeButton);
  root.appendChild(iframe);
  document.body.appendChild(root);
  document.body.appendChild(toggleButton);
  document.body.appendChild(overlay);

  // --- Add Panel Toggle Listeners ---
  const togglePanel = () => {
    root.classList.toggle('visible');
    overlay.classList.toggle('visible');
  };

  toggleButton.addEventListener('click', togglePanel);
  closeButton.addEventListener('click', togglePanel);
  overlay.addEventListener('click', togglePanel);
  
  // --- Add Iframe Message Listener for Sandbox Communication ---
  window.addEventListener('message', (event) => {
    // Security: ensure the message is from our iframe and not a random source.
    if (event.source !== iframe.contentWindow) {
      return;
    }

    if (event.data?.type === "GET_READ_BOOKS_FROM_IFRAME") {
      try {
        const books = scrapeReadBooks();
        // Send the data back to the iframe that requested it.
        iframe.contentWindow.postMessage({ type: "READ_BOOKS_RESPONSE", books: books }, '*');
      } catch (e) {
        iframe.contentWindow.postMessage({ type: "READ_BOOKS_RESPONSE", books: [], error: e.message }, '*');
      }
    }
  });
}

// Ensure the UI is injected only once and after the page has loaded
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectUI);
} else {
  injectUI();
}