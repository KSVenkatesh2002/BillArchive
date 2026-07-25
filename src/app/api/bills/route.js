import { NextResponse } from 'next/server';
import { billService } from '@/lib/services/billService';

export async function GET() {
  try {
    const result = await billService.getBills();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const body = await request.json();
    const result = await billService.createBill(body);
    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    const isValidationError = error.message.includes('Missing required');
    return NextResponse.json(
      { success: false, error: error.message },
      { status: isValidationError ? 400 : 500 }
    );
  }
}
