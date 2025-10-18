// User types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'readonly';
  preferences?: Record<string, any>;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

// SCED Course types - Updated to match API response structure
export interface SCEDCourse {
  id: string;
  course_code: string; // API returns course_code, not sced_code
  course_code_description: string; // API returns course_code_description, not course_title
  course_description?: string;
  course_subject_area?: string; // API returns course_subject_area, not subject_area
  course_level?: string; // API returns course_level
  cte_indicator?: string; // API returns cte_indicator, not cte_pathway
  ap_indicator?: string; // API returns ap_indicator
  ib_indicator?: string; // API returns ib_indicator
  certifications?: string[]; // Array of certification descriptions
  certification_codes?: string[]; // Array of certification codes
  prerequisite_courses?: string[];
  industry_alignment?: string[];
  national_standards?: string[];
  created_at?: string;
  updated_at?: string;
}

// Certification types
export interface Certification {
  id: string;
  certification_code: string;
  certification_name: string;
  certification_type?: string;
  issuing_authority?: string;
  subject_areas?: string[];
  grade_levels?: string[];
  endorsements?: string[];
  description?: string;
  requirements?: string;
  renewal_period_months?: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

// Relationship types
export interface SCEDCertificationRequirement {
  id: string;
  sced_course_id: string;
  certification_id: string;
  requirement_type: 'required' | 'preferred' | 'alternative';
  notes?: string;
  created_at: string;
}

// Extended types with relationships
export interface SCEDCourseWithCertifications extends Omit<SCEDCourse, 'certifications'> {
  certifications?: Array<Certification & { 
    requirement_type: string; 
    notes?: string;
  }>;
}

export interface CertificationWithCourses extends Certification {
  courses?: Array<SCEDCourse & { 
    requirement_type: string; 
    notes?: string;
  }>;
}

// Search types
export interface SearchResult {
  courses: SCEDCourse[];
  certifications: Certification[];
  total: number;
  page?: number;
  limit?: number;
}

export interface SearchHistory {
  id: string;
  user_id?: string;
  search_type?: 'sced' | 'certification' | 'both' | 'verification' | 'universal';
  search_query: string;
  search_filters?: Record<string, any>;
  results_count?: number;
  selected_result_id?: string;
  searched_at: string;
}

export interface UserFavorite {
  id: string;
  user_id: string;
  favorite_type: 'sced_course' | 'certification';
  item_id: string;
  notes?: string;
  created_at: string;
  item_data?: SCEDCourse | Certification;
}

export interface SearchSuggestion {
  text: string;
  type: string;
  count?: number;
}

// Request/Response types
export interface LoginRequest {
  username: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user' | 'readonly';
}

export interface SearchRequest {
  query?: string;
  type?: 'sced' | 'certification' | 'both';
  filters?: {
    course_subject_area?: string; // Updated to match API field names
    cte_indicator?: string;
    course_level?: string;
    ap_indicator?: string;
    ib_indicator?: string;
    certification_type?: string;
    issuing_authority?: string;
  };
  sort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  page?: number;
  limit?: number;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  filters?: Record<string, any>;
}

export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface ApiError {
  success: false;
  error: {
    message: string;
    stack?: string;
  };
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
}

export interface UniversalSearchResponse {
  sced_courses?: SCEDCourse[];
  certifications?: Certification[];
  total_sced: number;
  total_certifications: number;
  total: number;
  suggestions?: SearchSuggestion[];
}

export interface SearchAnalytics {
  total_searches: number;
  unique_users: number;
  top_queries: Array<{ query: string; count: number }>;
  search_trends: Array<{ date: string; count: number }>;
  popular_results: Array<{ result_id: string; selections: number }>;
}

export interface FilterOptions {
  subject_areas?: Array<{ value: string; count: number }>;
  cte_indicators?: Array<{ value: string; count: number }>;
  course_levels?: Array<{ value: string; count: number }>;
  ap_indicators?: Array<{ value: string; count: number }>;
  ib_indicators?: Array<{ value: string; count: number }>;
  certification_types?: Array<{ value: string; count: number }>;
  issuing_authorities?: Array<{ value: string; count: number }>;
}

// Program Metrics types for ProgramMetrics component
export interface ProgramMetricsData {
  totalCourses: number;
  cteCourses: number;
  requiredCertifications: number;
  optionalCertifications: number;
  completionRate: number;
  enrollmentCount: number;
  pathwayPrograms: number;
  avgCourseLevel: number;
  recentActivity: number;
}

export interface ProgramTrend {
  value: number;
  direction: 'up' | 'down' | 'neutral';
  period?: string; // e.g., "30 days", "quarter"
}

export interface ProgramAnalytics {
  metrics: ProgramMetricsData;
  trends: Record<string, ProgramTrend>;
  lastUpdated: string;
  programType: 'all' | 'cte' | 'academic';
  subjectArea?: string;
}