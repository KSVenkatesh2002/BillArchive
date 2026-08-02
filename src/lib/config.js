/**
 * Single Source of Truth (SSOT) Configuration
 * All global site configuration and constants live here.
 */

export const CONFIG = {
  SITE_NAME: 'Bill Archive',
  SITE_INITIAL: 'B',
  SUBTITLE: 'Pro Desktop Edition',
  DESCRIPTION: 'Multi-User Task Management • Status Change Audit Logging • Timeframe & Project Text Exports',


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
