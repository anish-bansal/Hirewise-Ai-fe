import React, { useState } from 'react';
import { Drawer } from '../ui/Drawer';
import { Button } from '../ui/Button';
import { motion } from 'framer-motion';
import {
    Linkedin, Github, Mail, Phone, ExternalLink, MapPin,
    Building2, GraduationCap, Download, Share2,
    Briefcase, Code2, Award, BookOpen, DollarSign, Zap, FileText
} from 'lucide-react';

interface CandidateProfileDrawerProps {
    isOpen: boolean;
    onClose: () => void;
    candidate: any; // Using any for flexibility with the complex JSON structure, but should be typed ideally
}

export const CandidateProfileDrawer: React.FC<CandidateProfileDrawerProps> = ({
    isOpen,
    onClose,
    candidate
}) => {
    const [activeTab, setActiveTab] = useState<'overview' | 'experience' | 'education' | 'projects' | 'skills'>('overview');

    if (!candidate) return null;

    const parsedResume = candidate.parsedResume || candidate.candidate?.parsedResume || {};
    const contact = parsedResume.contact || {};
    const experience = parsedResume.experience || [];
    const education = parsedResume.education || [];
    const projects = parsedResume.projects || [];
    const skills = parsedResume.skills || {};

    const scores = candidate.scores || {};
    const unifiedScore = scores.unifiedScore || candidate.matchScore || candidate.alignmentScore;
    const resumeScore = scores.resumeScore || candidate.resumeScore;
    const githubScore = scores.githubPortfolioScore;
    const compensationScore = scores.compensationScore;
    const compensationAnalysis = scores.compensationAnalysis;

    const scoreItems = [
        {
            id: 'unified',
            label: 'Overall Match',
            value: unifiedScore,
            icon: Zap,
            color: 'text-purple-600',
            bg: 'bg-purple-100',
            barColor: 'bg-purple-600',
            description: 'Combined score based on all factors'
        },
        {
            id: 'resume',
            label: 'Resume Score',
            value: resumeScore,
            icon: FileText,
            color: 'text-blue-600',
            bg: 'bg-blue-100',
            barColor: 'bg-blue-600',
            description: 'Based on skills and experience match'
        },
        {
            id: 'github',
            label: 'GitHub / Portfolio',
            value: githubScore,
            icon: Github,
            color: 'text-gray-700',
            bg: 'bg-gray-100',
            barColor: 'bg-gray-800',
            description: 'Code quality and project impact'
        },
        {
            id: 'compensation',
            label: 'Compensation',
            value: compensationScore,
            icon: DollarSign,
            color: 'text-green-600',
            bg: 'bg-green-100',
            barColor: 'bg-green-600',
            description: compensationAnalysis || 'Salary expectation alignment'
        }
    ].filter(item => item.value !== undefined && item.value !== null);

    const socialLinks = {
        linkedin: contact.linkedin || candidate.candidate?.linkedin || candidate.socialLinks?.linkedin,
        github: contact.github || candidate.candidate?.github || candidate.socialLinks?.github,
        portfolio: contact.portfolio || candidate.candidate?.portfolio || candidate.socialLinks?.portfolio,
        email: contact.email || candidate.email,
        phone: contact.phone || candidate.phone
    };

    const tabs = [
        { id: 'overview', label: 'Overview', icon: BookOpen },
        { id: 'experience', label: 'Experience', icon: Briefcase },
        { id: 'education', label: 'Education', icon: GraduationCap },
        { id: 'projects', label: 'Projects', icon: Code2 },
        { id: 'skills', label: 'Skills', icon: Award },
    ];

    return (
        <Drawer isOpen={isOpen} onClose={onClose} title="Candidate Profile" width="max-w-3xl">
            <div className="flex flex-col h-full">
                {/* Profile Header */}
                <div className="px-8 py-6 bg-white border-b border-gray-100">
                    <div className="flex items-start justify-between mb-6">
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 rounded-full bg-purple-100 flex items-center justify-center text-purple-600 text-2xl font-bold">
                                {candidate.name?.charAt(0) || 'C'}
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{candidate.name}</h1>
                                <p className="text-gray-500 text-sm mt-1 flex items-center gap-2">
                                    {candidate.role || experience[0]?.title || 'Candidate'}
                                    {(candidate.location || experience[0]?.location) && (
                                        <>
                                            <span className="w-1 h-1 rounded-full bg-gray-300" />
                                            <span className="flex items-center gap-1">
                                                <MapPin className="h-3 w-3" />
                                                {candidate.location || experience[0]?.location}
                                            </span>
                                        </>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" className="gap-2">
                                <Share2 className="h-4 w-4" />
                                Share
                            </Button>
                            <Button size="sm" className="gap-2">
                                <Download className="h-4 w-4" />
                                Resume
                            </Button>
                        </div>
                    </div>

                    {/* Social Links */}
                    <div className="flex flex-wrap gap-3">
                        {socialLinks.email && (
                            <a href={`mailto:${socialLinks.email}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-sm hover:bg-gray-100 transition-colors">
                                <Mail className="h-3.5 w-3.5" />
                                {socialLinks.email}
                            </a>
                        )}
                        {socialLinks.phone && (
                            <a href={`tel:${socialLinks.phone}`} className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-50 text-gray-600 text-sm hover:bg-gray-100 transition-colors">
                                <Phone className="h-3.5 w-3.5" />
                                {socialLinks.phone}
                            </a>
                        )}
                        {socialLinks.linkedin && (
                            <a href={socialLinks.linkedin} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-sm hover:bg-blue-100 transition-colors">
                                <Linkedin className="h-3.5 w-3.5" />
                                LinkedIn
                            </a>
                        )}
                        {socialLinks.github && (
                            <a href={socialLinks.github} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gray-100 text-gray-700 text-sm hover:bg-gray-200 transition-colors">
                                <Github className="h-3.5 w-3.5" />
                                GitHub
                            </a>
                        )}
                        {socialLinks.portfolio && (
                            <a href={socialLinks.portfolio} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-50 text-purple-600 text-sm hover:bg-purple-100 transition-colors">
                                <ExternalLink className="h-3.5 w-3.5" />
                                Portfolio
                            </a>
                        )}
                    </div>
                </div>

                {/* Tabs Navigation */}
                <div className="px-8 border-b border-gray-100 sticky top-0 bg-white z-10">
                    <div className="flex gap-6 overflow-x-auto no-scrollbar">
                        {tabs.map((tab) => {
                            const Icon = tab.icon;
                            const isActive = activeTab === tab.id;
                            return (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={`
                                        flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-colors whitespace-nowrap
                                        ${isActive
                                            ? 'border-purple-600 text-purple-600'
                                            : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}
                                    `}
                                >
                                    <Icon className="h-4 w-4" />
                                    {tab.label}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="flex-1 overflow-y-auto p-8 bg-gray-50/50">
                    {activeTab === 'overview' && (
                        <div className="space-y-8">
                            {/* Premium Scores Section */}
                            <section>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Match Analysis</h3>
                                <div className="flex flex-col gap-4">
                                    {scoreItems.map((item, index) => (
                                        <motion.div
                                            key={item.id}
                                            initial={{ opacity: 0, y: 20 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.1, duration: 0.4 }}
                                            className="bg-white rounded-xl p-5 shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden group"
                                        >
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="flex items-center gap-3">
                                                    <div className={`p-2 rounded-lg ${item.bg} ${item.color}`}>
                                                        <item.icon className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-600">{item.label}</p>
                                                        <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{item.description}</p>
                                                    </div>
                                                </div>
                                                <span className={`text-2xl font-bold ${item.color}`}>
                                                    {Math.round(item.value)}%
                                                </span>
                                            </div>

                                            <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                                                <motion.div
                                                    initial={{ width: 0 }}
                                                    animate={{ width: `${item.value}%` }}
                                                    transition={{ duration: 1, ease: "easeOut", delay: 0.2 + (index * 0.1) }}
                                                    className={`h-full rounded-full ${item.barColor}`}
                                                />
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            </section>

                            {/* Summary */}
                            <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                <h3 className="text-lg font-semibold text-gray-900 mb-4">Professional Summary</h3>
                                <p className="text-gray-600 leading-relaxed whitespace-pre-line">
                                    {parsedResume.resumeSummary || parsedResume.profile || candidate.bio || 'No summary provided.'}
                                </p>
                            </section>

                            {/* Key Highlights */}
                            {candidate.topReasons && candidate.topReasons.length > 0 && (
                                <section className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Why they're a match</h3>
                                    <ul className="space-y-3">
                                        {candidate.topReasons.map((reason: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3 text-gray-700">
                                                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-green-500 flex-shrink-0" />
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </section>
                            )}
                        </div>
                    )}

                    {activeTab === 'experience' && (
                        <div className="space-y-6">
                            {experience.length > 0 ? (
                                experience.map((role: any, i: number) => (
                                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 relative">
                                        {/* Timeline connector */}
                                        {i !== experience.length - 1 && (
                                            <div className="absolute left-10 top-20 bottom-0 w-0.5 bg-gray-100" />
                                        )}

                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-blue-50 flex items-center justify-center text-blue-600 flex-shrink-0">
                                                <Building2 className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{role.title}</h3>
                                                        <p className="text-purple-600 font-medium">{role.company}</p>
                                                    </div>
                                                    <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                        {role.duration}
                                                    </span>
                                                </div>

                                                {role.location && (
                                                    <div className="flex items-center gap-1.5 text-sm text-gray-500 mt-1 mb-3">
                                                        <MapPin className="h-3.5 w-3.5" />
                                                        {role.location}
                                                    </div>
                                                )}

                                                {role.responsibilities && role.responsibilities.length > 0 && (
                                                    <ul className="mt-4 space-y-2">
                                                        {role.responsibilities.map((resp: string, j: number) => (
                                                            <li key={j} className="text-sm text-gray-600 flex items-start gap-2">
                                                                <span className="mt-1.5 h-1 w-1 rounded-full bg-gray-400 flex-shrink-0" />
                                                                {resp}
                                                            </li>
                                                        ))}
                                                    </ul>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">No experience listed</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'education' && (
                        <div className="space-y-6">
                            {education.length > 0 ? (
                                education.map((edu: any, i: number) => (
                                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex gap-4">
                                            <div className="h-12 w-12 rounded-lg bg-orange-50 flex items-center justify-center text-orange-600 flex-shrink-0">
                                                <GraduationCap className="h-6 w-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex justify-between items-start">
                                                    <div>
                                                        <h3 className="text-lg font-semibold text-gray-900">{edu.institution}</h3>
                                                        <p className="text-gray-700 font-medium">{edu.degree} {edu.field && `in ${edu.field}`}</p>
                                                    </div>
                                                    <span className="text-sm text-gray-500 bg-gray-50 px-2 py-1 rounded">
                                                        {edu.duration}
                                                    </span>
                                                </div>
                                                {edu.gpa && (
                                                    <p className="text-sm text-gray-500 mt-2">GPA: {edu.gpa}</p>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">No education listed</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'projects' && (
                        <div className="space-y-6">
                            {projects.length > 0 ? (
                                projects.map((project: any, i: number) => (
                                    <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="text-lg font-semibold text-gray-900">{project.name}</h3>
                                            {project.links && project.links.length > 0 && (
                                                <div className="flex gap-2">
                                                    {project.links.map((link: string, j: number) => (
                                                        <a key={j} href={link} target="_blank" rel="noopener noreferrer" className="text-purple-600 hover:text-purple-700">
                                                            <ExternalLink className="h-4 w-4" />
                                                        </a>
                                                    ))}
                                                </div>
                                            )}
                                        </div>

                                        {project.description && (
                                            <div className="text-sm text-gray-600 mb-4 space-y-2">
                                                {Array.isArray(project.description) ? (
                                                    project.description.map((desc: string, j: number) => (
                                                        <p key={j}>{desc}</p>
                                                    ))
                                                ) : (
                                                    <p>{project.description}</p>
                                                )}
                                            </div>
                                        )}

                                        {project.technologies && (
                                            <div className="flex flex-wrap gap-2">
                                                {project.technologies.map((tech: string, j: number) => (
                                                    <span key={j} className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-medium">
                                                        {tech}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="text-center py-12 text-gray-500">No projects listed</div>
                            )}
                        </div>
                    )}

                    {activeTab === 'skills' && (
                        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                            <div className="space-y-8">
                                {Object.entries(skills).map(([category, items]: [string, any]) => {
                                    if (!items || items.length === 0) return null;
                                    return (
                                        <div key={category}>
                                            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                                {category.replace(/([A-Z])/g, ' $1').trim()}
                                            </h3>
                                            <div className="flex flex-wrap gap-2">
                                                {items.map((skill: string, i: number) => (
                                                    <span key={i} className="px-3 py-1.5 rounded-lg bg-purple-50 text-purple-700 text-sm font-medium border border-purple-100">
                                                        {skill}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                                {candidate.tags && (
                                    <div>
                                        <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
                                            Other Tags
                                        </h3>
                                        <div className="flex flex-wrap gap-2">
                                            {candidate.tags.map((tag: string, i: number) => (
                                                <span key={i} className="px-3 py-1.5 rounded-lg bg-gray-100 text-gray-700 text-sm font-medium">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </Drawer>
    );
};
