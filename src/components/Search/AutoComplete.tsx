'use client';

import { Fragment } from 'react';
import { SearchSuggestion, SearchHistory } from '@/types';
import { 
  MagnifyingGlassIcon, 
  ClockIcon,
  BookOpenIcon,
  AcademicCapIcon,
  FireIcon,
  HashtagIcon,
} from '@heroicons/react/24/outline';

interface AutoCompleteProps {
  query: string;
  suggestions: SearchSuggestion[];
  recentSearches: SearchHistory[];
  isLoading: boolean;
  onSuggestionClick: (suggestion: SearchSuggestion) => void;
  onRecentSearchClick: (search: SearchHistory) => void;
}

export default function AutoComplete({
  query,
  suggestions,
  recentSearches,
  isLoading,
  onSuggestionClick,
  onRecentSearchClick,
}: AutoCompleteProps) {
  const getIconForType = (type: string) => {
    switch (type) {
      case 'course_name':
      case 'sced_code':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'certification':
      case 'certification_name':
        return <AcademicCapIcon className="h-4 w-4" />;
      case 'pathway':
      case 'subject_area':
        return <HashtagIcon className="h-4 w-4" />;
      case 'popular':
        return <FireIcon className="h-4 w-4" />;
      default:
        return <MagnifyingGlassIcon className="h-4 w-4" />;
    }
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query.trim()) return text;
    
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <span key={index} className="font-semibold text-primary-600 bg-primary-50">
          {part}
        </span>
      ) : (
        part
      )
    );
  };

  const hasContent = suggestions.length > 0 || recentSearches.length > 0;

  if (!hasContent && !isLoading) {
    return null;
  }

  return (
    <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto">
      {isLoading && (
        <div className="p-4 text-center">
          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600 mx-auto"></div>
          <p className="text-sm text-gray-500 mt-2">Loading suggestions...</p>
        </div>
      )}

      {!isLoading && (
        <>
          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="py-2">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide border-b border-gray-100">
                Suggestions
              </div>
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => onSuggestionClick(suggestion)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 group"
                >
                  <div className="text-gray-400 group-hover:text-primary-500">
                    {getIconForType(suggestion.type)}
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">
                      {highlightMatch(suggestion.text, query)}
                    </div>
                    {suggestion.count && (
                      <div className="text-xs text-gray-500">
                        {suggestion.count} results
                      </div>
                    )}
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {suggestion.type.replace('_', ' ')}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="py-2 border-t border-gray-100">
              <div className="px-4 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Recent Searches
              </div>
              {recentSearches.map((search) => (
                <button
                  key={search.id}
                  onClick={() => onRecentSearchClick(search)}
                  className="w-full text-left px-4 py-2 hover:bg-gray-50 flex items-center space-x-3 group"
                >
                  <div className="text-gray-400 group-hover:text-primary-500">
                    <ClockIcon className="h-4 w-4" />
                  </div>
                  <div className="flex-1">
                    <div className="text-sm text-gray-900">
                      {highlightMatch(search.search_query, query)}
                    </div>
                    <div className="text-xs text-gray-500">
                      {new Date(search.searched_at).toLocaleDateString()} • 
                      {search.results_count || 0} results
                    </div>
                  </div>
                  <div className="text-xs text-gray-400 capitalize">
                    {search.search_type || 'all'}
                  </div>
                </button>
              ))}
            </div>
          )}

          {/* No Results */}
          {!isLoading && suggestions.length === 0 && recentSearches.length === 0 && query.length >= 2 && (
            <div className="p-4 text-center text-gray-500">
              <MagnifyingGlassIcon className="h-8 w-8 mx-auto mb-2 text-gray-300" />
              <p className="text-sm">No suggestions found for "{query}"</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}

          {/* Search Tip */}
          {query.length >= 2 && (
            <div className="border-t border-gray-100 px-4 py-2 bg-gray-50">
              <p className="text-xs text-gray-500">
                💡 Press Enter to search for "{query}" or click a suggestion above
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}