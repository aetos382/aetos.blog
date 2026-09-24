import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// astro-asciidoc passes AsciiDoc entries as `{ title, asciidoc: { ...attributes } }`.
// Flatten them into the same shape as Markdown frontmatter.
function flattenAsciiDoc(data: unknown) {
	if (typeof data !== 'object' || data === null || !('asciidoc' in data)) {
		return data;
	}
	const { title, asciidoc } = data as { title?: string; asciidoc: Record<string, unknown> };
	return {
		title,
		description: asciidoc['description'],
		pubDate: asciidoc['revdate'],
		updatedDate: asciidoc['updated-date'],
		heroImage: asciidoc['hero-image'],
	};
}

const blog = defineCollection({
	// Load Markdown, MDX and AsciiDoc files in the `src/content/blog/` directory.
	loader: glob({ base: './src/content/blog', pattern: '**/*.{md,mdx,adoc}' }),
	// Type-check frontmatter using a schema
	schema: ({ image }) =>
		z.preprocess(
			flattenAsciiDoc,
			z.object({
				title: z.string(),
				description: z.string(),
				// Transform string to Date object
				pubDate: z.coerce.date(),
				updatedDate: z.coerce.date().optional(),
				heroImage: z.optional(image()),
			}),
		),
});

export const collections = { blog };
