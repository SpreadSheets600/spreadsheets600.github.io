export interface GitHubRepo {
	name: string;
	description: string | null;
	html_url: string;
	homepage: string | null;
	language: string | null;
	topics: string[];
	stargazers_count: number;
	forks_count: number;
	updated_at: string;
}

interface RepositoryFetchResult {
	repos: GitHubRepo[];
	ok: boolean;
}

const RAW_REPOSITORY_FILES = import.meta.glob("../content/repositories/*.yml", {
	eager: true,
	query: "?raw",
	import: "default",
}) as Record<string, string>;

const decodeYamlValue = (raw: string): string => {
	const value = raw.trim();
	if (!value) return "";
	if (value.startsWith('"') && value.endsWith('"')) {
		try {
			return JSON.parse(value) as string;
		} catch {
			return value.slice(1, -1);
		}
	}
	return value;
};

const parseRepoFromYaml = (raw: string): GitHubRepo | null => {
	const lines = raw.split(/\r?\n/);
	const parsed = new Map<string, string>();
	const topics: string[] = [];
	let inTopics = false;

	for (const line of lines) {
		if (!line.trim()) continue;

		if (/^\w+:/.test(line)) {
			inTopics = false;
			const splitIndex = line.indexOf(":");
			const key = line.slice(0, splitIndex).trim();
			const value = decodeYamlValue(line.slice(splitIndex + 1));
			parsed.set(key, value);
			if (key === "topics") inTopics = true;
			continue;
		}

		if (inTopics) {
			const topicMatch = line.match(/^\s*-\s*(.+)$/);
			if (topicMatch) topics.push(decodeYamlValue(topicMatch[1]));
		}
	}

	const name = parsed.get("name");
	const htmlUrl = parsed.get("html_url");
	if (!name || !htmlUrl) return null;

	return {
		name,
		description: parsed.get("description") || null,
		html_url: htmlUrl,
		homepage: parsed.get("homepage") || null,
		language: null,
		topics,
		stargazers_count: 0,
		forks_count: 0,
		updated_at: "",
	};
};

const loadFallbackRepos = (): GitHubRepo[] =>
	Object.values(RAW_REPOSITORY_FILES)
		.map((rawFile) => parseRepoFromYaml(rawFile))
		.filter((repo): repo is GitHubRepo => repo !== null)
		.sort((a, b) => a.name.localeCompare(b.name));

export async function fetchPublicRepos(username: string, tokenOverride?: string): Promise<RepositoryFetchResult> {
	try {
		let token = tokenOverride || import.meta.env.GITHUB_PAT || import.meta.env.GITHUB_TOKEN || "";

		const controller = new AbortController();
		const timeoutId = setTimeout(() => controller.abort(), 8000);

		const response = await fetch(`https://api.github.com/users/${username}/repos?sort=updated&per_page=200&type=owner`, {
			headers: {
				Accept: "application/vnd.github+json",
				"X-GitHub-Api-Version": "2022-11-28",
				"User-Agent": "Astro-Portfolio",
				...(token ? { Authorization: `Bearer ${token}` } : {}),
			},
			signal: controller.signal
		});
		clearTimeout(timeoutId);

		if (response.ok) {
			const data = await response.json();
			const repos = (Array.isArray(data) ? data : [])
				.filter((repo: any) => !repo.fork && !repo.archived)
				.map(
					(repo: any) =>
						({
							name: repo.name,
							description: repo.description,
							html_url: repo.html_url,
							homepage: repo.homepage,
							language: repo.language,
							topics: repo.topics || [],
							stargazers_count: repo.stargazers_count,
							forks_count: repo.forks_count,
							updated_at: repo.updated_at,
						}) satisfies GitHubRepo,
				);

			return { repos, ok: true };
		} else {
			console.warn(`GitHub API returned ${response.status}: ${response.statusText}`);
		}
	} catch (error) {
		if (error instanceof Error && error.name === 'AbortError') {
			console.error("Error fetching repos from GitHub: Request timed out");
		} else {
			console.error("Error fetching repos from GitHub:", error);
		}
	}

	const fallbackRepos = loadFallbackRepos();
	return { repos: fallbackRepos, ok: fallbackRepos.length > 0 };
}
