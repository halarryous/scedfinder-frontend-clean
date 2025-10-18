'use client';

import { useState, useEffect } from 'react';
import { 
  ChartBarIcon,
  BookOpenIcon,
  AcademicCapIcon,
  CheckCircleIcon,
  MapIcon,
  UserGroupIcon,
  TrendingUpIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { ProgramMetricsData, ProgramTrend } from '@/types';

interface ProgramMetricsProps {
  programType?: 'all' | 'cte' | 'academic';
  subjectArea?: string;
  metrics?: ProgramMetricsData;
  loading?: boolean;
  className?: string;
}

interface MetricCardProps {
  title: string;
  value: string | number;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  color: string;
  bgColor: string;
  loading: boolean;
  trend?: ProgramTrend;
}

function MetricCard({ title, value, description, icon: Icon, color, bgColor, loading, trend }: MetricCardProps) {
  return (
    <div className="bg-white overflow-hidden shadow-sm rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
      <div className="p-5">
        <div className="flex items-center">
          <div className="flex-shrink-0">
            <div className={`p-3 rounded-md ${bgColor}`}>
              <Icon className={`h-6 w-6 ${color}`} aria-hidden="true" />
            </div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">
                {title}
              </dt>
              <dd className="flex items-baseline">
                {loading ? (
                  <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                ) : (
                  <div className="text-2xl font-semibold text-gray-900">
                    {typeof value === 'number' ? value.toLocaleString() : value}
                  </div>
                )}
                {trend && !loading && (
                  <div className={`ml-2 flex items-baseline text-sm font-semibold ${
                    trend.direction === 'up' ? 'text-green-600' : 
                    trend.direction === 'down' ? 'text-red-600' : 'text-gray-500'
                  }`}>
                    <TrendingUpIcon 
                      className={`self-center flex-shrink-0 h-4 w-4 ${
                        trend.direction === 'down' ? 'transform rotate-180' : ''
                      }`}
                      aria-hidden="true"
                    />
                    <span className="sr-only">
                      {trend.direction === 'up' ? 'Increased' : trend.direction === 'down' ? 'Decreased' : 'No change'} by
                    </span>
                    {Math.abs(trend.value)}%
                  </div>
                )}
              </dd>
              <dd className="text-xs text-gray-500 mt-1">
                {description}
              </dd>
            </dl>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProgramMetrics({ 
  programType = 'all',
  subjectArea,
  metrics,
  loading = false,
  className = ''
}: ProgramMetricsProps) {
  const [displayMetrics, setDisplayMetrics] = useState<ProgramMetricsData>({
    totalCourses: 0,
    cteCourses: 0,
    requiredCertifications: 0,
    optionalCertifications: 0,
    completionRate: 0,
    enrollmentCount: 0,
    pathwayPrograms: 0,
    avgCourseLevel: 0,
    recentActivity: 0,
  });

  useEffect(() => {
    if (metrics) {
      setDisplayMetrics(metrics);
    } else if (!loading) {
      // Mock data for demonstration when no metrics provided
      setDisplayMetrics({
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
    }
  }, [metrics, loading]);

  const metricCards = [
    {
      title: 'Total SCED Courses',
      value: displayMetrics.totalCourses,
      description: programType === 'cte' ? 'CTE course offerings' : 'Available course codes',
      icon: BookOpenIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      trend: { value: 5.2, direction: 'up' as const },
    },
    {
      title: 'CTE Programs',
      value: displayMetrics.cteCourses,
      description: 'Career & Technical Education courses',
      icon: MapIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      trend: { value: 8.1, direction: 'up' as const },
    },
    {
      title: 'Required Certifications',
      value: displayMetrics.requiredCertifications,
      description: 'Teacher certifications needed',
      icon: AcademicCapIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-50',
    },
    {
      title: 'Completion Rate',
      value: `${displayMetrics.completionRate}%`,
      description: 'Program completion success rate',
      icon: CheckCircleIcon,
      color: 'text-emerald-600',
      bgColor: 'bg-emerald-50',
      trend: { value: 2.3, direction: 'up' as const },
    },
    {
      title: 'Student Enrollment',
      value: displayMetrics.enrollmentCount,
      description: 'Current program enrollment',
      icon: UserGroupIcon,
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      trend: { value: 1.2, direction: 'down' as const },
    },
    {
      title: 'Pathway Programs',
      value: displayMetrics.pathwayPrograms,
      description: 'Distinct career pathways',
      icon: ChartBarIcon,
      color: 'text-indigo-600',
      bgColor: 'bg-indigo-50',
    },
    {
      title: 'Avg Course Level',
      value: displayMetrics.avgCourseLevel.toFixed(1),
      description: 'Average course difficulty level',
      icon: TrendingUpIcon,
      color: 'text-teal-600',
      bgColor: 'bg-teal-50',
    },
    {
      title: 'Recent Activity',
      value: displayMetrics.recentActivity,
      description: 'Searches and updates (30 days)',
      icon: ClockIcon,
      color: 'text-rose-600',
      bgColor: 'bg-rose-50',
      trend: { value: 12.7, direction: 'up' as const },
    },
  ];

  // Filter metrics based on program type
  const visibleMetrics = programType === 'cte' 
    ? metricCards.filter(metric => 
        ['CTE Programs', 'Required Certifications', 'Completion Rate', 'Student Enrollment', 'Pathway Programs', 'Recent Activity'].includes(metric.title)
      )
    : metricCards;

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-medium text-gray-900">
            Program Metrics
            {subjectArea && (
              <span className="ml-2 text-sm font-normal text-gray-500">
                • {subjectArea}
              </span>
            )}
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            {programType === 'cte' 
              ? 'Career and Technical Education program statistics'
              : programType === 'academic'
              ? 'Academic program performance metrics'
              : 'Comprehensive program overview and performance indicators'
            }
          </p>
        </div>
        
        {!loading && (
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        )}
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {visibleMetrics.map((metric) => (
          <MetricCard
            key={metric.title}
            title={metric.title}
            value={metric.value}
            description={metric.description}
            icon={metric.icon}
            color={metric.color}
            bgColor={metric.bgColor}
            loading={loading}
            trend={metric.trend}
          />
        ))}
      </div>

      {/* Summary Stats for CTE Focus */}
      {programType === 'cte' && !loading && (
        <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
          <div className="flex items-center space-x-4">
            <div className="flex-shrink-0">
              <div className="p-3 bg-white rounded-lg shadow-sm">
                <ChartBarIcon className="h-8 w-8 text-blue-600" />
              </div>
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-medium text-gray-900">CTE Program Summary</h3>
              <div className="mt-2 grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-gray-700">Coverage:</span>
                  <span className="ml-2 text-gray-600">
                    {Math.round((displayMetrics.cteCourses / displayMetrics.totalCourses) * 100)}% of total courses
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Certification Ratio:</span>
                  <span className="ml-2 text-gray-600">
                    {(displayMetrics.requiredCertifications / displayMetrics.cteCourses).toFixed(1)} certs per course
                  </span>
                </div>
                <div>
                  <span className="font-medium text-gray-700">Pathway Density:</span>
                  <span className="ml-2 text-gray-600">
                    {Math.round(displayMetrics.cteCourses / displayMetrics.pathwayPrograms)} courses per pathway
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}