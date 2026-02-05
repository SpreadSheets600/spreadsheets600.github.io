import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";

const GITHUB_USERNAME = process.env.GITHUB_USERNAME || "SpreadSheets600";
const OUTPUT_DIR = join(process.cwd(), "src/content/repositories");
const PER_PAGE = 100;

const response = await fetch(`https://api.github.com/users/${GITHUB_USERNAME}/repos?sort=updated&per_page=${PER_PAGE}&type=owner`, {
  headers: {
    Accept: "application/vnd.github+json",
    "User-Agent": "Astro-Portfolio",
    ...(process.env.GITHUB_TOKEN ? { Authorization: `Bearer ${process.env.GITHUB_TOKEN}` } : {}),
  },
});

if (!response.ok) {
  const message = await response.text();
  throw new Error(`GitHub API error (${response.status}): ${message}`);
}

const repos = await response.json();

const safeYaml = (value) => {
  if (value === null || value === undefined) return "";
  const str = String(value);
  if (str === "" || /[:#\n\r\t]/.test(str)) {
    return JSON.stringify(str);
  }
  return str;
};

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });

for (const repo of repos) {
  if (repo.fork || repo.archived) continue;

  const lines = [
    `name: ${safeYaml(repo.name)}`,
    `description: ${safeYaml(repo.description || "")}`,
    `html_url: ${safeYaml(repo.html_url)}`,
    `homepage: ${safeYaml(repo.homepage || "")}`,
    "topics:",
    ...(repo.topics || []).map((topic) => `  - ${safeYaml(topic)}`),
  ];

  await writeFile(join(OUTPUT_DIR, `${repo.name}.yml`), `${lines.join("\n")}\n`, "utf8");
}

console.log(`Synced ${repos.length} repositories to ${OUTPUT_DIR}`);
