class HuggingFaceClient {
  constructor(apiKey, model = "sadhaklar/gpt2-nepali") {
    this.apiKey = apiKey;
    this.model = model;
    this.baseUrl = "https://router.huggingface.co/models";
  }

  async generate(prompt, options = {}) {
    const response = await fetch(`${this.baseUrl}/${this.model}`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: prompt,
        parameters: {
          max_length: options.maxLength || 100,
          temperature: options.temperature || 0.7,
          top_p: options.topP || 0.9,
          repetition_penalty: options.repetitionPenalty || 1.2,
          do_sample: true,
          ...options.parameters,
        },
        options: {
          use_cache: true,
          wait_for_model: true,
        },
      }),
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Hugging Face API error: ${error}`);
    }

    return response.json();
  }

  // For NepaliBERT (fill-mask task)
  async fillMask(text, options = {}) {
    const response = await fetch(`${this.baseUrl}/NLP-Nepal/NepaliBERT`, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${this.apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        inputs: text,
        parameters: options.parameters || {},
      }),
    });

    return response.json();
  }

  // Get available Nepali models
  static getNepaliModels() {
    return [
      {
        id: "sadhaklar/gpt2-nepali",
        name: "GPT-2 Nepali",
        description: "Best for creative writing and chat",
        maxLength: 200,
      },
      {
        id: "NLP-Nepal/NepaliBERT",
        name: "NepaliBERT",
        description: "Best for Q&A and text completion",
        maxLength: 512,
      },
      {
        id: "ai4bharat/IndicBERT",
        name: "IndicBERT",
        description: "Multi-language including Nepali",
        maxLength: 512,
      },
    ];
  }
}

export default HuggingFaceClient;
