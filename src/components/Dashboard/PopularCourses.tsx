'use client';

import { useRouter } from 'next/navigation';
import { SCEDCourse } from '@/types';
import { 
  BookOpenIcon, 
  ArrowTopRightOnSquareIcon,
  HashtagIcon,
  AcademicCapIcon,
} from '@heroicons/react/24/outline';

interface PopularCoursesProps {
  courses: SCEDCourse[];
  loading: boolean;
}

export default function PopularCourses({ courses, loading }: PopularCoursesProps) {
  const router = useRouter();

  const handleCourseClick = (course: SCEDCourse) => {
    router.push(`/sced/${course.id}`);
  };

  if (loading) {
    return (
      <div className="bg-white shadow rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-gray-900 mb-4">
            Popular Courses
          </h3>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-start space-x-3">
                  <div className="h-8 w-8 bg-gray-200 rounded"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2 mt-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/3 mt-1"></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            Popular Courses
          </h3>
          <BookOpenIcon className="h-5 w-5 text-gray-400" />
        </div>

        {courses.length === 0 ? (
          <div className="text-center py-8">
            <BookOpenIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-sm text-gray-500">No courses available</p>
            <p className="text-xs text-gray-400 mt-1">
              Check back later for popular course recommendations
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div
                key={course.id}
                onClick={() => handleCourseClick(course)}
                className="group flex items-start justify-between p-3 rounded-md hover:bg-gray-50 cursor-pointer border border-transparent hover:border-gray-200 transition-colors"
              >
                <div className="flex items-start space-x-3 flex-1 min-w-0">
                  <div className="p-2 bg-primary-50 rounded-md group-hover:bg-primary-100">
                    <BookOpenIcon className="h-5 w-5 text-primary-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-medium text-gray-900 group-hover:text-primary-600 transition-colors">
                      {course.course_code_description}
                    </h4>
                    <div className="flex items-center space-x-2 mt-1">
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-800">
                        {course.course_code}
                      </span>
                      {course.course_subject_area && (
                        <span className="flex items-center text-xs text-gray-500">
                          <HashtagIcon className="h-3 w-3 mr-1" />
                          {course.course_subject_area}
                        </span>
                      )}
                    </div>
                    {course.course_description && (
                      <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                        {course.course_description}
                      </p>
                    )}
                    <div className="flex items-center space-x-4 mt-2">
                      {course.course_level && (
                        <span className="flex items-center text-xs text-gray-500">
                          <AcademicCapIcon className="h-3 w-3 mr-1" />
                          {course.course_level}
                        </span>
                      )}
                      {course.cte_indicator === 'Yes' && (
                        <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                          CTE
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <ArrowTopRightOnSquareIcon className="h-4 w-4 text-gray-400 group-hover:text-primary-600 opacity-0 group-hover:opacity-100 transition-opacity ml-2 flex-shrink-0" />
              </div>
            ))}
          </div>
        )}

        {courses.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-100">
            <button
              onClick={() => router.push('/sced')}
              className="text-sm text-primary-600 hover:text-primary-500 font-medium"
            >
              Browse all SCED courses →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}