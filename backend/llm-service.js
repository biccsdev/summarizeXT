import fetch from "node-fetch";

export class LLMService {
    constructor(config) {
      this.config = config;
    }
  
    async summarize(text) {
      throw new Error('Method not implemented');
    }
  }
  
  export class OllamaLLM extends LLMService {
    async summarize(text) {
      const response = await fetch(this.config.endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: this.config.model,
          prompt: `Summarize this text in 3-5 sentences and list 2-3 key insights:\n\n${text}. Respond Using JSON.`,
          format: {
            type: "object",
            properties: {
              summary: { type: "string" },
              insights: { type: "string" }
            }
          },
          required: ["summary","insights"],
          stream: false,
          max_tokens: 200,
        }),
      });
  
      if (!response.ok) throw new Error('Ollama request failed');
      const data = await response.json();
      const output = JSON.parse(data.response);

      console.log("output: ", output)
  
    //   const [summary, insightsPart] = output.split('Key insights:');
    const summary = output?.summary;
    const unParsedinsights = output?.insights;

    console.log("data parsed: ", summary, unParsedinsights)

    const insightsPart = unParsedinsights
          .split(/\[\d+\]/) //.split(/(\[\d+\]|\d+\.\s)/) 
          .map(insight => insight.trim())
          .filter(insight => insight.length > 0);

    console.log("insights part: ", insightsPart)


      return {
        summary: summary.trim(),
        insights: insightsPart ? insightsPart: [],
      };
    }
  }