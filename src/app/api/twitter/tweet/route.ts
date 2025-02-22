import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const accessToken = authHeader.split(' ')[1];
    const { text, media_ids } = await request.json();

    const client = new TwitterApi({
      appKey: process.env.NEXT_PUBLIC_TWITTER_API_KEY!,
      appSecret: process.env.NEXT_PUBLIC_TWITTER_API_SECRET!,
      accessToken: accessToken
    });

    const tweet = await client.v2.tweet({
      text,
      media: media_ids?.length > 0 ? { media_ids } : undefined
    });

    return NextResponse.json(tweet);
  } catch (error) {
    console.error('Twitter API error:', error);
    return NextResponse.json(
      { error: 'Failed to post tweet' },
      { status: 500 }
    );
  }
}