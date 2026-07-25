import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        {
          status: 'error',
          connected: false,
          message: 'MONGODB_URI environment variable is missing. Please set it in .env.local',
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    // Ping the database to verify live connection
    await db.command({ ping: 1 });

    return NextResponse.json({
      status: 'success',
      connected: true,
      database: process.env.MONGODB_DB || 'bill_db',
      message: 'Successfully connected to MongoDB live instance!',
    });
  } catch (error) {
    return NextResponse.json(
      {
        status: 'error',
        connected: false,
        message: error.message || 'Failed to connect to MongoDB',
      },
      { status: 500 }
    );
  }
}
