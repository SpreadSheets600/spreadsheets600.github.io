import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    date: z.date(),
    tags: z.array(z.string()).optional(),
    heroImage: z.string().optional(),
    author: z.string().optional(),
    authorRole: z.string().optional(),
    draft: z.boolean().optional().default(false),
  }),
});

const bookmarks = defineCollection({
  type: "data",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    icon: z.string(),
    accent: z.string(),
    accentSoft: z.string(),
    accentFaint: z.string(),
    order: z.number().optional().default(0),
    items: z.array(
      z.object({
        title: z.string(),
        description: z.string().optional(),
        icon: z.string(),
        text: z.string().optional(),
        prompt: z.string().optional(),
        note: z.string().optional(),
        links: z
          .array(
            z.object({
              label: z.string(),
              url: z.string(),
              primary: z.boolean().optional().default(false),
            }),
          )
          .optional(),
      }),
    ),
  }),
});

export const collections = { blog, bookmarks };
