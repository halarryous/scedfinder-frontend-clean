'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Certification } from '@/types';
import { useAuth } from '@/contexts/AuthContext';
import { userApi } from '@/lib/api-services';
import { 
  AcademicCapIcon,
  HeartIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ClockIcon,
  TagIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import toast from 'react-hot-toast';

interface CertificationCardProps {
  certification: Certification;
  showFavoriteButton?: boolean;
  isFavorite?: boolean;
  onFavoriteToggle?: (certificationId: string, isFavorite: boolean) => void;
  className?: string;
}

export default function CertificationCard({ 
  certification, 
  showFavoriteButton = true, 
  isFavorite = false,
  onFavoriteToggle,
  className = '' 
}: CertificationCardProps) {
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
        toast.success('Removed from favorites');
        setFavoriteState(false);
        onFavoriteToggle?.(certification.id, false);
      } else {
        await userApi.addToFavorites({
          favorite_type: 'certification',
          item_id: certification.id,
        });
        toast.success('Added to favorites');
        setFavoriteState(true);
        onFavoriteToggle?.(certification.id, true);
      }
    } catch (error: any) {
      const message = error.response?.data?.error?.message || 'Failed to update favorites';
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  const getCertificationTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'teaching':
        return 'bg-blue-100 text-blue-800';
      case 'industry':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  return (
    <Link href={`/certifications/${certification.id}`} className={`block ${className}`}>
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow p-4 h-full">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-secondary-50 rounded-md">
              <AcademicCapIcon className="h-5 w-5 text-secondary-600" />
            </div>
            <div className="flex-1 min-w-0">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-800">
                {certification.certification_code}
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
        <h3 className="text-lg font-medium text-gray-900 mb-2 line-clamp-2 hover:text-secondary-600 transition-colors">
          {certification.certification_name}
        </h3>

        {/* Description */}
        {certification.description && (
          <p className="text-sm text-gray-600 mb-3 line-clamp-3">
            {certification.description}
          </p>
        )}

        {/* Metadata */}
        <div className="space-y-2">
          {/* Issuing Authority */}
          {certification.issuing_authority && (
            <div className="flex items-center text-sm text-gray-500">
              <BuildingOffice2Icon className="h-4 w-4 mr-2" />
              <span className="truncate">{certification.issuing_authority}</span>
            </div>
          )}

          {/* Status and Type */}
          <div className="flex items-center space-x-2">
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(certification.is_active)}`}>
              <ShieldCheckIcon className="h-3 w-3 mr-1" />
              {certification.is_active ? 'Active' : 'Inactive'}
            </span>
            
            {certification.certification_type && (
              <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCertificationTypeColor(certification.certification_type)}`}>
                <TagIcon className="h-3 w-3 mr-1" />
                {certification.certification_type}
              </span>
            )}
          </div>

          {/* Renewal Period */}
          {certification.renewal_period_months && (
            <div className="flex items-center text-sm text-gray-500">
              <ClockIcon className="h-4 w-4 mr-2" />
              <span>Renews every {Math.floor(certification.renewal_period_months / 12)} years</span>
            </div>
          )}
        </div>

        {/* Subject Areas */}
        {certification.subject_areas && certification.subject_areas.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-xs font-medium text-gray-500 mb-2">Subject Areas:</p>
            <div className="flex flex-wrap gap-1">
              {certification.subject_areas.slice(0, 3).map((subject, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-secondary-50 text-secondary-700"
                >
                  {subject}
                </span>
              ))}
              {certification.subject_areas.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500">
                  +{certification.subject_areas.length - 3} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Grade Levels */}
        {certification.grade_levels && certification.grade_levels.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Grade Levels:</p>
            <div className="flex flex-wrap gap-1">
              {certification.grade_levels.map((grade, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-primary-50 text-primary-700"
                >
                  {grade}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Endorsements */}
        {certification.endorsements && certification.endorsements.length > 0 && (
          <div className="mt-2">
            <p className="text-xs font-medium text-gray-500 mb-1">Endorsements:</p>
            <div className="flex flex-wrap gap-1">
              {certification.endorsements.slice(0, 2).map((endorsement, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-50 text-yellow-700"
                >
                  {endorsement}
                </span>
              ))}
              {certification.endorsements.length > 2 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-50 text-gray-500">
                  +{certification.endorsements.length - 2} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </Link>
  );
}