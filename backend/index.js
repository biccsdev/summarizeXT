import express from 'express';
import cors from 'cors';
import fetch from 'node-fetch';

const app = express();

app.use(express.json());
app.use(cors());

// Ollama configuration (replace with your own llm IP)
const llmEndpoint = 'http://yourIP:11434/api/generate';

const generatePrompt = (text) => `Summarize this text in 3-5 sentences and list 2-3 key insights:\n\n${text}. Respond Using JSON.`;
 
app.post('/summarize', async (req, res) => {
  const { text } = req.body;
  console.log("prompt: ", generatePrompt(text))

  try {
    const response = await fetch(llmEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: 'smolLM2:1.7B', // Your model name in Ollama
        prompt: generatePrompt(text),
        format: {
          type: "object",
          properties: {
            summary: { type: "string" },
            insights: { type: "string" }
          }
        },
        required: ["summary","insights"],
        stream: false, // Get full response at once
        max_tokens: 200, // Limit output length
      }),
    });

    if (!response.ok) throw new Error('Ollama request failed');

    const data = await response.json();
    const output = data.response; 

    const [summary, insightsPart] = output.split('Key insights:');
    const summaryText = summary.trim();
    const insights = insightsPart
      ? insightsPart.trim().split('\n').filter(Boolean).slice(0, 3)
      : ['Insight parsing failed'];

    res.json({
      summary: summaryText,
      insights,
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ summary: 'Error summarizing', insights: [] });
  }

});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});