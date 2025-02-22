export interface SocialPost {
  content: string;
  images?: string[];
  platform: 'twitter' | 'linkedin';
}

interface TwitterMediaUploadResponse {
  media_id_string: string;
}

function getAuthSession() {
  const sessionStr = document.cookie
    .split('; ')
    .find(row => row.startsWith('auth_session='));

  if (!sessionStr) {
    throw new Error('Not authenticated');
  }

  return JSON.parse(decodeURIComponent(sessionStr.split('=')[1]));
}

export async function postToTwitter(post: SocialPost): Promise<void> {
  if (!post.content) throw new Error('Content is required for Twitter post');
  
  const session = getAuthSession();
  if (session.platform !== 'twitter') {
    throw new Error('Not authenticated with Twitter');
  }

  let mediaIds: string[] = [];
  if (post.images && post.images.length > 0) {
    mediaIds = await Promise.all(post.images.map(async (imageBase64) => {
      const formData = new FormData();
      const blob = await fetch(imageBase64).then(r => r.blob());
      formData.append('media', blob);

      const response = await fetch('/api/twitter/upload-media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${session.accessToken}`
        },
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload media to Twitter');
      }
      
      const data: TwitterMediaUploadResponse = await response.json();
      return data.media_id_string;
    }));
  }

  const response = await fetch('/api/twitter/tweet', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.accessToken}`
    },
    body: JSON.stringify({
      text: post.content,
      media_ids: mediaIds
    })
  });

  if (!response.ok) {
    throw new Error('Failed to post tweet');
  }
}

export async function postToLinkedIn(post: SocialPost): Promise<void> {
  if (!post.content) throw new Error('Content is required for LinkedIn post');

  const session = getAuthSession();
  if (session.platform !== 'linkedin') {
    throw new Error('Not authenticated with LinkedIn');
  }

  const response = await fetch('https://api.linkedin.com/v2/ugcPosts', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${session.accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      author: `urn:li:person:${session.userId}`,
      lifecycleState: 'PUBLISHED',
      specificContent: {
        'com.linkedin.ugc.ShareContent': {
          shareCommentary: {
            text: post.content
          },
          shareMediaCategory: post.images ? 'IMAGE' : 'NONE',
          media: post.images ? [{
            status: 'READY',
            description: {
              text: 'Image from AI Content Generator'
            },
            media: post.images[0]
          }] : undefined
        }
      },
      visibility: {
        'com.linkedin.ugc.MemberNetworkVisibility': 'PUBLIC'
      }
    })
  });

  if (!response.ok) {
    throw new Error(`LinkedIn API error: ${response.statusText}`);
  }
}