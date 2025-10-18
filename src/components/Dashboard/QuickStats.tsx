'use client';

import { 
  BookOpenIcon, 
  AcademicCapIcon, 
  MagnifyingGlassIcon, 
  HeartIcon 
} from '@heroicons/react/24/outline';

interface QuickStatsProps {
  stats: {
    totalCourses: number;
    totalCertifications: number;
    totalSearches: number;
    favoriteCount: number;
  };
  loading: boolean;
}

export default function QuickStats({ stats, loading }: QuickStatsProps) {
  const statItems = [
    {
      name: 'SCED Courses',
      value: stats.totalCourses,
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
      description: 'Available course codes',
    },
    {
      name: 'Certifications',
      value: stats.totalCertifications,
      icon: AcademicCapIcon,
      color: 'text-green-600',
      bg: 'bg-green-50',
      description: 'Teacher certifications',
    },
    {
      name: 'Recent Searches',
      value: stats.totalSearches,
      icon: MagnifyingGlassIcon,
      color: 'text-purple-600',
      bg: 'bg-purple-50',
      description: 'Your search activity',
    },
    {
      name: 'Favorites',
      value: stats.favoriteCount,
      icon: HeartIcon,
      color: 'text-red-600',
      bg: 'bg-red-50',
      description: 'Saved items',
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      {statItems.map((item) => (
        <div key={item.name} className="bg-white overflow-hidden shadow rounded-lg">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className={`p-3 rounded-md ${item.bg}`}>
                  <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-gray-500 truncate">
                    {item.name}
                  </dt>
                  <dd className="flex items-baseline">
                    {loading ? (
                      <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                    ) : (
                      <div className="text-2xl font-semibold text-gray-900">
                        {item.value.toLocaleString()}
                      </div>
                    )}
                  </dd>
                  <dd className="text-xs text-gray-500 mt-1">
                    {item.description}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}