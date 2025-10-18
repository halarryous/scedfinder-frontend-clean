# ProgramMetrics Component

A comprehensive dashboard component for displaying CTE (Career and Technical Education) program statistics and key performance indicators in the SCED Finder application.

## Overview

The ProgramMetrics component provides a visual dashboard for tracking important metrics related to SCED courses, certifications, and program performance. It follows the established design patterns of the SCED Finder application and integrates seamlessly with existing components.

## Features

- **Responsive Grid Layout**: Displays metrics in a responsive grid that adapts to different screen sizes
- **Loading States**: Built-in loading animations for better user experience
- **Trend Indicators**: Optional trend arrows showing performance changes
- **Program Type Filtering**: Different metric sets based on program focus (all, CTE, academic)
- **Subject Area Filtering**: Metrics can be filtered by specific subject areas
- **Professional Design**: Consistent with SCED Finder's design system using Tailwind CSS

## Installation

The component is already integrated into the SCED Finder project. Import it from the Dashboard components:

```typescript
import ProgramMetrics from '@/components/Dashboard/ProgramMetrics';
```

## Basic Usage

### Simple Usage (with mock data)
```tsx
import ProgramMetrics from '@/components/Dashboard/ProgramMetrics';

function MyDashboard() {
  return (
    <ProgramMetrics 
      loading={false} 
      programType="all"
    />
  );
}
```

### With Real Data
```tsx
import { useState, useEffect } from 'react';
import ProgramMetrics from '@/components/Dashboard/ProgramMetrics';
import { ProgramMetricsData } from '@/types';

function DashboardWithMetrics() {
  const [metrics, setMetrics] = useState<ProgramMetricsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/v1/analytics/program-metrics');
        const data = await response.json();
        setMetrics(data.metrics);
      } catch (error) {
        console.error('Failed to load metrics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  return (
    <ProgramMetrics 
      metrics={metrics}
      loading={loading}
      programType="all"
    />
  );
}
```

