import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'superAdmin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const organizations = await dbService.getOrganizations();
    return NextResponse.json({ success: true, organizations });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser || authUser.role !== 'superAdmin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { name, slug, dynamicFields } = await request.json();
    if (!name || !slug) {
      return NextResponse.json({ success: false, error: 'Organization name and slug are required' }, { status: 400 });
    }

    // Check if slug is taken
    const existing = await dbService.findOrganizationBySlug(slug);
    if (existing) {
      return NextResponse.json({ success: false, error: 'Organization slug already exists' }, { status: 400 });
    }

    const created = await dbService.createOrganization({
      name,
      slug: slug.toLowerCase(),
      dynamicFields: dynamicFields || [
        { name: 'source', label: 'Source', type: 'dropdown', options: ['dialedin', 'fluent'], defaultValue: 'dialedin' },
        { name: 'typeOfWork', label: 'Type Of Work', type: 'dropdown', options: ['dev', 'qa'], defaultValue: 'dev' }
      ]
    });

    return NextResponse.json({ success: true, organization: created });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
