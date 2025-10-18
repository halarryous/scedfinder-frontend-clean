'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DashboardLayout from '@/components/Layout/DashboardLayout';
import SearchBar from '@/components/Search/SearchBar';
import QuickStats from '@/components/Dashboard/QuickStats';
import RecentSearches from '@/components/Dashboard/RecentSearches';
import PopularCourses from '@/components/Dashboard/PopularCourses';
import { searchApi, scedApi, certificationApi } from '@/lib/api-services';
import { SearchHistory, SCEDCourse, Certification } from '@/types';
import toast from 'react-hot-toast';

export default function DashboardPage() {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<SearchHistory[]>([]);
  const [popularCourses, setPopularCourses] = useState<SCEDCourse[]>([]);
  const [stats, setStats] = useState({
    totalCourses: 0,
    totalCertifications: 0,
    totalSearches: 0,
    favoriteCount: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    setIsLoading(true);
    try {
      // Load popular courses (skip search history since no authentication)
      try {
        const coursesResponse = await scedApi.getCourses(1, 5);
        if (coursesResponse.success) {
          setPopularCourses(coursesResponse.data);
        }
      } catch (error) {
        console.error('Failed to load popular courses:', error);
      }

      // Load stats
      try {
        const [coursesData, certsData] = await Promise.all([
          scedApi.getCourses(1, 1),
          certificationApi.getCertifications(1, 1),
        ]);

        setStats({
          totalCourses: coursesData.pagination?.total || 0,
          totalCertifications: certsData.pagination?.total || 0,
          totalSearches: 0, // Skip search history without auth
          favoriteCount: 0, // Skip favorites without auth
        });
      } catch (error) {
        console.error('Failed to load stats:', error);
      }
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      toast.error('Failed to load dashboard data');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="mt-1 text-sm text-gray-500">
            Search SCED codes and certifications for Career and Technical Education
          </p>
        </div>

        {/* Search Bar */}
        <div className="bg-white shadow rounded-lg p-6">
          <SearchBar />
        </div>

        {/* Quick Stats */}
        <QuickStats stats={stats} loading={isLoading} />

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {/* Recent Searches */}
          <RecentSearches searches={recentSearches} loading={isLoading} />

          {/* Popular Courses */}
          <PopularCourses courses={popularCourses} loading={isLoading} />
        </div>

        {/* Quick Actions */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <button
              onClick={() => router.push('/teacher-lookup')}
              className="btn-primary"
            >
              Teacher Lookup
            </button>
            <button
              onClick={() => router.push('/search')}
              className="btn-secondary"
            >
              Advanced Search
            </button>
            <button
              onClick={() => router.push('/sced')}
              className="btn-secondary"
            >
              Browse SCED Codes
            </button>
            <button
              onClick={() => router.push('/certifications')}
              className="btn-secondary"
            >
              View Certifications
            </button>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}