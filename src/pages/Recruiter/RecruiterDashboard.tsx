import { useEffect, useState } from 'react';
import { applicationsApi, type Application } from '../../api/applications';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { CandidateCard } from '../../components/Recruiter/CandidateCard';
import { Loader2 } from 'lucide-react';
import { SearchBox } from '../../components/Recruiter/SearchBox';
import { ResultSummary } from '../../components/Recruiter/ResultSummary';
import { FilterDrawer } from '../../components/Recruiter/FilterDrawer';
import { searchApi, type CandidateProfile } from '../../api/search';
import { ResultsHeader } from '../../components/Recruiter/ResultsHeader';
import { CandidateProfileDrawer } from '../../components/Recruiter/CandidateProfileDrawer';

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
                            <h1 className="text-4xl font-bold tracking-tight text-gray-900">PeopleGPT by HireWise</h1>
                            <p className="text-lg text-gray-500">Find exactly who you're looking for, in seconds.</p>
                        </div>

                        <div className="w-full max-w-3xl">
                            <SearchBox onSearch={handleSearch} />
                        </div>
                    </div>
                ) : (
                    <>
                        <div className="space-y-6">
                            <SearchBox onSearch={handleSearch} />

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
                                                onShortlist={(id: string) => {
                                                    console.log('Shortlist candidate:', id);
                                                    // TODO: Implement shortlist functionality
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
                />
            </div>
        </div>
    );
};

export default RecruiterDashboard;