### CTE-Focused Display
```tsx
<ProgramMetrics
  programType="cte"
  subjectArea="Business & Technology"
  metrics={cteMetrics}
  loading={false}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `programType` | `'all' \| 'cte' \| 'academic'` | `'all'` | Filters which metrics to display |
| `subjectArea` | `string` | `undefined` | Optional subject area filter displayed in header |
| `metrics` | `ProgramMetricsData \| null` | `null` | Data object containing all metric values |
| `loading` | `boolean` | `false` | Shows loading animations when true |
| `className` | `string` | `''` | Additional CSS classes |

## Data Types

### ProgramMetricsData Interface

```typescript
interface ProgramMetricsData {
  totalCourses: number;          // Total SCED courses available
  cteCourses: number;            // Number of CTE courses
  requiredCertifications: number; // Required teacher certifications
  optionalCertifications: number; // Optional/alternative certifications
  completionRate: number;         // Program completion rate (percentage)
  enrollmentCount: number;        // Current student enrollment
  pathwayPrograms: number;        // Number of distinct career pathways
  avgCourseLevel: number;         // Average course difficulty level
  recentActivity: number;         // Recent search/activity count
}
```

### ProgramTrend Interface

```typescript
interface ProgramTrend {
  value: number;                  // Percentage change
  direction: 'up' | 'down' | 'neutral'; // Trend direction
  period?: string;                // Time period (e.g., "30 days")
}
```

## Displayed Metrics

### All Programs Mode (`programType="all"`)
Displays all 8 metric cards:
- Total SCED Courses
- CTE Programs  
- Required Certifications
- Completion Rate
- Student Enrollment
- Pathway Programs
- Avg Course Level
- Recent Activity

### CTE Mode (`programType="cte"`)
Displays 6 CTE-focused metrics:
- CTE Programs
- Required Certifications  
- Completion Rate
- Student Enrollment
- Pathway Programs
- Recent Activity

Plus a summary panel with calculated ratios:
- Coverage percentage (CTE courses vs total)
- Certification ratio (certs per course)
- Pathway density (courses per pathway)

## Styling

The component uses Tailwind CSS classes consistent with the SCED Finder design system:

- **Color Scheme**: Blue, green, purple, emerald, orange, indigo, teal, rose
- **Layout**: Responsive grid (1 column mobile, 2 on SM, 3 on LG, 4 on XL)
- **Cards**: White background with subtle shadows and hover effects
- **Icons**: Heroicons outline style with colored backgrounds
- **Typography**: Standard text hierarchy with proper contrast

## API Integration

### Backend Route Example

Add to your Express router:

```typescript
// GET /api/v1/analytics/program-metrics
router.get('/program-metrics', async (req, res) => {
  try {
    const { programType, subjectArea } = req.query;
    
    // Build database query based on filters
    let query = knex('sced_course_details');
    
    if (programType === 'cte') {
      query = query.where('cte_indicator', 'Y');
    }
    
    if (subjectArea) {
      query = query.where('course_subject_area', subjectArea);
    }
    
    // Get aggregated metrics
    const metrics = await query.select([
      knex.raw('COUNT(*) as total_courses'),
      knex.raw('COUNT(CASE WHEN cte_indicator = ? THEN 1 END) as cte_courses', ['Y']),
      knex.raw('AVG(CAST(course_level as DECIMAL)) as avg_course_level')
    ]).first();
    
    // Add additional calculated metrics
    const programMetrics = {
      ...metrics,
      requiredCertifications: 34, // From certification mappings
      completionRate: 87.5,       // From enrollment data
      enrollmentCount: 2156,      // From student records  
      pathwayPrograms: 12,        // Unique pathways count
      recentActivity: 156,        // From search analytics
    };
    
    res.json({
      success: true,
      data: programMetrics
    });
    
  } catch (error) {
    res.status(500).json({
      success: false,
      error: { message: 'Failed to fetch program metrics' }
    });
  }
});
```

### Frontend API Service

Add to `lib/api-services.ts`:

```typescript
export const analyticsApi = {
  getProgramMetrics: async (filters?: {
    programType?: 'all' | 'cte' | 'academic';
    subjectArea?: string;
  }): Promise<ApiResponse<ProgramMetricsData>> => {
    const params = new URLSearchParams();
    if (filters?.programType) params.append('programType', filters.programType);
    if (filters?.subjectArea) params.append('subjectArea', filters.subjectArea);
    
    const response = await api.get(`/analytics/program-metrics?${params}`);
    return response.data;
  },
};
```

## Integration Examples

### Dashboard Page Integration

```tsx
// app/dashboard/page.tsx
export default function DashboardPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Existing components */}
        <SearchBar />
        <QuickStats stats={stats} loading={isLoading} />
        
        {/* Add ProgramMetrics */}
        <ProgramMetrics
          programType="all"
          loading={isLoading}
        />
        
        {/* Other dashboard content */}
      </div>
    </DashboardLayout>
  );
}
```

### CTE Programs Page

```tsx
// app/cte/page.tsx
export default function CTEProgramsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">CTE Programs</h1>
        <p className="text-gray-500">Career and Technical Education overview</p>
      </div>
      
      <ProgramMetrics
        programType="cte"
        subjectArea="All CTE Programs"
      />
      
      {/* CTE-specific content */}
    </div>
  );
}
```

### Subject-Specific View

```tsx
// app/subjects/[area]/page.tsx
export default function SubjectAreaPage({ params }: { params: { area: string } }) {
  const subjectArea = decodeURIComponent(params.area);
  
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-gray-900">{subjectArea}</h1>
      
      <ProgramMetrics
        programType="cte"
        subjectArea={subjectArea}
      />
      
      {/* Subject-specific courses and certifications */}
    </div>
  );
}
```

## Accessibility

The component follows accessibility best practices:

- **ARIA Labels**: Icons have `aria-hidden="true"`
- **Screen Reader Support**: Trend indicators include `sr-only` text
- **Semantic HTML**: Proper use of `dl`, `dt`, `dd` elements for metrics
- **Keyboard Navigation**: All interactive elements are keyboard accessible
- **Color Contrast**: All text meets WCAG contrast requirements

## Performance Considerations

- **Loading States**: Skeleton animations prevent layout shifts
- **Conditional Rendering**: Only renders metrics relevant to program type
- **Memoization**: Consider wrapping in `React.memo` for heavy usage
- **API Caching**: Implement caching for metrics data that changes infrequently

## Customization

### Custom Metrics

To add new metrics, update the `ProgramMetricsData` interface and add corresponding cards to the `metricCards` array.

### Custom Styling

Override styles by passing `className` prop or customizing Tailwind classes:

```tsx
<ProgramMetrics
  className="bg-gray-50 p-6 rounded-xl"
  // Other props...
/>
```

### Custom Icons

Replace icons by modifying the `metricCards` array in the component.

## Error Handling

The component gracefully handles:

- **Missing Data**: Shows loading state or default values
- **API Errors**: Displays appropriate error states
- **Invalid Props**: Provides sensible defaults

## Testing

```typescript
// __tests__/ProgramMetrics.test.tsx
import { render, screen } from '@testing-library/react';
import ProgramMetrics from '../ProgramMetrics';

describe('ProgramMetrics', () => {
  const mockMetrics = {
    totalCourses: 100,
    cteCourses: 50,
    requiredCertifications: 10,
    // ... other metrics
  };

  it('renders metrics correctly', () => {
    render(<ProgramMetrics metrics={mockMetrics} loading={false} />);
    
    expect(screen.getByText('100')).toBeInTheDocument();
    expect(screen.getByText('50')).toBeInTheDocument();
  });

  it('shows loading state', () => {
    render(<ProgramMetrics loading={true} />);
    
    expect(screen.getAllByRole('generic')).toHaveLength(8); // Skeleton loaders
  });
});
```

## Contributing

When modifying this component:

1. Maintain TypeScript strict typing
2. Follow existing code patterns
3. Update this documentation
4. Add tests for new functionality
5. Ensure accessibility compliance