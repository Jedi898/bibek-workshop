class HuggingFaceClient {
  constructor(apiKey, model) {
    this.apiKey = apiKey;
    this.model = model;
    // The old endpoint `api-inference.huggingface.co` is deprecated.
    // Using the new recommended endpoint `router.huggingface.co`.
    this.API_URL = `https://router.huggingface.co/models/${model}`;
  }

  async generate(prompt, options = {}) {
    const payload = {
      inputs: prompt,
      parameters: options,
    };

    const response = await fetch(this.API_URL, {
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      let errorDetails;
      try {
        // Try to parse a structured error message from the API
        const errorPayload = await response.json();
        errorDetails = errorPayload.error || JSON.stringify(errorPayload);
      } catch (e) {
        // If the error response isn't JSON, use the raw text
        errorDetails = await response.text();
      }
      throw new Error(`Hugging Face API request failed with status ${response.status}: ${errorDetails}`);
    }

    // It's also good practice to handle cases where a successful response is not valid JSON
    try {
      return await response.json();
    } catch (e) {
      console.error('Error parsing JSON from Hugging Face API:', e);
      throw new Error('Received an invalid response from the AI service.');
    }
  }

  static getNepaliModels() {
    return [
      "sadhaklar/gpt2-nepali",
      "thenaijapromptengineer/matsya-7b",
    ];
  }
}

export default HuggingFaceClient;