'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MagnifyingGlassIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ArrowRightIcon
} from '@heroicons/react/24/outline';

export default function SimpleDashboard() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/sced?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            SCED & Certification Search Tool
          </h1>
          <p className="text-sm text-gray-600 mt-1">
            Find SCED course codes and required teacher certifications
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Search Section */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 text-center">
              Search for a Course
            </h2>
            <form onSubmit={handleSearch} className="flex gap-2">
              <div className="relative flex-1">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Enter course name (e.g., Computer Science, Algebra, Biology)"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                Search
              </button>
            </form>
          </div>
        </div>

        {/* Quick Links */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Browse All SCED Courses */}
          <button
            onClick={() => router.push('/sced')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <BookOpenIcon className="h-8 w-8 text-blue-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Browse All SCED Courses
                  </h3>
                </div>
                <p className="text-gray-600">
                  View the complete list of SCED course codes with descriptions and certification requirements
                </p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 mt-1" />
            </div>
          </button>

          {/* Browse Certifications */}
          <button
            onClick={() => router.push('/certifications')}
            className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow text-left group"
          >
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center mb-3">
                  <AcademicCapIcon className="h-8 w-8 text-green-600 mr-3" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Browse Certifications
                  </h3>
                </div>
                <p className="text-gray-600">
                  View all teaching certifications and the courses they qualify you to teach
                </p>
              </div>
              <ArrowRightIcon className="h-5 w-5 text-gray-400 group-hover:text-gray-600 mt-1" />
            </div>
          </button>
        </div>

        {/* Info Box */}
        <div className="mt-8 bg-blue-50 rounded-lg p-6">
          <h3 className="font-semibold text-blue-900 mb-2">How to Use This Tool</h3>
          <ul className="space-y-2 text-sm text-blue-800">
            <li className="flex items-start">
              <span className="font-semibold mr-2">1.</span>
              <span>Search for a course by name to find its SCED code and required certifications</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">2.</span>
              <span>Browse all SCED courses to see the complete catalog</span>
            </li>
            <li className="flex items-start">
              <span className="font-semibold mr-2">3.</span>
              <span>Click on any course to view detailed certification requirements</span>
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
}