import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

const TWITTER_CALLBACK_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/twitter/callback';

export async function GET() {
  try {
    const client = new TwitterApi({
      appKey: process.env.TWITTER_API_KEY!,
      appSecret: process.env.TWITTER_API_SECRET!,
    });

    const { url, oauth_token, oauth_token_secret } = await client.generateAuthLink(TWITTER_CALLBACK_URL);
    
    const response = NextResponse.json({ url });
    
    // Store oauth_token_secret in a secure HTTP-only cookie
    response.cookies.set('twitter_oauth_token_secret', oauth_token_secret, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 5, // 5 minutes
    });

    return response;
  } catch (error) {
    console.error('Twitter auth error:', error);
    return NextResponse.json(
      { error: 'Failed to initialize Twitter authentication' },
      { status: 500 }
    );
  }
}