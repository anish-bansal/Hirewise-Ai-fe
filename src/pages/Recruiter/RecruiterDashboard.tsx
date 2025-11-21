import { useEffect, useState } from 'react';
import { applicationsApi, type Application } from '../../api/applications';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { CandidateCard } from '../../components/Recruiter/CandidateCard';
import { Loader2, History, Clock, Users, CheckCircle, XCircle, Edit2, Play } from 'lucide-react';
import { SearchBox } from '../../components/Recruiter/SearchBox';
import { ResultSummary } from '../../components/Recruiter/ResultSummary';
import { FilterDrawer } from '../../components/Recruiter/FilterDrawer';
import { searchApi, type CandidateProfile, type PastSearch, type SearchDetails } from '../../api/search';
import { ResultsHeader } from '../../components/Recruiter/ResultsHeader';
import { CandidateProfileDrawer } from '../../components/Recruiter/CandidateProfileDrawer';
import { Button } from '../../components/ui/Button';

const RecruiterDashboard = () => {
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [selectedApp, setSelectedApp] = useState<Application | null>(null);

    // Search State
    const [hasSearched, setHasSearched] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isFilterDrawerOpen, setIsFilterDrawerOpen] = useState(false);
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<CandidateProfile[]>([]);
    const [matchCount, setMatchCount] = useState(0);
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize] = useState(15);
    const [isAllSelected, setIsAllSelected] = useState(false);
    const [filters, setFilters] = useState({
        jobTitle: '',
        location: '',
        experience: '',
        skills: [] as string[]
    });

    const fetchApplications = async () => {
        setIsLoading(true);
        try {
            const data = await applicationsApi.list();
            setApplications(data);
        } catch (error) {
            console.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchApplications();
    }, []);

    const handleSearch = async (query: string, page: number = 1) => {
        setSearchQuery(query);
        setHasSearched(true);
        setIsSearching(true);
        setCurrentPage(page);

        try {
            // Call the search API
            const response = await searchApi.search(query, page, pageSize);

            // Log the response for debugging
            console.log('Search API Response:', response);

            // Handle different response structures
            // Check if response is an array directly
            let candidates: CandidateProfile[] = [];
            let total = 0;

            if (Array.isArray(response)) {
                // Response is directly an array
                candidates = response;
                total = response.length;
            } else if (response.candidates) {
                candidates = Array.isArray(response.candidates) ? response.candidates : [];
                total = response.total || response.totalMatches || response.count || candidates.length;
            } else if (response.users) {
                candidates = Array.isArray(response.users) ? response.users : [];
                total = response.total || response.totalMatches || response.count || candidates.length;
            } else if (response.data) {
                // Some APIs wrap data in a 'data' field
                candidates = Array.isArray(response.data) ? response.data : [];
                total = response.total || response.totalMatches || response.count || candidates.length;
            } else {
                // Try to find any array field in the response
                const responseKeys = Object.keys(response);
                const arrayKey = responseKeys.find(key => Array.isArray((response as any)[key]));
                if (arrayKey) {
                    candidates = (response as any)[arrayKey];
                    total = response.total || response.totalMatches || response.count || candidates.length;
                }
            }

            console.log('Parsed candidates:', candidates);
            console.log('Total count:', total);

            // Update search results
            setSearchResults(candidates);
            setMatchCount(total);

            // Update filters from API response if provided
            if ('filters' in response && response.filters) {
                setFilters({
                    jobTitle: response.filters.jobTitle || '',
                    location: response.filters.location || '',
                    experience: response.filters.experience || '',
                    skills: response.filters.skills || []
                });
            } else {
                // Fallback: parse query to auto-populate filters
        if (query.toLowerCase().includes('software engineer')) {
            setFilters(prev => ({ ...prev, jobTitle: 'Software Engineer', skills: ['Python', 'Node.js'] }));
        } else if (query.toLowerCase().includes('marketing')) {
            setFilters(prev => ({ ...prev, jobTitle: 'Marketing Manager', location: 'Europe' }));
                }
            }
        } catch (error: any) {
            console.error('Search failed:', error);
            console.error('Error details:', {
                message: error?.message,
                stack: error?.stack,
                response: error?.response
            });

            // On error, show empty results
            setSearchResults([]);
            setMatchCount(0);

            // Show user-friendly error message
            if (error?.message) {
                alert(`Search error: ${error.message}. Please check the console for more details.`);
            }
        } finally {
            setIsSearching(false);
        }
    };

    const handleUpdateFilters = (newFilters: any) => {
        setFilters(prev => ({ ...prev, ...newFilters }));
        setIsFilterDrawerOpen(false);
        // Re-run search with updated filters
        if (hasSearched && searchQuery) {
            handleSearch(searchQuery);
        }
    };

    const handleRunSearch = () => {
        if (searchQuery) {
            handleSearch(searchQuery, currentPage);
        }
    };

    const handlePageChange = (page: number) => {
        if (searchQuery) {
            handleSearch(searchQuery, page);
        }
    };

    const [selectedCandidateForDrawer, setSelectedCandidateForDrawer] = useState<CandidateProfile | null>(null);
    
    // Past Searches State
    const [isPastSearchesOpen, setIsPastSearchesOpen] = useState(false);
    const [pastSearches, setPastSearches] = useState<PastSearch[]>([]);
    const [isLoadingPastSearches, setIsLoadingPastSearches] = useState(false);
    const [selectedSearchDetails, setSelectedSearchDetails] = useState<SearchDetails | null>(null);
    const [isLoadingSearchDetails, setIsLoadingSearchDetails] = useState(false);
    const [searchFilter, setSearchFilter] = useState<'all' | 'shortlisted' | 'rejected'>('all');
    const [shortlistedUsers, setShortlistedUsers] = useState<Set<string>>(new Set());
    const [rejectedUsers, setRejectedUsers] = useState<Set<string>>(new Set());

    const fetchPastSearches = async () => {
        setIsLoadingPastSearches(true);
        try {
            const searches = await searchApi.getPastSearches();
            setPastSearches(searches);
        } catch (error) {
            console.error('Failed to fetch past searches:', error);
            alert('Failed to load past searches. Please try again.');
        } finally {
            setIsLoadingPastSearches(false);
        }
    };

    const handleOpenPastSearches = () => {
        if (!isPastSearchesOpen) {
            fetchPastSearches();
        }
        setIsPastSearchesOpen(!isPastSearchesOpen);
    };

    const handleSearchClick = async (searchId: string, filterType: 'all' | 'shortlisted' | 'rejected' = 'all') => {
        setIsLoadingSearchDetails(true);
        setSearchFilter(filterType);
        try {
            const details = await searchApi.getSearchDetails(searchId);
            setSelectedSearchDetails(details);
            
            // Update shortlisted and rejected users sets from the response
            if (details.shortlistedUsers && Array.isArray(details.shortlistedUsers)) {
                setShortlistedUsers(new Set(details.shortlistedUsers));
            }
            if (details.rejectedUsers && Array.isArray(details.rejectedUsers)) {
                setRejectedUsers(new Set(details.rejectedUsers));
            }
            
            // Get candidates from resultsSnapshot or existing users/candidates arrays
            let allCandidates: CandidateProfile[] = [];
            
            if (details.resultsSnapshot && Array.isArray(details.resultsSnapshot) && details.resultsSnapshot.length > 0) {
                // Fetch user profiles for each userId in resultsSnapshot
                const profilePromises = details.resultsSnapshot.map(async (snapshot) => {
                    try {
                        const profile = await searchApi.getUserProfile(snapshot.userId);
                        // Add match score and skills matched from snapshot
                        return {
                            ...profile,
                            id: profile.id || snapshot.userId,
                            _id: profile._id || snapshot._id,
                            matchScore: snapshot.matchScore,
                            skillsMatched: snapshot.skillsMatched,
                            recommendedAction: snapshot.recommendedAction,
                        } as CandidateProfile & { matchScore?: number; skillsMatched?: string[]; recommendedAction?: string };
                    } catch (error) {
                        console.error(`Failed to fetch profile for userId ${snapshot.userId}:`, error);
                        // Return a minimal profile object if fetch fails
                        return {
                            id: snapshot.userId,
                            _id: snapshot._id,
                            matchScore: snapshot.matchScore,
                            skillsMatched: snapshot.skillsMatched,
                            recommendedAction: snapshot.recommendedAction,
                        } as CandidateProfile & { matchScore?: number; skillsMatched?: string[]; recommendedAction?: string };
                    }
                });
                
                allCandidates = await Promise.all(profilePromises);
            } else {
                // Fallback to existing users/candidates arrays
                allCandidates = details.users || details.candidates || [];
            }
            
            // Filter based on selection
            let filteredCandidates = allCandidates;
            if (filterType === 'shortlisted') {
                const shortlistedSet = details.shortlistedUsers ? new Set(details.shortlistedUsers) : shortlistedUsers;
                filteredCandidates = allCandidates.filter((candidate: CandidateProfile) => 
                    shortlistedSet.has(candidate.id || candidate._id || '')
                );
            } else if (filterType === 'rejected') {
                const rejectedSet = details.rejectedUsers ? new Set(details.rejectedUsers) : rejectedUsers;
                filteredCandidates = allCandidates.filter((candidate: CandidateProfile) => 
                    rejectedSet.has(candidate.id || candidate._id || '')
                );
            }
            
            setSearchResults(filteredCandidates);
            setMatchCount(details.totalResults || details.totalMatches || filteredCandidates.length);
            setSearchQuery(details.searchText || details.query || '');
            setHasSearched(true);
            setIsPastSearchesOpen(false);
        } catch (error) {
            console.error('Failed to fetch search details:', error);
            alert('Failed to load search details. Please try again.');
        } finally {
            setIsLoadingSearchDetails(false);
        }
    };

    const handleViewShortlisted = async (searchId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        await handleSearchClick(searchId, 'shortlisted');
    };

    const handleViewRejected = async (searchId: string, event: React.MouseEvent) => {
        event.stopPropagation();
        await handleSearchClick(searchId, 'rejected');
    };

    const handleShortlistUser = async (searchId: string, userId: string) => {
        try {
            await searchApi.shortlistUser(searchId, userId);
            setShortlistedUsers(prev => new Set(prev).add(userId));
            setRejectedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            // Refresh search details if currently viewing this search
            if (selectedSearchDetails?.searchId === searchId || selectedSearchDetails?.id === searchId) {
                await handleSearchClick(searchId, searchFilter);
            }
        } catch (error) {
            console.error('Failed to shortlist user:', error);
            alert('Failed to shortlist user. Please try again.');
        }
    };

    const handleRejectUser = async (searchId: string, userId: string) => {
        try {
            await searchApi.rejectUser(searchId, userId);
            setRejectedUsers(prev => new Set(prev).add(userId));
            setShortlistedUsers(prev => {
                const newSet = new Set(prev);
                newSet.delete(userId);
                return newSet;
            });
            // Refresh search details if currently viewing this search
            if (selectedSearchDetails?.searchId === searchId || selectedSearchDetails?.id === searchId) {
                await handleSearchClick(searchId, searchFilter);
            }
        } catch (error) {
            console.error('Failed to reject user:', error);
            alert('Failed to reject user. Please try again.');
        }
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return 'Unknown date';
        try {
            const date = new Date(dateString);
            return date.toLocaleDateString('en-US', { 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch {
            return dateString;
        }
    };

    return (
        <div className="min-h-screen bg-gray-50/50 -m-6 p-6">
            <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in duration-500">

                {!hasSearched ? (
                    <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-8">
                        <div className="text-center space-y-4">
                            <div className="h-16 w-16 bg-white rounded-xl shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-6">
                                <svg className="h-8 w-8 text-purple-600" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                    <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                    <line x1="12" y1="22.08" x2="12" y2="12" />
                                </svg>
                            </div>
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">PeopleGPT by HireWiseAI</h1>
                            <p className="text-lg text-gray-500">Find exactly who you're looking for, in seconds.</p>
                        </div>

                        <div className="w-full max-w-3xl space-y-6">
                            <div className="flex items-center gap-4">
                                <div className="flex-1">
                            <SearchBox onSearch={handleSearch} />
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={handleOpenPastSearches}
                                    className="gap-2"
                                >
                                    <History className="h-4 w-4" />
                                    {isPastSearchesOpen ? 'Hide' : 'Show'} Past Searches
                                </Button>
                            </div>

                            {/* Past Searches Cards */}
                            {isPastSearchesOpen && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {isLoadingPastSearches ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                        </div>
                                    ) : pastSearches.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                                            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No past searches found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {pastSearches.map((search) => (
                                                <Card
                                                    key={search.id || search.searchId}
                                                    className="hover:shadow-lg transition-all border-gray-200"
                                                >
                                                    <CardContent className="p-5">
                                                        <div className="space-y-4">
                                                            {/* Header Section */}
                                                            <div className="flex items-start gap-4">
                                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-purple-700 font-bold text-sm">
                                                                        {(search.searchText || search.query) ? (search.searchText || search.query)!.charAt(0).toUpperCase() : 'S'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    {(search.searchText || search.query) && (
                                                                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                                            {search.searchText || search.query}
                                                                        </h3>
                                                                    )}
                                                                    <p className="text-sm text-gray-500">
                                                                        Do these filters look good? ({search.totalResults || search.totalMatches || 0} matches)
                                                                    </p>
                                                                    {(search.createdAt || search.updatedAt) && (
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            {formatDate(search.createdAt || search.updatedAt)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {isLoadingSearchDetails && (selectedSearchDetails?.searchId === (search.searchId || search.id) || selectedSearchDetails?.id === (search.searchId || search.id)) && (
                                                                    <Loader2 className="h-5 w-5 animate-spin text-purple-600 flex-shrink-0" />
                                                                )}
                                                            </div>

                                                            {/* Stats Section */}
                                                            <div className="flex items-center gap-6 text-sm">
                                                                {(search.totalResults !== undefined || search.totalMatches !== undefined) && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-gray-500" />
                                                                        <span className="text-gray-700 font-medium">{search.totalResults || search.totalMatches || 0} matches</span>
                                                                    </div>
                                                                )}
                                                                {search.shortlistedCount !== undefined && (
                                                                    <div className="flex items-center gap-2 text-green-600">
                                                                        <CheckCircle className="h-4 w-4" />
                                                                        <span className="font-medium">{search.shortlistedCount} shortlisted</span>
                                                                    </div>
                                                                )}
                                                                {search.rejectedCount !== undefined && (
                                                                    <div className="flex items-center gap-2 text-red-600">
                                                                        <XCircle className="h-4 w-4" />
                                                                        <span className="font-medium">{search.rejectedCount} rejected</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const id = search.searchId || search.id;
                                                                        if (id) handleSearchClick(id, 'all');
                                                                    }}
                                                                >
                                                                    <Play className="h-4 w-4 mr-2" />
                                                                    View All
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        const id = search.searchId || search.id;
                                                                        if (id) handleViewShortlisted(id, e);
                                                                    }}
                                                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                                                    disabled={!search.shortlistedCount || search.shortlistedCount === 0}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    View Shortlisted
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        const id = search.searchId || search.id;
                                                                        if (id) handleViewRejected(id, e);
                                                                    }}
                                                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                                                    disabled={!search.rejectedCount || search.rejectedCount === 0}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    View Rejected
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <div className="flex-1">
                            <SearchBox onSearch={handleSearch} />
                                </div>
                                <Button 
                                    variant="outline" 
                                    onClick={handleOpenPastSearches}
                                    className="ml-4 gap-2"
                                >
                                    <History className="h-4 w-4" />
                                    {isPastSearchesOpen ? 'Hide' : 'Show'} Past Searches
                                </Button>
                            </div>

                            {/* Past Searches Cards */}
                            {isPastSearchesOpen && (
                                <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {isLoadingPastSearches ? (
                                        <div className="flex justify-center py-8">
                                            <Loader2 className="h-6 w-6 animate-spin text-purple-600" />
                                        </div>
                                    ) : pastSearches.length === 0 ? (
                                        <div className="text-center py-8 text-gray-500 bg-white rounded-lg border border-gray-200">
                                            <History className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                                            <p>No past searches found</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-4">
                                            {pastSearches.map((search) => (
                                                <Card
                                                    key={search.id || search.searchId}
                                                    className="hover:shadow-lg transition-all border-gray-200"
                                                >
                                                    <CardContent className="p-5">
                                                        <div className="space-y-4">
                                                            {/* Header Section */}
                                                            <div className="flex items-start gap-4">
                                                                <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center flex-shrink-0">
                                                                    <span className="text-purple-700 font-bold text-sm">
                                                                        {(search.searchText || search.query) ? (search.searchText || search.query)!.charAt(0).toUpperCase() : 'S'}
                                                                    </span>
                                                                </div>
                                                                <div className="flex-1 min-w-0">
                                                                    {(search.searchText || search.query) && (
                                                                        <h3 className="text-lg font-medium text-gray-900 mb-1">
                                                                            {search.searchText || search.query}
                                                                        </h3>
                                                                    )}
                                                                    <p className="text-sm text-gray-500">
                                                                        Do these filters look good? ({search.totalResults || search.totalMatches || 0} matches)
                                                                    </p>
                                                                    {(search.createdAt || search.updatedAt) && (
                                                                        <p className="text-xs text-gray-400 mt-1">
                                                                            {formatDate(search.createdAt || search.updatedAt)}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                                {isLoadingSearchDetails && (selectedSearchDetails?.searchId === (search.searchId || search.id) || selectedSearchDetails?.id === (search.searchId || search.id)) && (
                                                                    <Loader2 className="h-5 w-5 animate-spin text-purple-600 flex-shrink-0" />
                                                                )}
                                                            </div>

                                                            {/* Stats Section */}
                                                            <div className="flex items-center gap-6 text-sm">
                                                                {(search.totalResults !== undefined || search.totalMatches !== undefined) && (
                                                                    <div className="flex items-center gap-2">
                                                                        <Users className="h-4 w-4 text-gray-500" />
                                                                        <span className="text-gray-700 font-medium">{search.totalResults || search.totalMatches || 0} matches</span>
                                                                    </div>
                                                                )}
                                                                {search.shortlistedCount !== undefined && (
                                                                    <div className="flex items-center gap-2 text-green-600">
                                                                        <CheckCircle className="h-4 w-4" />
                                                                        <span className="font-medium">{search.shortlistedCount} shortlisted</span>
                                                                    </div>
                                                                )}
                                                                {search.rejectedCount !== undefined && (
                                                                    <div className="flex items-center gap-2 text-red-600">
                                                                        <XCircle className="h-4 w-4" />
                                                                        <span className="font-medium">{search.rejectedCount} rejected</span>
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {/* Action Buttons */}
                                                            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={() => {
                                                                        const id = search.searchId || search.id;
                                                                        if (id) handleSearchClick(id, 'all');
                                                                    }}
                                                                >
                                                                    <Play className="h-4 w-4 mr-2" />
                                                                    View All
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        const id = search.searchId || search.id;
                                                                        if (id) handleViewShortlisted(id, e);
                                                                    }}
                                                                    className="border-green-200 text-green-700 hover:bg-green-50"
                                                                    disabled={!search.shortlistedCount || search.shortlistedCount === 0}
                                                                >
                                                                    <CheckCircle className="h-4 w-4 mr-2" />
                                                                    View Shortlisted
                                                                </Button>
                                                                <Button
                                                                    variant="outline"
                                                                    size="sm"
                                                                    onClick={(e) => {
                                                                        const id = search.searchId || search.id;
                                                                        if (id) handleViewRejected(id, e);
                                                                    }}
                                                                    className="border-red-200 text-red-700 hover:bg-red-50"
                                                                    disabled={!search.rejectedCount || search.rejectedCount === 0}
                                                                >
                                                                    <XCircle className="h-4 w-4 mr-2" />
                                                                    View Rejected
                                                                </Button>
                                                            </div>
                                                        </div>
                                                    </CardContent>
                                                </Card>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            )}

                            <ResultSummary
                                query={searchQuery}
                                matchCount={matchCount}
                                filters={filters}
                                onEditFilters={() => setIsFilterDrawerOpen(true)}
                                onRunSearch={handleRunSearch}
                            />
                        </div>

                        {/* Search Results - List Format */}
                        {isSearching ? (
                            <div className="flex justify-center py-12">
                                <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
                                <ResultsHeader
                                    totalCount={matchCount}
                                    currentPage={currentPage}
                                    pageSize={pageSize}
                                    isAllSelected={isAllSelected}
                                    onSelectAll={setIsAllSelected}
                                    onPageChange={handlePageChange}
                                />
                                <div className="p-6">
                                    {searchResults.map((candidate) => {
                                        // Extract data from parsedResume if available
                                        const resume = candidate.parsedResume;
                                        const experience = resume?.experience?.[0];
                                        const education = resume?.education?.[0];
                                        const contact = resume?.contact;

                                        // Map CandidateProfile to CandidateCard props
                                        const candidateData = {
                                            id: candidate.id || candidate._id || '',
                                            name: candidate.name || candidate.fullName || 'Unknown',
                                            email: candidate.email,
                                            phone: candidate.phone,
                                            // Prefer parsed resume data, fallback to top-level fields
                                            role: experience?.title || candidate.currentRole?.title || candidate.currentRole?.position,
                                            company: experience?.company || candidate.currentRole?.company || candidate.currentRole?.companyName,
                                            location: experience?.location || candidate.currentRole?.location || candidate.currentRole?.city,
                                            education: education ? `${education.degree} ${education.field ? `, ${education.field}` : ''} at ${education.institution}` :
                                                (candidate.education ? `${candidate.education.degree || ''} ${candidate.education.field || ''} at ${candidate.education.university || ''}` : undefined),
                                            bio: candidate.resumeSummary || candidate.bio || candidate.summary || candidate.description,
                                            skills: candidate.tags || candidate.skills || [],
                                            matchScore: undefined,
                                            socialLinks: {
                                                linkedin: contact?.linkedin || candidate.linkedin,
                                                github: contact?.github || candidate.github,
                                                portfolio: contact?.portfolio || candidate.portfolio || candidate.website
                                            }
                                        };

                                        return (
                                            <CandidateCard
                                                key={candidateData.id}
                                                candidate={candidateData}
                                                query={searchQuery}
                                                onShortlist={async (id: string) => {
                                                    if (selectedSearchDetails?.searchId || selectedSearchDetails?.id) {
                                                        const searchId = selectedSearchDetails.searchId || selectedSearchDetails.id || '';
                                                        const userId = candidate.id || candidate._id || id;
                                                        await handleShortlistUser(searchId, userId);
                                                    }
                                                }}
                                                onView={() => {
                                                    setSelectedCandidateForDrawer(candidate);
                                                }}
                                            />
                                        );
                                    })}
                                        </div>
                                        </div>
                        ) : hasSearched && !isSearching ? (
                            <div className="text-center py-12 text-gray-500">
                                <p>No candidates found. Try adjusting your search query.</p>
                        </div>
                        ) : null}
                    </>
                )}

                <Modal
                    isOpen={!!selectedApp}
                    onClose={() => setSelectedApp(null)}
                    title="Candidate Profile"
                >
                    {selectedApp && (
                        <CandidateCard
                            candidate={{
                                id: selectedApp.id || selectedApp.applicationId || '',
                                name: selectedApp.candidateName,
                                email: selectedApp.email,
                                phone: selectedApp.phone,
                                company: selectedApp.currentCompany,
                                bio: selectedApp.resumePreview,
                                skills: selectedApp.tags,
                                matchScore: selectedApp.scores?.unifiedScore || selectedApp.alignmentScore,
                                resumeScore: selectedApp.scores?.resumeScore,
                                status: typeof selectedApp.status === 'string' ? selectedApp.status : 'Unknown',
                            }}
                            onView={(id) => {
                                console.log('View candidate from modal:', id);
                            }}
                            onShortlist={(id) => {
                                console.log('Shortlist candidate from modal:', id);
                            }}
                        />
                    )}
                </Modal>

                <FilterDrawer
                    isOpen={isFilterDrawerOpen}
                    onClose={() => setIsFilterDrawerOpen(false)}
                    filters={filters}
                    onSave={handleUpdateFilters}
                />

                <CandidateProfileDrawer
                    isOpen={!!selectedCandidateForDrawer}
                    onClose={() => setSelectedCandidateForDrawer(null)}
                    candidate={selectedCandidateForDrawer}
                    fromRecruiterPage={true}
                />
            </div>
        </div>
    );
};

export default RecruiterDashboard;
