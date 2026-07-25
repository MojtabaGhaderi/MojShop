import { NextResponse } from 'next/server';
import { DEFAULT_METAL_RATES } from '@/lib/constants';

export async function GET() {
  // In production, this would proxy to the backend's live rate endpoint
  return NextResponse.json({
    rates: DEFAULT_METAL_RATES,
    updated_at: new Date().toISOString(),
  });
}
