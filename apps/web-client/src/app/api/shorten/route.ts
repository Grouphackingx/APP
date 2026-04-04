import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();
    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    const res = await fetch(`https://tinyurl.com/api-create.php?url=${encodeURIComponent(url)}`);
    const shortUrl = await res.text();

    return NextResponse.json({ shortUrl });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to shorten URL' }, { status: 500 });
  }
}
