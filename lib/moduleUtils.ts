import { getPendingModules, getApprovedModules } from '../app/githubApi';

export type User = {
    login: string;
    avatar_url: string;
};

export type LensModule = {
    moduleType: string;
    moduleName: string;
    moduleAddress: string;
    isImmutable: boolean;
    usingProxy: boolean;
    registered: boolean;
    verified: boolean;
    summary: string;
    id: number;
    number: number;
    user: User;
    created_at: string;
    status: 'pending' | 'approved';
};

const parseModuleBody = (body: string) => {
    if (!body.toLowerCase().includes("verify my module")) {
        return null;
    }

    const lines = body.split('\n').map(line => line.trim());
    const moduleInfo: { [key: string]: string } = {};

    lines.slice(1).forEach(line => {
        let key = "", value = "";
        if (line.startsWith("-")) {
            const index = line.indexOf(':');
            if (index !== -1) {
                key = line.slice(1, index).trim().toLowerCase();
                value = line.slice(index + 1).trim().replace(/["`]/g, '');
            }
        } else {
            const index = line.indexOf(':');
            if (index !== -1) {
                key = line.slice(0, index).trim().toLowerCase();
                value = line.slice(index + 1).trim().replace(/["`]/g, '');
            }
        }
        if (key && value) {
            moduleInfo[key] = value;
        }
    });

    let moduleAddress = moduleInfo['module address'] || 'N/A';

    const markdownLinkRegex = /\[.*?\]\((.*?)\)/;
    const match = moduleAddress.match(markdownLinkRegex);
    if (match) {
        moduleAddress = match[1];
    }

    const formattedModuleAddress = moduleAddress.startsWith('https')
        ? moduleAddress
        : `https://polygonscan.com/address/${moduleAddress}`;

    return {
        moduleType: moduleInfo['module type'] || 'N/A',
        moduleName: moduleInfo['module name'] || 'N/A',
        moduleAddress: formattedModuleAddress,
        isImmutable: moduleInfo['my module is immutable'] === 'yes',
        usingProxy: moduleInfo['my module is using an upgradeable proxy'] === 'yes',
        registered: moduleInfo['my module has been registered on the registry'] === 'yes',
        verified: moduleInfo['my module has been verified on the block explorer'] === 'yes',
        summary: moduleInfo['summary of my module'] || 'N/A',
    };
};

export const getAllLensModules = async (): Promise<LensModule[]> => {
    try {
        const [pendingModules, approvedModules] = await Promise.all([
            getPendingModules(),
            getApprovedModules(),
        ]);

        const parsedPendingModules = pendingModules
            .map(module => {
                if (!module.body || !module.body.toLowerCase().includes("verify my module")) return null;
                if (!module.title || module.title.toLowerCase().includes("update")) return null;
                const parsedBody = parseModuleBody(module.body);
                if (!parsedBody) return null;
                return {
                    ...parsedBody,
                    id: module.id,
                    number: module.number,
                    user: {
                        login: module.user.login,
                        avatar_url: module.user.avatar_url,
                    },
                    created_at: module.created_at,
                    status: 'pending' as const,
                };
            })
            .filter((module): module is LensModule => module !== null);

        const parsedApprovedModules = approvedModules
            .map(module => {
                if (!module.body || !module.body.toLowerCase().includes("verify my module")) return null;
                if (!module.title || module.title.toLowerCase().includes("update")) return null;
                const parsedBody = parseModuleBody(module.body);
                if (!parsedBody) return null;
                return {
                    ...parsedBody,
                    id: module.id,
                    number: module.number,
                    user: {
                        login: module.user.login,
                        avatar_url: module.user.avatar_url,
                    },
                    created_at: module.created_at,
                    status: 'approved' as const,
                };
            })
            .filter((module): module is LensModule => module !== null);

        return [...parsedPendingModules, ...parsedApprovedModules];
    } catch (error) {
        console.error('Error fetching modules:', error);
        throw error;
    }
};

export const getLensModuleByName = async (name: string): Promise<LensModule | undefined> => {
    try {
        const modules = await getAllLensModules();
        return modules.find(module => module.moduleName === name);
    } catch (error) {
        console.error('Error fetching module by name:', error);
        throw error;
    }
};
