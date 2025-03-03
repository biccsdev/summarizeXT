chrome.action.onClicked.addListener((tab) => {
  });
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'getText') {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tab = tabs[0];
        chrome.scripting.executeScript({
          target: { tabId: tab.id },
          function: extractText,
        }, (results) => {
          sendResponse({ text: results[0].result });
        });
      });
      return true;
    }
  });
  
  function extractText() {
    
    const selectors = [
      'article',            // Standard HTML5 article tag
      'main',               // Main content container
      '.post-content',      // Common blog class
      '.entry-content',     // WordPress
      '.article-body',      // Generic
      'section',            // Fallback
      'p'                   // Paragraphs as last resort
    ];
  
    for (const selector of selectors) {
      const elements = document.querySelectorAll(selector);
      if (elements.length > 0) {
        let text = '';
        elements.forEach((el) => {
          if (!el.closest('nav, footer, aside, script, style')) {
            text += el.innerText + '\n';
          }
        });
        if (text.trim()) return text.trim();
      }
    }
  
    return document.body.innerText.trim();
  }