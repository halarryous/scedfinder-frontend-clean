'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '@/lib/api';

interface Certification {
  name: string;
  code: string;
  course_count: string;
  subject_areas?: string[];
}

export default function SimpleCertificationsBrowse() {
  const [certifications, setCertifications] = useState<Certification[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLetter, setSelectedLetter] = useState<string>('A');
  const [totalItems, setTotalItems] = useState(0);

  // Create alphabet array
  const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('');

  useEffect(() => {
    loadCertifications();
  }, [selectedLetter]);

  const loadCertifications = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        query: `${selectedLetter}*`, // Use wildcard search for letter
        page: '1',
        limit: '100', // Maximum allowed by validation
        sort_by: 'certification_name',
        sort_order: 'asc'
      });

      const response = await fetch(`${API_BASE_URL}/certifications/search?${params}`);
      const data = await response.json();

      if (data.success) {
        setCertifications(data.data);
        setTotalItems(data.total);
      }
    } catch (error) {
      console.error('Failed to load certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLetterClick = (letter: string) => {
    setSelectedLetter(letter);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
                ← Back to Dashboard
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">Teacher Certifications</h1>
              <p className="text-sm text-gray-600 mt-1">
                {totalItems > 0 ? `${totalItems} certifications available` : 'Loading certifications...'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Alphabetical Navigation */}
      <div className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap justify-center gap-2">
            {alphabet.map((letter) => (
              <button
                key={letter}
                onClick={() => handleLetterClick(letter)}
                className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
                  selectedLetter === letter
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {letter}
              </button>
            ))}
          </div>
          <div className="text-center mt-3">
            <p className="text-sm text-gray-600">
              Showing certifications starting with <span className="font-medium">{selectedLetter}</span>
              {totalItems > 0 && ` (${totalItems} ${totalItems === 1 ? 'certification' : 'certifications'})`}
            </p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-20 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ) : certifications.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <AcademicCapIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No certifications found</h3>
            <p className="text-gray-500">Unable to load certification data.</p>
          </div>
        ) : (
          <>
            {/* Certification List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Certification Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Courses
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Areas
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {certifications.map((cert, index) => (
                    <tr key={`${cert.code}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {cert.code}
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        {cert.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <Link 
                          href={`/certifications/cte-courses/${encodeURIComponent(cert.name)}`}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer transition-colors"
                          title="View CTE courses for this certification"
                        >
                          {cert.course_count} courses
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-500">
                        {cert.subject_areas && cert.subject_areas.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {cert.subject_areas.slice(0, 3).map((area, idx) => (
                              <span key={idx} className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-700">
                                {area}
                              </span>
                            ))}
                            {cert.subject_areas.length > 3 && (
                              <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500">
                                +{cert.subject_areas.length - 3} more
                              </span>
                            )}
                          </div>
                        ) : (
                          '-'
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Results Summary */}
            {totalItems > 0 && (
              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Found {totalItems} certification{totalItems !== 1 ? 's' : ''} starting with "{selectedLetter}"
                </p>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}