import { NextResponse } from 'next/server';
import { TwitterApi } from 'twitter-api-v2';

export async function POST(request: Request) {
  try {
    const { oauth_token, oauth_token_secret, oauth_verifier } = await request.json();

    if (!oauth_token || !oauth_token_secret || !oauth_verifier) {
      return NextResponse.json(
        { error: 'Missing OAuth parameters' },
        { status: 400 }
      );
    }

    const client = new TwitterApi({
      appKey: process.env.NEXT_PUBLIC_TWITTER_API_KEY!,
      appSecret: process.env.NEXT_PUBLIC_TWITTER_API_SECRET!,
      accessToken: oauth_token,
      accessSecret: oauth_token_secret,
    });

    const {
      client: loggedClient,
      accessToken,
      accessSecret,
      userId
    } = await client.login(oauth_verifier);

    // Set the auth session cookie
    const session = {
      accessToken,
      platform: 'twitter',
      userId
    };

    const cookieOptions = 'Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=86400';
    const response = NextResponse.json({ accessToken, userId });
    response.headers.set(
      'Set-Cookie',
      `auth_session=${encodeURIComponent(JSON.stringify(session))}; ${cookieOptions}`
    );

    return response;
  } catch (error) {
    console.error('X (Twitter) callback error:', error);
    return NextResponse.json(
      { error: 'Failed to complete X (Twitter) authentication' },
      { status: 500 }
    );
  }
}