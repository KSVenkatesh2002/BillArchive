import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const sources = await dbService.getSources();
    return NextResponse.json({ success: true, sources });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
