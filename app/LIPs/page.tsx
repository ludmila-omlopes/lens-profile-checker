'use client'

import React, { useEffect, useState } from 'react';
import { Card } from "@/components/ui/card";
import { getPendingLIPs, getMergedLIPs, PullRequest } from '../githubApi';
import { filterLIPs, parseLIP, LIP } from '@/lib/LIPUtils';
import ReactMarkdown from 'react-markdown';
import { CalendarIcon, ClockIcon, GithubIcon, UserIcon, WebcamIcon } from "@/components/icons";

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
        const formattedDate = new Date(lip.created_at).toLocaleDateString();

        return (
            <Card className={`bg-gray-100/60 dark:bg-gray-950/40 p-6 rounded-lg ${lip.status === 'merged' ? 'bg-green-50 dark:bg-green-950/50' : ''}`} key={lip.id}>
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
                <div className="max-h-24 overflow-hidden text-ellipsis mb-4">
                    <ReactMarkdown className="text-gray-500 dark:text-gray-300">
                        {lip.body}
                    </ReactMarkdown>
                </div>
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
                            The objective of the LIPs is to establish uniformity and offer comprehensive documentation for Lens, including the conventions and frameworks built on top of it. This page monitors both completed and ongoing enhancements to Lens through the LIPs.
                            Read more at <a href="https://github.com/lens-protocol/LIPs" className="text-blue-500 hover:underline dark:text-blue-400" target="_blank" rel="noopener noreferrer">https://github.com/lens-protocol/LIPs</a>
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

export default LIPPage;
