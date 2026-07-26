import { dbService } from '@/lib/db/dbService';

export default async function sitemap() {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';

  // Static Public Routes
  const staticRoutes = [
    '',
    '/login',
    '/register',
    '/sitemap',
    '/superadmin',
  ].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: 'daily',
    priority: route === '' ? 1.0 : 0.8,
  }));

  return [...staticRoutes];
}
