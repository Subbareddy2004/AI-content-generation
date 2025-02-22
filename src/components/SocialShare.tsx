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

  const handleShare = async (platform: 'twitter' | 'linkedin') => {
    setIsPosting(true);
    setError(null);

    try {
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
    } catch (err) {
      if (err instanceof Error && err.message === 'Not authenticated') {
        if (platform === 'twitter') {
          initiateTwitterAuth();
        } else {
          initiateLinkedInAuth();
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to share content');
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => handleShare('twitter')}
          disabled={isPosting}
          className="flex-1 px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 disabled:opacity-50 transition-colors"
        >
          {isPosting ? 'Sharing...' : 'Share on Twitter'}
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          disabled={isPosting}
          className="flex-1 px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 disabled:opacity-50 transition-colors"
        >
          {isPosting ? 'Sharing...' : 'Share on LinkedIn'}
        </button>
      </div>
      {error && (
        <div className="text-red-500 text-sm">
          {error}
        </div>
      )}
    </div>
  );
}