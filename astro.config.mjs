// @ts-check

import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { defineConfig, fontProviders } from 'astro/config';
import asciidoc from 'astro-asciidoc';

const asciidocConfig = asciidoc({
  options: {
    safe: 'server',
    attributes: {
      // Fetch diagrams from the Kroki server at build time and embed them as data URIs.
      'kroki-server-url': process.env.KROKI_SERVER_URL ?? 'http://localhost:8000',
      'kroki-default-format': 'svg',
      'kroki-default-options': 'inline',
    },
  },
  // Extensions are imported from inside astro-asciidoc, so pass absolute URLs.
  extensions: [new URL('./src/asciidoctor/kroki.js', import.meta.url).href],
});

// https://astro.build/config
export default defineConfig({
	site: 'https://example.com',
	integrations: [mdx(), sitemap(), asciidocConfig],
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
