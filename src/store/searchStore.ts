import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { SCEDCourse, Certification, SearchHistory, SearchSuggestion } from '@/types';

interface SearchState {
  // Search query and filters
  searchQuery: string;
  searchType: 'sced' | 'certification' | 'both';
  filters: {
    subject_area?: string;
    cte_pathway?: string;
    course_type?: string;
    grade_level?: string;
    certification_type?: string;
    issuing_authority?: string;
  };
  
  // Search results
  scedResults: SCEDCourse[];
  certificationResults: Certification[];
  totalResults: number;
  loading: boolean;
  
  // Search history and suggestions
  recentSearches: SearchHistory[];
  searchHistory: SearchHistory[];
  suggestions: SearchSuggestion[];
  
  // Pagination
  currentPage: number;
  itemsPerPage: number;
  
  // Actions
  setSearchQuery: (query: string) => void;
  setSearchType: (type: 'sced' | 'certification' | 'both') => void;
  setFilters: (filters: any) => void;
  updateFilter: (key: string, value: any) => void;
  clearFilters: () => void;
  
  setScedResults: (results: SCEDCourse[]) => void;
  setCertificationResults: (results: Certification[]) => void;
  setTotalResults: (total: number) => void;
  setLoading: (loading: boolean) => void;
  
  addRecentSearch: (search: SearchHistory) => void;
  clearRecentSearches: () => void;
  
  addToHistory: (search: SearchHistory) => void;
  clearHistory: () => void;
  removeFromHistory: (itemId: string) => void;
  
  setSuggestions: (suggestions: SearchSuggestion[]) => void;
  
  setCurrentPage: (page: number) => void;
  setItemsPerPage: (items: number) => void;
  
  reset: () => void;
}

const initialState = {
  searchQuery: '',
  searchType: 'both' as const,
  filters: {},
  scedResults: [],
  certificationResults: [],
  totalResults: 0,
  loading: false,
  recentSearches: [],
  searchHistory: [],
  suggestions: [],
  currentPage: 1,
  itemsPerPage: 20,
};

export const useSearchStore = create<SearchState>()(
  persist(
    (set, get) => ({
      ...initialState,

      setSearchQuery: (query) => set({ searchQuery: query }),
      
      setSearchType: (type) => set({ searchType: type }),
      
      setFilters: (filters) => set({ filters }),
      
      updateFilter: (key, value) =>
        set((state) => ({
          filters: {
            ...state.filters,
            [key]: value || undefined,
          },
        })),
      
      clearFilters: () => set({ filters: {} }),
      
      setScedResults: (results) => set({ scedResults: results }),
      
      setCertificationResults: (results) => set({ certificationResults: results }),
      
      setTotalResults: (total) => set({ totalResults: total }),
      
      setLoading: (loading) => set({ loading }),
      
      addRecentSearch: (search) =>
        set((state) => ({
          recentSearches: [search, ...state.recentSearches.slice(0, 9)], // Keep last 10
        })),
      
      clearRecentSearches: () => set({ recentSearches: [] }),
      
      addToHistory: (search) =>
        set((state) => ({
          searchHistory: [search, ...state.searchHistory.slice(0, 99)], // Keep last 100
        })),
      
      clearHistory: () => set({ searchHistory: [] }),
      
      removeFromHistory: (itemId) =>
        set((state) => ({
          searchHistory: state.searchHistory.filter(item => item.id !== itemId),
        })),
      
      setSuggestions: (suggestions) => set({ suggestions }),
      
      setCurrentPage: (page) => set({ currentPage: page }),
      
      setItemsPerPage: (items) => set({ itemsPerPage: items }),
      
      reset: () => set(initialState),
    }),
    {
      name: 'search-storage',
      partialize: (state) => ({
        recentSearches: state.recentSearches.slice(0, 5), // Only persist last 5 searches
        searchHistory: state.searchHistory.slice(0, 50), // Only persist last 50 searches
        searchType: state.searchType,
        itemsPerPage: state.itemsPerPage,
      }),
    }
  )
);