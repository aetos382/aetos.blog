// Astro integration that serves images placed next to blog posts.
//
// Image files below the blog content directory (for example
// `src/content/blog/<slug>/images/foo.jpg`) are served under the same relative path below the blog
// URL (`/blog/<slug>/images/foo.jpg`): by the dev server during development, and by copying them
// into the build output. Only image files are exposed, so post sources are never published.
// See also `src/asciidoctor/blog-images.js`, which points AsciiDoc image references to these URLs.

import { createReadStream } from 'node:fs';
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

/** @type {Record<string, string>} */
const CONTENT_TYPES = {
	'.avif': 'image/avif',
	'.gif': 'image/gif',
	'.jpeg': 'image/jpeg',
	'.jpg': 'image/jpeg',
	'.png': 'image/png',
	'.svg': 'image/svg+xml',
	'.webp': 'image/webp',
};

/**
 * @param {string} file
 */
function isImage(file) {
	return Object.hasOwn(CONTENT_TYPES, path.extname(file).toLowerCase());
}

/**
 * @param {{ contentDir: string, urlBase: string }} options
 *   `contentDir` is the absolute path of the blog content directory and `urlBase` the URL path the
 *   blog is served from, without Astro's `base` (e.g. `/blog`). The dev server strips `base` from
 *   request URLs, and the build output directory corresponds to `base`.
 * @returns {import('astro').AstroIntegration}
 */
export default function blogImages({ contentDir, urlBase }) {
	const prefix = `${urlBase.replace(/\/$/, '')}/`;

	return {
		name: 'blog-images',
		hooks: {
			'astro:server:setup': ({ server }) => {
				server.middlewares.use(async (req, res, next) => {
					const pathname = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
					if (!pathname.startsWith(prefix) || !isImage(pathname)) {
						return next();
					}
					const file = path.join(contentDir, pathname.slice(prefix.length));
					if (!file.startsWith(contentDir + path.sep)) {
						return next();
					}
					const stat = await fs.stat(file).catch(() => null);
					if (!stat?.isFile()) {
						return next();
					}
					res.setHeader('Content-Type', CONTENT_TYPES[path.extname(file).toLowerCase()]);
					res.setHeader('Content-Length', stat.size);
					createReadStream(file).pipe(res);
				});
			},
			'astro:build:done': async ({ dir, logger }) => {
				const outDir = path.join(fileURLToPath(dir), prefix);
				const entries = await fs.readdir(contentDir, { recursive: true, withFileTypes: true });
				let count = 0;
				for (const entry of entries) {
					if (!entry.isFile() || !isImage(entry.name)) {
						continue;
					}
					const relative = path.relative(contentDir, path.join(entry.parentPath, entry.name));
					const destination = path.join(outDir, relative);
					await fs.mkdir(path.dirname(destination), { recursive: true });
					await fs.copyFile(path.join(contentDir, relative), destination);
					count++;
				}
				logger.info(`Copied ${count} image(s) from ${path.relative(process.cwd(), contentDir)}`);
			},
		},
	};
}
