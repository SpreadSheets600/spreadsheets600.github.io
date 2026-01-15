import { defineCollection, z } from 'astro:content';

const blogs = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    draft: z.boolean().optional(),
  }),
});

const bookmarks = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    url: z.string().url(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    date: z.date(),
  }),
});

const prompts = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.string(),
    tags: z.array(z.string()).optional(),
    date: z.date(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(), // Maps to 'name'
    websiteUrl: z.string().url().nullable().optional(),
    githubUrl: z.string().url(),
    description: z.string(),
    tech: z.array(z.string()),
    status: z.enum(['Live', 'Published', 'Active', 'Beta', 'Archived']),
    featured: z.boolean().default(false),
    date: z.date().default(() => new Date()), // Added for sorting if needed
  }),
});

export const collections = { blogs, bookmarks, prompts, projects };
