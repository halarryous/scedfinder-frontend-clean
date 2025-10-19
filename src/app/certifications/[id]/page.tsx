'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Certification, SCEDCourse } from '@/types';
import CourseCard from '@/components/Shared/CourseCard';
import { 
  AcademicCapIcon,
  HeartIcon,
  ArrowLeftIcon,
  BuildingOffice2Icon,
  ShieldCheckIcon,
  ClockIcon,
  TagIcon,
  ShareIcon,
  PrinterIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon,
  InformationCircleIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

interface CertificationDetailPageProps {
  params: { id: string };
}

export default function CertificationDetailPage({ params }: CertificationDetailPageProps) {
  const router = useRouter();
  const [certification, setCertification] = useState<Certification | null>(null);
  const [qualifiedCourses, setQualifiedCourses] = useState<{
    required: SCEDCourse[];
    preferred: SCEDCourse[];
    alternative: SCEDCourse[];
  }>({ required: [], preferred: [], alternative: [] });
  const [loading, setLoading] = useState(true);
  const [coursesLoading, setCoursesLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFavorite, setIsFavorite] = useState(false);
  const [favLoading, setFavLoading] = useState(false);

  useEffect(() => {
    loadCertificationDetails();
  }, [params.id]);

  const loadCertificationDetails = async () => {
    // This page is not implemented in the simplified version
    setError('Certification details page is not available');
    setLoading(false);
    setCoursesLoading(false);
  };


  const handleToggleFavorite = async () => {
    // Favorites feature removed - no auth system
  };

  const handleShare = async () => {
    // Share feature removed
  };

  const handlePrint = () => {
    window.print();
  };

  const getCertificationTypeColor = (type?: string) => {
    switch (type?.toLowerCase()) {
      case 'teaching':
        return 'bg-blue-100 text-blue-800';
      case 'industry':
        return 'bg-green-100 text-green-800';
      case 'cte':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (isActive: boolean) => {
    return isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800';
  };

  const getRenewalText = (renewalMonths?: number) => {
    if (!renewalMonths) return 'Not specified';
    const years = Math.floor(renewalMonths / 12);
    const months = renewalMonths % 12;
    
    if (years > 0 && months > 0) {
      return `Every ${years} year${years > 1 ? 's' : ''} and ${months} month${months > 1 ? 's' : ''}`;
    } else if (years > 0) {
      return `Every ${years} year${years > 1 ? 's' : ''}`;
    } else {
      return `Every ${months} month${months > 1 ? 's' : ''}`;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="animate-pulse">
            <div className="flex items-center mb-6">
              <div className="h-4 w-20 bg-gray-200 rounded"></div>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-8">
              <div className="h-8 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
              <div className="space-y-4">
                <div className="h-4 bg-gray-200 rounded w-full"></div>
                <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                <div className="h-4 bg-gray-200 rounded w-4/6"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <ExclamationTriangleIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Certification</h3>
            <p className="text-gray-500 mb-6">{error}</p>
            <div className="space-x-3">
              <button
                onClick={() => router.back()}
                className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                <ArrowLeftIcon className="h-4 w-4 mr-2" />
                Go Back
              </button>
              <button
                onClick={loadCertificationDetails}
                className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-secondary-600 text-sm font-medium text-white hover:bg-secondary-700"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!certification) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center py-12">
            <AcademicCapIcon className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Certification Not Found</h3>
            <p className="text-gray-500 mb-6">The requested certification could not be found.</p>
            <Link
              href="/certifications"
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm bg-secondary-600 text-sm font-medium text-white hover:bg-secondary-700"
            >
              <AcademicCapIcon className="h-4 w-4 mr-2" />
              Browse All Certifications
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
          <Link href="/certifications" className="hover:text-gray-700">
            Teacher Certifications
          </Link>
          <span>/</span>
          <span className="text-gray-900 font-medium">{certification.certification_code}</span>
        </nav>

        {/* Main Content */}
        <div className="bg-white rounded-lg shadow-sm">
          {/* Header */}
          <div className="px-6 py-8 sm:px-8 border-b border-gray-200">
            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-3 bg-secondary-50 rounded-lg">
                    <AcademicCapIcon className="h-8 w-8 text-secondary-600" />
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-gray-100 text-gray-800">
                      {certification.certification_code}
                    </span>
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
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-3">
                  {certification.certification_name}
                </h1>
                {certification.description && (
                  <p className="text-lg text-gray-600 leading-relaxed">
                    {certification.description}
                  </p>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center space-x-3">
                <button
                  onClick={handleShare}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <ShareIcon className="h-4 w-4 mr-2" />
                  Share
                </button>
                
                <button
                  onClick={handlePrint}
                  className="inline-flex items-center px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
                >
                  <PrinterIcon className="h-4 w-4 mr-2" />
                  Print
                </button>

              </div>
            </div>
          </div>

          {/* Certification Details */}
          <div className="px-6 py-8 sm:px-8">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Left Column */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Certification Information</h3>
                  <div className="space-y-4">
                    {certification.issuing_authority && (
                      <div className="flex items-center">
                        <BuildingOffice2Icon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500">Issuing Authority</span>
                          <p className="text-gray-900">{certification.issuing_authority}</p>
                        </div>
                      </div>
                    )}

                    {certification.renewal_period_months && (
                      <div className="flex items-center">
                        <ClockIcon className="h-5 w-5 text-gray-400 mr-3" />
                        <div>
                          <span className="text-sm font-medium text-gray-500">Renewal Period</span>
                          <p className="text-gray-900">{getRenewalText(certification.renewal_period_months)}</p>
                        </div>
                      </div>
                    )}

                    {certification.requirements && (
                      <div>
                        <span className="text-sm font-medium text-gray-500">Requirements</span>
                        <div className="mt-1 text-gray-900 text-sm whitespace-pre-line">
                          {certification.requirements}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Subject Areas */}
                {certification.subject_areas && certification.subject_areas.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Subject Areas</h4>
                    <div className="flex flex-wrap gap-2">
                      {certification.subject_areas.map((subject, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-secondary-50 text-secondary-800"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Grade Levels */}
                {certification.grade_levels && certification.grade_levels.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Grade Levels</h4>
                    <div className="flex flex-wrap gap-2">
                      {certification.grade_levels.map((grade, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-primary-50 text-primary-800"
                        >
                          {grade}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Endorsements */}
                {certification.endorsements && certification.endorsements.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-900 mb-3">Endorsements</h4>
                    <div className="flex flex-wrap gap-2">
                      {certification.endorsements.map((endorsement, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-medium bg-yellow-50 text-yellow-800"
                        >
                          {endorsement}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Right Column - Qualified Courses */}
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Qualified SCED Courses</h3>
                  
                  {coursesLoading ? (
                    <div className="space-y-4">
                      {[...Array(2)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-4 bg-gray-200 rounded w-1/3 mb-2"></div>
                          <div className="h-20 bg-gray-200 rounded"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-6">
                      {/* Required for Courses */}
                      {qualifiedCourses.required.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-green-700 mb-3 flex items-center">
                            <CheckCircleIcon className="h-4 w-4 mr-2" />
                            Required for Courses ({qualifiedCourses.required.length})
                          </h4>
                          <div className="space-y-3">
                            {qualifiedCourses.required.map((course) => (
                              <div key={course.id} className="border border-green-200 rounded-lg">
                                <CourseCard
                                  course={course}
                                  showFavoriteButton={false}
                                  className="border-none shadow-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Preferred for Courses */}
                      {qualifiedCourses.preferred.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-blue-700 mb-3 flex items-center">
                            <InformationCircleIcon className="h-4 w-4 mr-2" />
                            Preferred for Courses ({qualifiedCourses.preferred.length})
                          </h4>
                          <div className="space-y-3">
                            {qualifiedCourses.preferred.map((course) => (
                              <div key={course.id} className="border border-blue-200 rounded-lg">
                                <CourseCard
                                  course={course}
                                  showFavoriteButton={false}
                                  className="border-none shadow-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Alternative for Courses */}
                      {qualifiedCourses.alternative.length > 0 && (
                        <div>
                          <h4 className="text-sm font-semibold text-yellow-700 mb-3 flex items-center">
                            <ExclamationTriangleIcon className="h-4 w-4 mr-2" />
                            Alternative for Courses ({qualifiedCourses.alternative.length})
                          </h4>
                          <div className="space-y-3">
                            {qualifiedCourses.alternative.map((course) => (
                              <div key={course.id} className="border border-yellow-200 rounded-lg">
                                <CourseCard
                                  course={course}
                                  showFavoriteButton={false}
                                  className="border-none shadow-none"
                                />
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* No Courses */}
                      {qualifiedCourses.required.length === 0 && 
                       qualifiedCourses.preferred.length === 0 && 
                       qualifiedCourses.alternative.length === 0 && (
                        <div className="text-center py-8 border border-gray-200 rounded-lg bg-gray-50">
                          <BookOpenIcon className="h-8 w-8 text-gray-300 mx-auto mb-2" />
                          <p className="text-sm text-gray-500">
                            No SCED courses found for this certification.
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Back Button */}
        <div className="mt-8">
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