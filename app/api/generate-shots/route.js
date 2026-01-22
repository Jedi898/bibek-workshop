import { NextResponse } from 'next/server';
import HuggingFaceClient from '../../../lib/hf-client.js';

export async function POST(request) {
  try {
    const { sceneText, directorNotes, model } = await request.json();

    if (!sceneText || sceneText.trim().length === 0) {
      return NextResponse.json(
        { error: 'Scene text is required' },
        { status: 400 }
      );
    }

    // Construct a detailed prompt for the Nepali model
    const prompt = `
You are an expert Nepali film director's assistant. Your task is to create a detailed shot list from a given scene script. The script is in Nepali.

**Instructions:**
1. Read the scene description, character actions, and dialogue carefully.
2. Identify the key moments, emotions, and actions in the scene.
3. For each moment, create a shot.
4. For each shot, describe:
    *   **Shot Type:** (e.g., वाइड शट, क्लोज-अप, मिड शट, ओभर-द-सोल्डर)
    *   **Angle:** (e.g., आई-लेभल, हाई एंगल, लो एंगल)
    *   **Movement:** (e.g., स्ट्याटिक, प्यान, डली, ह्यान्डहेल्ड)
    *   **Description:** A brief, clear description of what is happening in the shot and what the camera should capture.

**Input Scene:**
\`\`\`
${sceneText}
\`\`\`

**Director's Notes:**
\`\`\`
${directorNotes || 'कुनै विशेष नोट छैन (No special notes).'}
\`\`\`

**Output Format:**
Provide the shot list as a numbered list. Each item should clearly describe one shot. Do not add any extra explanation before or after the list.

**Example:**
1. **वाइड शट:** कोठाको ढोका देखिन्छ। राम कोठाभित्र पस्छ, ऊ थकित देखिन्छ।
2. **मिड शट:** राम सोफामा बस्छ र लामो सास फेर्छ। उसको अनुहारमा तनाव स्पष्ट छ।
3. **क्लोज-अप:** टेबलमा रहेको पानीको गिलासमा रामको हात।

Now, generate the shot list for the provided scene.
---
Shot List:
`;

    // Initialize Hugging Face client
    const client = new HuggingFaceClient(
      process.env.HUGGINGFACE_API_KEY,
      model || 'thenaijapromptengineer/matsya-7b'
    );

    // Generate response
    const result = await client.generate(prompt, {
      max_new_tokens: 512,
      temperature: 0.7,
      top_p: 0.95,
      repetition_penalty: 1.2,
    });

    // Extract the generated text. The structure might vary between models.
    const generatedText = Array.isArray(result) ? result[0]?.generated_text || '' : result.generated_text || '';
    
    // Clean up the output - remove the prompt from the beginning of the response if the model includes it.
    const shotList = generatedText.split('--- Shot List:').pop().trim();

    return NextResponse.json({ shotList });

  } catch (error) {
    console.error('Shot generation error:', error);
    return NextResponse.json(
      {
        error: error.message,
      },
      { status: 500 }
    );
  }
}