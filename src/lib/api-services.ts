import apiClient from './api';
import {
  User,
  SCEDCourse,
  Certification,
  LoginRequest,
  RegisterRequest,
  AuthResponse,
  ApiResponse,
  PaginatedResponse,
  SearchRequest,
  UniversalSearchResponse,
  SearchHistory,
  UserFavorite,
  SearchSuggestion,
  SCEDCourseWithCertifications,
  CertificationWithCourses,
  SearchAnalytics,
} from '@/types';

// Authentication API
export const authApi = {
  login: (data: LoginRequest) => 
    apiClient.post<AuthResponse>('/auth/login', data),
  
  register: (data: RegisterRequest) => 
    apiClient.post<AuthResponse>('/auth/register', data),
  
  logout: () => 
    apiClient.post<ApiResponse<null>>('/auth/logout'),
  
  getMe: () => 
    apiClient.get<ApiResponse<{ user: User }>>('/auth/me'),
  
  refresh: () => 
    apiClient.post<ApiResponse<{ token: string }>>('/auth/refresh'),
};

// SCED Courses API
export const scedApi = {
  search: (params?: {
    query?: string;
    subject_area?: string;
    cte_pathway?: string;
    course_type?: string;
    grade_level?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => apiClient.get<PaginatedResponse<SCEDCourse>>('/sced/search', params),
  
  getCourses: (page = 1, limit = 20) => 
    apiClient.get<PaginatedResponse<SCEDCourse>>('/sced/courses', { page, limit }),
  
  getCourseById: (id: string) => 
    apiClient.get<ApiResponse<{ course: SCEDCourseWithCertifications; related_courses: SCEDCourse[] }>>(`/sced/courses/${id}`),
  
  getCourseByCode: (sced_code: string) => 
    apiClient.get<ApiResponse<{ course: SCEDCourseWithCertifications }>>(`/sced/courses/code/${sced_code}`),
  
  getSuggestions: (q: string, type?: string) => 
    apiClient.get<ApiResponse<SearchSuggestion[]>>('/sced/suggestions', { q, type }),
  
  getFilterOptions: () => 
    apiClient.get<ApiResponse<any>>('/sced/filters'),
  
  createCourse: (data: Partial<SCEDCourse>) => 
    apiClient.post<ApiResponse<{ course: SCEDCourse }>>('/sced/courses', data),
  
  updateCourse: (id: string, data: Partial<SCEDCourse>) => 
    apiClient.put<ApiResponse<{ course: SCEDCourse }>>(`/sced/courses/${id}`, data),
  
  deleteCourse: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/sced/courses/${id}`),

  getCourseCertifications: (id: string) => 
    apiClient.get<ApiResponse<{
      required: Certification[];
      preferred: Certification[];
      alternative: Certification[];
    }>>(`/sced/courses/${id}/certifications`),

  searchCourses: (params: {
    query?: string;
    filters?: any;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => apiClient.get<ApiResponse<SCEDCourse[]> & {
    pagination: {
      total: number;
      page: number;
      limit: number;
      totalPages: number;
    };
  }>('/sced/search', params),
};

// Certifications API
export const certificationApi = {
  search: (params?: {
    query?: string;
    certification_type?: string;
    issuing_authority?: string;
    subject_areas?: string;
    grade_levels?: string;
    sort_by?: string;
    sort_order?: 'asc' | 'desc';
    page?: number;
    limit?: number;
  }) => apiClient.get<PaginatedResponse<Certification>>('/certifications/search', params),
  
  getCertifications: (page = 1, limit = 20) => 
    apiClient.get<PaginatedResponse<Certification>>('/certifications', { page, limit }),
  
  getCertificationById: (id: string) => 
    apiClient.get<ApiResponse<{ certification: CertificationWithCourses; alternative_certifications: Certification[] }>>(`/certifications/${id}`),
  
  getCertificationByCode: (certification_code: string) => 
    apiClient.get<ApiResponse<{ certification: CertificationWithCourses }>>(`/certifications/code/${certification_code}`),
  
  getQualifiedCourses: (id: string, requirement_type?: string, page = 1, limit = 20) => 
    apiClient.get<PaginatedResponse<SCEDCourse & { requirement_type: string; notes?: string }>>(`/certifications/${id}/courses`, { requirement_type, page, limit }),
  
  createCertification: (data: Partial<Certification>) => 
    apiClient.post<ApiResponse<{ certification: Certification }>>('/certifications', data),
  
  updateCertification: (id: string, data: Partial<Certification>) => 
    apiClient.put<ApiResponse<{ certification: Certification }>>(`/certifications/${id}`, data),
  
  deleteCertification: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/certifications/${id}`),
  
  linkToCourse: (certification_id: string, course_id: string, requirement_type: string, notes?: string) => 
    apiClient.post<ApiResponse<{ link: any }>>(`/certifications/${certification_id}/courses/${course_id}`, { requirement_type, notes }),
  
  unlinkFromCourse: (certification_id: string, course_id: string) => 
    apiClient.delete<ApiResponse<null>>(`/certifications/${certification_id}/courses/${course_id}`),

  getCertificationCourses: (id: string) => 
    apiClient.get<ApiResponse<{
      required: SCEDCourse[];
      preferred: SCEDCourse[];
      alternative: SCEDCourse[];
    }>>(`/certifications/${id}/courses`),

  searchCertifications: (params: {
    query?: string;
    filters?: any;
    page?: number;
    limit?: number;
    sortBy?: string;
    sortOrder?: 'asc' | 'desc';
  }) => apiClient.get<{
    certifications: Certification[];
    total: number;
    page: number;
    limit: number;
  }>('/certifications/search', params),
};

// Search API
export const searchApi = {
  universalSearch: (params: {
    query: string;
    type?: 'sced' | 'certification' | 'both';
    filters?: any;
    sort?: any;
    page?: number;
    limit?: number;
  }) => apiClient.get<ApiResponse<UniversalSearchResponse> & { pagination: any; query: any }>('/search', params),
  
  getSuggestions: (q: string, type?: string, limit = 10) => 
    apiClient.get<ApiResponse<SearchSuggestion[]>>('/search/suggestions', { q, type, limit }),
  
  getSearchHistory: (limit = 50) => 
    apiClient.get<ApiResponse<SearchHistory[]>>('/search/history', { limit }),
  
  recordSearch: (data: {
    search_type?: string;
    search_query: string;
    search_filters?: any;
    results_count?: number;
    selected_result_id?: string;
  }) => apiClient.post<ApiResponse<{ search_history: SearchHistory }>>('/search/history', data),
  
  deleteSearchHistory: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/search/history/${id}`),
  
  clearSearchHistory: () => 
    apiClient.delete<ApiResponse<null>>('/search/history'),
  
  getPopularSearches: (query?: string, limit = 10) => 
    apiClient.get<ApiResponse<Array<{ search_query: string; search_count: number }>>>('/search/popular', { query, limit }),
  
  getSearchAnalytics: (start_date?: string, end_date?: string, search_type?: string) => 
    apiClient.get<ApiResponse<SearchAnalytics>>('/search/analytics', { start_date, end_date, search_type }),
  
  findCertificationsForSCED: (sced_code: string) => 
    apiClient.get<ApiResponse<{ sced_code: string; certifications: any[]; total: number }>>(`/search/cross-reference/sced/${sced_code}`),
  
  findSCEDForCertification: (certification_code: string) => 
    apiClient.get<ApiResponse<{ certification_code: string; courses: any[]; total: number }>>(`/search/cross-reference/certification/${certification_code}`),
};

// User API
export const userApi = {
  getProfile: () => 
    apiClient.get<ApiResponse<{ user: User }>>('/users/profile'),
  
  updateProfile: (data: {
    username?: string;
    email?: string;
    current_password?: string;
    new_password?: string;
  }) => apiClient.put<ApiResponse<{ user: User }>>('/users/profile', data),
  
  getFavorites: (type?: string) => 
    apiClient.get<ApiResponse<UserFavorite[]>>('/users/favorites', { type }),
  
  addToFavorites: (data: {
    favorite_type: 'sced_course' | 'certification';
    item_id: string;
    notes?: string;
  }) => apiClient.post<ApiResponse<{ favorite: UserFavorite }>>('/users/favorites', data),
  
  removeFromFavorites: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/users/favorites/${id}`),
  
  updateFavoriteNotes: (id: string, notes: string) => 
    apiClient.put<ApiResponse<{ favorite: UserFavorite }>>(`/users/favorites/${id}`, { notes }),
  
  getPreferences: () => 
    apiClient.get<ApiResponse<{ preferences: Record<string, any> }>>('/users/preferences'),
  
  updatePreferences: (preferences: Record<string, any>) => 
    apiClient.put<ApiResponse<{ user: User }>>('/users/preferences', preferences),
  
  // Admin only
  getUsers: (page = 1, limit = 20) => 
    apiClient.get<PaginatedResponse<User>>('/users', { page, limit }),
  
  getUserById: (id: string) => 
    apiClient.get<ApiResponse<{ user: User }>>(`/users/${id}`),
  
  updateUser: (id: string, data: Partial<User>) => 
    apiClient.put<ApiResponse<{ user: User }>>(`/users/${id}`, data),
  
  deleteUser: (id: string) => 
    apiClient.delete<ApiResponse<null>>(`/users/${id}`),
};