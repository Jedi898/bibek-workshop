import { NextResponse } from 'next/server';
import HuggingFaceClient from '../../../lib/hf-client.js';

export async function GET() {
  const status = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    models: HuggingFaceClient.getNepaliModels(),
    limits: {
      rateLimit: parseInt(process.env.API_RATE_LIMIT) || 10,
      timeout: 30, // seconds
    },
  };

  // Test API connection
  try {
    const client = new HuggingFaceClient(process.env.HUGGINGFACE_API_KEY);
    await client.generate('test', { maxLength: 5 });
    status.api = 'connected';
  } catch (error) {
    status.api = 'disconnected';
    status.apiError = error.message;
  }

  return NextResponse.json(status);
}
