# Blog Summarizer Chrome Extension
---
A Chrome extension that summarizes blog content and extracts key insights using a pluggable Large Language Model (LLM). This browser extension is designed to work with SmolLM-21.7B via Ollama, but its modular architecture allows users to swap in any LLM of their choice.

## Features
- Summarizes webpage text (focused on blogs) in 3-5 sentences.
- Extracts 2-3 key insights from the content.
- Persists summaries per tab, even if the popup closes mid-process.
- Open-source and extensible—plug in your own LLM!

## Tech Stack
- **Client (Extension)**: Node.js, Vue.js (Options API), Vite
- **Server (Backend)**: Node.js, Express.js
- **LLM**: SmolLM-21.7B (via Ollama), configurable for other models
- **Deployment**: Chrome Web Store (client), local server (backend)

## Prerequisites
- **Node.js**: v16+ (install via [nodejs.org](https://nodejs.org/))
- **npm**: Comes with Node.js
- **Google Chrome**: For running the extension
- **Raspberry Pi (optional)**: For running Ollama locally with SmolLM-21.7B
- **Ollama**: For serving the LLM (install instructions below)

---

## Setup Instructions

### 1. Clone the Repository
```bash
git clone https://github.com/biccsdev/summarizeXT.git
cd summarizeXT
```

### 2. Server Setup (Backend)
The backend runs an Express server that communicates with Ollama for summarization.

Install Dependencies
```bash
cd backend
npm install
```

Configure the LLM
1. Install Ollama (on your Raspberry Pi or local machine):
- Follow the official guide: Ollama GitHub
- On a Raspberry Pi (Linux ARM):
```bash
curl -fsSL https://ollama.com/install.sh | sh
```

- Start Ollama:
```bash
ollama serve
```

- Pull SmolLM-21.7B:
```bash
ollama pull smollm:21.7b
```

2. Update llm-config.js:
- Open backend/llm-config.js and set your Ollama endpoint:
```bash
module.exports = {
  type: 'ollama',
  endpoint: 'http://<your-pi-ip>:11434/api/generate', // e.g., http://192.168.1.100:11434/api/generate
  model: 'smolLM2:1.7B',
};
```
- Replace <your-pi-ip> with your Raspberry Pi’s IP (find it with hostname -I on the Pi).

#### Start the Server
```bash
node index.js
```

- The server runs on http://localhost:3000. Test it:
```bash
curl -X POST http://localhost:3000/summarize -H "Content-Type: application/json" -d '{"text":"Hello world"}'
```


3. **Client Setup (Chrome Extension)**
The client is a Chrome extension built with Vue.js.

Install Dependencies
```bash 
cd extension
npm install
```
Build the Extension
```bash
npx vite build
```

- This generates a dist/ folder. Copy its contents to extension/ if needed (e.g., popup/ files).

**Load into Chrome**
1. Open Chrome and go to chrome://extensions/.
2. Enable “Developer mode” (top right).
3. Click “Load unpacked” and select the extension/ folder.
4. The “Blog Summarizer” icon should appear in your toolbar.

---

### Running Locally

1. Start the Backend:
   - In backend/, run node index.js.
2. Ensure Ollama is Running:
   - On your Pi (or local machine), keep ollama serve active.
3. Use the Extension:
   - Open a blog page in Chrome (e.g., uploadVR, hackernews, futurism).
   - Click the extension icon, then click “Summarize”.
   - Wait for the summary and insights to appear (may take a few seconds depending on your Pi’s performance).


### Customizing the LLM
The backend is modular—swap out SmolLM for another LLM:

1. Open backend/llm-service.js.
2. Create a new class extending LLMService (e.g., HuggingFaceLLM):
```javascript  
export class HuggingFaceLLM extends LLMService {
  async summarize(text) {
    // Implement API call to Hugging Face
  }
}
```

3. Update backend/index.js to use your new class:
```javascript 
const llm = new HuggingFaceLLM(llmConfig);
```

4. Adjust llm-config.js with your LLM’s endpoint and settings.

### Troubleshooting
- Slow Response: If the Pi is sluggish with SmolLM2-1.7B, try a smaller model (e.g., smollm:1.7b), change machine or optimize with quantization.
- CORS Errors: Ensure the backend is running and cors is enabled (npm install cors if missing).
- State Not Updating: Check console logs in the popup (Inspect) and background script (Inspect background page).


---
### Contributing
1. Fork the repo.
2. Create a branch (git checkout -b feature/your-feature).
3. Commit changes (git commit -m "Add feature").
4. Push to your fork (git push origin feature/your-feature).
5. Open a Pull Request.

License
MIT License - Feel free to use, modify, and distribute!

