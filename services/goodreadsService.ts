import type { Book } from '../types';

/**
 * Fetches the user's read books by communicating with the content script
 * running in the parent window, using postMessage for sandboxed communication.
 */
export const getReadBooks = (): Promise<Book[]> => {
  return new Promise((resolve, reject) => {
    // Create a listener for the response from the content script.
    const messageListener = (event: MessageEvent) => {
      // Security: We only accept messages from the parent window.
      if (event.source !== window.parent) {
        return;
      }
      
      const { type, books, error } = event.data;

      if (type === "READ_BOOKS_RESPONSE") {
        window.removeEventListener('message', messageListener); // Clean up the listener.
        if (error) {
          reject(new Error(error));
        } else {
          resolve(books || []);
        }
      }
    };

    window.addEventListener('message', messageListener);

    // Send the request to the parent window (the content script).
    // The '*' target origin is acceptable for this use case as the content
    // script validates the message source.
    window.parent.postMessage({ type: "GET_READ_BOOKS_FROM_IFRAME" }, "*");

    // Add a timeout to prevent the promise from hanging indefinitely.
    setTimeout(() => {
        window.removeEventListener('message', messageListener);
        reject(new Error("Timeout: No response from the Goodreads page. Ensure you're on a valid Goodreads shelf page."));
    }, 5000);
  });
};