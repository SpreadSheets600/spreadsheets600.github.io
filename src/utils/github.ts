import matter from "gray-matter";
import { marked } from "marked";

const GITHUB_TOKEN = import.meta.env.GITHUB_PAT || "";

const GITHUB_REPO = import.meta.env.GITHUB_REPO || "SpreadSheets600/SpreadsSheets600.github.io";
const GITHUB_BRANCH = import.meta.env.GITHUB_BRANCH || "jam-stack";

const PINNED_PROJECTS_PATH = "src/content/projects.md";
const DEFAULT_ACCEPT_HEADER = "application/vnd.github+json";

function buildGitHubHeaders(overrides: Record<string, string> = {}) {
	return {
		Accept: DEFAULT_ACCEPT_HEADER,
		...(GITHUB_TOKEN ? { Authorization: `Bearer ${GITHUB_TOKEN}` } : {}),
		...overrides,
	};
}

export interface GitHubFileContent {
	content: string;
	name: string;
	path: string;
	sha: string;
}

export async function getFileFromGitHub(path: string): Promise<GitHubFileContent | null> {
	try {
		const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}?ref=${GITHUB_BRANCH}`, {
			headers: buildGitHubHeaders(),
		});

		if (!response.ok) return null;

		const data = await response.json();

		return {
			name: data.name,
			path: data.path,
			sha: data.sha,
			content: Buffer.from(data.content, "base64").toString("utf8"),
		};
	} catch (error) {
		console.error("Error Fetching From GitHub:", error);
		return null;
	}
}

export async function saveFileToGitHub(path: string, content: string, message: string, sha?: string): Promise<boolean> {
	try {
		let currentSha = sha;

		if (!currentSha) {
			const existingFile = await getFileFromGitHub(path);

			if (existingFile) {
				currentSha = existingFile.sha;
			}
		}

		const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
			method: "PUT",
			headers: buildGitHubHeaders({ "Content-Type": "application/json" }),

			body: JSON.stringify({
				message,
				content: Buffer.from(content).toString("base64"),
				branch: GITHUB_BRANCH,
				...(currentSha && { sha: currentSha }),
			}),
		});

		if (!response.ok) {
			const errorData = await response.json().catch(() => ({}));
			console.error(`GitHub API Error (${response.status}):`, errorData.message || response.statusText);
		}

		return response.ok;
	} catch (error) {
		console.error("Error Saving File To GitHub:", error);
		return false;
	}
}

export async function deleteFileFromGitHub(path: string, sha: string, message: string): Promise<boolean> {
	try {
		const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`, {
			method: "DELETE",

			headers: buildGitHubHeaders({ "Content-Type": "application/json" }),
			body: JSON.stringify({
				message,
				sha,
				branch: GITHUB_BRANCH,
			}),
		});

		return response.ok;
	} catch (error) {
		console.error("Error Deleting File From GitHub:", error);
		return false;
	}
}

export async function listFilesFromGitHub(directory: string): Promise<GitHubFileContent[]> {
	try {
		const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/contents/${directory}?ref=${GITHUB_BRANCH}`, {
			headers: buildGitHubHeaders(),
		});

		if (!response.ok) return [];

		const data = await response.json();
		return data.map((file: any) => ({
			name: file.name,
			path: file.path,
			sha: file.sha,
			content: "",
		}));
	} catch (error) {
		console.error("Error Listing Files From GitHub:", error);
		return [];
	}
}

export interface GitHubRepo {
	name: string;
	description: string | null;
	html_url: string;
	homepage: string | null;
	language: string | null;
	topics: string[];
	private: boolean;
	archived: boolean;
	fork: boolean;
	stargazers_count?: number;
	forks_count?: number;
	updated_at?: string;
}

export async function fetchUserRepos(token: string): Promise<GitHubRepo[]> {
	try {
		const response = await fetch("https://api.github.com/user/repos?sort=updated&per_page=100", {
			headers: buildGitHubHeaders({ Authorization: `Bearer ${token}` }),
		});

		if (!response.ok) return [];

		const data = await response.json();
		return data.map((repo: any) => ({
			name: repo.name,
			description: repo.description,
			html_url: repo.html_url,
			homepage: repo.homepage,
			language: repo.language,
			topics: repo.topics || [],
			private: repo.private,
			archived: repo.archived,
			fork: repo.fork,
			stargazers_count: repo.stargazers_count,
			forks_count: repo.forks_count,
			updated_at: repo.updated_at,
		}));
	} catch (error) {
		console.error("Error Fetching User Repos:", error);
		return [];
	}
}

export interface PinnedProjectFrontmatter {
	title: string;
	githubUrl: string;
	websiteUrl?: string | null;
	description: string;
	tech: string[];
	status: string;
	date?: string;
	featured?: boolean;
}

export interface PinnedProjectFile {
	sha: string;
	projects: PinnedProjectFrontmatter[];
	body: string;
	html: string;
}

export async function fetchPinnedProjects(): Promise<PinnedProjectFile | null> {
	const file = await getFileFromGitHub(PINNED_PROJECTS_PATH);
	if (!file) return null;

	const parsed = matter(file.content);
	const projects = parsed.data?.projects;
	const body = parsed.content.trim();

	if (!Array.isArray(projects)) {
		console.warn("Pinned Projects File Missing");
		return { sha: file.sha, projects: [], body, html: marked.parse(body) as string };
	}

	return {
		sha: file.sha,
		projects: projects as PinnedProjectFrontmatter[],
		body,
		html: marked.parse(body) as string,
	};
}

export async function getPinnedProjectFileSha(): Promise<string | null> {
	const file = await getFileFromGitHub(PINNED_PROJECTS_PATH);
	return file?.sha ?? null;
}

export async function savePinnedProjects(projects: PinnedProjectFrontmatter[], body = "", message = "cms: update pinned projects"): Promise<boolean> {
	const serialized = matter.stringify(body, { projects });
	return saveFileToGitHub(PINNED_PROJECTS_PATH, serialized, message);
}

export function withPinnedMeta(projects: PinnedProjectFrontmatter[]) {
	return projects.map((project) => ({
		...project,
		repoName: project.githubUrl.replace(/https:\/\/github.com\//i, ""),
	}));
}
