/**
 * ProgramMetrics Component Usage Examples
 * 
 * This file demonstrates how to integrate the ProgramMetrics component
 * into the SCED Finder application following the established patterns.
 */

'use client';

import { useEffect, useState } from 'react';
import ProgramMetrics from './ProgramMetrics';
import { ProgramMetricsData } from '@/types';

// Example 1: Basic usage in Dashboard
export function DashboardWithProgramMetrics() {
  const [isLoading, setIsLoading] = useState(true);
  const [programData, setProgramData] = useState<ProgramMetricsData | null>(null);

  useEffect(() => {
    // Simulate data loading
    const loadProgramData = async () => {
      setIsLoading(true);
      
      // In a real implementation, this would fetch from your API
      // Example: const response = await api.getProgramMetrics();
      
      setTimeout(() => {
        setProgramData({
          totalCourses: 1247,
          cteCourses: 289,
          requiredCertifications: 34,
          optionalCertifications: 18,
          completionRate: 87.5,
          enrollmentCount: 2156,
          pathwayPrograms: 12,
          avgCourseLevel: 2.3,
          recentActivity: 156,
        });
        setIsLoading(false);
      }, 1000);
    };

    loadProgramData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Existing dashboard content */}
      
      {/* Add ProgramMetrics component */}
      <ProgramMetrics
        programType="all"
        metrics={programData || undefined}
        loading={isLoading}
        className="mt-6"
      />
    </div>
  );
}

// Example 2: CTE-focused metrics for CTE programs page
export function CTEProgramMetrics() {
  const [metrics, setMetrics] = useState({
    totalCourses: 1247,
    cteCourses: 289,
    requiredCertifications: 34,
    optionalCertifications: 18,
    completionRate: 87.5,
    enrollmentCount: 2156,
    pathwayPrograms: 12,
    avgCourseLevel: 2.3,
    recentActivity: 156,
  });

  return (
    <ProgramMetrics
      programType="cte"
      subjectArea="Business & Technology"
      metrics={metrics || undefined}
      loading={false}
    />
  );
}

// Example 3: Subject-specific metrics
export function SubjectAreaMetrics({ subjectArea }: { subjectArea: string }) {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState<ProgramMetricsData | null>(null);

  useEffect(() => {
    const fetchSubjectMetrics = async () => {
      setLoading(true);
      try {
        // In real implementation:
        // const response = await api.getSubjectAreaMetrics(subjectArea);
        // setMetrics(response.data);
        
        // Mock data for demo
        setTimeout(() => {
          setMetrics({
            totalCourses: 156,
            cteCourses: 89,
            requiredCertifications: 12,
            optionalCertifications: 5,
            completionRate: 92.3,
            enrollmentCount: 445,
            pathwayPrograms: 4,
            avgCourseLevel: 2.1,
            recentActivity: 23,
          });
          setLoading(false);
        }, 800);
      } catch (error) {
        console.error('Failed to load subject metrics:', error);
        setLoading(false);
      }
    };

    fetchSubjectMetrics();
  }, [subjectArea]);

  return (
    <ProgramMetrics
      programType="cte"
      subjectArea={subjectArea}
      metrics={metrics || undefined}
      loading={loading}
    />
  );
}

