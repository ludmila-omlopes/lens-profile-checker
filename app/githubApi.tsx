const GITHUB_MODULES_API_URL = 'https://api.github.com/repos/lens-protocol/verified-modules';
const GITHUB_LIPS_API_URL = 'https://api.github.com/repos/lens-protocol/LIPs';

const GITHUB_TOKEN = process.env.NEXT_PUBLIC_GITHUB_TOKEN;

if (!GITHUB_TOKEN) {
  throw new Error('GitHub token is not defined. Please set the NEXT_PUBLIC_GITHUB_TOKEN environment variable.');
}

const headers = new Headers({
  'Authorization': `Bearer ${GITHUB_TOKEN}`, // Changed from 'token' to 'Bearer'
  'Accept': 'application/vnd.github.v3+json'
});

export type User = {
  login: string;
  avatar_url: string;
};

export type PullRequest = {
  id: number;
  title: string;
  body: string;
  html_url: string;
  user: User;
  comments_url: string;
  comments_count?: number; // Optional field to store the comments count
  merged_at?: string | null;
  created_at: string;
};

export const getPendingModules = async () => {
  const response = await fetch(`${GITHUB_MODULES_API_URL}/pulls?state=open`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch pending modules: ${response.statusText}`);
  }
  return await response.json();
};

export const getApprovedModules = async () => {
  const response = await fetch(`${GITHUB_MODULES_API_URL}/pulls?state=closed`, { headers });
  if (!response.ok) {
    throw new Error(`Failed to fetch approved modules: ${response.statusText}`);
  }
  const allClosedPulls = await response.json();
  const approvedModules = allClosedPulls.filter((pull: any) => pull.merged_at !== null);
  return approvedModules;
};

export const getPendingLIPs = async (): Promise<PullRequest[]> => {
  try {
    const response = await fetch(`${GITHUB_LIPS_API_URL}/pulls?state=open`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch pending LIPs: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Data received is not an array');
    }
    return data;
  } catch (error) {
    console.error('Error fetching pending LIPs:', error);
    throw error;
  }
};

export const getMergedLIPs = async (): Promise<PullRequest[]> => {
  try {
    const response = await fetch(`${GITHUB_LIPS_API_URL}/pulls?state=closed`, { headers });
    if (!response.ok) {
      throw new Error(`Failed to fetch merged LIPs: ${response.statusText}`);
    }
    const data = await response.json();
    if (!Array.isArray(data)) {
      throw new Error('Data received is not an array');
    }
    const mergedPullRequests = data.filter(pr => pr.merged_at !== null);
    return mergedPullRequests;
  } catch (error) {
    console.error('Error fetching merged LIPs:', error);
    throw error;
  }
};
