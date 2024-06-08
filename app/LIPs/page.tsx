'use client'

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { getPendingLIPs, getMergedLIPs, PullRequest } from '../githubApi';
import { filterLIPs, parseLIP, LIP } from '@/lib/LIPUtils';

const LIPPage = () => {
    const [pendingLIPs, setPendingLIPs] = useState<LIP[]>([]);
    const [mergedLIPs, setMergedLIPs] = useState<LIP[]>([]);

    useEffect(() => {
        const fetchLIPs = async () => {
            try {
                const [pending, merged] = await Promise.all([getPendingLIPs(), getMergedLIPs()]);

                const filteredPending = filterLIPs(pending);
                const filteredMerged = filterLIPs(merged);

                const pendingLIPsWithComments = await Promise.all(filteredPending.map(async lip => {
                    const response = await fetch(lip.comments_url, {
                        headers: {
                            'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    const comments = await response.json();
                    return parseLIP(lip, comments.length, 'pending');
                }));

                const mergedLIPsWithComments = await Promise.all(filteredMerged.map(async lip => {
                    const response = await fetch(lip.comments_url, {
                        headers: {
                            'Authorization': `token ${process.env.NEXT_PUBLIC_GITHUB_TOKEN}`,
                            'Accept': 'application/vnd.github.v3+json'
                        }
                    });
                    const comments = await response.json();
                    return parseLIP(lip, comments.length, 'merged');
                }));

                setPendingLIPs(pendingLIPsWithComments);
                setMergedLIPs(mergedLIPsWithComments);
            } catch (error) {
                console.error('Error fetching LIPs:', error);
            }
        };

        fetchLIPs();
    }, []);

    const renderLIP = (lip: LIP) => {
        const truncatedBody = lip.body && lip.body.length > 100 ? lip.body.substring(0, 100) + '...' : lip.body;
        const formattedDate = new Date(lip.created_at).toLocaleDateString();

        return (
            <Card className={`bg-orange-100/60 dark:bg-orange-950/40 p-6 rounded-lg ${lip.status === 'merged' ? 'bg-green-50 dark:bg-green-950/50' : ''}`} key={lip.id}>
                <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">{lip.id}: {lip.title}</h3>
                    <a
                        href={lip.html_url}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                        target="_blank" rel="noopener noreferrer"
                    >
                        <GithubIcon className="w-4 h-4" />
                    </a>
                </div>
                <p className="text-gray-500 dark:text-gray-300 mb-4">
                    {truncatedBody}
                </p>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <UserIcon className="w-4 h-4" /> {lip.user.login}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <ClockIcon className="w-4 h-4" /> {lip.status === 'merged' ? 'Completed' : 'Pending'}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 mb-4">
                    <CalendarIcon className="w-4 h-4" /> {formattedDate}
                </div>
                <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
                    <WebcamIcon className="w-4 h-4" /> {lip.comments_count} comments
                </div>
            </Card>
        );
    };

    return (
        <div className="flex flex-col min-h-[100dvh]">
            <main className="flex-1 py-12 md:py-16 lg:py-24">
                <div className="container px-4 md:px-6">
                    <div className="space-y-8">
                        <div className="space-y-4">
                            <h2 className="text-3xl font-bold">Lens Improvement Proposals (LIPs)</h2>
                            <p className="text-gray-500 dark:text-gray-400">
                            The objective of the LIPs is to establish uniformity and offer comprehensive documentation for Lens, including the conventions and frameworks built on top of it. This repository monitors both completed and ongoing enhancements to Lens through the LIPs.
                            Read more at https://github.com/lens-protocol/LIPs
                            </p>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Pending Proposals</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {pendingLIPs.map(lip => renderLIP(lip))}
                            </div>
                        </div>
                        <div>
                            <h2 className="text-2xl font-bold mb-6">Completed Proposals</h2>
                            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                {mergedLIPs.map(lip => renderLIP(lip))}
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

function CalendarIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M8 2v4" />
            <path d="M16 2v4" />
            <rect width="18" height="18" x="3" y="4" rx="2" />
            <path d="M3 10h18" />
        </svg>
    );
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="12" r="10" />
            <polyline points="12 6 12 12 16 14" />
        </svg>
    );
}

function GithubIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M15 22v-4a4.8 4.8 0 0 0-1-3.5c3 0 6-2 6-5.5.08-1.25-.27-2.48-1-3.5.28-1.15.28-2.35 0-3.5 0 0-1 0-3 1.5-2.64-.5-5.36-.5-8 0C6 2 5 2 5 2c-.3 1.15-.3 2.35 0 3.5A5.403 5.403 0 0 0 4 9c0 3.5 3 5.5 6 5.5-.39.49-.68 1.05-.85 1.65-.17.6-.22 1.23-.15 1.85v4" />
            <path d="M9 18c-4.51 2-5-2-7-2" />
        </svg>
    );
}

function UserIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
        </svg>
    );
}

function WebcamIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <circle cx="12" cy="10" r="8" />
            <circle cx="12" cy="10" r="3" />
            <path d="M7 22h10" />
            <path d="M12 22v-4" />
        </svg>
    );
}

export default LIPPage;
