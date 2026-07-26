import { NextResponse } from 'next/server';
import { getAuthUser } from '@/lib/auth';
import { dbService } from '@/lib/db/dbService';

export async function GET() {
  try {
    const authUser = await getAuthUser();
    if (!authUser) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const user = await dbService.findUserByUsername(authUser.username);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Convert map to plain object if Mongoose Map
    const fieldDefaults = user.preferences?.fieldDefaults && typeof user.preferences.fieldDefaults.toJSON === 'function'
      ? user.preferences.fieldDefaults.toJSON()
      : (user.preferences?.fieldDefaults || {});

    return NextResponse.json({
      success: true,
      preferences: {
        fieldDefaults
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

    const { fieldDefaults } = await request.json();
    if (!fieldDefaults || typeof fieldDefaults !== 'object') {
      return NextResponse.json({ success: false, error: 'Invalid field defaults' }, { status: 400 });
    }

    const user = await dbService.findUserByUsername(authUser.username);
    if (!user) {
      return NextResponse.json({ success: false, error: 'User not found' }, { status: 404 });
    }

    // Merge or set preferences
    const currentPrefs = user.preferences || {};
    const updatedPrefs = {
      ...currentPrefs,
      fieldDefaults: {
        ...(currentPrefs.fieldDefaults || {}),
        ...fieldDefaults
      }
    };

    await dbService.updateUser(user._id || user.id, {
      $set: { preferences: updatedPrefs }
    });

    return NextResponse.json({
      success: true,
      preferences: updatedPrefs
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
