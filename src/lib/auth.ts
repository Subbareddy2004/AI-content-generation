const TWITTER_CALLBACK_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/twitter/callback';
const LINKEDIN_CALLBACK_URL = process.env.NEXT_PUBLIC_BASE_URL + '/api/auth/linkedin/callback';

export interface AuthSession {
  accessToken: string;
  refreshToken?: string;
  platform: 'twitter' | 'linkedin';
  userId?: string;
  expiresAt?: number;
}

export async function initiateTwitterAuth(): Promise<string> {
  try {
    const response = await fetch('/api/auth/twitter', {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
        'X-API-Version': '2.0'
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to initialize X (Twitter) authentication');
    }

    const data = await response.json();
    return data.url;
  } catch (error) {
    console.error('X (Twitter) auth error:', error);
    throw new Error(`Failed to initialize X (Twitter) authentication: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function initiateLinkedInAuth(): Promise<string> {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
    redirect_uri: LINKEDIN_CALLBACK_URL,
    state: generateRandomState(),
    scope: 'r_liteprofile w_member_social',
  });

  // Store state in session for verification during callback
  sessionStorage.setItem('linkedin_state', params.get('state')!);

  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

function generateRandomState(): string {
  return Math.random().toString(36).substring(7);
}

export async function handleTwitterCallback(oauth_token: string, oauth_verifier: string): Promise<AuthSession> {
  const oauth_token_secret = document.cookie
    .split('; ')
    .find(row => row.startsWith('twitter_oauth_token_secret='))
    ?.split('=')[1];

  if (!oauth_token_secret) {
    throw new Error('Invalid OAuth session');
  }

  try {
    const response = await fetch('/api/auth/twitter/callback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Version': '2.0'
      },
      body: JSON.stringify({
        oauth_token,
        oauth_token_secret,
        oauth_verifier,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to complete X (Twitter) authentication');
    }

    const { accessToken, userId } = await response.json();

    return {
      accessToken,
      platform: 'twitter',
      userId,
    };
  } catch (error) {
    console.error('X (Twitter) callback error:', error);
    throw new Error(`Failed to complete X (Twitter) authentication: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function handleLinkedInCallback(code: string, state: string): Promise<AuthSession> {
  const storedState = sessionStorage.getItem('linkedin_state');
  if (state !== storedState) {
    throw new Error('Invalid state parameter');
  }

  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: LINKEDIN_CALLBACK_URL,
    client_id: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_ID!,
    client_secret: process.env.NEXT_PUBLIC_LINKEDIN_CLIENT_SECRET!,
  });

  const response = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error('Failed to get LinkedIn access token');
  }

  const { access_token, expires_in } = await response.json();

  return {
    accessToken: access_token,
    platform: 'linkedin',
    expiresAt: Date.now() + expires_in * 1000,
  };
}