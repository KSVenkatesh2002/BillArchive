import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const url = searchParams.get('url');

    if (!url || (!url.startsWith('http://') && !url.startsWith('https://'))) {
      return NextResponse.json({ success: false, error: 'Valid URL is required' }, { status: 400 });
    }

    // Fetch the page with a 3-second timeout
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 3000);

    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    clearTimeout(timeoutId);

    if (!response.ok) {
      return NextResponse.json({ success: false, error: 'Failed to fetch the target page' });
    }

    const html = await response.text();
    const match = html.match(/<title>([^<]*)<\/title>/i);
    const title = match ? match[1].trim() : '';

    return NextResponse.json({
      success: true,
      title: title.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
    });
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message });
  }
}
