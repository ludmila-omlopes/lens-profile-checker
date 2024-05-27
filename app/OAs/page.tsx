'use client'

import React, { useEffect, useState } from 'react';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Card } from "@/components/ui/card";
import { getAllLensModules, LensModule } from '../../lib/moduleUtils';

const MAX_BODY_LENGTH = 150;

const truncateText = (text: string, length: number) => {
    if (!text || text.length <= length) {
        return { truncatedText: text || "", isTruncated: false };
    }
    return { truncatedText: text.slice(0, length) + "...", isTruncated: true };
};

const OpenActions = () => {
    const [pendingModules, setPendingModules] = useState<LensModule[]>([]);
    const [approvedModules, setApprovedModules] = useState<LensModule[]>([]);

    useEffect(() => {
        const fetchModules = async () => {
            try {
                const parsedModules = await getAllLensModules();

                const filteredPending = parsedModules.filter(module => module.status === 'pending');
                const filteredApproved = parsedModules.filter(module => module.status === 'approved');

                setPendingModules(filteredPending);
                setApprovedModules(filteredApproved);
            } catch (error) {
                console.error('Error fetching modules:', error);
            }
        };

        fetchModules();
    }, []);

    const renderModule = (module: LensModule) => {
        const { truncatedText: truncatedSummary } = truncateText(module.summary, MAX_BODY_LENGTH);

        const badgeClass = module.status === 'approved'
            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';

        return (
            <Card className="p-6 bg-white dark:bg-gray-950 rounded-lg shadow-md hover:shadow-lg transition-shadow" key={module.id}>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-xl font-semibold">{module.moduleName}</h2>
                    <Badge className={`px-3 py-1 rounded-full ${badgeClass}`}>
                        {module.status.charAt(0).toUpperCase() + module.status.slice(1)}
                    </Badge>
                </div>
                <p className="text-gray-500 dark:text-gray-400 mb-4">{truncatedSummary}</p>
                <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-500 dark:text-gray-400">Created by {module.user.login}</span>
                    <Link className="text-primary hover:underline" href={`OAs/${module.moduleName}`}>
                        View Details
                    </Link>
                </div>
            </Card>
        );
    };

    return (
        <main className="container mx-auto px-4 md:px-6 py-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-3xl font-bold">Lens Open Actions</h1>
                {/*<Button>Add New Action</Button>*/}
            </div>
            <h2 className="text-2xl font-semibold mb-4">Pending Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {pendingModules.map(module => renderModule(module))}
            </div>
            <h2 className="text-2xl font-semibold mt-12 mb-4">Approved Modules</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {approvedModules.map(module => renderModule(module))}
            </div>
        </main>
    );
};

export default OpenActions;
