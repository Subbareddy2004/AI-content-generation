'use client';

import { useState } from 'react';
import { SocialPost, postToTwitter, postToLinkedIn } from '@/lib/social-auth';
import { initiateTwitterAuth, initiateLinkedInAuth } from '@/lib/auth';

interface SocialShareProps {
  content: string;
  images?: string[];
}

export function SocialShare({ content, images }: SocialShareProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const handleLogin = async (platform: 'twitter' | 'linkedin') => {
    try {
      const authUrl = platform === 'twitter' 
        ? await initiateTwitterAuth()
        : await initiateLinkedInAuth();
      window.location.href = authUrl;
    } catch (err) {
      setError(`Failed to initiate ${platform} login: ${err.message}`);
    }
  };

  const handlePost = async (platform: 'twitter' | 'linkedin') => {
    setIsPosting(true);
    setError(null);
    setSuccess(null);

    try {
      // Check authentication first
      try {
        document.cookie.split('; ').find(row => row.startsWith('auth_session='));
      } catch (err) {
        // Not authenticated, redirect to login
        handleLogin(platform);
        return;
      }

      const post: SocialPost = {
        content,
        images,
        platform
      };

      if (platform === 'twitter') {
        await postToTwitter(post);
      } else {
        await postToLinkedIn(post);
      }

      setSuccess(`Successfully posted to ${platform}!`);
    } catch (err) {
      if (err.message.includes('Not authenticated')) {
        handleLogin(platform);
      } else {
        setError(`Failed to post to ${platform}: ${err.message}`);
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => handlePost('twitter')}
          disabled={isPosting}
          className="flex-1 px-4 py-2 bg-[#1DA1F2] text-white rounded-lg hover:bg-[#1a8cd8] disabled:opacity-50 transition-colors"
        >
          {isPosting ? 'Posting...' : 'Post to Twitter'}
        </button>
        <button
          onClick={() => handlePost('linkedin')}
          disabled={isPosting}
          className="flex-1 px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182] disabled:opacity-50 transition-colors"
        >
          {isPosting ? 'Posting...' : 'Post to LinkedIn'}
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-50 text-red-700 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="p-4 bg-green-50 text-green-700 rounded-lg">
          {success}
        </div>
      )}
    </div>
  );
}