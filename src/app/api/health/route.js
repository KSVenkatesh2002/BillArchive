import { NextResponse } from 'next/server';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const isDemo = await dbService.isDemo();
    if (isDemo) {
      return NextResponse.json({
        status: 'success',
        connected: true,
        database: 'in-memory-fallback',
        message: 'Running in In-Memory Demo Fallback mode. Live database could not be reached.',
      });
    }

    // Perform a lightweight query to test active Mongo connection
    await dbService.findTasks({}, { limit: 1 });

    return NextResponse.json({
      status: 'success',
      connected: true,
      database: process.env.MONGODB_DB || 'bill',
      message: 'Successfully connected to MongoDB live instance!',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        message: error.message || 'Failed to connect to database',
      },
      { status: 500 }
    );
  }
}
