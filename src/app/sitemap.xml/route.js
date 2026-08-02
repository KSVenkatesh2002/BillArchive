import { NextResponse } from 'next/server';

export async function GET() {
  if (!process.env.NEXT_PUBLIC_SITE_URL) {
    console.warn('WARNING: NEXT_PUBLIC_SITE_URL is not set for sitemap generation.');
  }
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL;

  // Static Public Routes
  const staticRoutes = [
    '',
    '/login',
    '/register',
    '/sitemap',
    '/superadmin',
  ].map((route) => ({
    loc: `${baseUrl}${route}`,
    lastmod: new Date().toISOString(),
    changefreq: 'daily',
    priority: route === '' ? '1.0' : '0.8',
  }));

  const urlNodes = staticRoutes
    .map(
      (route) => `  <url>
    <loc>${route.loc}</loc>
    <lastmod>${route.lastmod}</lastmod>
    <changefreq>${route.changefreq}</changefreq>
    <priority>${route.priority}</priority>
  </url>`
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<?xml-stylesheet type="text/xsl" href="/sitemap.xsl"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlNodes}
</urlset>`;

  return new NextResponse(xml, {
    headers: {
      'Content-Type': 'text/xml',
      'Cache-Control': 'public, s-maxage=86400, stale-while-revalidate',
    },
  });
}
