'use client';

import { useState } from 'react';
import { SCEDCourse, Certification, SearchResult } from '@/types';
import CourseCard from '@/components/Shared/CourseCard';
import CertificationCard from '@/components/Shared/CertificationCard';
import Pagination from '@/components/Shared/Pagination';
import { 
  ViewColumnsIcon, 
  Bars3Icon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  AcademicCapIcon,
  AdjustmentsHorizontalIcon
} from '@heroicons/react/24/outline';

interface SearchResultsProps {
  results: SearchResult;
  loading: boolean;
  searchQuery: string;
  searchType: 'sced' | 'certification' | 'both';
  currentPage: number;
  onPageChange: (page: number) => void;
  onCourseToggleFavorite?: (courseId: string, isFavorite: boolean) => void;
  onCertificationToggleFavorite?: (certificationId: string, isFavorite: boolean) => void;
  userFavorites?: { courseIds: string[]; certificationIds: string[] };
}

type ViewMode = 'grid' | 'list';
type SortOption = 'relevance' | 'name' | 'recent';

export default function SearchResults({
  results,
  loading,
  searchQuery,
  searchType,
  currentPage,
  onPageChange,
  onCourseToggleFavorite,
  onCertificationToggleFavorite,
  userFavorites = { courseIds: [], certificationIds: [] }
}: SearchResultsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState<SortOption>('relevance');
  const [activeTab, setActiveTab] = useState<'all' | 'courses' | 'certifications'>('all');

  const itemsPerPage = 12;
  
  // Filter results based on active tab
  const getFilteredResults = () => {
    switch (activeTab) {
      case 'courses':
        return {
          courses: results.courses || [],
          certifications: [],
          total: results.courses?.length || 0
        };
      case 'certifications':
        return {
          courses: [],
          certifications: results.certifications || [],
          total: results.certifications?.length || 0
        };
      default:
        return {
          courses: results.courses || [],
          certifications: results.certifications || [],
          total: results.total || 0
        };
    }
  };

  const filteredResults = getFilteredResults();
  const totalPages = Math.ceil(filteredResults.total / itemsPerPage);

  const getTabCount = (type: 'courses' | 'certifications') => {
    return results[type]?.length || 0;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        {/* Loading header */}
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/4"></div>
        </div>

        {/* Loading grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-lg shadow-sm p-4">
              <div className="animate-pulse">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className="h-9 w-9 bg-gray-200 rounded-md"></div>
                    <div className="h-4 bg-gray-200 rounded w-16"></div>
                  </div>
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
      </div>
    );
  }

  if (!results.total || results.total === 0) {
    return (
      <div className="text-center py-12">
        <MagnifyingGlassIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No results found</h3>
        <p className="text-gray-500 mb-6">
          {searchQuery ? (
            <>No results found for <span className="font-medium">"{searchQuery}"</span></>
          ) : (
            'Try adjusting your search terms or filters'
          )}
        </p>
        <div className="space-y-2 text-sm text-gray-400">
          <p>Try searching for:</p>
          <ul className="list-disc list-inside space-y-1">
            <li>Course names or SCED codes</li>
            <li>Certification names or codes</li>
            <li>Subject areas or pathways</li>
            <li>Broader or more specific terms</li>
          </ul>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        <div>
          <h2 className="text-lg font-semibold text-gray-900">
            {searchQuery ? (
              <>Search results for "<span className="text-primary-600">{searchQuery}</span>"</>
            ) : (
              'Search Results'
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Found {results.total.toLocaleString()} results
          </p>
        </div>

        {/* View Controls */}
        <div className="flex items-center space-x-4">
          {/* Sort Dropdown */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="rounded-md border-gray-300 text-sm focus:border-primary-500 focus:ring-primary-500"
          >
            <option value="relevance">Sort by Relevance</option>
            <option value="name">Sort by Name</option>
            <option value="recent">Sort by Recent</option>
          </select>

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

      {/* Tabs */}
      {searchType === 'both' && (results.courses?.length || results.certifications?.length) && (
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab('all')}
              className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap ${
                activeTab === 'all'
                  ? 'border-primary-500 text-primary-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              All Results ({results.total})
            </button>
            {results.courses && results.courses.length > 0 && (
              <button
                onClick={() => setActiveTab('courses')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === 'courses'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <BookOpenIcon className="h-4 w-4 mr-2" />
                Courses ({getTabCount('courses')})
              </button>
            )}
            {results.certifications && results.certifications.length > 0 && (
              <button
                onClick={() => setActiveTab('certifications')}
                className={`py-2 px-1 border-b-2 font-medium text-sm whitespace-nowrap flex items-center ${
                  activeTab === 'certifications'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <AcademicCapIcon className="h-4 w-4 mr-2" />
                Certifications ({getTabCount('certifications')})
              </button>
            )}
          </nav>
        </div>
      )}

      {/* Results Grid/List */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Courses */}
          {(activeTab === 'all' || activeTab === 'courses') &&
            filteredResults.courses.map((course) => (
              <CourseCard
                key={`course-${course.id}`}
                course={course}
                isFavorite={userFavorites.courseIds.includes(course.id)}
                onFavoriteToggle={onCourseToggleFavorite}
              />
            ))}
          
          {/* Certifications */}
          {(activeTab === 'all' || activeTab === 'certifications') &&
            filteredResults.certifications.map((certification) => (
              <CertificationCard
                key={`cert-${certification.id}`}
                certification={certification}
                isFavorite={userFavorites.certificationIds.includes(certification.id)}
                onFavoriteToggle={onCertificationToggleFavorite}
              />
            ))}
        </div>
      ) : (
        <div className="space-y-4">
          {/* List view for courses */}
          {(activeTab === 'all' || activeTab === 'courses') &&
            filteredResults.courses.map((course) => (
              <CourseCard
                key={`course-${course.id}`}
                course={course}
                isFavorite={userFavorites.courseIds.includes(course.id)}
                onFavoriteToggle={onCourseToggleFavorite}
                className="w-full"
              />
            ))}
          
          {/* List view for certifications */}
          {(activeTab === 'all' || activeTab === 'certifications') &&
            filteredResults.certifications.map((certification) => (
              <CertificationCard
                key={`cert-${certification.id}`}
                certification={certification}
                isFavorite={userFavorites.certificationIds.includes(certification.id)}
                onFavoriteToggle={onCertificationToggleFavorite}
                className="w-full"
              />
            ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={filteredResults.total}
          itemsPerPage={itemsPerPage}
          onPageChange={onPageChange}
        />
      )}
    </div>
  );
}