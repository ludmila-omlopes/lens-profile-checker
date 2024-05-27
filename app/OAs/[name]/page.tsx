'use client'

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { getLensModuleByName, LensModule } from '../../../lib/moduleUtils';
import { Card, CardHeader, CardContent, CardTitle } from '@/components/ui/card';
import { Button } from "@/components/ui/button";

const ModuleDetail = () => {
    const params = useParams();
    const moduleName = params.name as string;
    const [module, setModule] = useState<LensModule | null>(null);

    useEffect(() => {
        if (moduleName) {
            const fetchModule = async () => {
                try {
                    const foundModule = await getLensModuleByName(moduleName);
                    console.log('foundModule:', foundModule);
                    if (foundModule) {
                        setModule(foundModule);
                    }
                } catch (error) {
                    console.error('Error fetching module details:', error);
                }
            };
            fetchModule();
        }
    }, [moduleName]);

    if (!module) {
        return <p>Loading...</p>;
    }

    const getAddressLink = (address: string) => {
        const addressRegex = /0x[a-fA-F0-9]{40}/;
        const match = address.match(addressRegex);
        console.log('match:', match);
        console.log('address:', address);
        if (match) {
            const extractedAddress = match[0];
            return (
                <a
                    className="text-blue-500 hover:underline dark:text-blue-400"
                    href={address}
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    {extractedAddress}
                </a>
            );
        }
        return (
            <a
                className="text-blue-500 hover:underline dark:text-blue-400"
                href={address}
                target="_blank"
                rel="noopener noreferrer"
            >
                {address}
            </a>
        );
    };

    return (
        <div className="bg-gray-100 dark:bg-gray-800 py-12 md:py-20">
            <div className="container px-4 md:px-6">
                <div className="grid gap-6 md:grid-cols-[1fr_300px] lg:grid-cols-[1fr_400px] xl:grid-cols-[1fr_500px]">
                    <div className="space-y-4">
                        <div className="bg-white dark:bg-gray-950 rounded-lg p-6 shadow-sm">
                            <div className="flex items-start justify-between">
                                <div className="space-y-2">
                                    <h1 className="text-2xl font-bold">{module.moduleName}</h1>
                                    <div className="flex items-center gap-2">
                                        <div className={`rounded-md px-2 py-1 text-xs font-medium ${module.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                            {module.status === 'approved' ? 'Approved' : 'Pending'}
                                        </div>
                                        <span className="text-gray-500 dark:text-gray-400">{module.moduleType}</span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="icon" variant="outline">
                                        <DeleteIcon className="h-5 w-5" />
                                        <span className="sr-only">Delete</span>
                                    </Button>
                                    <Button size="icon" variant="outline">
                                        <ShareIcon className="h-5 w-5" />
                                        <span className="sr-only">Share</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                        <div className="grid gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>About</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className="text-gray-500 dark:text-gray-400">
                                        {module.summary}
                                    </p>
                                    {module.moduleAddress && (
                                        <div className="flex items-center gap-2 mt-4">
                                            <LinkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                            {getAddressLink(module.moduleAddress)}
                                        </div>
                                    )}
                                    <div className="grid grid-cols-2 gap-4 mt-4">
                                        <div className="flex items-center gap-2">
                                            <CheckIcon className="h-5 w-5" />
                                            <div className="text-gray-500 dark:text-gray-400">Immutable: {module.isImmutable ? 'Yes' : 'No'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckIcon className="h-5 w-5" />
                                            <div className="text-gray-500 dark:text-gray-400">Using Proxy: {module.usingProxy ? 'Yes' : 'No'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckIcon className="h-5 w-5" />
                                            <div className="text-gray-500 dark:text-gray-400">Registered: {module.registered ? 'Yes' : 'No'}</div>
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <CheckIcon className="h-5 w-5" />
                                            <div className="text-gray-500 dark:text-gray-400">Verified on Block Explorer: {module.verified ? 'Yes' : 'No'}</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 mt-4">
                                        <LinkIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        <a className="text-blue-500 hover:underline dark:text-blue-400" href={`https://github.com/${module.user.login}/${module.id}`} target="_blank" rel="noopener noreferrer">
                                            See on GitHub
                                        </a>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Creator</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <a href={`https://github.com/${module.user.login}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                        <img
                                            alt="Avatar"
                                            className="rounded-full"
                                            height={40}
                                            src={module.user.avatar_url}
                                            style={{
                                                aspectRatio: "40/40",
                                                objectFit: "cover",
                                            }}
                                            width={40}
                                        />
                                        <div>
                                            <div className="font-medium text-blue-500 hover:underline dark:text-blue-400">{module.user.login}</div>
                                            <div className="text-gray-500 dark:text-gray-400">Creator</div>
                                        </div>
                                    </a>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                    <div className="space-y-4">
                        <Card>
                            <CardContent>
                                <div className="flex flex-col items-center gap-4">
                                    <Package2Icon className="h-12 w-12 text-gray-500 dark:text-gray-400" />
                                    <div className="space-y-2 text-center">
                                        <div className="text-2xl font-bold">{module.moduleName}</div>
                                        <div className="flex items-center gap-2">
                                        <div className={`rounded-md px-2 py-1 text-xs font-medium ${module.status === 'approved' ? 'bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400' : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'}`}>
                                            {module.status === 'approved' ? 'Approved' : 'Pending'}
                                        </div>
                                            <span className="text-gray-500 dark:text-gray-400">{module.moduleType}</span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card>
                            <CardHeader>
                                <CardTitle>Usage</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="grid gap-2">
                                    <div className="flex items-center gap-2">
                                        <UsersIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        <div>
                                            <div className="font-medium">1,234</div>
                                            <div className="text-gray-500 dark:text-gray-400">Active Users</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <DownloadIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        <div>
                                            <div className="font-medium">12,345</div>
                                            <div className="text-gray-500 dark:text-gray-400">Total Downloads</div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <StarIcon className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                                        <div>
                                            <div className="font-medium">4.8</div>
                                            <div className="text-gray-500 dark:text-gray-400">Average Rating</div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

function CheckIcon(props) {
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
        <path d="M20 6 9 17l-5-5" />
      </svg>
    )
  }
  
  
  function DeleteIcon(props) {
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
        <path d="M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z" />
        <line x1="18" x2="12" y1="9" y2="15" />
        <line x1="12" x2="18" y1="9" y2="15" />
      </svg>
    )
  }
  
  
  function DownloadIcon(props) {
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
        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
        <polyline points="7 10 12 15 17 10" />
        <line x1="12" x2="12" y1="15" y2="3" />
      </svg>
    )
  }
  
  
  function LinkIcon(props) {
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
        <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
        <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
      </svg>
    )
  }
  
  
  function Package2Icon(props) {
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
        <path d="M3 9h18v10a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9Z" />
        <path d="m3 9 2.45-4.9A2 2 0 0 1 7.24 3h9.52a2 2 0 0 1 1.8 1.1L21 9" />
        <path d="M12 3v6" />
      </svg>
    )
  }
  
  
  function ShareIcon(props) {
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
        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8" />
        <polyline points="16 6 12 2 8 6" />
        <line x1="12" x2="12" y1="2" y2="15" />
      </svg>
    )
  }
  
  
  function StarIcon(props) {
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
        <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
      </svg>
    )
  }
  
  
  function UsersIcon(props) {
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
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
        <circle cx="9" cy="7" r="4" />
        <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </svg>
    )
  }

export default ModuleDetail;
