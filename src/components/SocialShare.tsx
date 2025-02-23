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
    const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(content)}`;
    const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(content)}`;

    if (platform === 'twitter') {
      window.open(twitterShareUrl, '_blank');
    } else {
      window.open(linkedinShareUrl, '_blank');
    }
  };

  return (
    <div className="mt-6 space-y-4">
      <div className="flex gap-4">
        <button
          onClick={() => handleShare('twitter')}
          className="flex-1 bg-blue-400 text-white py-2 px-4 rounded hover:bg-blue-500 transition-colors"
          disabled={isPosting}
        >
          Share on Twitter
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          disabled={isPosting}
        >
          Share on LinkedIn
        </button>
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </div>
  );
}