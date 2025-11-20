import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { jobsApi, type Job } from '../../api/jobs';
import { applicationsApi, type Application, formatApplicationStatus } from '../../api/applications';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Loader2, ExternalLink, Copy, User, Mail, TrendingUp, Building2 } from 'lucide-react';
import { Input } from '../../components/ui/Input';

// Circular Score Component
const CircularScore = ({ score, size = 80, strokeWidth = 8 }: { score: number; size?: number; strokeWidth?: number }) => {
    const radius = (size - strokeWidth) / 2;
    const circumference = radius * 2 * Math.PI;
    const offset = circumference - (score / 100) * circumference;
    
    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-green-500';
        if (score >= 60) return 'text-yellow-500';
        if (score >= 40) return 'text-orange-500';
        return 'text-red-500';
    };
    
    const getScoreBgColor = (score: number) => {
        if (score >= 80) return 'bg-green-500';
        if (score >= 60) return 'bg-yellow-500';
        if (score >= 40) return 'bg-orange-500';
        return 'bg-red-500';
    };
    
    const getStrokeColor = (score: number) => {
        if (score >= 80) return '#22c55e';
        if (score >= 60) return '#eab308';
        if (score >= 40) return '#f97316';
        return '#ef4444';
    };

    return (
        <div className="relative inline-flex items-center justify-center">
            <svg width={size} height={size} className="transform -rotate-90">
                {/* Background circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="none"
                    className="text-muted/20"
                />
                {/* Progress circle */}
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={getStrokeColor(score)}
                    strokeWidth={strokeWidth}
                    fill="none"
                    strokeDasharray={circumference}
                    strokeDashoffset={offset}
                    strokeLinecap="round"
                    className="transition-all duration-500 ease-out"
                />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-2xl font-bold ${getScoreColor(score)}`}>
                    {Math.round(score)}
                </span>
                <span className="text-xs text-muted-foreground">%</span>
            </div>
        </div>
    );
};

const JobDetailPage = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const [job, setJob] = useState<Job | null>(null);
    const [applications, setApplications] = useState<Application[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isLoadingApplications, setIsLoadingApplications] = useState(false);

    useEffect(() => {
        const fetchJob = async () => {
            if (!jobId) return;
            try {
                const data = await jobsApi.get(jobId);
                setJob(data);
            } catch (error) {
                console.error(error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchJob();
    }, [jobId]);

    useEffect(() => {
        const fetchApplications = async () => {
            if (!jobId) return;
            setIsLoadingApplications(true);
            try {
                const data = await applicationsApi.getByJobId(jobId, {
                    sortBy: 'score',
                    sortOrder: 'desc'
                });
                // Ensure data is always an array
                setApplications(Array.isArray(data) ? data : []);
            } catch (error) {
                console.error('Failed to fetch applications:', error);
                setApplications([]); // Set empty array on error
            } finally {
                setIsLoadingApplications(false);
            }
        };
        if (jobId) {
            fetchApplications();
        }
    }, [jobId]);

    if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="h-8 w-8 animate-spin" /></div>;
    if (!job) return <div className="text-center py-8">Job not found</div>;

    const publicLink = `${window.location.origin}/agent/${job.id}`;

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold">{job.role}</h1>
                    <p className="text-muted-foreground">{job.company_name} • {job.seniority}</p>
                </div>
                <div className="flex space-x-2">
                    <Button variant="outline" asChild>
                        <Link to={`/agent/${job.id}`} target="_blank">
                            <ExternalLink className="mr-2 h-4 w-4" />
                            View Public Page
                        </Link>
                    </Button>
                    <Button>Publish Job</Button>
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
                <div className="md:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Enhanced Job Description</CardTitle>
                            <CardDescription>Generated by our AI agent based on your input.</CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap">
                                {job.enhanced_jd || job.raw_jd}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Candidate Matches</CardTitle>
                            <CardDescription>
                                {isLoadingApplications 
                                    ? 'Loading applications...' 
                                    : `${applications.length} ${applications.length === 1 ? 'match' : 'matches'} found`}
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {isLoadingApplications ? (
                                <div className="flex justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                </div>
                            ) : !Array.isArray(applications) || applications.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground">
                                    <p>No applications found for this job yet.</p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {applications.map((application) => {
                                        const resumeScore = application.scores?.resumeScore;
                                        const unifiedScore = application.scores?.unifiedScore || application.alignmentScore;
                                        
                                        return (
                                            <Card key={application.id || application.applicationId} className="border-l-4 border-l-primary hover:shadow-md transition-shadow">
                                                <CardContent className="pt-6">
                                                    <div className="flex items-start gap-6">
                                                        {/* Score Section */}
                                                        <div className="flex-shrink-0">
                                                            <div className="flex flex-col items-center gap-2">
                                                                <CircularScore score={unifiedScore} size={100} strokeWidth={10} />
                                                                <div className="text-xs text-muted-foreground text-center">
                                                                    <div className="font-medium">Match Score</div>
                                                                    {resumeScore && resumeScore !== unifiedScore && (
                                                                        <div className="text-xs mt-1">
                                                                            Resume: {Math.round(resumeScore)}%
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>

                                                        {/* Details Section */}
                                                        <div className="flex-1 space-y-4">
                                                            <div className="space-y-2">
                                                                <div className="flex items-center gap-2">
                                                                    <User className="h-4 w-4 text-muted-foreground" />
                                                                    <span className="font-semibold text-lg">{application.candidateName}</span>
                                                                </div>
                                                                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                                    <Mail className="h-3 w-3" />
                                                                    <span>{application.email}</span>
                                                                </div>
                                                                {application.currentCompany && (
                                                                    <div className="flex items-center gap-2 text-sm">
                                                                        <Building2 className="h-3 w-3 text-muted-foreground" />
                                                                        <span className="text-muted-foreground">{application.currentCompany}</span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                            
                                                            <div className="flex items-center gap-3 flex-wrap">
                                                                <div className="inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground">
                                                                    {formatApplicationStatus(application.status)}
                                                                </div>
                                                                {application.phone && (
                                                                    <div className="text-xs text-muted-foreground">
                                                                        {application.phone}
                                                                    </div>
                                                                )}
                                                            </div>

                                                            {application.tags && application.tags.length > 0 && (
                                                                <div className="flex flex-wrap gap-2">
                                                                    {application.tags.slice(0, 12).map((tag, idx) => (
                                                                        <span 
                                                                            key={idx}
                                                                            className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-primary/10 text-primary hover:bg-primary/20"
                                                                        >
                                                                            {tag}
                                                                        </span>
                                                                    ))}
                                                                    {application.tags.length > 12 && (
                                                                        <span className="inline-flex items-center rounded-full border px-2.5 py-1 text-xs font-medium text-muted-foreground bg-muted/50">
                                                                            +{application.tags.length - 12} more
                                                                        </span>
                                                                    )}
                                                                </div>
                                                            )}

                                                            {application.resumePreview && (
                                                                <p className="text-sm text-muted-foreground line-clamp-2 bg-muted/30 p-2 rounded-md">
                                                                    {application.resumePreview}
                                                                </p>
                                                            )}
                                                        </div>
                                                    </div>
                                                </CardContent>
                                            </Card>
                                        );
                                    })}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>

                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Job Settings</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Public Link</label>
                                <div className="flex space-x-2">
                                    <Input readOnly value={publicLink} />
                                    <Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(publicLink)}>
                                        <Copy className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Status</label>
                                <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 border-transparent bg-secondary text-secondary-foreground hover:bg-secondary/80">
                                    {job.status}
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default JobDetailPage;
