import { NextResponse } from 'next/server';
import HuggingFaceClient from '../../../lib/hf-client.js';
// import { Redis } from '@upstash/redis';

// Initialize Redis for caching (optional)
const redis = null;
// const redis = process.env.UPSTASH_REDIS_REST_URL
//   ? new Redis({
//       url: process.env.UPSTASH_REDIS_REST_URL,
//       token: process.env.UPSTASH_REDIS_REST_TOKEN,
//     })
//   : null;

// Rate limiting in-memory store (simple version)
const requestCounts = new Map();

function checkRateLimit(ip) {
  if (process.env.NODE_ENV === 'development') return true;

  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = parseInt(process.env.API_RATE_LIMIT) || 10;

  if (!requestCounts.has(ip)) {
    requestCounts.set(ip, []);
  }

  const requests = requestCounts.get(ip);
  const windowStart = now - windowMs;

  // Remove old requests
  while (requests.length && requests[0] < windowStart) {
    requests.shift();
  }

  if (requests.length >= maxRequests) {
    return false;
  }

  requests.push(now);
  return true;
}

export async function POST(request) {
  try {
    // Get client IP for rate limiting
    const ip = request.headers.get('x-forwarded-for') || 'unknown';

    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      );
    }

    const { prompt, model, options } = await request.json();

    if (!prompt || prompt.trim().length === 0) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    // Check cache first (optional)
    const cacheKey = `gen:${model}:${prompt}`;
    if (redis) {
      const cached = await redis.get(cacheKey);
      if (cached) {
        console.log('Cache hit for:', cacheKey);
        return NextResponse.json(cached);
      }
    }

    // Initialize Hugging Face client
    const client = new HuggingFaceClient(
      process.env.HUGGINGFACE_API_KEY,
      model || "sadhaklar/gpt2-nepali"
    );

    // Generate response
    const startTime = Date.now();
    const result = await client.generate(prompt, options || {});
    const generationTime = Date.now() - startTime;

    console.log(`Generated in ${generationTime}ms`);

    const response = {
      text: Array.isArray(result) ? result[0]?.generated_text || '' : result.generated_text || '',
      model,
      time: generationTime,
      timestamp: new Date().toISOString(),
    };

    // Cache the result for 1 hour (optional)
    if (redis && response.text) {
      await redis.setex(cacheKey, 3600, response);
    }

    return NextResponse.json(response);

  } catch (error) {
    console.error('Generation error:', error);

    // Fallback response if API fails
    const fallbackResponses = {
      en: "I'm having trouble connecting to the AI service. Please try again in a moment.",
      ne: "म कृत्रिम बुद्धिमत्ता सेवासँग जडान गर्न समस्या भइरहेको छु। कृपया केही क्षण पछि पुनः प्रयास गर्नुहोस्।",
    };

    return NextResponse.json(
      {
        text: fallbackResponses.ne,
        error: error.message,
        isFallback: true
      },
      { status: 500 }
    );
  }
}

// GET method to check available models
export async function GET() {
  const models = HuggingFaceClient.getNepaliModels();
  return NextResponse.json({ models });
}
