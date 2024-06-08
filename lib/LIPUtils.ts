// LIPUtils.ts

import { PullRequest } from "@/app/githubApi";

export type LIP = {
    id: string;
    title: string;
    body: string;
    html_url: string;
    user: {
        login: string;
        avatar_url: string;
    };
    comments_url: string;
    comments_count: number;
    created_at: string;
    status: 'pending' | 'merged';
};

export const filterLIPs = (pullRequests: PullRequest[]): PullRequest[] => {
    return pullRequests.filter(pr => pr.title.includes('LIP'));
};

export const parseLIP = (pullRequest: PullRequest, commentsCount: number, status: 'pending' | 'merged'): LIP => {
    const lipIdMatch = pullRequest.title.match(/LIP[-\s]*#?(\d+)/i);
    const id = lipIdMatch ? `LIP-${lipIdMatch[1]}` : 'N/A';

    // Remove the "LIP - #" part from the title, including any brackets or special characters
    var titleWithoutId = pullRequest.title.replace(/LIP[-\s]*#?\d+[\s:\-]*[\[\]{}()]*/i, '').trim();
    titleWithoutId = titleWithoutId.replace(/[\[\]{}()-:]/g, '');

    return {
        id,
        title: titleWithoutId,
        body: pullRequest.body,
        html_url: pullRequest.html_url,
        user: {
            login: pullRequest.user.login,
            avatar_url: pullRequest.user.avatar_url,
        },
        comments_url: pullRequest.comments_url,
        comments_count: commentsCount,
        created_at: pullRequest.created_at,
        status,
    };
};