// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import asciidoc from 'astro-asciidoc';
import { fileURLToPath } from 'node:url';
import blogImages from './src/integrations/blog-images.js';

// Published on GitHub Pages as a project site, so every page is served below this path.
const base = '/astro-site';

// Images placed next to blog posts are served under the same relative path below this URL.
const blogImagesOptions = {
  contentDir: fileURLToPath(new URL('./src/content/blog', import.meta.url)),
  urlBase: '/blog',
};

const asciidocConfig = asciidoc({
  options: {
    safe: 'server',
    attributes: {
      // Fetch diagrams from the Kroki server at build time and embed them as data URIs.
      'kroki-server-url': process.env.KROKI_SERVER_URL ?? 'http://localhost:8000',
      'kroki-default-format': 'svg',
      'kroki-default-options': 'inline',
      // Soft default (`@`) so that documents can override it.
      'imagesdir@': 'images',
    },
  },
  // Extensions are imported from inside astro-asciidoc, so pass absolute URLs.
  extensions: [
    new URL('./src/asciidoctor/kroki.js', import.meta.url).href,
    {
      path: new URL('./src/asciidoctor/blog-images.js', import.meta.url).href,
      // Image URLs in the converted HTML must include the base path.
      options: { ...blogImagesOptions, urlBase: `${base}${blogImagesOptions.urlBase}` },
    },
  ],
});

// https://astro.build/config
export default defineConfig({
	site: 'https://aetos382.github.io',
	base,
	integrations: [sitemap(), asciidocConfig, blogImages(blogImagesOptions)],
	fonts: [
		{
			provider: fontProviders.local(),
			name: 'Atkinson',
			cssVariable: '--font-atkinson',
			fallbacks: ['sans-serif'],
			options: {
				variants: [
					{
						src: ['./src/assets/fonts/atkinson-regular.woff'],
						weight: 400,
						style: 'normal',
						display: 'swap',
					},
					{
						src: ['./src/assets/fonts/atkinson-bold.woff'],
						weight: 700,
						style: 'normal',
						display: 'swap',
					},
				],
			},
		},
	],
});
