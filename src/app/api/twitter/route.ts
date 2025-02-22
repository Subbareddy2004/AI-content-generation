import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function GET() {
  try {
    const client = new TwitterApi({
      appKey: process.env.NEXT_PUBLIC_TWITTER_API_KEY!,
      appSecret: process.env.NEXT_PUBLIC_TWITTER_API_SECRET!,
    });

    const authLink = await client.generateAuthLink(
      process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/twitter/callback',
      { linkMode: 'authorize' }
    );

    // Store the oauth token secret in a cookie for the callback
    const cookieOptions = 'Path=/; HttpOnly; Secure; SameSite=Strict';
    const response = NextResponse.json({ url: authLink.url });
    response.headers.set(
      'Set-Cookie',
      `twitter_oauth_token_secret=${authLink.oauth_token_secret}; ${cookieOptions}`
    );

    return response;
  } catch (error) {
    console.error('X (Twitter) auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize X (Twitter) authentication' },
      { status: 500 }
    );
  }
}