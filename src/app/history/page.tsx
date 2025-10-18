'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useSearchStore } from '@/store/searchStore';
import { SearchHistory } from '@/types';
import { 
  ClockIcon,
  MagnifyingGlassIcon,
  TrashIcon,
  ArrowTopRightOnSquareIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CalendarIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

export default function SearchHistoryPage() {
  const router = useRouter();
  const { user } = useAuth();
  const { searchHistory, clearHistory, removeFromHistory } = useSearchStore();
  
  const [filteredHistory, setFilteredHistory] = useState<SearchHistory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState<'all' | 'sced' | 'certification' | 'both'>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    filterHistory();
  }, [searchHistory, searchQuery, typeFilter, dateFilter]);

  const filterHistory = () => {
    let filtered = [...searchHistory];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(item =>
        item.search_query.toLowerCase().includes(query)
      );
    }

    // Filter by type
    if (typeFilter !== 'all') {
      filtered = filtered.filter(item => item.search_type === typeFilter);
    }

    // Filter by date
    if (dateFilter !== 'all') {
      const now = new Date();
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);
      const monthAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);

      filtered = filtered.filter(item => {
        const itemDate = new Date(item.searched_at);
        switch (dateFilter) {
          case 'today':
            return itemDate >= today;
          case 'week':
            return itemDate >= weekAgo;
          case 'month':
            return itemDate >= monthAgo;
          default:
            return true;
        }
      });
    }

    // Sort by timestamp (newest first)
    filtered.sort((a, b) => new Date(b.searched_at).getTime() - new Date(a.searched_at).getTime());

    setFilteredHistory(filtered);
  };

  const handleSearchClick = (historyItem: SearchHistory) => {
    const params = new URLSearchParams({
      q: historyItem.search_query,
      type: historyItem.search_type || 'both',
    });
    router.push(`/search?${params.toString()}`);
  };

  const handleDeleteItem = (itemId: string) => {
    removeFromHistory(itemId);
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(itemId);
      return newSet;
    });
    toast.success('Removed from search history');
  };

  const handleBulkDelete = () => {
    if (selectedItems.size === 0) return;

    selectedItems.forEach(itemId => {
      removeFromHistory(itemId);
    });
    
    setSelectedItems(new Set());
    toast.success(`Removed ${selectedItems.size} items from history`);
  };

  const handleClearAll = () => {
    clearHistory();
    setSelectedItems(new Set());
    toast.success('Search history cleared');
  };

  const handleSelectItem = (itemId: string) => {
    setSelectedItems(prev => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (selectedItems.size === filteredHistory.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredHistory.map(item => item.id)));
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    if (date >= today) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else if (date >= yesterday) {
      return `Yesterday at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`;
    } else {
      return date.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric',
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'sced':
        return <BookOpenIcon className="h-4 w-4" />;
      case 'certification':
        return <AcademicCapIcon className="h-4 w-4" />;
      default:
        return <MagnifyingGlassIcon className="h-4 w-4" />;
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'sced':
        return 'Courses';
      case 'certification':
        return 'Certifications';
      default:
        return 'All';
    }
  };

  const getCounts = () => {
    const sced = searchHistory.filter(item => item.search_type === 'sced').length;
    const certification = searchHistory.filter(item => item.search_type === 'certification').length;
    const both = searchHistory.filter(item => item.search_type === 'both').length;
    return { sced, certification, both, total: sced + certification + both };
  };

  const counts = getCounts();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500">Please login to view your search history.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <ClockIcon className="h-8 w-8 text-purple-600 mr-3" />
                Search History
              </h1>
              <p className="text-gray-600 mt-1">
                Your recent search queries and results
              </p>
            </div>
            
            {searchHistory.length > 0 && (
              <button
                onClick={handleClearAll}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-red-600 text-sm font-medium text-white hover:bg-red-700"
              >
                <TrashIcon className="h-4 w-4 mr-2" />
                Clear All History
              </button>
            )}
          </div>

          {/* Search and Filters */}
          <div className="space-y-4">
            {/* Search */}
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your history..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
              {/* Type Filter */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {([
                  { value: 'all' as const, label: 'All', count: counts.total },
                  { value: 'sced' as const, label: 'Courses', count: counts.sced },
                  { value: 'certification' as const, label: 'Certifications', count: counts.certification },
                  { value: 'both' as const, label: 'Combined', count: counts.both }
                ]).map(({ value, label, count }) => (
                  <button
                    key={value}
                    onClick={() => setTypeFilter(value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      typeFilter === value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label} ({count})
                  </button>
                ))}
              </div>

              {/* Date Filter */}
              <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
                {([
                  { value: 'all' as const, label: 'All Time' },
                  { value: 'today' as const, label: 'Today' },
                  { value: 'week' as const, label: 'This Week' },
                  { value: 'month' as const, label: 'This Month' }
                ]).map(({ value, label }) => (
                  <button
                    key={value}
                    onClick={() => setDateFilter(value)}
                    className={`px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                      dateFilter === value
                        ? 'bg-white text-gray-900 shadow-sm'
                        : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    {label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        {filteredHistory.length > 0 && (
          <div className="flex items-center justify-between mb-6 p-4 bg-white rounded-lg border border-gray-200">
            <div className="flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={selectedItems.size === filteredHistory.length && filteredHistory.length > 0}
                  onChange={handleSelectAll}
                  className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                />
                <span className="ml-2 text-sm text-gray-600">
                  Select all ({filteredHistory.length})
                </span>
              </label>
              
              {selectedItems.size > 0 && (
                <button
                  onClick={handleBulkDelete}
                  className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                >
                  <TrashIcon className="h-4 w-4 mr-1" />
                  Delete Selected ({selectedItems.size})
                </button>
              )}
            </div>

            <div className="text-sm text-gray-500">
              {filteredHistory.length} search{filteredHistory.length !== 1 ? 'es' : ''}
            </div>
          </div>
        )}

        {/* Empty State */}
        {filteredHistory.length === 0 && (
          <div className="text-center py-12">
            <ClockIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchHistory.length === 0 ? 'No search history' : 'No matching searches'}
            </h3>
            <p className="text-gray-500 mb-6">
              {searchHistory.length === 0 
                ? 'Start searching to see your search history here'
                : 'Try adjusting your filters or search terms'
              }
            </p>
            {searchHistory.length === 0 && (
              <button
                onClick={() => router.push('/search')}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-primary-600 text-sm font-medium text-white hover:bg-primary-700"
              >
                <MagnifyingGlassIcon className="h-4 w-4 mr-2" />
                Start Searching
              </button>
            )}
          </div>
        )}

        {/* History List */}
        {filteredHistory.length > 0 && (
          <div className="space-y-3">
            {filteredHistory.map((item) => (
              <div
                key={item.id}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 flex-1 min-w-0">
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={selectedItems.has(item.id)}
                      onChange={() => handleSelectItem(item.id)}
                      className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                    />

                    {/* Search Info */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={() => handleSearchClick(item)}
                          className="flex items-center space-x-2 hover:text-primary-600 transition-colors group"
                        >
                          <div className="p-2 bg-gray-50 rounded-md group-hover:bg-primary-50">
                            {getTypeIcon(item.search_type || 'both')}
                          </div>
                          <div>
                            <h3 className="text-sm font-medium text-gray-900 group-hover:text-primary-600">
                              "{item.search_query}"
                            </h3>
                            <div className="flex items-center space-x-4 text-xs text-gray-500 mt-1">
                              <span className="flex items-center">
                                <TagIcon className="h-3 w-3 mr-1" />
                                {getTypeLabel(item.search_type || 'both')}
                              </span>
                              <span className="flex items-center">
                                <CalendarIcon className="h-3 w-3 mr-1" />
                                {formatDate(item.searched_at)}
                              </span>
                              {item.results_count !== undefined && (
                                <span>
                                  {item.results_count} result{item.results_count !== 1 ? 's' : ''}
                                </span>
                              )}
                            </div>
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleSearchClick(item)}
                        className="p-2 text-gray-400 hover:text-primary-600 transition-colors"
                        title="Search again"
                      >
                        <ArrowTopRightOnSquareIcon className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-2 text-gray-400 hover:text-red-600 transition-colors"
                        title="Remove from history"
                      >
                        <TrashIcon className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}