// @ts-check

import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import asciidoc from 'astro-asciidoc';
import { fileURLToPath } from 'node:url';
import shiki from './src/asciidoctor/shiki.js';
import blogImages from './src/integrations/blog-images.js';

// Images placed next to blog posts are served under the same relative path below this URL.
const blogImagesOptions = {
  contentDir: fileURLToPath(new URL('./src/content/blog', import.meta.url)),
  urlBase: '/blog',
};

const asciidocConfig = asciidoc({
  options: {
    safe: 'server',
    attributes: {
      // Colorize source blocks at build time with the highlighter registered below.
      'source-highlighter': 'shiki',
      // Fetch diagrams from the Kroki server at build time and embed them as data URIs.
      'kroki-server-url': process.env.KROKI_SERVER_URL ?? 'http://localhost:8000',
      'kroki-default-format': 'svg',
      'kroki-default-options': 'inline',
      // Soft default (`@`) so that documents can override it.
      'imagesdir@': 'images',
    },
  },
  highlighters: [await shiki()],
  // Extensions are imported from inside astro-asciidoc, so pass absolute URLs.
  extensions: [
    new URL('./src/asciidoctor/kroki.js', import.meta.url).href,
    {
      path: new URL('./src/asciidoctor/blog-images.js', import.meta.url).href,
      options: blogImagesOptions,
    },
  ],
});

// https://astro.build/config
export default defineConfig({
	site: 'https://aetos.blog',
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
