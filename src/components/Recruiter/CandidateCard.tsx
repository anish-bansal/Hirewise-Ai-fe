import React from 'react';
import { Building2, GraduationCap, Linkedin, Github, ExternalLink, Eye, Bookmark, Sparkles, Mail } from 'lucide-react';
import { Button } from '../ui/Button';
import { Card, CardContent } from '../ui/Card';

export interface CandidateCardProps {
    candidate: {
        id: string;
        name: string;
        email?: string;
        phone?: string;
        role?: string;
        company?: string;
        location?: string;
        education?: string;
        bio?: string; // Summary
        skills?: string[]; // Used for highlighting
        matchScore?: number;
        resumeScore?: number;
        socialLinks?: {
            linkedin?: string;
            github?: string;
            portfolio?: string;
            twitter?: string;
            stackoverflow?: string;
            devto?: string;
        };
        status?: string;
    };
    onShortlist?: (id: string) => void;
    onView?: (id: string) => void;
    query?: string; // For highlighting
}

export const CandidateCard: React.FC<CandidateCardProps> = ({ candidate, onShortlist, onView, query = '' }) => {

    // Helper to highlight keywords
    const renderHighlightedBio = (text: string, keywords: string[] = []) => {
        if (!text) return null;

        // Combine query terms and top skills for highlighting
        const queryTerms = query.toLowerCase().split(/\s+/).filter(t => t.length > 2);
        const skillTerms = keywords.map(k => k.toLowerCase());
        const termsToHighlight = [...new Set([...queryTerms, ...skillTerms])];

        if (termsToHighlight.length === 0) return <p className="text-sm text-gray-700 leading-relaxed">{text}</p>;

        // Escape special characters for regex
        const escapedTerms = termsToHighlight.map(term => term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
        const pattern = new RegExp(`(${escapedTerms.join('|')})`, 'gi');

        const parts = text.split(pattern);

        return (
            <p className="text-sm text-gray-700 leading-relaxed">
                {parts.map((part, i) => {
                    if (termsToHighlight.some(term => term === part.toLowerCase())) {
                        return (
                            <span key={i} className="bg-purple-100 text-purple-900 font-medium px-1 rounded-sm">
                                {part}
                            </span>
                        );
                    }
                    return <span key={i}>{part}</span>;
                })}
            </p>
        );
    };

    return (
        <Card
            className="group hover:shadow-md transition-all duration-200 border-l-4 border-l-transparent hover:border-l-purple-600 mb-4 cursor-pointer"
            onClick={() => onView?.(candidate.id)}
        >
            <CardContent className="p-5">
                <div className="flex flex-col gap-4">
                    {/* Header: Name, Socials, Actions */}
                    <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3 flex-wrap">
                            {/* Checkbox placeholder if needed */}
                            <div
                                className="h-5 w-5 rounded border border-gray-300 mr-1"
                                onClick={(e) => e.stopPropagation()}
                            ></div>

                            <h3 className="text-lg font-bold text-gray-900">{candidate.name}</h3>

                            <div className="flex items-center gap-1.5 ml-2" onClick={(e) => e.stopPropagation()}>
                                {candidate.socialLinks?.portfolio && (
                                    <a href={candidate.socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700 p-1 bg-purple-50 rounded">
                                        <ExternalLink className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {candidate.socialLinks?.linkedin && (
                                    <a href={candidate.socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-700 p-1 bg-blue-50 rounded">
                                        <Linkedin className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {candidate.email && (
                                    <a href={`mailto:${candidate.email}`} className="text-gray-600 hover:text-gray-700 p-1 bg-gray-100 rounded">
                                        <Mail className="h-3.5 w-3.5" />
                                    </a>
                                )}
                                {candidate.socialLinks?.github && (
                                    <a href={candidate.socialLinks.github} target="_blank" rel="noopener noreferrer" className="text-gray-700 hover:text-black p-1 bg-gray-100 rounded">
                                        <Github className="h-3.5 w-3.5" />
                                    </a>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                className="h-8 gap-1.5 text-xs font-medium"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onShortlist?.(candidate.id);
                                }}
                            >
                                <Bookmark className="h-3.5 w-3.5" />
                                Shortlist
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={(e) => {
                                    e.stopPropagation();
                                    onView?.(candidate.id);
                                }}
                            >
                                <Eye className="h-4 w-4 text-gray-500" />
                            </Button>
                        </div>
                    </div>

                    {/* Role & Company */}
                    <div className="space-y-2 -mt-1">
                        {candidate.role && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="h-5 w-5 rounded-full bg-blue-900 flex items-center justify-center flex-shrink-0">
                                    <Building2 className="h-3 w-3 text-white" />
                                </div>
                                <span className="font-semibold">{candidate.role}</span>
                                {candidate.company && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span>{candidate.company}</span>
                                    </>
                                )}
                                {candidate.location && (
                                    <>
                                        <span className="text-gray-400">•</span>
                                        <span className="text-gray-500">{candidate.location}</span>
                                    </>
                                )}
                            </div>
                        )}

                        {/* Education */}
                        {candidate.education && (
                            <div className="flex items-center gap-2 text-sm text-gray-700">
                                <div className="h-5 w-5 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                                    <GraduationCap className="h-3 w-3 text-gray-600" />
                                </div>
                                <span>{candidate.education}</span>
                            </div>
                        )}
                    </div>

                    {/* Bio / Summary with Highlights */}
                    {candidate.bio && (
                        <div className="flex items-start gap-2.5 mt-1">
                            <Sparkles className="h-4 w-4 text-purple-600 flex-shrink-0 mt-0.5" />
                            {renderHighlightedBio(candidate.bio, candidate.skills)}
                        </div>
                    )}
                </div>
            </CardContent>
        </Card>
    );
};
