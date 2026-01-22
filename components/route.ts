import { supabase } from '@/lib/supabase';
import { NextResponse } from 'next/server';

// This function can be visited at /api/cron/keep-alive
// Or configured as a cron job in vercel.json
export async function GET() {
  try {
    // Perform a simple, lightweight query to the database to prevent it from sleeping.
    // Fetching the count of projects is a good, low-cost operation.
    const { error } = await supabase
      .from('projects')
      .select('id', { count: 'exact', head: true });

    if (error) {
      throw error;
    }

    return NextResponse.json({ message: `Successfully pinged Supabase at ${new Date().toISOString()}.` });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to ping Supabase.', details: error.message }, { status: 500 });
  }
}