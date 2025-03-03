<template>
  <div class="main-container">
    <h1 class="title">summarizeXT</h1>
    
    <button 
      class="summarize-btn" 
      @click="fetchSummary" 
      :disabled="loading"
    >
      {{ summary && !loading && !error ? 'Summarize Again' : 'Summarize Current Website' }}
    </button>
    <div class="content-wrapper">
      <div v-if="loading" class="loading-container">
        <div class="cyber-spinner"></div>
        <p class="loading-text">Processing Data Stream...</p>
      </div>
      <div v-else-if="summary && !error" class="result-container">
        <div class="summary-section">
          <h3 class="section-title">Summary</h3>
          <p class="summary-text">{{ summary }}</p>
        </div>
        
        <div class="insights-section">
          <h3 class="section-title">Key Insights</h3>
          <ul class="insights-list">
            <li v-for="(insight, index) in insights" :key="index" class="insight-item">
              {{ insight }}
            </li>
          </ul>
        </div>
      </div>

      <div v-else-if="error" class="error-container">
        <h3 class="error-title">Oops, Data Sync Failed</h3>
        <p class="error-message">Couldn’t summarize your content. Please retry.</p>
        <button 
          class="retry-btn" 
          @click="fetchSummary"
        >
          Try Again
        </button>
      </div>

      <div v-else class="initial-state">
        <p>Click to analyze the current webpage</p>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return {
      summary: false,
      insights: [],
      loading: false,
      error: false,
      currentUrl: '',
    };
  },
  mounted() {
    this.loadTabState();
    chrome.runtime.onMessage.addListener((message) => {
      if (message.action === 'stateUpdate') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (message.tabId === tabs[0].id) {
            this.summary = message.state.summary;
            this.insights = message.state.insights;
            this.loading = message.state.loading;
          }
        });
      }
    });
  },
  methods: {
    async fetchSummary() {
      const response = await new Promise((resolve) => {
        chrome.runtime.sendMessage({ action: 'startSummary' }, resolve);
      });
      if (response && response.alreadySummarized) {
        this.loadTabState(); // Load existing summary immediately
      }
    },
    loadTabState() {
      chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        const tabId = tabs[0].id;
        chrome.storage.local.get(tabId.toString(), (result) => {
          const state = result[tabId] || { summary: false, insights: [], loading: false };
          this.summary = state.summary;
          this.insights = state.insights;
          this.loading = state.loading;
        });
      });
    },
  },
};
</script>

<style scoped>
.main-container {
  width: 320px;
  min-height: 400px;
  padding: 20px;
  background: linear-gradient(135deg, #1a2e1a 0%, #163e21 100%);
  color: #e0e0e0;
  font-family: 'Roboto Mono', monospace;
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(0, 255, 127, 0.2);
}

.title {
  font-size: 24px;
  color: #00ff7f;
  text-align: center;
  margin-bottom: 20px;
  text-transform: uppercase;
  letter-spacing: 2px;
  text-shadow: 0 0 5px rgba(0, 255, 127, 0.5);
}

/* Button Styles */
.summarize-btn,
.retry-btn {
  display: block;
  width: 100%;
  padding: 10px;
  background: #00ff7f;
  color: #1a2e1a;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.3s ease;
  text-transform: uppercase;
  letter-spacing: 1px;
}

.summarize-btn:hover:not(:disabled),
.retry-btn:hover {
  background: #00cc66;
  box-shadow: 0 0 10px rgba(0, 255, 127, 0.5);
}

.summarize-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

/* Loading Animation */
.loading-container {
  text-align: center;
  padding: 20px;
}

.cyber-spinner {
  width: 40px;
  height: 40px;
  border: 4px solid #00ff7f;
  border-top: 4px solid transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 10px;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.loading-text {
  font-size: 14px;
  color: #00ff7f;
  text-shadow: 0 0 5px rgba(0, 255, 127, 0.3);
}

/* Result Styles */
.content-wrapper {
  margin-top: 20px;
}

.result-container {
  animation: fadeIn 0.3s ease-in;
}

.section-title {
  font-size: 18px;
  color: #00ff7f;
  margin-bottom: 10px;
  border-bottom: 1px solid rgba(0, 255, 127, 0.2);
  padding-bottom: 5px;
}

.summary-text {
  font-size: 14px;
  line-height: 1.5;
  margin-bottom: 20px;
}

.insights-list {
  list-style: none;
  padding: 0;
}

.insight-item {
  font-size: 14px;
  line-height: 1.6;
  padding: 8px;
  background: rgba(255, 255, 255, 0.05);
  margin-bottom: 8px;
  border-radius: 4px;
  transition: all 0.3s ease;
}

.insight-item:hover {
  background: rgba(0, 255, 127, 0.1);
}

/* Error State */
.error-container {
  text-align: center;
  padding: 20px;
  animation: fadeIn 0.3s ease-in;
}

.error-title {
  font-size: 18px;
  color: #ff3366;
  margin-bottom: 10px;
}

.error-message {
  font-size: 14px;
  margin-bottom: 20px;
}

.initial-state {
  text-align: center;
  padding: 20px;
  font-size: 14px;
  color: #a0a0a0;
}

/* Fade Animation */
@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>