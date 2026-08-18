/**
 * Single Source of Truth (SSOT) Configuration
 * All global site configuration and constants live here.
 */

export const CONFIG = {
  USE_NEW_UI: true, // Fallback flag to switch between old and new UI layouts
  SITE_NAME: 'Bill Archive',
  SITE_INITIAL: 'B',
  SUBTITLE: 'Pro Desktop Edition',
  DESCRIPTION: 'Multi-User Task Management • Status Change Audit Logging • Timeframe & Project Text Exports',

  // Status Colors (Single Source of Truth)
  DEFAULT_STATUS_COLORS: {
    'inprocess': 'bg-amber-500',
    'ready for qa': 'bg-blue-500',
    'ready for code review': 'bg-purple-500',
    'completed': 'bg-emerald-500'
  },
  COLOR_OPTIONS: [
    { label: 'Gray', value: 'bg-zinc-500' },
    { label: 'Blue', value: 'bg-blue-500' },
    { label: 'Emerald', value: 'bg-emerald-500' },
    { label: 'Rose', value: 'bg-rose-500' },
    { label: 'Orange', value: 'bg-orange-500' },
    { label: 'Purple', value: 'bg-purple-500' },
    { label: 'Amber', value: 'bg-amber-500' },
    { label: 'Cyan', value: 'bg-cyan-500' },
  ],


  DEFAULT_DB_NAME: 'bill',
  JWT_COOKIE_NAME: 'auth_token',
  JWT_EXPIRY_DAYS: 7,

  // Fallback DB settings
  MOCK_USER: {
    username: 'admin',
    password: 'adminpassword', // Will be hashed or matched in memory
    name: 'Admin User',
    userId: 'mock-admin-id'
  }
};
