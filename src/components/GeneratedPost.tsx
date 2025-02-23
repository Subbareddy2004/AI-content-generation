import { useState } from 'react';
import { postToTwitter, postToLinkedIn, SocialPost } from '@/lib/social-auth';
import { initiateTwitterAuth, initiateLinkedInAuth } from '@/lib/auth';

interface GeneratedPostProps {
  content: string;
  onClose: () => void;
}

export default function GeneratedPost({ content, onClose }: GeneratedPostProps) {
  const [isPosting, setIsPosting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleShare = async (platform: 'twitter' | 'linkedin') => {
    setIsPosting(true);
    setError(null);

    try {
      const post: SocialPost = {
        content,
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
          window.location.href = await initiateTwitterAuth();
        } else {
          window.location.href = await initiateLinkedInAuth();
        }
      } else {
        setError(err instanceof Error ? err.message : 'Failed to share content');
      }
    } finally {
      setIsPosting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Generated Post</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p className="whitespace-pre-wrap">{content}</p>
        </div>

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
          <div className="mt-4 text-red-500 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
}