'use client';

import { useState } from 'react';

interface SocialShareProps {
  content: string;
}

export function SocialShare({ content }: SocialShareProps) {
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
          className="flex-1 py-2 px-4 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
        >
          Share on Twitter
        </button>
        <button
          onClick={() => handleShare('linkedin')}
          className="flex-1 py-2 px-4 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
        >
          Share on LinkedIn
        </button>
      </div>
    </div>
  );
}