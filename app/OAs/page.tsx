'use client'

import React, { useEffect, useState } from 'react';
import { AvatarImage, AvatarFallback, Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import ReactMarkdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';
import { getPendingModules, getApprovedModules } from '../githubApi'; // Adjust the import path as necessary

type User = {
    login: string;
};

type PullRequest = {
    id: number;
    title: string;
    body: string | null;
    html_url: string;
    user: User;
    created_at: string;
    comments_url: string;
    comments_count?: number; // Optional field to store the comments count
};

const MAX_BODY_LENGTH = 150;

const truncateText = (text: string | null, length: number) => {
    if (!text || text.length <= length) {
        return { truncatedText: text || "", isTruncated: false };
    }
    return { truncatedText: text.slice(0, length) + "...", isTruncated: true };
};

const PendingAndApprovedModules = () => {
    const [pendingModules, setPendingModules] = useState<PullRequest[]>([]);
    const [approvedModules, setApprovedModules] = useState<PullRequest[]>([]);
    const [expandedModules, setExpandedModules] = useState<{ [key: number]: boolean }>({});

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const pending = await getPendingModules();
                const approved = await getApprovedModules();
                
                const filteredPending = pending.filter(module => module.body && module.body.includes("Verify my module"));
                const filteredApproved = approved.filter(module => module.body && module.body.includes("Verify my module"));

                setPendingModules(filteredPending);
                setApprovedModules(filteredApproved);
            } catch (error) {
                console.error('Error fetching modules:', error);
            }
        };

        fetchModules();
    }, []);

    const toggleReadMore = (id: number) => {
        setExpandedModules(prevState => ({
            ...prevState,
            [id]: !prevState[id]
        }));
    };

    const renderModule = (module: PullRequest, status: string) => {
        const { truncatedText, isTruncated } = truncateText(module.body, MAX_BODY_LENGTH);
        const isExpanded = expandedModules[module.id];

        const badgeClass = status === 'approved' 
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';

        return (
            <div className="bg-white rounded-lg shadow-md overflow-hidden dark:bg-gray-950" key={module.id}>
                <Link className="block" href={module.html_url}>
                    <div className="p-4 md:p-6">
                        <h3 className="text-lg font-semibold mb-2">{module.title}</h3>
                        <div className="text-gray-500 dark:text-gray-400 mb-4">
                            <ReactMarkdown remarkPlugins={[remarkBreaks]}>
                                {isExpanded ? String(module.body) : truncatedText}
                            </ReactMarkdown>
                            {isTruncated && (
                                <button className="text-blue-500 hover:underline">
                                    {isExpanded ? "Show less" : "Read more"}
                                </button>
                            )}
                        </div>
                        <div className="flex items-center space-x-4 mb-4">
                            <Avatar>
                                <AvatarImage alt={`@${module.user.login}`} src="/placeholder-avatar.jpg" />
                                <AvatarFallback>{module.user.login[0].toUpperCase()}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="font-medium">{module.user.login}</p>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Added {new Date(module.created_at).toDateString()}</p>
                            </div>
                        </div>
                        <Badge className={badgeClass} variant="secondary">
                            {status.charAt(0).toUpperCase() + status.slice(1)} Approval
                        </Badge>
                    </div>
                </Link>
            </div>
        );
    };

    return (
        <section className="container mx-auto py-12 px-4 md:px-6 lg:py-16">
            <div className="space-y-6">
                <div className="text-center">
                    <h1 className="text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl">Lens Open Actions</h1>
                    <p className="mt-4 text-lg text-gray-500 dark:text-gray-400">
                        Discover and Engage with the Latest Community-Driven Enhancements.
                    </p>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Pending Modules</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {pendingModules.map(module => renderModule(module, 'pending'))}
                    </div>
                </div>
                <div>
                    <h2 className="text-2xl font-bold mb-4">Approved Modules</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {approvedModules.map(module => renderModule(module, 'approved'))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default PendingAndApprovedModules;
