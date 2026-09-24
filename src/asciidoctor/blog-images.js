// Asciidoctor extension that points image references in blog posts to the URLs the images are
// served from.
//
// astro-asciidoc emits the converted HTML as is, so Astro neither copies nor rewrites images
// referenced from AsciiDoc documents. Images placed next to a post (for example
// `src/content/blog/<slug>/images/foo.jpg`) are served under the same relative path below the blog
// URL (`/blog/<slug>/images/foo.jpg`) by the blog-images integration. This extension rewrites
// `imagesdir` into that absolute URL, so images resolve correctly regardless of the page URL's
// trailing slash.

import path from 'node:path';

/**
 * @param {{ contentDir: string, urlBase: string }} options
 *   `contentDir` is the absolute path of the blog content directory and `urlBase` the URL path the
 *   blog is served from (e.g. `/blog`).
 */
export default function ({ contentDir, urlBase }) {
	return (/** @type {import('@asciidoctor/core').Registry} */ registry) => {
		registry.treeProcessor(function () {
			this.process((/** @type {import('@asciidoctor/core').Document} */ doc) => {
				// `docfile` and `docdir` are not absolute paths in the `server` safe mode, so use the base
				// directory, which defaults to the directory of the loaded file.
				const docDir = path.relative(contentDir, doc.getBaseDir());
				if (docDir.startsWith('..') || path.isAbsolute(docDir)) {
					return;
				}

				/**
				 * Resolves a relative `imagesdir` to the URL it is served from. Absolute paths and URLs
				 * are left as they are.
				 *
				 * @param {unknown} imagesdir
				 * @returns {string | undefined}
				 */
				const toUrl = (imagesdir) => {
					const dir = String(imagesdir ?? '');
					if (dir.startsWith('/') || /^[a-z][a-z0-9+.-]*:/i.test(dir)) {
						return undefined;
					}
					const segments = [urlBase, ...docDir.split(path.sep), dir].filter((segment) => segment !== '');
					return path.posix.join(...segments);
				};

				// Inline images read the document's `imagesdir` when converted.
				const docUrl = toUrl(doc.getAttribute('imagesdir'));
				if (docUrl !== undefined) {
					doc.setAttribute('imagesdir', docUrl);
				}

				// Block images copy `imagesdir` onto themselves while parsing, so rewrite each of them too.
				for (const block of doc.findBy({ context: 'image' })) {
					const imagesdir = block.getAttribute('imagesdir');
					const url = imagesdir === undefined ? undefined : toUrl(imagesdir);
					if (url !== undefined) {
						block.setAttribute('imagesdir', url);
					}
				}
			});
		});
	};
}
