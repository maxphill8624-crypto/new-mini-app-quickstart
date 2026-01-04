import { NextResponse } from 'next/server';

export async function GET() {
  // In production, this would fetch from the bot instance
  const positions: any[] = [];

  return NextResponse.json(positions);
}
