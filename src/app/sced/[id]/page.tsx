'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  BookOpenIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ArrowLeftIcon
} from '@heroicons/react/24/outline';
import { API_BASE_URL } from '@/lib/api';

interface CourseDetailPageProps {
  params: { id: string };
}

interface CourseDetails {
  id: string;
  course_code: string;
  course_code_description: string;
  course_description?: string;
  course_subject_area?: string;
  course_level?: string;
  cte_indicator?: string;
  ap_indicator?: string;
  ib_indicator?: string;
  certifications?: string[] | Array<{certification_area_code: string; certification_area_description: string}>;
  certification_codes?: string[];
}

export default function SimpleCourseDetail({ params }: CourseDetailPageProps) {
  const router = useRouter();
  const [course, setCourse] = useState<CourseDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadCourseDetails();
  }, [params.id]);

  const loadCourseDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if the ID is a UUID (contains hyphens) or a course code (numeric)
      const isUUID = params.id.includes('-');
      const apiEndpoint = isUUID 
        ? `${API_BASE_URL}/sced/courses/${params.id}`
        : `${API_BASE_URL}/sced/courses/code/${params.id}`;
      
      const response = await fetch(apiEndpoint, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();

      if (data.success && data.data.course) {
        setCourse(data.data.course);
      } else {
        setError(data.error?.message || 'Course not found');
      }
    } catch (err) {
      console.error('Failed to load course details:', err);
      setError(err instanceof Error ? err.message : 'Failed to load course details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-8">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Course</h3>
            <p className="text-gray-500 mb-6">{error || 'Course not found'}</p>
            <button
              onClick={() => router.back()}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              <ArrowLeftIcon className="h-4 w-4 mr-2" />
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <Link href="/sced" className="text-blue-600 hover:text-blue-700 text-sm mb-2 inline-block">
            ← Back to Course List
          </Link>
          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {course.course_code_description}
              </h1>
              <div className="flex items-center gap-3 mt-2">
                <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                  SCED Code: {course.course_code}
                </span>
                {(course.cte_indicator === 'Y' || course.cte_indicator === 'Yes') && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 text-green-800">
                    CTE
                  </span>
                )}
                {(course.ap_indicator === 'Y' || course.ap_indicator === 'Yes') && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                    AP
                  </span>
                )}
                {(course.ib_indicator === 'Y' || course.ib_indicator === 'Yes') && (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                    IB
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm">
          {/* Course Information */}
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <BookOpenIcon className="h-5 w-5 mr-2 text-gray-400" />
              Course Information
            </h2>
            
            {course.course_description && (
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Description</h3>
                <p className="text-gray-900">{course.course_description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              {course.course_subject_area && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Subject Area</h3>
                  <p className="text-gray-900">{course.course_subject_area}</p>
                </div>
              )}
              
              {course.course_level && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Course Level</h3>
                  <p className="text-gray-900">{course.course_level}</p>
                </div>
              )}
            </div>
          </div>

          {/* Required Certifications */}
          <div className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
              <AcademicCapIcon className="h-5 w-5 mr-2 text-gray-400" />
              Required Teacher Certifications
            </h2>

            {course.certifications && course.certifications.length > 0 ? (
              <div className="space-y-2">
                {course.certifications.map((cert, index) => {
                  // Handle both formats: string[] and object[]
                  const certName = typeof cert === 'string' ? cert : cert.certification_area_description;
                  const certCode = typeof cert === 'string' 
                    ? (course.certification_codes && course.certification_codes[index])
                    : cert.certification_area_code;
                  
                  return (
                    <div key={index} className="flex items-start p-3 bg-gray-50 rounded-lg">
                      <CheckCircleIcon className="h-5 w-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                      <div className="flex-1">
                        <p className="text-gray-900 font-medium">{certName}</p>
                        {certCode && (
                          <p className="text-sm text-gray-500 mt-1">
                            Code: {certCode}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 bg-gray-50 rounded-lg text-center">
                <AcademicCapIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                <p className="text-gray-500">
                  No specific certification requirements found for this course.
                </p>
                <p className="text-sm text-gray-400 mt-2">
                  This may be a general education course or requirements may vary by state.
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-6">
          <button
            onClick={() => router.back()}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            <ArrowLeftIcon className="h-4 w-4 mr-2" />
            Back to Search Results
          </button>
        </div>
      </div>
    </div>
  );
}