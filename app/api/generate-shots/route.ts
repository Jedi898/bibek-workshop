import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { sceneText, directorNotes, model } = await req.json();

    if (!process.env.HUGGINGFACE_API_KEY) {
      return NextResponse.json(
        { error: 'Hugging Face API key is not configured.' },
        { status: 500 }
      );
    }

    const prompt = `Act as a professional cinematographer and director.
Analyze the following scene script and create a detailed shot list.

Scene Script:
"${sceneText}"

Director's Notes:
"${directorNotes || 'None'}"

Output the shot list in Nepali language (Devanagari script) mixed with English technical terms where appropriate.
Format as a numbered list. For each shot include:
- Shot Size (Wide, Medium, Close-up, etc.)
- Camera Angle (Low, High, Eye-level, etc.)
- Movement (Static, Pan, Tilt, Dolly, etc.)
- Description of action and focus.`;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${model}`,
      {
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        method: 'POST',
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 1500,
            temperature: 0.7,
            return_full_text: false,
            do_sample: true,
          },
        }),
      }
    );

    if (!response.ok) {
      const error = await response.json();
      return NextResponse.json(
        { error: error.error || 'Failed to generate shots' },
        { status: response.status }
      );
    }

    const result = await response.json();
    const generatedText = Array.isArray(result) ? result[0]?.generated_text : result?.generated_text;

    return NextResponse.json({ shotList: generatedText });
  } catch (error: any) {
    console.error('Shot generation error:', error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}