const GITHUB_MODULES_API_URL = 'https://api.github.com/repos/lens-protocol/verified-modules';

export const getPendingModules = async () => {
  const response = await fetch(`${GITHUB_MODULES_API_URL}/pulls?state=open`);
  if (!response.ok) {
    throw new Error('Failed to fetch pending modules');
  }
  return await response.json();
};

export const getApprovedModules = async () => {
  const response = await fetch(`${GITHUB_MODULES_API_URL}/pulls?state=closed`);
  if (!response.ok) {
    throw new Error('Failed to fetch approved modules');
  }
  const allClosedPulls = await response.json();
  const approvedModules = allClosedPulls.filter((pull: any) => pull.merged_at !== null);
  return approvedModules;
};
