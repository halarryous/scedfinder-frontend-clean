'use client';

import { useRouter } from 'next/navigation';
import { SearchHistory } from '@/types';
import { 
  ClockIcon, 
  MagnifyingGlassIcon,
  ArrowTopRightOnSquareIcon 
} from '@heroicons/react/24/outline';

interface RecentSearchesProps {
  searches: SearchHistory[];
  loading: boolean;
}

export default function RecentSearches({ searches, loading }: RecentSearchesProps) {
  const router = useRouter();

  const handleSearchClick = (search: SearchHistory) => {
    const params = new URLSearchParams({
      q: search.search_query,
      type: search.search_type || 'both',
    });
    router.push(`/search?${params.toString()}`);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Recent Searches
          </h3>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Recent Searches
          </h3>
          <ClockIcon className="h-5 w-5 text-gray-400" />
        </div>

        {searches.length === 0 ? (
          <div className="text-center py-8">
            <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No recent searches</p>
            <p className="text-xs text-gray-400 mt-1">
              Start searching to see your search history here
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {searches.map((search) => (
              <div
                key={search.id}
                onClick={() => handleSearchClick(search)}
                className="group flex items-center justify-between p-3 rounded-md hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
              >
                <div className="flex items-center space-x-3 flex-1 min-w-0">
                  <div className="p-1 bg-gray-100 rounded group-hover:bg-primary-100">
                    <MagnifyingGlassIcon className="h-4 w-4 text-gray-500 group-hover:text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {search.search_query}
                    </p>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="text-xs text-gray-500">
                        {new Date(search.searched_at).toLocaleDateString()}
                      </span>
                      <span className="text-xs text-gray-300">•</span>
                      <span className="text-xs text-gray-500 capitalize">
                        {search.search_type || 'all'}
                      </span>
                      {search.results_count && (
                        <>
                          <span className="text-xs text-gray-300">•</span>
                          <span className="text-xs text-gray-500">
                            {search.results_count} results
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            ))}
          </div>
        )}

        {searches.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => router.push('/history')}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              View all search history →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}