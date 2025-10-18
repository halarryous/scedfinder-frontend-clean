'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import { API_BASE_URL } from '@/lib/api';

interface TeacherCertification {
  name: string;
  code?: string;
  area: string;
  status: string;
  issueDate?: string;
  expirationDate?: string;
  certificationLevel?: string;
  raw?: string;
}

interface SCEDCourse {
  course_code: string;
  course_code_description: string;
  course_subject_area: string;
  cte_indicator: string;
  certification_area_description: string;
}

interface SCEDCoursesResult {
  success: boolean;
  data?: {
    certification: string;
    scedCourses: SCEDCourse[];
    matchingStrategies: string[];
    totalFound: number;
  };
  error?: string;
}

interface TeacherLookupResult {
  name?: string;
  certifications?: TeacherCertification[];
  teacher?: {
    name: string;
    certifications: TeacherCertification[];
  };
  processingTime?: number;
  enhancedData?: {
    searchMethod: string;
    timestamp: string;
    rateLimit: string;
  };
  parsedName: {
    firstName: string;
    lastName: string;
    middleInitial?: string;
    confidence: number;
  };
  success?: boolean;
  error?: string;
  suggestions?: string[];
}

export default function TeacherLookupPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [teacherName, setTeacherName] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResult, setSearchResult] = useState<TeacherLookupResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showNameVariations, setShowNameVariations] = useState(false);
  const [nameVariations, setNameVariations] = useState<any>(null);
  const [scedCoursesModal, setSCEDCoursesModal] = useState<{
    isOpen: boolean;
    certification: string;
    courses: SCEDCourse[];
    matchingStrategies: string[];
    totalFound: number;
    isLoading: boolean;
    error: string | null;
  }>({
    isOpen: false,
    certification: '',
    courses: [],
    matchingStrategies: [],
    totalFound: 0,
    isLoading: false,
    error: null
  });
  
  // Get token from localStorage
  const [token, setToken] = useState<string | null>(null);
  
  React.useEffect(() => {
    const storedToken = localStorage.getItem('token');
    setToken(storedToken);
  }, [user]);

  // Check authentication
  React.useEffect(() => {
    if (!user) {
      router.push('/login');
    }
  }, [user, router]);

  const handleSearch = async () => {
    console.log('Search clicked. Teacher name:', teacherName, 'Token exists:', !!token);
    
    if (!teacherName.trim()) {
      console.log('No teacher name provided');
      return;
    }
    
    if (!token) {
      console.log('No token available');
      setError('Please login to search for teachers');
      return;
    }

    setIsSearching(true);
    setError(null);
    setSearchResult(null);

    console.log('Making API call to:', `${API_BASE_URL}/enhanced/lookup`);
    
    try {
      const response = await fetch(`${API_BASE_URL}/enhanced/lookup`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ fullName: teacherName.trim() }),
      });

      console.log('API Response status:', response.status);
      const data = await response.json();
      console.log('API Response data:', data);

      if (data.success && data.data) {
        console.log('Setting search result:', data.data);
        setSearchResult(data.data);
        
        // If the inner data has an error and suggestions, show them
        if (data.data.success === false && data.data.error) {
          console.log('Suggestions found:', data.data.suggestions);
          setError(data.data.error);
        }
      } else {
        console.log('No data found or error:', data.error);
        setError(data.error || 'No certifications found for this teacher');
      }
    } catch (err) {
      console.error('Search error:', err);
      setError('Failed to search teacher certifications. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const checkNameVariations = async () => {
    if (!teacherName.trim() || !token) {
      if (!token) {
        setError('Please login to check name variations');
      }
      return;
    }

    try {
      const response = await fetch(
        `${API_BASE_URL}/teacher-lookup/name-variations?fullName=${encodeURIComponent(teacherName)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        setNameVariations(data.data);
        setShowNameVariations(true);
      }
    } catch (err) {
      console.error('Name variations error:', err);
    }
  };

  const findSCEDCourses = async (certificationName: string) => {
    if (!token) {
      setSCEDCoursesModal(prev => ({ ...prev, error: 'Please login to view SCED courses' }));
      return;
    }

    setSCEDCoursesModal(prev => ({
      ...prev,
      isOpen: true,
      certification: certificationName,
      isLoading: true,
      error: null,
      courses: [],
      matchingStrategies: [],
      totalFound: 0
    }));

    try {
      const response = await fetch(`${API_BASE_URL}/enhanced/certification/sced-courses`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ certificationName }),
      });

      const data: SCEDCoursesResult = await response.json();
      
      if (data.success && data.data) {
        setSCEDCoursesModal(prev => ({
          ...prev,
          courses: data.data?.scedCourses || [],
          matchingStrategies: data.data?.matchingStrategies || [],
          totalFound: data.data?.totalFound || 0,
          isLoading: false
        }));
      } else {
        setSCEDCoursesModal(prev => ({
          ...prev,
          error: data.error || 'Failed to find SCED courses for this certification',
          isLoading: false
        }));
      }
    } catch (err) {
      console.error('SCED courses error:', err);
      setSCEDCoursesModal(prev => ({
        ...prev,
        error: 'Failed to load SCED courses. Please try again.',
        isLoading: false
      }));
    }
  };

  const closeSCEDModal = () => {
    setSCEDCoursesModal({
      isOpen: false,
      certification: '',
      courses: [],
      matchingStrategies: [],
      totalFound: 0,
      isLoading: false,
      error: null
    });
  };

  const getExpirationStatus = (expirationDate?: string) => {
    if (!expirationDate) return null;

    const expDate = new Date(expirationDate);
    const now = new Date();
    const daysUntilExpiration = Math.ceil((expDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiration < 0) {
      return { text: 'Expired', className: 'text-red-600 bg-red-50' };
    } else if (daysUntilExpiration <= 30) {
      return { text: `Expires in ${daysUntilExpiration} days`, className: 'text-red-600 bg-red-50' };
    } else if (daysUntilExpiration <= 90) {
      return { text: `Expires in ${daysUntilExpiration} days`, className: 'text-yellow-600 bg-yellow-50' };
    } else if (daysUntilExpiration <= 180) {
      return { text: `Expires in ${daysUntilExpiration} days`, className: 'text-blue-600 bg-blue-50' };
    }
    return { text: `Valid until ${expDate.toLocaleDateString()}`, className: 'text-green-600 bg-green-50' };
  };

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Teacher Certification Lookup</h1>
          <p className="mt-2 text-gray-600">
            Search for a teacher by name to view their certifications and applicable SCED courses
          </p>
        </div>

        {/* Search Form */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="space-y-4">
            <div>
              <label htmlFor="teacher-name" className="block text-sm font-medium text-gray-700">
                Teacher Full Name
              </label>
              <div className="mt-1 flex gap-2">
                <input
                  type="text"
                  id="teacher-name"
                  value={teacherName}
                  onChange={(e) => setTeacherName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Enter first and last name (e.g., John Smith)"
                  className="flex-1 rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                />
                <button
                  onClick={checkNameVariations}
                  className="px-3 py-2 text-sm border border-gray-300 rounded-md hover:bg-gray-50"
                  title="Check how the name will be parsed"
                >
                  🔍 Parse
                </button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                🔍 Real NYSED integration active - Try: John Smith, Mary Johnson, or any NY State certified teacher name
              </p>
            </div>

            <button
              onClick={handleSearch}
              disabled={!teacherName.trim() || isSearching}
              className="w-full bg-indigo-600 text-white px-4 py-2 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? 'Searching...' : 'Search Teacher Certifications'}
            </button>
          </div>
        </div>

        {/* Name Variations Preview */}
        {showNameVariations && nameVariations && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-blue-900 mb-2">Name Parsing Preview</h3>
            <p className="text-sm text-blue-800 mb-2">
              Original: <span className="font-mono">{nameVariations.originalName}</span>
            </p>
            <p className="text-sm text-blue-800 mb-2">
              Parsed: First: <span className="font-semibold">{nameVariations.parsedName.firstName}</span>,
              {nameVariations.parsedName.middleInitial && (
                <> M.I.: <span className="font-semibold">{nameVariations.parsedName.middleInitial}</span>,</>
              )}
              {' '}Last: <span className="font-semibold">{nameVariations.parsedName.lastName}</span>
              {' '}(Confidence: {Math.round(nameVariations.parsedName.confidence * 100)}%)
            </p>
            <button
              onClick={() => setShowNameVariations(false)}
              className="text-xs text-blue-600 hover:text-blue-800"
            >
              Hide
            </button>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            {searchResult?.suggestions && searchResult.suggestions.length > 0 && (
              <div className="mt-4">
                <p className="text-sm font-medium text-red-800">Did you mean one of these?</p>
                <div className="mt-2 space-y-1">
                  {searchResult.suggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      onClick={() => setTeacherName(suggestion)}
                      className="block text-sm text-blue-600 hover:text-blue-800 hover:underline"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
            <ul className="mt-2 text-sm text-red-700 list-disc list-inside">
              <li>Check the spelling of the name</li>
              <li>Try using only first and last name</li>
              <li>Remember: only teachers certified after 1983 appear in the database</li>
            </ul>
          </div>
        )}

        {/* Search Results */}
        {searchResult && (
          <div className="space-y-6">
            {/* Teacher Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Teacher Information</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Name Found</p>
                  <p className="font-semibold">
                    {searchResult.teacher?.name || searchResult.name || 'No teacher data'}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Parse Confidence</p>
                  <p className="font-semibold">
                    {searchResult.parsedName?.confidence ? Math.round(searchResult.parsedName.confidence * 100) : 'N/A'}%
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Processing Time</p>
                  <p className="font-semibold">
                    {searchResult.processingTime ? `${(searchResult.processingTime / 1000).toFixed(1)}s` : 'N/A'}
                  </p>
                </div>
              </div>
              {searchResult.enhancedData && (
                <div className="mt-4 p-3 bg-green-50 rounded-lg">
                  <p className="text-sm text-green-800">
                    ✅ Enhanced lookup using {searchResult.enhancedData.searchMethod} method
                    <span className="text-xs block mt-1 text-green-600">
                      Rate limit: {searchResult.enhancedData.rateLimit}
                    </span>
                  </p>
                </div>
              )}
            </div>

            {/* Certifications */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">
                Certifications ({(searchResult.teacher?.certifications || searchResult.certifications || []).length})
              </h2>
              <div className="space-y-3">
                {(searchResult.teacher?.certifications || searchResult.certifications || []).map((cert, index) => {
                  const expStatus = getExpirationStatus(cert.expirationDate);
                  return (
                    <div key={index} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900">{cert.name}</h3>
                          <div className="mt-2 space-y-1">
                            <div className="flex items-center gap-4">
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                {cert.area}
                              </span>
                              {cert.certificationLevel && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                                  {cert.certificationLevel}
                                </span>
                              )}
                            </div>
                            {cert.code && (
                              <p className="text-xs text-gray-500">Code: <span className="font-mono">{cert.code}</span></p>
                            )}
                          </div>
                        </div>
                        <div className="text-right ml-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            cert.status === 'Active' ? 'bg-green-100 text-green-800' : 
                            cert.status === 'Expired' ? 'bg-red-100 text-red-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {cert.status}
                          </span>
                          {expStatus && (
                            <div className={`mt-2 px-2 py-1 rounded text-xs ${expStatus.className}`}>
                              {expStatus.text}
                            </div>
                          )}
                        </div>
                        <div className="ml-4 flex flex-col gap-2">
                          <button
                            onClick={() => findSCEDCourses(cert.name)}
                            className="px-3 py-1 bg-indigo-600 text-white text-xs rounded-md hover:bg-indigo-700 transition-colors"
                            title="View SCED courses that can be taught with this certification"
                          >
                            View SCED Courses
                          </button>
                        </div>
                      </div>
                      
                      {/* Dates Section */}
                      {(cert.issueDate || cert.expirationDate) && (
                        <div className="border-t pt-3 mt-3">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                            {cert.issueDate && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                                <span className="text-gray-600">Issued:</span>
                                <span className="ml-2 font-medium">{cert.issueDate}</span>
                              </div>
                            )}
                            {cert.expirationDate && (
                              <div className="flex items-center">
                                <svg className="w-4 h-4 mr-2 text-orange-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <span className="text-gray-600">Expires:</span>
                                <span className="ml-2 font-medium">{cert.expirationDate}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                      
                      {/* Debug: Raw data (only in dev) */}
                      {process.env.NODE_ENV === 'development' && cert.raw && (
                        <details className="mt-3 text-xs">
                          <summary className="text-gray-500 cursor-pointer">Raw NYSED Data</summary>
                          <pre className="mt-2 p-2 bg-gray-100 rounded text-xs overflow-x-auto">{cert.raw}</pre>
                        </details>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Enhanced Features */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Enhanced Features Available</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-blue-50 rounded-lg">
                  <h3 className="font-semibold text-blue-900">🚀 Batch Processing</h3>
                  <p className="text-sm text-blue-700 mt-1">
                    Process multiple teachers at once with CSV upload
                  </p>
                  <Link href="/bulk-verification" className="text-blue-600 text-xs hover:underline">
                    Go to Bulk Verification →
                  </Link>
                </div>
                <div className="p-4 bg-green-50 rounded-lg">
                  <h3 className="font-semibold text-green-900">⚡ Real NYSED Data</h3>
                  <p className="text-sm text-green-700 mt-1">
                    Live scraping from NY State Education Department
                  </p>
                  <p className="text-green-600 text-xs mt-1">
                    Includes retry logic and caching
                  </p>
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="bg-white rounded-lg shadow p-6">
              <h2 className="text-xl font-semibold mb-4">Next Steps</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">Find SCED Courses</h3>
                    <p className="text-sm text-gray-600">Search for courses this teacher can teach</p>
                  </div>
                  <Link href="/sced" className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm hover:bg-indigo-700">
                    Browse SCED →
                  </Link>
                </div>
                <div className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <h3 className="font-semibold">View All Certifications</h3>
                    <p className="text-sm text-gray-600">Browse NY State certification database</p>
                  </div>
                  <Link href="/certifications" className="bg-green-600 text-white px-4 py-2 rounded-md text-sm hover:bg-green-700">
                    Browse Certs →
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCED Courses Modal */}
        {scedCoursesModal.isOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
              {/* Modal Header */}
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">
                      SCED Courses for Certification
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {scedCoursesModal.certification}
                    </p>
                  </div>
                  <button
                    onClick={closeSCEDModal}
                    className="text-gray-400 hover:text-gray-600 text-2xl"
                  >
                    ×
                  </button>
                </div>
                
                {scedCoursesModal.matchingStrategies.length > 0 && (
                  <div className="mt-3 p-3 bg-blue-50 rounded-md">
                    <p className="text-sm text-blue-800">
                      <strong>Matching Strategy:</strong> {scedCoursesModal.matchingStrategies.join(', ')}
                    </p>
                    {scedCoursesModal.totalFound > 0 && (
                      <p className="text-sm text-blue-600 mt-1">
                        Found {scedCoursesModal.totalFound} SCED courses
                        {scedCoursesModal.totalFound > 25 && ' (showing first 25)'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Modal Body */}
              <div className="p-6 overflow-y-auto max-h-[60vh]">
                {scedCoursesModal.isLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <div className="text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
                      <p className="text-gray-600">Finding SCED courses...</p>
                    </div>
                  </div>
                ) : scedCoursesModal.error ? (
                  <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-800">{scedCoursesModal.error}</p>
                  </div>
                ) : scedCoursesModal.courses.length > 0 ? (
                  <div className="space-y-3">
                    {scedCoursesModal.courses.map((course, index) => (
                      <div key={index} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <span className="text-lg font-semibold text-indigo-700">
                                {course.course_code}
                              </span>
                              {course.cte_indicator === 'Yes' && (
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                  CTE
                                </span>
                              )}
                            </div>
                            <h3 className="font-medium text-gray-900 mb-1">
                              {course.course_code_description}
                            </h3>
                            <div className="text-sm text-gray-600">
                              <p><strong>Subject Area:</strong> {course.course_subject_area}</p>
                              {course.certification_area_description && (
                                <p><strong>Required Certification:</strong> {course.certification_area_description}</p>
                              )}
                            </div>
                          </div>
                          <div className="ml-4">
                            <a
                              href={`/sced/${course.course_code}`}
                              target="_blank"
                              className="text-indigo-600 hover:text-indigo-800 text-sm font-medium"
                            >
                              View Details →
                            </a>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <p className="text-gray-600">No SCED courses found for this certification.</p>
                    <p className="text-sm text-gray-500 mt-2">
                      This certification may not have direct course mappings in our database.
                    </p>
                  </div>
                )}
              </div>

              {/* Modal Footer */}
              <div className="p-6 border-t border-gray-200">
                <div className="flex justify-between items-center">
                  <div className="text-sm text-gray-500">
                    {scedCoursesModal.courses.length > 0 && (
                      <>Showing {scedCoursesModal.courses.length} of {scedCoursesModal.totalFound} courses</>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={closeSCEDModal}
                      className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                    >
                      Close
                    </button>
                    {scedCoursesModal.courses.length > 0 && (
                      <a
                        href={`/sced?search=${encodeURIComponent(scedCoursesModal.certification)}`}
                        target="_blank"
                        className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors"
                      >
                        Browse All in SCED Search
                      </a>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}