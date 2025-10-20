'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  AcademicCapIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '@/lib/api';

interface CTECourse {
  id: string;
  course_code: string;
  course_code_description: string;
  course_description?: string;
  course_subject_area?: string;
  course_level?: string;
  cte_indicator: string;
  ap_indicator?: string;
  ib_indicator?: string;
}

export default function CTECoursesPage() {
  const params = useParams();
  const certificationName = decodeURIComponent(params.name as string);
  
  const [courses, setCourses] = useState<CTECourse[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const itemsPerPage = 20;

  useEffect(() => {
    loadCTECourses();
  }, [currentPage, certificationName]);

  const loadCTECourses = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: itemsPerPage.toString()
      });

      const response = await fetch(
        `${API_BASE_URL}/certifications/name/${encodeURIComponent(certificationName)}/cte-courses?${params}`
      );
      const data = await response.json();

      if (data.success) {
        setCourses(data.data);
        setTotalItems(data.pagination.total);
        setTotalPages(data.pagination.totalPages);
      } else {
        console.error('Failed to load CTE courses:', data.error);
      }
    } catch (error) {
      console.error('Failed to load CTE courses:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <Link href="/certifications" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
                ← Back to Certifications
              </Link>
              <h1 className="text-2xl font-bold text-gray-900">CTE Courses</h1>
              <p className="text-sm text-gray-600 mt-1">
                Certification: <span className="font-medium">{certificationName}</span>
              </p>
              <p className="text-xs text-gray-500 mt-1">
                {totalItems > 0 ? `${totalItems} CTE courses available for this certification` : 'Loading courses...'}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm">
                <AcademicCapIcon className="h-4 w-4 mr-1" />
                CTE Only
              </div>
            </div>
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
        ) : courses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <BookOpenIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No CTE courses found</h3>
            <p className="text-gray-500">
              No Career and Technical Education courses were found for this certification.
            </p>
            <Link 
              href="/certifications" 
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              ← Back to Certifications
            </Link>
          </div>
        ) : (
          <>
            {/* Course List */}
            <div className="bg-white rounded-lg shadow-sm overflow-hidden">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Code
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Course Title
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Subject Area
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Level
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Indicators
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {courses.map((course, index) => (
                    <tr key={`${course.course_code}-${index}`} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        <Link 
                          href={`/sced/${course.course_code}?from=certification&cert=${encodeURIComponent(certificationName)}`}
                          className="text-blue-600 hover:text-blue-700 hover:underline"
                        >
                          {course.course_code}
                        </Link>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <Link 
                          href={`/sced/${course.course_code}?from=certification&cert=${encodeURIComponent(certificationName)}`}
                          className="text-gray-900 hover:text-blue-600"
                        >
                          {course.course_code_description}
                        </Link>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.course_subject_area || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {course.course_level || '-'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        <div className="flex flex-wrap gap-1">
                          {course.cte_indicator === 'Yes' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              CTE
                            </span>
                          )}
                          {course.ap_indicator === 'Yes' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-800">
                              AP
                            </span>
                          )}
                          {course.ib_indicator === 'Yes' && (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-indigo-100 text-indigo-800">
                              IB
                            </span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-6 flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * itemsPerPage) + 1} to {Math.min(currentPage * itemsPerPage, totalItems)} of {totalItems} courses
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeftIcon className="h-4 w-4" />
                  </button>
                  <span className="px-4 py-2 text-sm text-gray-700">
                    Page {currentPage} of {totalPages}
                  </span>
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="px-3 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronRightIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}