import Image from "next/image";

'use client';

import { useState } from 'react';
import { ContentGenerationForm } from '@/components/ContentGenerationForm';
import { generateContent, optimizeContent, analyzeSentiment, ContentGenerationParams } from '@/lib/gemini';
import { SocialShare } from '@/components/SocialShare';

export default function Home() {
  const [generatedContent, setGeneratedContent] = useState<string>('');
  const [sentiment, setSentiment] = useState<{ sentiment: string; score: number } | null>(null);
  const [isOptimizing, setIsOptimizing] = useState(false);

  const handleGenerateContent = async (params: ContentGenerationParams) => {
    try {
      const content = await generateContent(params);
      setGeneratedContent(content);

      const sentimentAnalysis = await analyzeSentiment(content);
      setSentiment(sentimentAnalysis);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleOptimizeContent = async () => {
    if (!generatedContent) return;
    setIsOptimizing(true);
    try {
      const optimizedContent = await optimizeContent(generatedContent, 'general');
      setGeneratedContent(optimizedContent);
    } catch (error) {
      console.error('Error optimizing content:', error);
    } finally {
      setIsOptimizing(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-sm">
          AI Content Generator
        </h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-blue-100/50 hover:shadow-blue-100/30 transition-all duration-500">
              <div className="p-8">
                <ContentGenerationForm onSubmit={handleGenerateContent} />
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-blue-100/50 hover:shadow-blue-100/30 transition-all duration-500">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Generated Content</h2>
                {generatedContent ? (
                  <div className="space-y-6">
                    <div className="prose prose-blue max-w-none whitespace-pre-wrap text-gray-800 text-lg">
                      {generatedContent}
                    </div>
                    <div className="flex justify-between items-center">
                      <button
                        onClick={handleOptimizeContent}
                        disabled={isOptimizing}
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
                      >
                        {isOptimizing ? 'Optimizing...' : 'Optimize Content'}
                      </button>
                      {sentiment && (
                        <div className="text-sm text-gray-600">
                          Sentiment: {sentiment.sentiment} ({sentiment.score})
                        </div>
                      )}
                    </div>
                    <SocialShare content={generatedContent} />
                  </div>
                ) : (
                  <div className="text-gray-500 text-center py-12">
                    Generated content will appear here
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
