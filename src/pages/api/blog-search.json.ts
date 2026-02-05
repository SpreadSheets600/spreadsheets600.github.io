import type { APIRoute } from "astro";
import { getCollection } from "astro:content";

const stripForSearch = (input: string) =>
	input
		.replace(/```[\s\S]*?```/g, " ")
		.replace(/`[^`]*`/g, " ")
		.replace(/[#>*_\-\[\]\(\)!]/g, " ")
		.replace(/\s+/g, " ")
		.toLowerCase();

export const GET: APIRoute = async () => {
	const posts = (await getCollection("blog"))
		.filter((post) => !post.data.draft)
		.sort((a, b) => b.data.date.valueOf() - a.data.date.valueOf());

	const payload = posts.map((post) => {
		const tags = post.data.tags ?? [];
		const search = [post.data.title, post.data.description, tags.join(" "), stripForSearch(post.body ?? "")]
			.join(" ")
			.toLowerCase();

		return {
			slug: post.slug,
			title: post.data.title,
			description: post.data.description,
			date: post.data.date.toISOString(),
			tags,
			search,
		};
	});

	return new Response(JSON.stringify({ posts: payload }), {
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "public, max-age=0, must-revalidate",
		},
	});
};
