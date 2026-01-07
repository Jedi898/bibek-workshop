import { streamText } from 'ai'
import { google } from '@ai-sdk/google'

// Configure Vercel Serverless Function settings
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { 
      scriptContent, 
      userMood, 
      userCharacters, 
      technicalConstraints, 
      nepaliGrammarAnalysis, 
      grammarKnowledgeBase, 
      isRegeneration 
    } = await req.json()

    if (!scriptContent) {
      return new Response('Script content is required', { status: 400 })
    }

    // Build the prompt for AI generation
    let prompt = `You are an expert cinematographer and script analyst specializing in visual storytelling. Generate professional shot ideas for this screenplay scene.

SCENE CONTENT:
${scriptContent}

`

    if (userMood) {
      prompt += `MOOD/TONE: ${userMood}\n\n`
    }

    if (userCharacters) {
      prompt += `KEY CHARACTERS: ${userCharacters}\n\n`
    }

    if (technicalConstraints) {
      prompt += `TECHNICAL CONSTRAINTS: ${JSON.stringify(technicalConstraints)}\n\n`
    }

    if (nepaliGrammarAnalysis) {
      prompt += `SCRIPT ANALYSIS: ${JSON.stringify(nepaliGrammarAnalysis)}\n\n`
    }

    if (grammarKnowledgeBase) {
      prompt += `CULTURAL CONTEXT: ${JSON.stringify(grammarKnowledgeBase)}\n\n`
    }

    prompt += `CINEMATOGRAPHY PRINCIPLES:
- Master Shot: Establish the scene and character relationships
- Coverage: Provide options for editing (wide, medium, close-up)
- Visual Continuity: Ensure shots can cut together smoothly
- Emotional Impact: Use camera techniques to enhance mood and tension
- Practical Production: Consider lighting, locations, and crew limitations

SHOT GENERATION RULES:
- Generate 5-8 shot ideas that form a complete visual sequence
- Each shot MUST include: SIZE | ANGLE | MOVEMENT (use these exact terms)
- SIZE options: EXTREME WIDE, WIDE, MEDIUM WIDE, MEDIUM, MEDIUM CLOSE-UP, CLOSE-UP, EXTREME CLOSE-UP
- ANGLE options: EYE LEVEL, LOW ANGLE, HIGH ANGLE, DUTCH, OVERHEAD, GROUND LEVEL, AERIAL
- MOVEMENT options: STATIC, PAN, TILT, TRACKING, DOLLY, CRANE, HANDHELD, ZOOM
- Focus on visual storytelling, emotional beats, and narrative progression
- Consider Nepali cultural elements, traditional settings, and local aesthetics
- Make shots technically feasible for independent film production
- Ensure variety in shot sizes and angles for dynamic editing

OUTPUT FORMAT:
- Output ONLY raw HTML. Use <ul> for the list and <li> for items.
- Format each item exactly like this: <li><strong>SIZE | ANGLE | MOVEMENT</strong>: Detailed description of the shot, what it shows, and why it works...</li>
- CRITICAL: Do NOT use markdown code blocks (\`\`\`html). Just return the raw HTML tags.
- If you have additional notes about the sequence, wrap them in <p> tags at the end.

Generate the shot sequence:`

    const result = await streamText({
      model: google('gemini-1.5-flash'),
      prompt: prompt,
      temperature: 0.7,
    })

    // Return the generated text as streaming response
    return result.toTextStreamResponse()
  } catch (error) {
    console.error('Error generating shots:', error)
    return new Response(JSON.stringify({ error: 'Failed to generate shots' }), { 
      status: 500, 
      headers: { 'Content-Type': 'application/json' } 
    })
  }
}
