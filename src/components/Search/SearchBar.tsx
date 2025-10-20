'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MagnifyingGlassIcon, XMarkIcon } from '@heroicons/react/24/outline';

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
  className = ""
}: SearchBarProps) {
  const router = useRouter();
  const [localQuery, setLocalQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      if (onSearch) {
        onSearch(localQuery.trim());
      } else {
        // Default behavior: navigate to SCED search
        router.push(`/sced?q=${encodeURIComponent(localQuery.trim())}`);
      }
    }
  };

  const handleClear = () => {
    setLocalQuery('');
  };

  return (
    <div className={`relative ${className}`}>
      <form onSubmit={handleSubmit} className="flex gap-2">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder={placeholder}
            className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {localQuery && (
            <button
              type="button"
              onClick={handleClear}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 hover:bg-gray-100 rounded"
            >
              <XMarkIcon className="h-4 w-4 text-gray-400" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          Search
        </button>
      </form>
    </div>
  );
}