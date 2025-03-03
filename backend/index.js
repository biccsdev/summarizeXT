import express from 'express';
import cors from 'cors';
import {OllamaLLM} from './llm-service.js';
import llmConfig from './llm-config.js';

const app = express();

app.use(express.json());
app.use(cors());

const llm = new OllamaLLM(llmConfig)

app.post('/summarize', async (req, res) => {
  const { text } = req.body;

  try {
    const { summary, insights } = await llm.summarize(text);
    res.json({ summary, insights });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ summary: 'Error summarizing', insights: [] });
  }
});

app.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});