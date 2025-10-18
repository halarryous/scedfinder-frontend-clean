'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api-services';
import CourseCard from '@/components/Shared/CourseCard';
import CertificationCard from '@/components/Shared/CertificationCard';
import Pagination from '@/components/Shared/Pagination';
import { UserFavorite, SCEDCourse, Certification } from '@/types';
import { 
  HeartIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ViewColumnsIcon,
  Bars3Icon,
  TrashIcon,
  MagnifyingGlassIcon
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';

type ViewMode = 'grid' | 'list';
type FilterType = 'all' | 'sced_course' | 'certification';

interface FavoriteWithDetails extends UserFavorite {
  course?: SCEDCourse;
  certification?: Certification;
}

export default function FavoritesPage() {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<FavoriteWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());

  const itemsPerPage = 12;

  useEffect(() => {
    if (user) {
      loadFavorites();
    }
  }, [user]);

  const loadFavorites = async () => {
    if (!user) return;

    setLoading(true);
    setError(null);

    try {
      const favoritesResponse = await userApi.getFavorites();
      
      // Load detailed information for each favorite
      const favoritesWithDetails = await Promise.all(
        favoritesResponse.data.map(async (favorite) => {
          const favoriteWithDetails: FavoriteWithDetails = { ...favorite };
          
          try {
            if (favorite.favorite_type === 'sced_course') {
              // Load course details (this would be an API call in real implementation)
              // For now, we'll create mock data
              favoriteWithDetails.course = {
                id: favorite.item_id,
                course_code: 'Mock Code',
                course_code_description: 'Mock Course Title',
                course_description: 'Mock description',
                course_subject_area: 'Technology',
                course_level: 'SECONDARY',
                cte_indicator: 'Y',
                ap_indicator: 'N',
                ib_indicator: 'N',
                certifications: ['Information Technology Teacher'],
                certification_codes: ['1234'],
                prerequisite_courses: [],
                industry_alignment: ['IT'],
                national_standards: [],
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            } else if (favorite.favorite_type === 'certification') {
              // Load certification details
              favoriteWithDetails.certification = {
                id: favorite.item_id,
                certification_code: 'Mock Cert',
                certification_name: 'Mock Certification',
                certification_type: 'Teaching',
                issuing_authority: 'Mock Authority',
                subject_areas: ['Technology'],
                grade_levels: ['9-12'],
                endorsements: [],
                description: 'Mock certification description',
                requirements: 'Mock requirements',
                renewal_period_months: 60,
                is_active: true,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              };
            }
          } catch (detailError) {
            console.error('Failed to load details for favorite:', detailError);
          }
          
          return favoriteWithDetails;
        })
      );

      setFavorites(favoritesWithDetails);
    } catch (err: any) {
      console.error('Failed to load favorites:', err);
      setError(err.response?.data?.error?.message || 'Failed to load favorites');
    } finally {
      setLoading(false);
    }
  };

  const getFilteredFavorites = () => {
    let filtered = favorites;

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(f => f.favorite_type === filterType);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase().trim();
      filtered = filtered.filter(f => {
        if (f.course) {
          return (
            f.course.course_code_description.toLowerCase().includes(query) ||
            f.course.course_code.toLowerCase().includes(query) ||
            f.course.course_subject_area?.toLowerCase().includes(query) ||
            f.course.cte_indicator?.toLowerCase().includes(query)
          );
        } else if (f.certification) {
          return (
            f.certification.certification_name.toLowerCase().includes(query) ||
            f.certification.certification_code.toLowerCase().includes(query) ||
            f.certification.issuing_authority?.toLowerCase().includes(query)
          );
        }
        return false;
      });
    }

    return filtered;
  };

  const handleToggleFavorite = async (itemId: string, isFavorite: boolean) => {
    if (!isFavorite) {
      // Remove from local state
      setFavorites(prev => prev.filter(f => f.item_id !== itemId));
      toast.success('Removed from favorites');
    }
  };

  const handleBulkDelete = async () => {
    if (selectedItems.size === 0) return;

    try {
      // In real implementation, this would be a bulk delete API call
      const itemsToDelete = Array.from(selectedItems);
      setFavorites(prev => prev.filter(f => !itemsToDelete.includes(f.item_id)));
      setSelectedItems(new Set());
      toast.success(`Removed ${itemsToDelete.length} items from favorites`);
    } catch (error) {
      toast.error('Failed to remove items from favorites');
    }
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
    const filteredFavorites = getFilteredFavorites();
    if (selectedItems.size === filteredFavorites.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(filteredFavorites.map(f => f.item_id)));
    }
  };

  const filteredFavorites = getFilteredFavorites();
  const totalPages = Math.ceil(filteredFavorites.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedFavorites = filteredFavorites.slice(startIndex, startIndex + itemsPerPage);

  const getCounts = () => {
    const courses = favorites.filter(f => f.favorite_type === 'sced_course').length;
    const certifications = favorites.filter(f => f.favorite_type === 'certification').length;
    return { courses, certifications, total: courses + certifications };
  };

  const counts = getCounts();

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Login Required</h3>
          <p className="text-gray-500">Please login to view your favorites.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                <HeartIcon className="h-8 w-8 text-red-500 mr-3" />
                My Favorites
              </h1>
              <p className="text-gray-600 mt-1">
                Your saved SCED courses and certifications
              </p>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search your favorites..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
              />
            </div>

            {/* Type Filter */}
            <div className="flex space-x-1 bg-gray-100 rounded-lg p-1">
              {([
                { value: 'all' as const, label: 'All', count: counts.total },
                { value: 'sced_course' as const, label: 'Courses', count: counts.courses },
                { value: 'certification' as const, label: 'Certifications', count: counts.certifications }
              ]).map(({ value, label, count }) => (
                <button
                  key={value}
                  onClick={() => {
                    setFilterType(value);
                    setCurrentPage(1);
                  }}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                    filterType === value
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {label} ({count})
                </button>
              ))}
            </div>
          </div>
        </div>

        {error && (
          <div className="mb-6 rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
                <div className="animate-pulse">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                      <div className="h-4 bg-gray-200 rounded w-16"></div>
                    </div>
                    <div className="h-4 w-4 bg-gray-200 rounded"></div>
                  </div>
                  <div className="h-6 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded mb-3"></div>
                  <div className="space-y-2">
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <>
            {/* Controls Bar */}
            {filteredFavorites.length > 0 && (
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
                <div className="flex items-center space-x-4">
                  <div className="text-sm text-gray-500">
                    Showing {filteredFavorites.length} favorite{filteredFavorites.length !== 1 ? 's' : ''}
                  </div>

                  {/* Bulk Actions */}
                  {filteredFavorites.length > 0 && (
                    <div className="flex items-center space-x-2">
                      <label className="flex items-center">
                        <input
                          type="checkbox"
                          checked={selectedItems.size === filteredFavorites.length && filteredFavorites.length > 0}
                          onChange={handleSelectAll}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                        <span className="ml-2 text-sm text-gray-600">Select all</span>
                      </label>
                      
                      {selectedItems.size > 0 && (
                        <button
                          onClick={handleBulkDelete}
                          className="inline-flex items-center px-3 py-1.5 border border-transparent text-sm font-medium rounded-md text-red-700 bg-red-100 hover:bg-red-200"
                        >
                          <TrashIcon className="h-4 w-4 mr-1" />
                          Remove ({selectedItems.size})
                        </button>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex items-center space-x-4">
                  {/* View Toggle */}
                  <div className="flex rounded-md border border-gray-300">
                    <button
                      onClick={() => setViewMode('grid')}
                      className={`p-2 text-sm font-medium rounded-l-md ${
                        viewMode === 'grid'
                          ? 'bg-primary-50 text-primary-600 border-primary-300'
                          : 'bg-white text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <ViewColumnsIcon className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setViewMode('list')}
                      className={`p-2 text-sm font-medium rounded-r-md border-l ${
                        viewMode === 'list'
                          ? 'bg-primary-50 text-primary-600 border-primary-300'
                          : 'bg-white text-gray-500 hover:text-gray-700'
                      }`}
                    >
                      <Bars3Icon className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Empty State */}
            {filteredFavorites.length === 0 && !loading && (
              <div className="text-center py-12">
                <HeartIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  {searchQuery || filterType !== 'all' ? 'No matching favorites' : 'No favorites yet'}
                </h3>
                <p className="text-gray-500 mb-6">
                  {searchQuery || filterType !== 'all' 
                    ? 'Try adjusting your search or filters'
                    : 'Start exploring and save your favorite courses and certifications'
                  }
                </p>
                {(searchQuery || filterType !== 'all') && (
                  <button
                    onClick={() => {
                      setSearchQuery('');
                      setFilterType('all');
                      setCurrentPage(1);
                    }}
                    className="text-primary-600 hover:text-primary-500 font-medium"
                  >
                    Clear filters
                  </button>
                )}
              </div>
            )}

            {/* Favorites Grid/List */}
            {paginatedFavorites.length > 0 && (
              <>
                <div className={viewMode === 'grid' 
                  ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8" 
                  : "space-y-4 mb-8"
                }>
                  {paginatedFavorites.map((favorite) => (
                    <div key={`${favorite.favorite_type}-${favorite.item_id}`} className="relative">
                      {/* Selection Checkbox */}
                      <div className="absolute top-2 left-2 z-10">
                        <input
                          type="checkbox"
                          checked={selectedItems.has(favorite.item_id)}
                          onChange={() => handleSelectItem(favorite.item_id)}
                          className="rounded border-gray-300 text-primary-600 shadow-sm focus:border-primary-300 focus:ring focus:ring-primary-200 focus:ring-opacity-50"
                        />
                      </div>

                      {/* Course or Certification Card */}
                      {favorite.course && (
                        <CourseCard
                          course={favorite.course}
                          isFavorite={true}
                          onFavoriteToggle={handleToggleFavorite}
                          className={`pl-8 ${viewMode === 'list' ? 'w-full' : ''}`}
                        />
                      )}
                      
                      {favorite.certification && (
                        <CertificationCard
                          certification={favorite.certification}
                          isFavorite={true}
                          onFavoriteToggle={handleToggleFavorite}
                          className={`pl-8 ${viewMode === 'list' ? 'w-full' : ''}`}
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    totalItems={filteredFavorites.length}
                    itemsPerPage={itemsPerPage}
                    onPageChange={setCurrentPage}
                  />
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  );
}