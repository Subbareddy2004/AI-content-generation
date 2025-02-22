import { NextResponse } from 'next/server';
import { handleLinkedInCallback } from '@/lib/auth';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const code = url.searchParams.get('code');
    const state = url.searchParams.get('state');

    if (!code || !state) {
      return NextResponse.json(
        { error: 'Missing OAuth parameters' },
        { status: 400 }
      );
    }

    const session = await handleLinkedInCallback(code, state);

    // Store the session in your preferred way (cookies, database, etc.)
    // For now, we'll use cookies
    const response = NextResponse.redirect(new URL('/', request.url));
    response.cookies.set('auth_session', JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
    });

    return response;
  } catch (error) {
    console.error('LinkedIn callback error:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}