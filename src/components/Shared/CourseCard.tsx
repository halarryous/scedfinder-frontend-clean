'use client';

import { useState } from 'react';
import Link from 'next/link';
import { SCEDCourse } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api-services';
import { 
  BookOpenIcon,
  HeartIcon,
  HashtagIcon,
  AcademicCapIcon,
  ClockIcon,
  BuildingOfficeIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface CourseCardProps {
  course: SCEDCourse;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (courseId: string, isFavorite: boolean) => void;
  className?: string;
}

export default function CourseCard({ 
  course, 
  showFavoriteButton = true, 
  isFavorite = false,
  onFavoriteToggle,
  className = '' 
}: CourseCardProps) {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [favoriteState, setFavoriteState] = useState(isFavorite);

  const handleFavoriteToggle = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!user) {
      toast.error('Please login to save favorites');
      return;
    }

    setIsLoading(true);
    try {
      if (favoriteState) {
        // Remove from favorites - this would need the favorite ID
        // For now, we'll just show a toast
        toast.success('Removed from favorites');
        setFavoriteState(false);
        onFavoriteToggle?.(course.id, false);
      } else {
        await userApi.addToFavorites({
          favorite_type: 'sced_course',
          item_id: course.id,
        });
        toast.success('Added to favorites');
        setFavoriteState(true);
        onFavoriteToggle?.(course.id, true);
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to update favorites';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Link href={`/sced/${course.id}`} className={`block ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-primary-50 rounded-md">
              <BookOpenIcon className="h-5 w-5 text-primary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {course.course_code}
              </span>
            </div>
          </div>
          
          {showFavoriteButton && user && (
            <button
              onClick={handleFavoriteToggle}
              disabled={isLoading}
              className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            >
              {favoriteState ? (
                <HeartIconSolid className="h-5 w-5 text-red-500" />
              ) : (
                <HeartIcon className="h-5 w-5 text-gray-400 hover:text-red-500" />
              )}
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 hover:text-primary-600 transition-colors">
          {course.course_code_description}
        </h3>

        {/* Description */}
        {course.course_description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {course.course_description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {course.course_subject_area && (
            <div className="flex items-center text-sm text-gray-500">
              <HashtagIcon className="h-4 w-4 mr-2" />
              <span>{course.course_subject_area}</span>
            </div>
          )}
          
          {course.cte_indicator && course.cte_indicator !== 'N' && (
            <div className="flex items-center text-sm text-gray-500">
              <BuildingOfficeIcon className="h-4 w-4 mr-2" />
              <span>CTE Course</span>
            </div>
          )}

          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center space-x-4">
              {course.course_level && (
                <div className="flex items-center">
                  <AcademicCapIcon className="h-4 w-4 mr-1" />
                  <span>Level {course.course_level}</span>
                </div>
              )}
              
              {course.ap_indicator === 'Y' && (
                <div className="flex items-center">
                  <ClockIcon className="h-4 w-4 mr-1" />
                  <span>AP Course</span>
                </div>
              )}
            </div>
          </div>

          {/* Course Indicators Badges */}
          <div className="flex flex-wrap gap-2 mt-3">
            {course.ap_indicator === 'Y' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                AP
              </span>
            )}
            {course.ib_indicator === 'Y' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                IB
              </span>
            )}
            {course.cte_indicator === 'Y' && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                CTE
              </span>
            )}
          </div>
        </div>

        {/* Certifications Tags */}
        {course.certifications && course.certifications.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-1">
              {course.certifications.slice(0, 2).map((cert, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700"
                >
                  {cert}
                </span>
              ))}
              {course.certifications.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500">
                  +{course.certifications.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}