import { NextResponse } from 'next/server';
import HuggingFaceClient from '../../../lib/hf-client.js';

export async function POST(request) {
  try {
    const { characterName, characterRole, existingDescription, model } = await request.json();

    if (!characterName || !characterRole) {
      return NextResponse.json(
        { error: 'Character name and role are required' },
        { status: 400 }
      );
    }

    // Create a detailed prompt for character breakdown
    const prompt = `Create a detailed character breakdown for a screenplay character:

Character Name: ${characterName}
Role: ${characterRole}
${existingDescription ? `Existing Description: ${existingDescription}` : ''}

Please provide a comprehensive character breakdown including:
1. Physical appearance and traits
2. Personality and temperament
3. Background and history
4. Motivations and goals
5. Relationships with other characters
6. Key character arc or development
7. Unique mannerisms or habits
8. Dialogue style and speech patterns

Make this suitable for a Nepali screenplay context. Write in Nepali language.`;

    // Initialize Hugging Face client
    const client = new HuggingFaceClient(
      process.env.HUGGINGFACE_API_KEY,
      model || "sadhaklar/gpt2-nepali"
    );

    // Generate character breakdown
    const startTime = Date.now();
    const result = await client.generate(prompt, {
      maxLength: 500,
      temperature: 0.8,
      topP: 0.9,
      repetitionPenalty: 1.2,
    });
    const generationTime = Date.now() - startTime;

    console.log(`Character breakdown generated in ${generationTime}ms`);

    const response = {
      breakdown: Array.isArray(result) ? result[0]?.generated_text || '' : result.generated_text || '',
      model,
      time: generationTime,
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json(response);

  } catch (error) {
    console.error('Character breakdown error:', error);

    // Fallback response
    const fallbackResponse = {
      breakdown: `क्षमा गर्नुहोस्, ${characterName} को लागि विस्तृत चरित्र विश्लेषण सिर्जना गर्न सकिएन। कृपया पछि फेरि प्रयास गर्नुहोस्।`,
      error: error.message,
      isFallback: true
    };

    return NextResponse.json(fallbackResponse, { status: 500 });
  }
}
