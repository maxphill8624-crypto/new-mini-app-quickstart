import { NextResponse } from 'next/server';

export async function POST() {
  // In production, this would stop the bot
  return NextResponse.json({ success: true, message: 'Bot stopped' });
}
