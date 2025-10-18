'use client';

import { useState, useEffect, useCallback } from 'react';
import { Disclosure } from '@headlessui/react';
import { ChevronDownIcon, XMarkIcon } from '@heroicons/react/24/outline';
import { useSearchStore } from '@/store/searchStore';
import { scedApi, certificationApi } from '@/lib/api-services';
import { FilterOptions } from '@/types';

interface FilterPanelProps {
  onFiltersChange?: (filters: any) => void;
  className?: string;
}

export default function FilterPanel({ onFiltersChange, className = '' }: FilterPanelProps) {
  const { filters, updateFilter, clearFilters, searchType } = useSearchStore();
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFilterOptions();
  }, [searchType]);

  useEffect(() => {
    if (onFiltersChange) {
      onFiltersChange(filters);
    }
  }, [filters]);

  const loadFilterOptions = async () => {
    setIsLoading(true);
    try {
      if (searchType === 'sced' || searchType === 'both') {
        const response = await scedApi.getFilterOptions();
        if (response.success) {
          setFilterOptions(prev => ({
            ...prev,
            ...response.data,
          }));
        }
      }
      
      // Note: In a real app, you'd load certification filter options here too
      // For now, using static data based on the backend schema
      setFilterOptions(prev => ({
        ...prev,
        certification_types: [
          { value: 'Teaching', count: 8 },
          { value: 'Industry', count: 6 },
        ],
        issuing_authorities: [
          { value: 'State Department of Education', count: 8 },
          { value: 'American Institute of CPAs', count: 1 },
          { value: 'American Culinary Federation', count: 1 },
          { value: 'State Board of Nursing', count: 1 },
        ],
      }));
    } catch (error) {
      console.error('Failed to load filter options:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFilterChange = (key: string, value: string) => {
    updateFilter(key, value === filters[key as keyof typeof filters] ? '' : value);
  };

  const getActiveFiltersCount = () => {
    return Object.values(filters).filter(value => value && value !== '').length;
  };

  const filterSections = [
    // SCED Course Filters
    ...(searchType === 'sced' || searchType === 'both' ? [
      {
        id: 'subject_areas',
        name: 'Subject Areas',
        options: filterOptions.subject_areas || [],
        current: filters.subject_area,
        onChange: (value: string) => handleFilterChange('subject_area', value),
      },
      {
        id: 'cte_pathways',
        name: 'CTE Pathways',
        options: filterOptions.cte_pathways || [],
        current: filters.cte_pathway,
        onChange: (value: string) => handleFilterChange('cte_pathway', value),
      },
      {
        id: 'course_types',
        name: 'Course Types',
        options: filterOptions.course_types || [],
        current: filters.course_type,
        onChange: (value: string) => handleFilterChange('course_type', value),
      },
      {
        id: 'grade_levels',
        name: 'Grade Levels',
        options: filterOptions.grade_levels || [],
        current: filters.grade_level,
        onChange: (value: string) => handleFilterChange('grade_level', value),
      },
    ] : []),
    
    // Certification Filters
    ...(searchType === 'certification' || searchType === 'both' ? [
      {
        id: 'certification_types',
        name: 'Certification Types',
        options: filterOptions.certification_types || [],
        current: filters.certification_type,
        onChange: (value: string) => handleFilterChange('certification_type', value),
      },
      {
        id: 'issuing_authorities',
        name: 'Issuing Authorities',
        options: filterOptions.issuing_authorities || [],
        current: filters.issuing_authority,
        onChange: (value: string) => handleFilterChange('issuing_authority', value),
      },
    ] : []),
  ];

  if (isLoading) {
    return (
      <div className={`bg-white border border-gray-200 rounded-lg p-4 ${className}`}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 rounded w-20"></div>
          <div className="space-y-2">
            <div className="h-3 bg-gray-200 rounded w-full"></div>
            <div className="h-3 bg-gray-200 rounded w-3/4"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-medium text-gray-900">
            Filters {getActiveFiltersCount() > 0 && (
              <span className="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800">
                {getActiveFiltersCount()}
              </span>
            )}
          </h3>
          {getActiveFiltersCount() > 0 && (
            <button
              onClick={clearFilters}
              className="text-sm text-primary-600 hover:text-primary-500 flex items-center"
            >
              <XMarkIcon className="h-4 w-4 mr-1" />
              Clear all
            </button>
          )}
        </div>
      </div>

      {/* Filter Sections */}
      <div className="divide-y divide-gray-200">
        {filterSections.map((section) => (
          <Disclosure key={section.id} defaultOpen={true}>
            {({ open }) => (
              <>
                <Disclosure.Button className="flex w-full justify-between px-4 py-3 text-left text-sm font-medium text-gray-900 hover:bg-gray-50">
                  <span>{section.name}</span>
                  <ChevronDownIcon
                    className={`${open ? 'rotate-180' : ''} h-4 w-4 text-gray-500 transition-transform`}
                  />
                </Disclosure.Button>
                <Disclosure.Panel className="px-4 pb-3 space-y-2">
                  {section.options.length === 0 ? (
                    <p className="text-xs text-gray-500">No options available</p>
                  ) : (
                    section.options.map((option) => (
                      <label key={option.value} className="flex items-center cursor-pointer">
                        <input
                          type="radio"
                          name={section.id}
                          value={option.value}
                          checked={section.current === option.value}
                          onChange={(e) => section.onChange(e.target.value)}
                          className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300"
                        />
                        <span className="ml-2 text-sm text-gray-700 flex-1">
                          {'label' in option ? option.label : option.value}
                        </span>
                        {'count' in option && option.count && (
                          <span className="text-xs text-gray-500 ml-1">
                            ({option.count})
                          </span>
                        )}
                      </label>
                    ))
                  )}
                </Disclosure.Panel>
              </>
            )}
          </Disclosure>
        ))}
      </div>

      {/* No Filters Message */}
      {filterSections.length === 0 && (
        <div className="px-4 py-8 text-center text-gray-500">
          <p className="text-sm">No filters available</p>
          <p className="text-xs mt-1">Select a search type to see available filters</p>
        </div>
      )}
    </div>
  );
}