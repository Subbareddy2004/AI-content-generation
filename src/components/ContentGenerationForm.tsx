'use client';

import { useState } from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';
import { ContentGenerationParams } from '@/lib/gemini';

interface ContentGenerationFormProps {
  onSubmit: (params: ContentGenerationParams) => Promise<void>;
}

export function ContentGenerationForm({ onSubmit }: ContentGenerationFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<ContentGenerationParams>({
    topic: '',
    platform: 'blog',
    tone: 'professional',
    length: 'medium',
    keywords: [],
    brandGuidelines: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error('Error generating content:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="max-w-2xl mx-auto bg-white p-8 rounded-2xl shadow-2xl border border-gray-100 space-y-8 transform transition-all hover:shadow-xl">
      <div className="space-y-3">
        <LabelPrimitive.Root htmlFor="topic" className="block text-base font-semibold text-gray-800">
          Topic
        </LabelPrimitive.Root>
        <input
          id="topic"
          type="text"
          required
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg placeholder-gray-400 bg-gray-50 hover:bg-white"
          value={formData.topic}
          onChange={(e) => setFormData({ ...formData, topic: e.target.value })}
          placeholder="Enter your topic"
          suppressHydrationWarning
        />
      </div>

      <div className="space-y-3">
        <LabelPrimitive.Root htmlFor="platform" className="block text-base font-semibold text-gray-800">
          Platform
        </LabelPrimitive.Root>
        <select
          id="platform"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white appearance-none cursor-pointer"
          value={formData.platform}
          onChange={(e) => setFormData({ ...formData, platform: e.target.value as ContentGenerationParams['platform'] })}
          suppressHydrationWarning
        >
          <option value="blog">Blog</option>
          <option value="twitter">Twitter</option>
          <option value="linkedin">LinkedIn</option>
        </select>
      </div>

      <div className="space-y-3">
        <LabelPrimitive.Root htmlFor="tone" className="block text-base font-semibold text-gray-800">
          Tone
        </LabelPrimitive.Root>
        <select
          id="tone"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white appearance-none cursor-pointer"
          value={formData.tone}
          onChange={(e) => setFormData({ ...formData, tone: e.target.value as ContentGenerationParams['tone'] })}
          suppressHydrationWarning
        >
          <option value="professional">Professional</option>
          <option value="casual">Casual</option>
          <option value="friendly">Friendly</option>
          <option value="formal">Formal</option>
        </select>
      </div>

      <div className="space-y-3">
        <LabelPrimitive.Root htmlFor="length" className="block text-base font-semibold text-gray-800">
          Length
        </LabelPrimitive.Root>
        <select
          id="length"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white appearance-none cursor-pointer"
          value={formData.length}
          onChange={(e) => setFormData({ ...formData, length: e.target.value as ContentGenerationParams['length'] })}
          suppressHydrationWarning
        >
          <option value="short">Short</option>
          <option value="medium">Medium</option>
          <option value="long">Long</option>
        </select>
      </div>

      <div className="space-y-3">
        <LabelPrimitive.Root htmlFor="keywords" className="block text-base font-semibold text-gray-800">
          Keywords (comma-separated)
        </LabelPrimitive.Root>
        <input
          id="keywords"
          type="text"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white placeholder-gray-400"
          value={formData.keywords?.join(', ') || ''}
          onChange={(e) => setFormData({ ...formData, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
          placeholder="Enter keywords separated by commas"
          suppressHydrationWarning
        />
      </div>

      <div className="space-y-3">
        <LabelPrimitive.Root htmlFor="brandGuidelines" className="block text-base font-semibold text-gray-800">
          Brand Guidelines
        </LabelPrimitive.Root>
        <textarea
          id="brandGuidelines"
          className="w-full p-4 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-blue-100 focus:border-blue-500 transition-all text-gray-800 text-lg bg-gray-50 hover:bg-white placeholder-gray-400 h-40 resize-none"
          value={formData.brandGuidelines || ''}
          onChange={(e) => setFormData({ ...formData, brandGuidelines: e.target.value })}
          placeholder="Enter your brand guidelines"
        />
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className="w-full py-4 px-6 bg-gradient-to-r from-blue-600 to-blue-800 text-white text-lg font-semibold rounded-xl hover:from-blue-700 hover:to-blue-900 focus:ring-4 focus:ring-blue-300 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transform hover:scale-[1.02] active:scale-[0.98]"
        suppressHydrationWarning
      >
        {isLoading ? (
          <span className="flex items-center justify-center space-x-3">
            <svg className="animate-spin h-6 w-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            <span>Generating...</span>
          </span>
        ) : (
          'Generate Content'
        )}
      </button>
    </form>
  );
}