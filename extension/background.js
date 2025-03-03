// Map to store state per tab
const tabStates = {};

function updateState(tabId, newState) {
  tabStates[tabId] = { ...tabStates[tabId], ...newState };
  chrome.storage.local.set({ [tabId]: tabStates[tabId] });
  chrome.runtime.sendMessage({ action: 'stateUpdate', tabId, state: tabStates[tabId] });
}

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
  } else if (request.action === 'startSummary') {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      const tab = tabs[0];
      console.log("tabs: ", tab, tabs)
      const tabId = tab.id;

      // Check if we already have a summary for this tab
      if (tabStates[tabId] && !tabStates[tabId].loading && tabStates[tabId].summary !== 'Click to summarize') {
        sendResponse({ alreadySummarized: true });
        return;
      }

      updateState(tabId, { loading: true, summary: false, insights: [] });

      chrome.scripting.executeScript({
        target: { tabId },
        function: extractText,
      }, async (results) => {
        const text = results[0].result;
        try {
          console.log("before sending the request")
          const response = await fetch('http://localhost:3000/summarize', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text }),
          });
          if (!response.ok) throw new Error('Fetch failed');
          const data = await response.json();
          console.log("data: ", data)
          updateState(tabId, { summary: data.summary, insights: data.insights, loading: false });
        } catch (error) {
          updateState(tabId, { summary: 'Failed to summarize', insights: [], loading: false });
        }
      });
    });
    return true;
  }
});

// Clear state when tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  delete tabStates[tabId];
  chrome.storage.local.remove(tabId.toString());
});

function extractText() {
  const selectors = ['article', 'main', '.post-content', '.entry-content', '.article-body', 'section', 'p'];
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