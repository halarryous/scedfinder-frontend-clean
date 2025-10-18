'use client';

import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import SearchBar from '@/components/Search/SearchBar';
import FilterPanel from '@/components/Search/FilterPanel';
import SearchResults from '@/components/Search/SearchResults';
import { useSearchStore } from '@/store/searchStore';
import { searchApi, userApi } from '@/lib/api-services';
import { useAuth } from '@/contexts/AuthContext';
import { SearchResult } from '@/types';
import { 
  AdjustmentsHorizontalIcon,
  XMarkIcon 
} from '@heroicons/react/24/outline';

export default function SearchPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  
  const {
    searchQuery,
    searchType,
    filters,
    setSearchQuery,
    setSearchType,
    setFilters,
    addToHistory
  } = useSearchStore();

  const [results, setResults] = useState<SearchResult>({
    courses: [],
    certifications: [],
    total: 0
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);
  const [userFavorites, setUserFavorites] = useState({ 
    courseIds: [] as string[], 
    certificationIds: [] as string[] 
  });

  // Initialize search from URL params
  useEffect(() => {
    const queryFromUrl = searchParams.get('q') || '';
    const typeFromUrl = searchParams.get('type') as 'sced' | 'certification' | 'both' || 'both';
    const pageFromUrl = parseInt(searchParams.get('page') || '1');

    if (queryFromUrl && queryFromUrl !== searchQuery) {
      setSearchQuery(queryFromUrl);
    }
    if (typeFromUrl !== searchType) {
      setSearchType(typeFromUrl);
    }
    if (pageFromUrl !== currentPage) {
      setCurrentPage(pageFromUrl);
    }

    // Perform search if we have a query
    if (queryFromUrl) {
      performSearch(queryFromUrl, typeFromUrl, pageFromUrl);
    }
  }, [searchParams]);

  // Load user favorites
  useEffect(() => {
    const loadUserFavorites = async () => {
      if (!user) return;
      
      try {
        const favoritesResponse = await userApi.getFavorites();
        const courseIds = favoritesResponse.data
          .filter(f => f.favorite_type === 'sced_course')
          .map(f => f.item_id);
        const certificationIds = favoritesResponse.data
          .filter(f => f.favorite_type === 'certification')
          .map(f => f.item_id);
        
        setUserFavorites({ courseIds, certificationIds });
      } catch (error) {
        console.error('Failed to load user favorites:', error);
      }
    };

    loadUserFavorites();
  }, [user]);

  const performSearch = async (query: string, type: string, page: number = 1) => {
    if (!query.trim()) return;

    setLoading(true);
    setError(null);

    try {
      const searchResponse = await searchApi.universalSearch({
        query: query.trim(),
        type: type as 'sced' | 'certification' | 'both',
        filters,
        page,
        limit: 12
      });

      setResults({
        courses: searchResponse.data.sced_courses || [],
        certifications: searchResponse.data.certifications || [],
        total: searchResponse.data.total || 0
      });
      
      // Add to search history
      addToHistory({
        id: Date.now().toString(),
        search_query: query.trim(),
        search_type: type as 'sced' | 'certification' | 'both',
        searched_at: new Date().toISOString(),
        results_count: searchResponse.data.total || 0
      });

    } catch (err: any) {
      console.error('Search failed:', err);
      setError(err.response?.data?.error?.message || 'Search failed. Please try again.');
      setResults({ courses: [], certifications: [], total: 0 });
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (query: string) => {
    setCurrentPage(1);
    const params = new URLSearchParams({
      q: query,
      type: searchType,
      page: '1'
    });
    router.push(`/search?${params.toString()}`);
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    const params = new URLSearchParams({
      q: searchQuery,
      type: searchType,
      page: page.toString()
    });
    router.push(`/search?${params.toString()}`);
    
    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
    // Re-search with new filters
    if (searchQuery) {
      performSearch(searchQuery, searchType, 1);
    }
  }, [searchQuery, searchType, setFilters]);

  const handleCourseToggleFavorite = async (courseId: string, isFavorite: boolean) => {
    if (isFavorite) {
      setUserFavorites(prev => ({
        ...prev,
        courseIds: [...prev.courseIds, courseId]
      }));
    } else {
      setUserFavorites(prev => ({
        ...prev,
        courseIds: prev.courseIds.filter(id => id !== courseId)
      }));
    }
  };

  const handleCertificationToggleFavorite = async (certificationId: string, isFavorite: boolean) => {
    if (isFavorite) {
      setUserFavorites(prev => ({
        ...prev,
        certificationIds: [...prev.certificationIds, certificationId]
      }));
    } else {
      setUserFavorites(prev => ({
        ...prev,
        certificationIds: prev.certificationIds.filter(id => id !== certificationId)
      }));
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search Header */}
        <div className="mb-8">
          <div className="max-w-3xl mx-auto">
            <SearchBar
              onSearch={handleSearch}
              showTypeToggle={true}
              placeholder="Search SCED courses, certifications..."
              className="mb-6"
            />
          </div>

          {/* Mobile Filter Toggle */}
          <div className="lg:hidden mb-4">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <AdjustmentsHorizontalIcon className="h-4 w-4 mr-2" />
              Filters
              {Object.keys(filters).length > 0 && (
                <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                  {Object.keys(filters).length}
                </span>
              )}
            </button>
          </div>
        </div>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filters Sidebar */}
          <aside className={`lg:w-80 ${showFilters ? 'block' : 'hidden lg:block'}`}>
            <div className="sticky top-8">
              <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="p-4 border-b border-gray-200 lg:hidden">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-medium text-gray-900">Filters</h3>
                    <button
                      onClick={() => setShowFilters(false)}
                      className="p-1 text-gray-400 hover:text-gray-500"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                </div>
                <FilterPanel
                  onFiltersChange={handleFilterChange}
                  className="border-none shadow-none"
                />
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0">
            {error && (
              <div className="mb-6 rounded-md bg-red-50 p-4">
                <div className="text-sm text-red-700">{error}</div>
              </div>
            )}

            <SearchResults
              results={results}
              loading={loading}
              searchQuery={searchQuery}
              searchType={searchType}
              currentPage={currentPage}
              onPageChange={handlePageChange}
              onCourseToggleFavorite={handleCourseToggleFavorite}
              onCertificationToggleFavorite={handleCertificationToggleFavorite}
              userFavorites={userFavorites}
            />
          </main>
        </div>
      </div>
    </div>
  );
}