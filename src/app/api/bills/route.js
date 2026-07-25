import { NextResponse } from 'next/server';
import { getDatabase } from '@/lib/mongodb';

export async function GET() {
  try {
    if (!process.env.MONGODB_URI) {
      return NextResponse.json({
        success: true,
        data: [
          { _id: 'demo-1', title: 'Hosting Subscription - Vercel', clientName: 'Acme Corp', amount: 49.00, status: 'Paid', date: '2026-07-20' },
          { _id: 'demo-2', title: 'UI/UX Design Retainer', clientName: 'Starlight Inc', amount: 1200.00, status: 'Pending', date: '2026-07-24' },
          { _id: 'demo-3', title: 'Database Optimization', clientName: 'Global Cloud', amount: 450.00, status: 'Overdue', date: '2026-07-15' },
        ],
        isDemo: true,
        message: 'Using demo data. Configure MONGODB_URI in .env.local to use live MongoDB.'
      });
    }

    const db = await getDatabase();
    const bills = await db.collection('bills').find({}).sort({ createdAt: -1 }).toArray();

    return NextResponse.json({
      success: true,
      data: bills,
      isDemo: false
    });
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
    const { title, clientName, amount, status, date } = body;

    if (!title || !clientName || !amount) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: title, clientName, amount' },
        { status: 400 }
      );
    }

    if (!process.env.MONGODB_URI) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'MONGODB_URI is not configured in .env.local. Cannot save to live database.' 
        },
        { status: 400 }
      );
    }

    const db = await getDatabase();
    const newBill = {
      title,
      clientName,
      amount: parseFloat(amount),
      status: status || 'Pending',
      date: date || new Date().toISOString().split('T')[0],
      createdAt: new Date()
    };

    const result = await db.collection('bills').insertOne(newBill);

    return NextResponse.json({
      success: true,
      data: { _id: result.insertedId, ...newBill }
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
