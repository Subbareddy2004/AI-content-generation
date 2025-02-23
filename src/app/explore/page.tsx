'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

import { generateContent, optimizeContent } from '@/lib/gemini';

interface NewsArticle {
  title: string;
  description: string;
  urlToImage: string;
  url: string;
  publishedAt: string;
  source: {
    name: string;
  };
}

interface ContentPreferences {
  platform: string;
  tone: string;
  length: string;
  keywords?: string[];
  brandGuidelines?: string;
}

interface FilterOptions {
  category: string;
  country: string;
}

export default function ExplorePage() {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    category: 'general',
    country: 'us'
  });
  const [selectedArticle, setSelectedArticle] = useState<NewsArticle | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [preferences, setPreferences] = useState<ContentPreferences>({
    platform: 'blog',
    tone: 'professional',
    length: 'medium'
  });

  const categories = [
    { value: 'general', label: 'General' },
    { value: 'technology', label: 'Technology' },
    { value: 'business', label: 'Business' },
    { value: 'science', label: 'Science' },
    { value: 'health', label: 'Health' }
  ];

  const countries = [
    { value: 'us', label: 'United States' },
    { value: 'gb', label: 'United Kingdom' },
    { value: 'in', label: 'India' },
    { value: 'au', label: 'Australia' },
    { value: 'ca', label: 'Canada' }
  ];

  useEffect(() => {
    setPage(1);
    setNews([]);
    setHasMore(true);
    fetchNews(1, true);
  }, [filters]);

  useEffect(() => {
    const savedPreferences = localStorage.getItem('contentPreferences');
    if (savedPreferences) {
      setPreferences(JSON.parse(savedPreferences));
    }
  }, []);

  const handleCreatePost = async (article: NewsArticle) => {
    setSelectedArticle(article);
    setIsGenerating(true);
    setShowModal(true);

    try {
      const content = await generateContent({
        topic: article.title,
        platform: preferences.platform as 'blog' | 'twitter' | 'linkedin' | 'facebook',
        tone: preferences.tone as 'professional' | 'casual' | 'friendly' | 'formal',
        length: preferences.length as 'short' | 'medium' | 'long',
        keywords: [...(preferences.keywords || []), article.source.name],
        brandGuidelines: preferences.brandGuidelines
      });
      
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setError('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleEnhanceContent = async () => {
    if (!generatedContent) return;
    setIsGenerating(true);
    try {
      const enhancedContent = await optimizeContent(generatedContent, preferences.platform);
      setGeneratedContent(enhancedContent);
    } catch (error) {
      console.error('Error enhancing content:', error);
      setError('Failed to enhance content');
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setSelectedArticle(null);
    setGeneratedContent('');
  };

  const fetchNews = async (pageNum: number, isNewFilter: boolean = false) => {
    try {
      isNewFilter ? setLoading(true) : setLoadingMore(true);
      const response = await fetch(`https://newsapi.org/v2/top-headlines?` + 
        new URLSearchParams({
          country: filters.country.toLowerCase(),
          category: filters.category,
          pageSize: '20',
          page: pageNum.toString(),
          apiKey: process.env.NEXT_PUBLIC_NEWS_API_KEY || ''
        }));
  
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to fetch news');
      }
      
      const data = await response.json();
      
      if (!data || !Array.isArray(data.articles)) {
        throw new Error('Invalid API response format');
      }
  
      const validArticles = data.articles.filter((article: any) => {
        return article &&
          typeof article.title === 'string' &&
          typeof article.url === 'string' &&
          article.source &&
          typeof article.source.name === 'string';
      });
  
      if (validArticles.length === 0) {
        setHasMore(false);
        if (isNewFilter) {
          throw new Error('No valid articles found');
        }
        return;
      }
  
      setNews(prev => isNewFilter ? validArticles : [...prev, ...validArticles]);
      
      // Update hasMore based on the total results and current page
      const totalResults = data.totalResults || 0;
      const currentCount = (pageNum * 20);
      setHasMore(validArticles.length === 20 && totalResults > currentCount);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load news articles');
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    const nextPage = page + 1;
    setPage(nextPage);
    fetchNews(nextPage);
  };

  const handleFilterChange = (type: keyof FilterOptions, value: string) => {
    setFilters(prev => ({ ...prev, [type]: value }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center text-red-600">
            <h2 className="text-2xl font-bold">{error}</h2>
            <p className="mt-2">Please try again later</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 py-24 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-bold text-center mb-12 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-purple-600">
          Latest News
        </h1>

        <div className="flex gap-4 mb-8 justify-center">
          <select
            value={filters.category}
            onChange={(e) => handleFilterChange('category', e.target.value)}
            className="px-6 py-3 bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors cursor-pointer text-gray-800 font-semibold shadow-lg hover:shadow-xl text-base min-w-[160px]"
          >
            {categories.map(category => (
              <option key={category.value} value={category.value} className="py-3 bg-white hover:bg-blue-50 font-medium">
                {category.label}
              </option>
            ))}
          </select>

          <select
            value={filters.country}
            onChange={(e) => handleFilterChange('country', e.target.value)}
            className="px-6 py-3 bg-white/95 backdrop-blur-sm border-2 border-blue-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 hover:border-blue-400 transition-colors cursor-pointer text-gray-800 font-semibold shadow-lg hover:shadow-xl text-base min-w-[160px]"
          >
            {countries.map(country => (
              <option key={country.value} value={country.value} className="py-3 bg-white hover:bg-blue-50 font-medium">
                {country.label}
              </option>
            ))}
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {news.map((article, index) => (
            <a
              key={`${article.url}-${index}`}
              href={article.url}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/80 backdrop-blur-sm rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100"
            >
              <div className="relative h-48 w-full">
                <Image
                  src={article.urlToImage || '/news-placeholder.svg'}
                  alt={article.title}
                  fill
                  className="object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = '/news-placeholder.svg';
                  }}
                />
              </div>
              <div className="p-6">
                <p className="text-sm text-blue-600 mb-2">{article.source.name}</p>
                <h2 className="text-xl font-semibold text-gray-900 mb-2 line-clamp-2">
                  {article.title}
                </h2>
                <p className="text-gray-600 mb-4 line-clamp-3">
                  {article.description}
                </p>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-gray-500">
                    {new Date(article.publishedAt).toLocaleDateString()}
                  </p>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      handleCreatePost(article);
                    }}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                  >
                    Create Post
                  </button>
                </div>
              </div>
            </a>
          ))}
        </div>

        {hasMore && (
          <div className="mt-12 text-center">
            <button
              onClick={handleLoadMore}
              disabled={loadingMore}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-md hover:shadow-lg"
            >
              {loadingMore ? (
                <span className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Loading...</span>
                </span>
              ) : (
                'Load More'
              )}
            </button>
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-xl font-semibold text-gray-900">
                  Generated Post
                </h3>
                <button
                  onClick={handleCloseModal}
                  className="text-gray-500 hover:text-gray-700 transition-colors"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {isGenerating ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="prose prose-blue max-w-none">
                    <textarea
                      value={generatedContent}
                      readOnly
                      className="w-full h-64 p-4 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-800 bg-white text-base"
                    />
                  </div>
                  <div className="flex justify-end space-x-4">
                    <button
                      onClick={handleEnhanceContent}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      Enhance Content
                    </button>
                    <button
                      onClick={() => {
                        const twitterShareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(generatedContent)}`;
                        window.open(twitterShareUrl, '_blank');
                      }}
                      className="px-4 py-2 bg-blue-400 text-white rounded-lg hover:bg-blue-500 transition-colors"
                    >
                      Share on Twitter
                    </button>
                    <button
                      onClick={() => {
                        const linkedinShareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(window.location.href)}&summary=${encodeURIComponent(generatedContent)}`;
                        window.open(linkedinShareUrl, '_blank');
                      }}
                      className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors"
                    >
                      Share on LinkedIn
                    </button>
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(generatedContent);
                        const button = document.activeElement as HTMLButtonElement;
                        const originalText = button.textContent;
                        button.textContent = 'Copied!';
                        setTimeout(() => {
                          button.textContent = originalText;
                        }, 2000);
                      }}
                      className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Copy Content
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}