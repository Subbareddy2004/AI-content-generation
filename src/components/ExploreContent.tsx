'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

type NewsItem = {
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  source: {
    name: string;
  };
  publishedAt: string;
};

type FilterOptions = {
  country: string;
  domain: string;
};

const countries = [
  { code: 'us', name: 'United States' },
  { code: 'gb', name: 'United Kingdom' },
  { code: 'in', name: 'India' },
  { code: 'au', name: 'Australia' },
  { code: 'ca', name: 'Canada' },
];

const domains = [
  { id: 'all', name: 'All' },
  { id: 'tech', name: 'Technology' },
  { id: 'fintech', name: 'Fintech' },
  { id: 'ai', name: 'Artificial Intelligence' },
  { id: 'agri', name: 'Agriculture' },
];

export default function ExploreContent() {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<FilterOptions>({
    country: 'us',
    domain: 'all',
  });

  useEffect(() => {
    fetchNews();
  }, [filters]);

  const fetchNews = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        `https://newsapi.org/v2/top-headlines?country=${filters.country}&category=technology&apiKey=${process.env.NEXT_PUBLIC_NEWS_API_KEY}`
      );
      const data = await response.json();
      
      let filteredNews = data.articles;
      if (filters.domain !== 'all') {
        filteredNews = filteredNews.filter((item: NewsItem) => {
          const content = (item.title + item.description).toLowerCase();
          switch (filters.domain) {
            case 'tech':
              return content.includes('technology') || content.includes('software') || content.includes('digital');
            case 'fintech':
              return content.includes('fintech') || content.includes('finance') || content.includes('banking');
            case 'ai':
              return content.includes('ai') || content.includes('artificial intelligence') || content.includes('machine learning');
            case 'agri':
              return content.includes('agriculture') || content.includes('farming') || content.includes('crop');
            default:
              return true;
          }
        });
      }
      
      setNews(filteredNews);
    } catch (error) {
      console.error('Error fetching news:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <select
          value={filters.country}
          onChange={(e) => setFilters({ ...filters, country: e.target.value })}
          className="p-2 border rounded-md bg-white shadow-sm"
        >
          {countries.map((country) => (
            <option key={country.code} value={country.code}>
              {country.name}
            </option>
          ))}
        </select>

        <select
          value={filters.domain}
          onChange={(e) => setFilters({ ...filters, domain: e.target.value })}
          className="p-2 border rounded-md bg-white shadow-sm"
        >
          {domains.map((domain) => (
            <option key={domain.id} value={domain.id}>
              {domain.name}
            </option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {news.map((item, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
              {item.urlToImage && (
                <div className="relative h-48">
                  <Image
                    src={item.urlToImage}
                    alt={item.title}
                    fill
                    className="object-cover"
                  />
                </div>
              )}
              <div className="p-4">
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600 mb-4">{item.description}</p>
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <span>{item.source.name}</span>
                  <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                </div>
                <a
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-block bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors"
                >
                  Read More
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}