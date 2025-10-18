'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearchStore } from '@/store/searchStore';
import { searchApi } from '@/lib/api-services';
import { SearchSuggestion } from '@/types';
import AutoComplete from './AutoComplete';

interface SearchBarProps {
  placeholder?: string;
  onSearch?: (query: string) => void;
  showFilters?: boolean;
  showTypeToggle?: boolean;
  className?: string;
}

export default function SearchBar({ 
  placeholder = "Search SCED codes, course names, or certifications...",
  onSearch,
  showFilters = true,
  showTypeToggle = false,
  className = ""
}: SearchBarProps) {
  const router = useRouter();
  const searchInputRef = useRef<HTMLInputElement>(null);
  
  const {
    searchQuery,
    searchType,
    setSearchQuery,
    setSearchType,
    suggestions,
    setSuggestions,
    recentSearches,
  } = useSearchStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Load suggestions when query changes
  useEffect(() => {
    const loadSuggestions = async () => {
      if (localQuery.length >= 2) {
        setIsLoading(true);
        try {
          const response = await searchApi.getSuggestions(localQuery, undefined, 10);
          if (response.success) {
            setSuggestions(response.data);
          }
        } catch (error) {
          console.error('Failed to load suggestions:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
      }
    };

    const debounce = setTimeout(loadSuggestions, 300);
    return () => clearTimeout(debounce);
  }, [localQuery, setSuggestions]);

  const handleSearch = (query: string = localQuery) => {
    if (!query.trim()) return;

    setSearchQuery(query);
    setShowSuggestions(false);

    if (onSearch) {
      onSearch(query);
    } else {
      // Navigate to search results page
      const params = new URLSearchParams({
        q: query,
        type: searchType,
      });
      router.push(`/search?${params.toString()}`);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setLocalQuery(value);
    setShowSuggestions(true);
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    setLocalQuery(suggestion.text);
    handleSearch(suggestion.text);
  };

  const handleClearSearch = () => {
    setLocalQuery('');
    setSearchQuery('');
    setSuggestions([]);
    setShowSuggestions(false);
    searchInputRef.current?.focus();
  };

  const handleFocus = () => {
    setShowSuggestions(localQuery.length >= 2 || suggestions.length > 0);
  };

  const handleBlur = () => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => setShowSuggestions(false), 150);
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Search Type Toggle */}
        {showFilters && (
          <div className="flex items-center space-x-4">
            <span className="text-sm font-medium text-gray-700">Search in:</span>
            <div className="flex items-center space-x-2">
              {[
                { value: 'both', label: 'All' },
                { value: 'sced', label: 'SCED Courses' },
                { value: 'certification', label: 'Certifications' },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSearchType(type.value as any)}
                  className={`px-3 py-1 text-sm rounded-md font-medium transition-colors ${
                    searchType === type.value
                      ? 'bg-primary-100 text-primary-700 border border-primary-200'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Search Input */}
        <div className="relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              value={localQuery}
              onChange={handleInputChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-primary-500 text-lg"
              placeholder={placeholder}
            />
            {localQuery && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                <XMarkIcon className="h-5 w-5 text-gray-400 hover:text-gray-600" />
              </button>
            )}
          </div>

          {/* Search Button */}
          <button
            type="submit"
            disabled={!localQuery.trim()}
            className="mt-3 w-full sm:w-auto px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed sm:ml-3 sm:mt-0 sm:inline-flex sm:items-center"
          >
            Search
          </button>
        </div>
      </form>

      {/* Autocomplete Suggestions */}
      {showSuggestions && (localQuery.length >= 2 || suggestions.length > 0 || recentSearches.length > 0) && (
        <AutoComplete
          query={localQuery}
          suggestions={suggestions}
          recentSearches={recentSearches.slice(0, 5)}
          isLoading={isLoading}
          onSuggestionClick={handleSuggestionClick}
          onRecentSearchClick={(search) => {
            setLocalQuery(search.search_query);
            handleSearch(search.search_query);
          }}
        />
      )}
    </div>
  );
}