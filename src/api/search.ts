import { request } from './apiClient';

export interface CandidateProfile {
    id: string;
    _id?: string; // Some APIs return _id
    name?: string;
    fullName?: string; // Some APIs return fullName
    email?: string;
    phone?: string;
    currentRole?: {
        title?: string;
        position?: string;
        company?: string;
        companyName?: string;
        location?: string;
        city?: string;
        state?: string;
        country?: string;
        companyLogo?: string;
    };
    education?: {
        degree?: string;
        field?: string;
        major?: string;
        university?: string;
        universityName?: string;
        universityLogo?: string;
        graduationYear?: string;
    };
    skills?: string[];
    tags?: string[]; // Added based on user feedback
    bio?: string;
    summary?: string;
    description?: string;
    resumeSummary?: string; // Added based on user feedback
    parsedResume?: { // Added based on user feedback
        contact?: {
            email?: string;
            phone?: string;
            linkedin?: string;
            github?: string;
            portfolio?: string;
        };
        education?: Array<{
            institution?: string;
            degree?: string;
            field?: string;
            duration?: string;
            gpa?: string;
            location?: string;
        }>;
        experience?: Array<{
            title?: string;
            company?: string;
            duration?: string;
            location?: string;
            responsibilities?: string[];
        }>;
        projects?: Array<{
            name?: string;
            technologies?: string[];
            description?: string[];
        }>;
        skills?: {
            languages?: string[];
            frameworks?: string[];
            tools?: string[];
            other?: string[];
        };
    };
    linkedin?: string;
    github?: string;
    portfolio?: string;
    website?: string;
    twitter?: string;
    stackoverflow?: string;
    devto?: string;
    highlightedKeywords?: string[];
}

export interface SearchResponse {
    candidates?: CandidateProfile[];
    users?: CandidateProfile[]; // Alternative field name
    data?: CandidateProfile[]; // Some APIs use 'data'
    total?: number;
    totalMatches?: number;
    count?: number;
    page?: number;
    pageSize?: number;
    totalPages?: number;
    filters?: {
        jobTitle?: string;
        location?: string;
        experience?: string;
        skills?: string[];
        industry?: string;
    };
    // Allow any other fields
    [key: string]: any;
}

export interface PastSearch {
    id?: string;
    searchId: string;
    searchText?: string;
    query?: string; // For backward compatibility
    createdAt?: string;
    updatedAt?: string;
    shortlistedCount?: number;
    rejectedCount?: number;
    totalResults?: number;
    totalMatches?: number; // For backward compatibility
    [key: string]: any;
}

export interface SearchResultSnapshot {
    userId: string;
    matchScore?: number;
    skillsMatched?: string[];
    recommendedAction?: string;
    _id?: string;
}

export interface SearchDetails {
    id?: string;
    searchId: string;
    searchText?: string;
    query?: string; // For backward compatibility
    searchCriteria?: {
        tags?: string[];
        resumeKeywords?: string[];
        isHired?: boolean;
    };
    explanation?: string;
    createdAt?: string;
    updatedAt?: string;
    users?: CandidateProfile[];
    candidates?: CandidateProfile[];
    resultsSnapshot?: SearchResultSnapshot[];
    shortlistedUsers?: string[];
    rejectedUsers?: string[];
    shortlistedCount?: number;
    rejectedCount?: number;
    totalResults?: number;
    totalMatches?: number; // For backward compatibility
    [key: string]: any;
}

export const searchApi = {
    search: async (query: string, page: number = 1, pageSize: number = 15): Promise<SearchResponse | CandidateProfile[]> => {
        try {
            console.log('Calling search API with:', { query, page, pageSize });

            // Try the API endpoint
            const response = await request<SearchResponse | CandidateProfile[]>('/api/users/search', {
                method: 'POST',
                body: JSON.stringify({ query, page, pageSize })
            });

            console.log('Raw API response:', response);
            console.log('Response type:', typeof response);
            console.log('Is array?', Array.isArray(response));

            return response;
        } catch (error: any) {
            console.error('Search API error:', error);
            console.error('Error message:', error?.message);
            console.error('Error stack:', error?.stack);

            // Re-throw with more context
            throw new Error(`Search API failed: ${error?.message || 'Unknown error'}`);
        }
    },

    getPastSearches: async (): Promise<PastSearch[]> => {
        try {
            const response = await request<PastSearch[] | { searches?: PastSearch[]; data?: PastSearch[] }>('/api/users/searches', {
                method: 'GET'
            });

            // Handle different response structures
            if (Array.isArray(response)) {
                return response;
            } else if (response && Array.isArray((response as any).searches)) {
                return (response as any).searches;
            } else if (response && Array.isArray((response as any).data)) {
                return (response as any).data;
            }
            return [];
        } catch (error: any) {
            console.error('Get past searches API error:', error);
            throw new Error(`Failed to fetch past searches: ${error?.message || 'Unknown error'}`);
        }
    },

    getSearchDetails: async (searchId: string, status?: 'shortlisted' | 'rejected'): Promise<SearchDetails> => {
        try {
            const url = status 
                ? `/api/users/search/${searchId}?status=${status}`
                : `/api/users/search/${searchId}`;
            const response = await request<SearchDetails>(url, {
                method: 'GET'
            });
            return response;
        } catch (error: any) {
            console.error('Get search details API error:', error);
            throw new Error(`Failed to fetch search details: ${error?.message || 'Unknown error'}`);
        }
    },

    getUserProfile: async (userId: string): Promise<CandidateProfile> => {
        try {
            const response = await request<CandidateProfile>(`/api/users/${userId}`, {
                method: 'GET'
            });
            return response;
        } catch (error: any) {
            console.error('Get user profile API error:', error);
            throw new Error(`Failed to fetch user profile: ${error?.message || 'Unknown error'}`);
        }
    },

    shortlistUser: async (searchId: string, userId: string): Promise<{ success: boolean }> => {
        try {
            const response = await request<{ success: boolean }>(`/api/users/search/${searchId}/shortlist`, {
                method: 'POST',
                body: JSON.stringify({ userId })
            });
            return response;
        } catch (error: any) {
            console.error('Shortlist user API error:', error);
            throw new Error(`Failed to shortlist user: ${error?.message || 'Unknown error'}`);
        }
    },

    rejectUser: async (searchId: string, userId: string): Promise<{ success: boolean }> => {
        try {
            const response = await request<{ success: boolean }>(`/api/users/search/${searchId}/reject`, {
                method: 'POST',
                body: JSON.stringify({ userId })
            });
            return response;
        } catch (error: any) {
            console.error('Reject user API error:', error);
            throw new Error(`Failed to reject user: ${error?.message || 'Unknown error'}`);
        }
    }
};

