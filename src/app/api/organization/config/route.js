import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

const DEFAULT_ENABLED_FIELDS = {
  allocatedHours: true,
  billedHours: true,
  actualHours: true,
  source: true,
  typeOfWork: true,
  project: true,
  clickupId: true
};

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await dbService.findUserByUsername(authUser.username);
    if (!user || !user.organization) {
      return NextResponse.json({ success: false, error: 'User organization not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      organization: {
        id: user.organization._id || user.organization.id,
        name: user.organization.name,
        slug: user.organization.slug,
        dynamicFields: user.organization.dynamicFields || [],
        enabledFields: user.organization.enabledFields || DEFAULT_ENABLED_FIELDS
      }
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    // Role check: Only admin or superAdmin can update organization config
    if (authUser.role !== 'admin' && authUser.role !== 'superAdmin') {
      return NextResponse.json({ success: false, error: 'Forbidden' }, { status: 403 });
    }

    const { dynamicFields, enabledFields } = await request.json();
    if (!Array.isArray(dynamicFields)) {
      return NextResponse.json({ success: false, error: 'Invalid dynamic fields structure' }, { status: 400 });
    }

    // Validate fields format
    for (const field of dynamicFields) {
      if (!field.name || !field.label || !field.type) {
        return NextResponse.json({ success: false, error: 'Fields must contain name, label and type' }, { status: 400 });
      }
      if (!['dropdown', 'selector', 'text', 'toggle'].includes(field.type)) {
        return NextResponse.json({ success: false, error: `Unsupported field type: ${field.type}` }, { status: 400 });
      }
    }

    const user = await dbService.findUserByUsername(authUser.username);
    if (!user || !user.organization) {
      return NextResponse.json({ success: false, error: 'User organization not found' }, { status: 404 });
    }

    const orgId = user.organization._id || user.organization.id;
    const updatedOrg = await dbService.updateOrganizationConfig(orgId, dynamicFields, enabledFields);

    return NextResponse.json({
      success: true,
      dynamicFields: updatedOrg.dynamicFields,
      enabledFields: updatedOrg.enabledFields || DEFAULT_ENABLED_FIELDS
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
