'use client';

import { useState, useEffect } from 'react';
import { ContentGenerationParams } from '@/lib/gemini';

interface ContentPreferences extends Omit<ContentGenerationParams, 'topic'> {
  platform: 'blog' | 'twitter' | 'linkedin' | 'facebook';
  tone: 'professional' | 'casual' | 'friendly' | 'formal';
  length: 'short' | 'medium' | 'long';
  keywords?: string[];
  brandGuidelines?: string;
}

export default function About() {
  const [preferences, setPreferences] = useState<ContentPreferences>({
    platform: 'blog',
    tone: 'professional',
    length: 'medium',
    keywords: [] as string[],
    brandGuidelines: ''
  });

  useEffect(() => {
    const savedPreferences = localStorage.getItem('contentPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handlePreferenceChange = (key: keyof ContentPreferences, value: string) => {
    const updatedPreferences = { ...preferences };
    if (key === 'keywords') {
      updatedPreferences.keywords = value.split(',').map(k => k.trim()).filter(Boolean);
    } else if (key === 'brandGuidelines') {
      updatedPreferences.brandGuidelines = value;
    } else {
      // Type guard to ensure value matches expected types
      switch (key) {
        case 'platform':
          if (value === 'blog' || value === 'twitter' || value === 'linkedin' || value === 'facebook') {
            updatedPreferences.platform = value;
          }
          break;
        case 'tone':
          if (value === 'professional' || value === 'casual' || value === 'friendly' || value === 'formal') {
            updatedPreferences.tone = value;
          }
          break;
        case 'length':
          if (value === 'short' || value === 'medium' || value === 'long') {
            updatedPreferences.length = value;
          }
          break;
      }
    }
    setPreferences(updatedPreferences);
    localStorage.setItem('contentPreferences', JSON.stringify(updatedPreferences));
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-16 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-extrabold text-center mb-16 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600 drop-shadow-sm">
          About AI Content Generator
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-blue-100/50 hover:shadow-blue-100/30 transition-all duration-500">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">About Us</h2>
                <p className="text-gray-700 text-lg mb-6">
                  Welcome to AI Content Generator, your intelligent companion for creating engaging and optimized content across various platforms. Our AI-powered solution helps you generate high-quality content while maintaining your brand's voice and style.
                </p>
                <p className="text-gray-700 text-lg">
                  Leverage advanced AI technology to create content that resonates with your audience, analyze sentiment, and optimize for maximum engagement.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-8">
            <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl overflow-hidden border border-blue-100/50 hover:shadow-blue-100/30 transition-all duration-500">
              <div className="p-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Content Preferences</h2>
                <div className="space-y-6">
                  <div className="space-y-3">
                    <label htmlFor="platform" className="block text-base font-semibold text-gray-800">
                      Default Platform
                    </label>
                    <select
                      id="platform"
                      value={preferences.platform}
                      onChange={(e) => handlePreferenceChange('platform', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                    >
                      <option value="blog">Blog</option>
                      <option value="twitter">Twitter</option>
                      <option value="linkedin">LinkedIn</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="tone" className="block text-base font-semibold text-gray-800">
                      Default Tone
                    </label>
                    <select
                      id="tone"
                      value={preferences.tone}
                      onChange={(e) => handlePreferenceChange('tone', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                    >
                      <option value="professional">Professional</option>
                      <option value="casual">Casual</option>
                      <option value="friendly">Friendly</option>
                      <option value="formal">Formal</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="length" className="block text-base font-semibold text-gray-800">
                      Default Content Length
                    </label>
                    <select
                      id="length"
                      value={preferences.length}
                      onChange={(e) => handlePreferenceChange('length', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                    >
                      <option value="short">Short</option>
                      <option value="medium">Medium</option>
                      <option value="long">Long</option>
                    </select>
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="keywords" className="block text-base font-semibold text-gray-800">
                      Default Keywords (comma-separated)
                    </label>
                    <input
                      id="keywords"
                      type="text"
                      value={Array.isArray(preferences.keywords) ? preferences.keywords.join(', ') : ''}
                      onChange={(e) => handlePreferenceChange('keywords', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white appearance-none cursor-pointer"
                      placeholder="Enter default keywords separated by commas"
                    />
                  </div>

                  <div className="space-y-3">
                    <label htmlFor="brandGuidelines" className="block text-base font-semibold text-gray-800">
                      Default Brand Guidelines
                    </label>
                    <textarea
                      id="brandGuidelines"
                      value={preferences.brandGuidelines || ''}
                      onChange={(e) => handlePreferenceChange('brandGuidelines', e.target.value)}
                      className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white appearance-none cursor-pointer h-40 resize-none"
                      placeholder="Enter default brand guidelines"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}