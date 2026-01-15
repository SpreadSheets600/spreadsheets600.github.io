// GitHub API utility for CMS storage
// Configure with your GitHub PAT (Personal Access Token)

const GITHUB_TOKEN = import.meta.env.GITHUB_PAT || '';
const GITHUB_REPO = import.meta.env.GITHUB_REPO || 'username/repo';
const GITHUB_BRANCH = import.meta.env.GITHUB_BRANCH || 'main';

export interface GitHubFileContent {
  name: string;
  path: string;
  sha: string;
  content: string;
}

export async function getFileFromGitHub(path: string): Promise<GitHubFileContent | null> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) return null;

    const data = await response.json();
    return {
      name: data.name,
      path: data.path,
      sha: data.sha,
      content: Buffer.from(data.content, 'base64').toString('utf8'),
    };
  } catch (error) {
    console.error('Error fetching file from GitHub:', error);
    return null;
  }
}

export async function saveFileToGitHub(
  path: string,
  content: string,
  message: string,
  sha?: string
): Promise<boolean> {
  try {
    let currentSha = sha;

    // If SHA isn't provided, try to fetch it to support updates
    if (!currentSha) {
      const existingFile = await getFileFromGitHub(path);
      if (existingFile) {
        currentSha = existingFile.sha;
      }
    }

    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          content: Buffer.from(content).toString('base64'),
          branch: GITHUB_BRANCH,
          ...(currentSha && { sha: currentSha }),
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error(`GitHub API Error (${response.status}):`, errorData.message || response.statusText);
    }

    return response.ok;
  } catch (error) {
    console.error('Error saving file to GitHub:', error);
    return false;
  }
}

export async function deleteFileFromGitHub(path: string, sha: string, message: string): Promise<boolean> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
      {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          sha,
          branch: GITHUB_BRANCH,
        }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error('Error deleting file from GitHub:', error);
    return false;
  }
}

export async function listFilesFromGitHub(directory: string): Promise<GitHubFileContent[]> {
  try {
    const response = await fetch(
      `https://api.github.com/repos/${GITHUB_REPO}/contents/${directory}?ref=${GITHUB_BRANCH}`,
      {
        headers: {
          Authorization: `Bearer ${GITHUB_TOKEN}`,
          Accept: 'application/vnd.github.v3+json',
        },
      }
    );

    if (!response.ok) return [];

    const data = await response.json();
    return data.map((file: any) => ({
      name: file.name,
      path: file.path,
      sha: file.sha,
      content: '',
    }));
  } catch (error) {
    console.error('Error listing files from GitHub:', error);
    return [];
  }
}
