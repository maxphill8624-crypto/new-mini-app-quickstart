import { NextResponse } from 'next/server';

export async function POST() {
  // In production, this would start the bot
  return NextResponse.json({ success: true, message: 'Bot started' });
}