// Example 4: Integration with existing API patterns
export async function fetchProgramMetrics(filters?: {
  programType?: 'all' | 'cte' | 'academic';
  subjectArea?: string;
  courseLevel?: string;
}) {
  try {
    // This would integrate with your existing API structure
    const response = await fetch('/api/v1/analytics/program-metrics', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(filters),
    });

    if (!response.ok) {
      throw new Error('Failed to fetch program metrics');
    }

    const data = await response.json();
    return {
      success: true,
      data: data.metrics,
    };
  } catch (error) {
    console.error('Error fetching program metrics:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

// Example 5: Complete dashboard page integration
export function EnhancedDashboardPage() {
  const [dashboardData, setDashboardData] = useState({
    quickStats: {
      totalCourses: 0,
      totalCertifications: 0,
      totalSearches: 0,
      favoriteCount: 0,
    },
    programMetrics: undefined,
    recentSearches: [],
    popularCourses: [],
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadAllData = async () => {
      setIsLoading(true);
      try {
        // Load all dashboard data in parallel
        const [quickStatsRes, programMetricsRes, searchesRes, coursesRes] = await Promise.allSettled([
          // Your existing API calls
          fetch('/api/v1/dashboard/quick-stats'),
          fetchProgramMetrics(), // New metrics API
          fetch('/api/v1/search/recent'),
          fetch('/api/v1/sced/popular'),
        ]);

        // Handle responses following your existing patterns
        if (quickStatsRes.status === 'fulfilled') {
          const stats = await quickStatsRes.value.json();
          setDashboardData(prev => ({ ...prev, quickStats: stats.data }));
        }

        if (programMetricsRes.status === 'fulfilled' && programMetricsRes.value.success) {
          setDashboardData(prev => ({ ...prev, programMetrics: programMetricsRes.value.data }));
        }

        // ... handle other responses
      } catch (error) {
        console.error('Failed to load dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadAllData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Comprehensive view of SCED codes and certification requirements
        </p>
      </div>

      {/* Search Bar */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Your existing SearchBar component */}
      </div>

      {/* Quick Stats */}
      <div className="bg-white shadow rounded-lg p-6">
        {/* Your existing QuickStats component */}
      </div>

      {/* Program Metrics - New Addition */}
      <ProgramMetrics
        programType="all"
        metrics={dashboardData.programMetrics}
        loading={isLoading}
      />

      {/* Existing grid content */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Recent Searches */}
        {/* Popular Courses */}
      </div>
    </div>
  );
}

/**
 * API Integration Example
 * 
 * Add this to your backend to support the ProgramMetrics component:
 * 
 * // Backend route: /api/v1/analytics/program-metrics
 * router.post('/program-metrics', async (req, res) => {
 *   try {
 *     const { programType, subjectArea, courseLevel } = req.body;
 *     
 *     // Build dynamic query based on filters
 *     let courseQuery = knex('sced_course_details');
 *     let certQuery = knex('course_certification_mappings');
 *     
 *     if (programType === 'cte') {
 *       courseQuery = courseQuery.where('cte_indicator', 'Y');
 *     }
 *     
 *     if (subjectArea) {
 *       courseQuery = courseQuery.where('course_subject_area', subjectArea);
 *     }
 *     
 *     if (courseLevel) {
 *       courseQuery = courseQuery.where('course_level', courseLevel);
 *     }
 *     
 *     // Get aggregated metrics
 *     const [courseStats, certificationStats] = await Promise.all([
 *       courseQuery.select(
 *         knex.raw('COUNT(*) as total_courses'),
 *         knex.raw('COUNT(CASE WHEN cte_indicator = ? THEN 1 END) as cte_courses', ['Y']),
 *         knex.raw('AVG(CAST(course_level as DECIMAL)) as avg_course_level')
 *       ).first(),
 *       
 *       certQuery.select(
 *         knex.raw('COUNT(DISTINCT certification_area_code) as total_certifications')
 *       ).first()
 *     ]);
 *     
 *     const metrics = {
 *       totalCourses: parseInt(courseStats.total_courses),
 *       cteCourses: parseInt(courseStats.cte_courses),
 *       requiredCertifications: parseInt(certificationStats.total_certifications),
 *       optionalCertifications: Math.floor(parseInt(certificationStats.total_certifications) * 0.4),
 *       completionRate: 87.5, // Calculate from enrollment data
 *       enrollmentCount: 2156, // From student enrollment system
 *       pathwayPrograms: 12, // Calculate unique pathways
 *       avgCourseLevel: parseFloat(courseStats.avg_course_level) || 0,
 *       recentActivity: 156, // From search analytics
 *     };
 *     
 *     res.json({
 *       success: true,
 *       data: metrics
 *     });
 *   } catch (error) {
 *     console.error('Error fetching program metrics:', error);
 *     res.status(500).json({
 *       success: false,
 *       error: { message: 'Failed to fetch program metrics' }
 *     });
 *   }
 * });
 */